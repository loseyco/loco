# OpenClaw Immortal Watchdog
# Runs in PowerShell to survive 'node.exe' taskkills and work without user login

$PRIMARY_PORT = 18789
$ENGINE_PORT = 18790
$RECOVERY_BAT = "C:\LoCoOS\scripts\recovery.bat"
$LOG_FILE = "C:\LoCoOS\logs\watchdog.log"

# Discord Webhook for critical alerts
$DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1336825700778872852/FvP09G_SECRET_KEY_HERE"

function Write-Log($msg) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$time] $msg"
    Write-Host $entry
    $entry | Out-File -FilePath $LOG_FILE -Append
}

function Send-DiscordAlert($message) {
    if ($DISCORD_WEBHOOK_URL -like "*SECRET_KEY_HERE*") { return }
    $payload = @{ 
        content = "🚨 **OC Watchdog Alert:** $message" 
        username = "Chase Watchdog"
        avatar_url = "https://www.losey.co/avatar.png"
    } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $DISCORD_WEBHOOK_URL -Method Post -Body $payload -ContentType "application/json"
    } catch {
        Write-Log "Failed to send Discord alert: $_"
    }
}

Write-Log "Watchdog Initiated (Headless Mode)"

while($true) {
    $primaryStatus = Test-NetConnection -ComputerName 127.0.0.1 -Port $PRIMARY_PORT -InformationLevel Quiet
    $engineStatus = Test-NetConnection -ComputerName 127.0.0.1 -Port $ENGINE_PORT -InformationLevel Quiet

    if (-not $primaryStatus -or -not $engineStatus) {
        Write-Log "CRITICAL: Port(s) down (Primary: $primaryStatus, Engine: $engineStatus). Executing Recovery..."
        
        # Notify Discord via direct webhook
        $payload = @{ 
            content = "🚨 **OC Watchdog Alert:** Systems went down (Primary: $primaryStatus, Engine: $engineStatus). I'm working on fixing it." 
            username = "Chase Watchdog"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "https://discord.com/api/webhooks/1336825700778872852/FvP09G_h9v-vU_3Y5-v_U_v_v_v_v_v" -Method Post -Body $payload -ContentType "application/json"

        # Launch recovery in a new window
        Start-Process -FilePath $RECOVERY_BAT
        
        Write-Log "Recovery triggered. Sleeping for 90s..."
        Start-Sleep -Seconds 90
    }

    # Check every 60 seconds
    Start-Sleep -Seconds 60
}
