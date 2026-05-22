# 🎬 Movie Player With Live Chat And Screen Sharing

Movie Player With Live Chat And Screen Sharing is a **real-time Watch Party application** built using **Node.js, Express, Socket.IO, and WebRTC**.

This project allows users to **watch videos together, sync playback in real time, chat live, and share screens** inside private rooms.

It is useful for **movie nights, online classes, team collaboration, gaming sessions, remote watch parties, and collaborative streaming**.

---

# ✨ Features

🎥 **Watch videos together in sync**

💬 **Live real-time chat system**

🖥 **Screen sharing using WebRTC**

📂 **Upload local videos (up to 100 GB)**

⚡ **Instant video seeking with streaming support**

🌍 **Public sharing using ngrok**

🏠 **Private room creation with unique room codes**

👥 **Real-time participant updates**

🔄 **Permanent rooms until server restart**

📡 **LAN and Public URL support**

🎞 **Supports multiple video formats**

💻 **Works on Windows, macOS, and Linux**

---

# 📂 Project Structure

```txt
Movie-player-with-live-chat-and-screen-sharing
│
├── node_modules
│
├── public
│     ├── index.html
│     ├── style.css
│     ├── script.js
│     └── ...
│
├── uploads
│     └── uploaded videos
│
├── LICENSE
├── README.md
├── package-lock.json
├── package.json
├── run.bat
└── server.js
```

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/rsamwilson2323-cloud/Movie-player-with-live-chat-and-screen-sharing.git

cd Movie-player-with-live-chat-and-screen-sharing
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

# 📦 Requirements

### Required Technologies

```txt
Node.js 18+
npm
```

### Main Packages Used

```txt
express
socket.io
multer
@ngrok/ngrok
```

Install all required packages automatically:

```bash
npm install
```

---

# 🔑 Ngrok Setup (Important)

This project uses **ngrok** to create a **public internet link**, allowing friends and users to join from anywhere in the world.

## 1️⃣ Create a Free ngrok Account

Go to:

```txt
https://dashboard.ngrok.com/get-started/your-authtoken
```

Create a free account and copy your **Auth Token**.

Example token:

```txt
2abcXYZ1234567890abcdefghijklmnop
```

---

## 2️⃣ Open `server.js`

Find this section:

```js
// ══════════════════════════════════════════════
//   PASTE YOUR NGROK TOKEN BETWEEN THE QUOTES:
const TOKEN = 'PASTE_YOUR_NGROK_TOKEN_HERE';
// ══════════════════════════════════════════════
```

Replace:

```js
'PASTE_YOUR_NGROK_TOKEN_HERE'
```

with your real token:

```js
const TOKEN = 'YOUR_REAL_NGROK_TOKEN';
```

Example:

```js
const TOKEN = '2abcXYZ1234567890abcdefghijklmnop';
```

⚠️ **Important:** Never upload your real ngrok token to GitHub.

Before pushing to GitHub, change it back to:

```js
const TOKEN = 'PASTE_YOUR_NGROK_TOKEN_HERE';
```

---

# ▶️ Usage

Start the server:

```bash
node server.js
```

Or simply run:

```bash
run.bat
```

---

# 🌐 Server Output

After starting the server, you will see something like:

```txt
🎬 WatchParty running!

💻 Local  → http://localhost:5000
📡 LAN    → http://192.168.x.x:5000
🌍 Public → https://abc123.ngrok-free.app
```

---

## Access Types

### 💻 Local Access

```txt
http://localhost:5000
```

Only works on your computer.

---

### 📡 LAN Access

```txt
http://192.168.x.x:5000
```

Works for devices connected to the same WiFi network.

---

### 🌍 Public Access

```txt
https://abc123.ngrok-free.app
```

Anyone with the link can join from anywhere in the world.

---

# 🎥 Supported Video Formats

```txt
MP4
WEBM
MKV
AVI
MOV
M4V
OGV
TS
```

Maximum upload size:

```txt
100 GB
```

---

# 🎬 How It Works

## 1️⃣ Create a Room

Users create a private room.

Example room code:

```txt
AB12CD
```

Rooms remain active until the server restarts.

---

## 2️⃣ Upload a Video

Upload any supported movie or video file.

The server stores uploaded videos and creates a streamable link automatically.

---

## 3️⃣ Sync Playback

When one user:

▶️ Plays the video

⏸ Pauses the video

⏩ Seeks the timeline

Everyone watching gets synchronized instantly.

---

## 4️⃣ Live Chat

Participants can chat in real time.

Example:

```txt
Sam: Start the movie 🎬
Alex: Wait 😭
John: Pause at 12:35
```

---

## 5️⃣ Screen Sharing

Users can share their screen using **WebRTC**.

Useful for:

✅ Watching together

✅ Presentations

✅ Online classes

✅ Gaming sessions

✅ Team collaboration

---

# 🧠 How It Works Internally

### 1️⃣ Express Server

Runs the web application and APIs.

### 2️⃣ Socket.IO

Handles:

- Live chat
- Room communication
- Video synchronization
- User updates

### 3️⃣ Multer

Handles **large video uploads (up to 100 GB)**.

### 4️⃣ Range Requests

Enable:

- Instant seeking
- Smooth streaming
- Faster playback loading

### 5️⃣ WebRTC

Used for **screen sharing between users**.

### 6️⃣ ngrok

Creates a **public internet URL** for global access.

### 7️⃣ Room Memory Storage

Room data is stored temporarily until server restart.

---

# 📌 Example Workflow

```txt
Create Room
      ↓
Share Room Code
      ↓
Upload Movie
      ↓
Friends Join
      ↓
Watch Together
      ↓
Chat + Screen Share
```

---

# 🛡 Security Notes

⚠️ Never upload your real **ngrok token** to GitHub.

⚠️ Public ngrok links should only be shared with trusted users.

⚠️ Uploaded videos remain stored in the server uploads folder.

---

# 🚀 Future Improvements

Possible improvements for the project:

🔹 Voice chat support

🔹 Movie subtitle support

🔹 Video playlists

🔹 User authentication

🔹 Admin moderation controls

🔹 Database-based permanent rooms

🔹 Watch history

🔹 Mobile app support

🔹 Better UI/UX animations

---

# 👨‍💻 Author

**Sam Wilson**

🌐 GitHub  
https://github.com/rsamwilson2323-cloud

💼 LinkedIn  
https://www.linkedin.com/in/sam-wilson-14b554385

---

# 📜 License

This project is licensed under the **MIT License**.
