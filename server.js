// ============================================================
//  WatchParty Server — server.js
//  npm install && node server.js
// ============================================================
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const os         = require('os');
const crypto     = require('crypto');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR  = path.join(__dirname, 'public');
[UPLOADS_DIR, PUBLIC_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  maxHttpBufferSize: 1e10,
  pingTimeout: 120000,
  pingInterval: 25000
});

// ── Multer (100 GB max) ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._\-]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 * 1024 } });

app.use(express.static(PUBLIC_DIR));
app.use(express.json());

// ── VIDEO STREAMING — range requests (instant seek) ──────────
app.get('/video/:filename', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

  const stat     = fs.statSync(filePath);
  const fileSize = stat.size;
  const range    = req.headers.range;
  const ext      = path.extname(filePath).toLowerCase();
  const mime     = { '.mp4':'video/mp4','.webm':'video/webm','.mkv':'video/x-matroska',
                     '.avi':'video/x-msvideo','.mov':'video/quicktime','.m4v':'video/mp4',
                     '.ogv':'video/ogg','.ts':'video/mp2t' }[ext] || 'video/mp4';

  if (range) {
    const [s, e]  = range.replace(/bytes=/, '').split('-');
    const start   = parseInt(s, 10);
    const end     = e ? parseInt(e, 10) : fileSize - 1;
    res.writeHead(206, {
      'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges':  'bytes',
      'Content-Length': end - start + 1,
      'Content-Type':   mime,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type':   mime,
      'Accept-Ranges':  'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// ── Upload ────────────────────────────────────────────────────
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: `/video/${req.file.filename}`
  });
});

// ── Server info ───────────────────────────────────────────────
app.get('/api/info', (req, res) => {
  res.json({ lan: `http://${getLocalIP()}:${PORT}`, public: publicURL });
});

// ── Rooms: permanent until server restart ─────────────────────
const rooms = {};

app.post('/api/create-room', (req, res) => {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  rooms[code] = {
    code, users: {}, chat: [],
    videoState: { playing: false, currentTime: 0, src: null, srcName: null, updatedAt: Date.now() }
  };
  console.log('🎬 Room created:', code, '| Total rooms:', Object.keys(rooms).length);
  res.json({ code });
});

// Anyone can create a room via socket too
// ── Socket.IO ─────────────────────────────────────────────────
io.on('connection', socket => {

  socket.on('join_room', ({ roomCode, name }) => {
    const code = (roomCode || '').toUpperCase().trim();
    if (!rooms[code]) { socket.emit('room_error', 'Room not found. Check the code.'); return; }

    const room = rooms[code];
    socket.roomCode = code;
    socket.userName = name;
    socket.join(code);
    room.users[socket.id] = { name, id: socket.id };

    // Calculate adjusted currentTime for late joiners
    let adjustedTime = room.videoState.currentTime;
    if (room.videoState.playing) {
      const elapsed = (Date.now() - room.videoState.updatedAt) / 1000;
      adjustedTime  = room.videoState.currentTime + elapsed;
    }

    socket.emit('room_joined', {
      code,
      users:      Object.values(room.users),
      videoState: { ...room.videoState, currentTime: adjustedTime },
      chat:       room.chat
    });

    socket.to(code).emit('users_update', Object.values(room.users));
    const evt = { type: 'system', text: `${name} joined 🎉`, time: Date.now() };
    room.chat.push(evt);
    io.to(code).emit('chat_msg', evt);
  });

  // ── VIDEO SYNC ────────────────────────────────────────────
  socket.on('vid_load', ({ src, srcName }) => {
    const room = rooms[socket.roomCode]; if (!room) return;
    room.videoState = { playing: false, currentTime: 0, src, srcName, updatedAt: Date.now() };
    io.to(socket.roomCode).emit('vid_load', { src, srcName, by: socket.userName });
    const evt = { type: 'system', text: `${socket.userName} loaded: ${srcName}`, time: Date.now() };
    room.chat.push(evt);
    io.to(socket.roomCode).emit('chat_msg', evt);
  });

  socket.on('vid_play', ({ currentTime }) => {
    const room = rooms[socket.roomCode]; if (!room) return;
    room.videoState.playing     = true;
    room.videoState.currentTime = currentTime;
    room.videoState.updatedAt   = Date.now();
    socket.to(socket.roomCode).emit('vid_play', { currentTime, by: socket.userName });
  });

  socket.on('vid_pause', ({ currentTime }) => {
    const room = rooms[socket.roomCode]; if (!room) return;
    room.videoState.playing     = false;
    room.videoState.currentTime = currentTime;
    room.videoState.updatedAt   = Date.now();
    socket.to(socket.roomCode).emit('vid_pause', { currentTime, by: socket.userName });
  });

  socket.on('vid_seek', ({ currentTime }) => {
    const room = rooms[socket.roomCode]; if (!room) return;
    room.videoState.currentTime = currentTime;
    room.videoState.updatedAt   = Date.now();
    socket.to(socket.roomCode).emit('vid_seek', { currentTime, by: socket.userName });
  });

  // ── SCREEN SHARE — WebRTC signaling ──────────────────────
  socket.on('screen_started', () => {
    const room = rooms[socket.roomCode]; if (!room) return;
    room.screenSharer = socket.id;
    socket.to(socket.roomCode).emit('screen_started', { from: socket.id, name: socket.userName });
  });
  socket.on('screen_stopped', () => {
    const room = rooms[socket.roomCode]; if (room) room.screenSharer = null;
    socket.to(socket.roomCode).emit('screen_stopped', { from: socket.id });
  });
  socket.on('screen_offer',  ({ offer,     to }) => io.to(to).emit('screen_offer',  { offer,     from: socket.id, name: socket.userName }));
  socket.on('screen_answer', ({ answer,    to }) => io.to(to).emit('screen_answer', { answer,    from: socket.id }));
  socket.on('screen_ice',    ({ candidate, to }) => io.to(to).emit('screen_ice',    { candidate, from: socket.id }));

  // ── CHAT ──────────────────────────────────────────────────
  socket.on('chat_send', ({ text }) => {
    const room = rooms[socket.roomCode]; if (!room) return;
    const msg = { type: 'text', from: socket.userName, fromId: socket.id, text, time: Date.now() };
    room.chat.push(msg);
    io.to(socket.roomCode).emit('chat_msg', msg);
  });

  // ── DISCONNECT ────────────────────────────────────────────
  socket.on('disconnect', () => {
    const room = rooms[socket.roomCode];
    if (!room || !room.users[socket.id]) return;
    const name = room.users[socket.id].name;
    delete room.users[socket.id];
    if (room.screenSharer === socket.id) {
      room.screenSharer = null;
      socket.to(socket.roomCode).emit('screen_stopped', { from: socket.id });
    }
    io.to(socket.roomCode).emit('users_update', Object.values(room.users));
    const evt = { type: 'system', text: `${name} left`, time: Date.now() };
    room.chat.push(evt);
    io.to(socket.roomCode).emit('chat_msg', evt);
    // NOTE: Room stays alive even when empty — code valid forever
  });
});

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const n of Object.keys(ifaces))
    for (const i of ifaces[n])
      if (i.family === 'IPv4' && !i.internal) return i.address;
  return '127.0.0.1';
}

const PORT = process.env.PORT || 5000;
let publicURL = null;

server.listen(PORT, '0.0.0.0', async () => {
  const ip = getLocalIP();
  console.log(`\n🎬 WatchParty running!`);
  console.log(`💻 Local  → http://localhost:${PORT}`);
  console.log(`📡 LAN    → http://${ip}:${PORT}`);

  try {
    const ngrok = require('@ngrok/ngrok');

    // ══════════════════════════════════════════════
    //   PASTE YOUR NGROK TOKEN BETWEEN THE QUOTES:
    const TOKEN = 'PASTE_YOUR_NGROK_TOKEN_HERE';
    // ══════════════════════════════════════════════

    const listener = await ngrok.forward({ addr: PORT, authtoken: TOKEN });
    publicURL = listener.url();
    console.log(`🌍 Public → ${publicURL}\n`);
  } catch(e) {
    console.log('⚠️  ngrok error:', e.message);
    console.log('Run manually: ngrok http', PORT, '\n');
  }
});
