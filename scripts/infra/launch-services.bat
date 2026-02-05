@echo off
setlocal
cd /d "C:\LoCoOS"

:: Kill any existing syncers to avoid port/PID locks
taskkill /F /FI "WINDOWTITLE eq OC-SYNCER" >nul 2>&1

title OC-SYNCER
echo [OpenClaw] Starting Background Services...
echo [OpenClaw] Dashboard: https://www.losey.co/dashboard

:RESTART
echo [%time%] Running Status Sync...
:: Run telemetry/status sync once then wait (or use your existing setInterval loop)
:: Since your mjs has a setInterval, we'll just launch it.
start "OC-SYNCER" /min node scripts\status-sync.mjs

echo [%time%] Services Active. Minimizing...
exit
