@echo off
echo [OpenClaw] DISABLING UAC (User Account Control)...
echo This will allow OpenClaw to manage system services without prompts.
echo ⚠️ WARNING: This reduces system security.

:: Modify Registry to disable UAC
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA /t REG_DWORD /d 0 /f

echo.
echo ✅ UAC has been disabled in the registry.
echo 🔄 A REBOOT IS REQUIRED for this to take effect.
echo.
pause
