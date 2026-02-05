@echo off
setlocal
cd /d "C:\LoCoOS"

:: Kill any stray node processes from prior session if needed (optional)
:: taskkill /F /IM node.exe /T >nul 2>&1

:: Start PM2 apps (Engine, Syncers)
:: Primary gateway starts automatically via Scheduled Task
pm2 start ecosystem.json
pm2 save

:: Refresh task list
node scripts\cron\sync-tasks.mjs

exit
