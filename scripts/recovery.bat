@echo off
setlocal
cd /d "C:\LoCoOS"

echo [OpenClaw] Starting Recovery System...

:: 1. Force kill existing blocks
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM pm2.exe /T >nul 2>&1

:: 2. Wait for clear
timeout /t 2 /nobreak >nul

:: 3. Start Primary Gateway (18789)
echo [OpenClaw] Starting Primary Gateway...
schtasks /Run /TN "OpenClaw Gateway" >nul 2>&1

:: 4. Start PM2 Engine (18790) + Syncers
echo [OpenClaw] Starting PM2 Ecosystem...
pm2 start ecosystem.json
pm2 save

:: 5. Refresh Tasks
echo [OpenClaw] Syncing Master Tasks...
node scripts\sync-tasks.mjs

echo ✅ System Recovered.
echo ------------------------------------------
echo Gateway (Voice): 18789 (Ready)
echo Gateway (Engine): 18790 (Ready)
echo Status Dashboard: https://www.losey.co/dashboard
echo ------------------------------------------
pause
