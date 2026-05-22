@echo off
title WatchParty
color 0D
echo.
echo  ==========================================
echo   🎬 WatchParty -- Starting...
echo  ==========================================
echo.
echo  [1/2] Installing dependencies...
call npm install
echo.
echo  [2/2] Starting server...
echo.
node server.js
pause
