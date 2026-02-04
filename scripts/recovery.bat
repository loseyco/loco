@echo off
setlocal
cd /d "C:\LoCoOS"

echo [OpenClaw] Starting DEEP RECOVERY...

:: 1. Force kill ALL node and pm2 instances to clear port locks
echo [OpenClaw] Clearing existing processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM pm2.exe /T >nul 2>&1
taskkill /F /IM "OpenClaw Gateway" /T >nul 2>&1

:: 2. Wait for OS to release ports
timeout /t 5 /nobreak >nul

:: 3. Clear any PID lock files if they exist (OpenClaw specific)
del /F /Q "C:\Users\pjlos\.openclaw\gateway.pid" >nul 2>&1

:: 4. Start Primary Gateway (18789) via Task Scheduler
echo [OpenClaw] Re-launching Primary Gateway (18789)...
schtasks /Run /TN "OpenClaw Gateway" >nul 2>&1

:: 5. Start Support Staff (18790) via PM2
echo [OpenClaw] Re-launching PM2 Support Staff...
:: We ensure PM2 is fresh
set PM2_HOME=C:\Users\pjlos\.pm2
pm2 kill >nul 2>&1
pm2 start ecosystem.json
pm2 save

:: 6. Refresh Tasks
echo [OpenClaw] Syncing Workspace...
:: Using a separate short-lived node call so it doesn't hang the script
start /min node scripts\sync-tasks.mjs

echo.
echo ✅ RECOVERY COMPLETE.
echo ------------------------------------------
echo Primary (Voice): 18789
echo Engine (Staff): 18790
echo Dashboard: https://www.losey.co/dashboard
echo ------------------------------------------
timeout /t 10
exit
