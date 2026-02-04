@echo off
setlocal
cd /d "C:\LoCoOS"

echo [OpenClaw] Starting DEEP RECOVERY...

:: 1. Force kill ALL node and pm2 instances
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM pm2.exe /T >nul 2>&1

:: 2. Wait for OS release
timeout /t 5 /nobreak >nul

:: 3. Clear lock files
del /F /Q "C:\Users\pjlos\.openclaw\gateway.pid" >nul 2>&1

:: 4. Start PM2 Ecosystem (Primary Voice + Support Engine)
echo [OpenClaw] Re-launching Full Staff via PM2 Headless...
set PM2_HOME=C:\Users\pjlos\.pm2
pm2 start ecosystem.json
pm2 save

:: 5. Refresh Tasks
start /min node scripts\sync-tasks.mjs

echo ✅ Headless Recovery Complete.
exit
