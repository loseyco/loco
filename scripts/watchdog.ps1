# OpenClaw Immortal Watchdog
# Runs in PowerShell to survive 'node.exe' taskkills and work without user login

$PRIMARY_PORT = 18789
$ENGINE_PORT = 18790
$RECOVERY_BAT = "C:\LoCoOS\scripts\recovery.bat"
$LOG_FILE = "C:\LoCoOS\logs\watchdog.log"

# Discord Webhook for critical alerts
$DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1336821817105027202/A_7pXoX_K_0rM_L_f_U_p_H_r_S_e_c_r_e_t" # PLACEHOLDER

function Write-Log($msg) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$time] $msg"
    Write-Host $entry
    $entry | Out-File -FilePath $LOG_FILE -Append
}

function Send-DiscordAlert($message) {
    if ($DISCORD_WEBHOOK_URL -like "*_S_e_c_r_e_t") { return }
    $payload = @{ content = "🚨 **OC Watchdog Alert:** $message" } | ConvertTo-Json
    Invoke-RestMethod -Uri $DISCORD_WEBHOOK_URL -Method Post -Body $payload -ContentType "application/json"
}

Write-Log "Watchdog Initiated (Headless Mode)"

while($true) {
    $primaryStatus = Test-NetConnection -ComputerName 127.0.0.1 -Port $PRIMARY_PORT -InformationLevel Quiet
    $engineStatus = Test-NetConnection -ComputerName 127.0.0.1 -Port $ENGINE_PORT -InformationLevel Quiet

    if (-not $primaryStatus -or -not $engineStatus) {
        Write-Log "CRITICAL: Port(s) down (Primary: $primaryStatus, Engine: $engineStatus). Executing Recovery..."
        
        Send-DiscordAlert "Port(s) down (Voice: $primaryStatus, Engine: $engineStatus). Attempting auto-recovery..."

        # Launch recovery in a new window
        Start-Process -FilePath $RECOVERY_BAT
        
        Write-Log "Recovery triggered. Sleeping for 90s..."
        Start-Sleep -Seconds 90
    }

    # Check every 60 seconds
    Start-Sleep -Seconds 60
}
