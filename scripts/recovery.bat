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

echo 🚀 Starting PM2 Ecosystem...
pm2 start C:\LoCoOS\ecosystem.json

echo ✅ Both bots (Voice + Engine) are recovering in the background via PM2.
echo Type 'pm2 list' to see status.
pause
