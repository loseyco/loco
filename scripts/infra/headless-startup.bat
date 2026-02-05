@echo off
setlocal
cd /d "C:\LoCoOS"

echo [%date% %time%] [OpenClaw] HEADLESS STARTUP INITIATED (SYSTEM)

:: 1. Force kill blocks
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM pm2.exe /T >nul 2>&1

:: 2. Set Environment
set PM2_HOME=C:\Users\pjlos\.pm2
set PATH=%PATH%;C:\Program Files\nodejs\;C:\Users\pjlos\AppData\Roaming\npm

:: 3. Launch the Immortal Watchdog (Survivor)
echo [%date% %time%] [OpenClaw] Starting Immortal Watchdog...
start /b "OC-WATCHDOG" powershell.exe -WindowStyle Hidden -File "C:\LoCoOS\scripts\infra\watchdog.ps1"

:: 4. Start PM2 Ecosystem (Handles Voice, Engine, and Syncers)
echo [%date% %time%] [OpenClaw] Launching PM2 Ecosystem...
call pm2 start ecosystem.json
call pm2 save

echo [%date% %time%] [OpenClaw] HEADLESS STARTUP COMPLETE.
exit
