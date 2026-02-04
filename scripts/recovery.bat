@echo off
echo 🧪 OpenClaw Dual-Bot Nuclear Recovery...
echo Killing all Node.js and OpenClaw processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM pm2.exe /T >nul 2>&1

echo Waiting for processes to clear...
timeout /t 3 /nobreak >nul

echo Syncing OAuth profiles...
copy /Y "C:\Users\pjlos\.openclaw\auth-profiles.json" "C:\Users\pjlos\.openclaw\agents\main\agent\auth-profiles.json" >nul 2>&1
copy /Y "C:\Users\pjlos\.openclaw\auth-profiles.json" "C:\Users\pjlos\.openclaw\agents\ops\agent\auth-profiles.json" >nul 2>&1

echo 🎙️ Starting VOICE Gateway (Port 18789)...
pm2 start "C:\Users\pjlos\.openclaw\gateway.cmd" --name openclaw-voice

echo ⚙️ Starting ENGINE Gateway (Port 18790)...
pm2 start "C:\LoCoOS\scripts\engine-gateway.cmd" --name openclaw-engine

echo 📡 Starting TELEMETRY...
pm2 start "C:\LoCoOS\scripts\telemetry.mjs" --name system-telemetry

echo ✅ Both bots are recovering in the background via PM2.
echo Type 'pm2 list' to see status.
pause
