@echo off
:: This script must be run AS ADMINISTRATOR.
:: It sets up OpenClaw to run automatically at system boot, before any user logs in.

echo [OpenClaw] Configuring Headless Startup...

:: 1. Create the Headless Startup task (Runs at boot as SYSTEM, highest privileges)
schtasks /Create /TN "OpenClaw Headless Startup" /TR "C:\LoCoOS\scripts\headless-startup.bat" /SC ONSTART /RU SYSTEM /RL HIGHEST /F

:: 2. Disable the old logon-only tasks to avoid conflicts
schtasks /Change /TN "OpenClaw Gateway" /Disable >nul 2>&1

echo.
echo ✅ Done. OpenClaw is now configured as a System Service.
echo I will now launch even if you don't log into Windows.
echo.
pause
