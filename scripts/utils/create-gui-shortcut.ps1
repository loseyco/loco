
$WshShell = New-Object -comObject WScript.Shell
$ShortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\LoCo-Control.lnk"
$Target = "C:\LoCoOS\gui\start.bat"
$Icon = "shell32.dll,3"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $Target
$Shortcut.WindowStyle = 1 # Normal window
$Shortcut.Description = "LoCo Mission Control"
$Shortcut.IconLocation = $Icon
$Shortcut.Save()

Write-Host "Startup Shortcut created at: $ShortcutPath"

# Also create on Desktop
$DesktopPath = "$env:USERPROFILE\Desktop\LoCo-Control.lnk"
$Shortcut = $WshShell.CreateShortcut($DesktopPath)
$Shortcut.TargetPath = $Target
$Shortcut.WindowStyle = 1
$Shortcut.IconLocation = $Icon
$Shortcut.Save()

Write-Host "Desktop Shortcut created at: $DesktopPath"
