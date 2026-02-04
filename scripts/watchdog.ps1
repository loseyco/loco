# OpenClaw Immortal Watchdog
# Runs in PowerShell to survive 'node.exe' taskkills

$PRIMARY_PORT = 18789
$ENGINE_PORT = 18790
$RECOVERY_BAT = "C:\LoCoOS\scripts\recovery.bat"
$LOG_FILE = "C:\LoCoOS\logs\watchdog.log"

function Write-Log($msg) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$time] $msg"
    Write-Host $entry
    $entry | Out-File -FilePath $LOG_FILE -Append
}

Write-Log "Watchdog Initiated (Immortal Mode)"

while($true) {
    $primaryStatus = Test-NetConnection -ComputerName 127.0.0.1 -Port $PRIMARY_PORT -InformationLevel Quiet
    $engineStatus = Test-NetConnection -ComputerName 127.0.0.1 -Port $ENGINE_PORT -InformationLevel Quiet

    if (-not $primaryStatus -or -not $engineStatus) {
        Write-Log "CRITICAL: Port(s) down (Primary: $primaryStatus, Engine: $engineStatus). Executing Recovery..."
        
        # Launch recovery in a new window
        Start-Process -FilePath $RECOVERY_BAT
        
        Write-Log "Recovery triggered. Sleeping for 90s..."
        Start-Sleep -Seconds 90
    } else {
        # Optional: heartbeat log every 10 mins to avoid log bloat
        # Write-Log "Pulse OK"
    }

    Start-Sleep -Seconds 30
}
