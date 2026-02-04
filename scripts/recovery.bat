@echo off
echo 🧪 OpenClaw Nuclear Recovery Initiated...
echo Killing all Node.js and OpenClaw processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM pm2.exe /T >nul 2>&1

echo Waiting for processes to clear...
timeout /t 3 /nobreak >nul

echo Syncing OAuth profiles...
copy /Y "C:\Users\pjlos\.openclaw\auth-profiles.json" "C:\Users\pjlos\.openclaw\agents\main\agent\auth-profiles.json" >nul 2>&1
copy /Y "C:\Users\pjlos\.openclaw\auth-profiles.json" "C:\Users\pjlos\.openclaw\agents\ops\agent\auth-profiles.json" >nul 2>&1

echo Starting Gateway via PM2...
pm2 start "C:\Users\pjlos\.openclaw\gateway.cmd" --name openclaw-gateway

echo ✅ Recovery Complete. Check Discord for bot status.
pause
