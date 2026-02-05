# Health Check Script for OpenClaw Services
$logFile = "memory/2026-02-05.md"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$report = "`n## [$timestamp] Gateway Watchdog Check`n"

# Load environment variables for Supabase
$envFile = "site/.env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#\s][^=]*)\s*=\s*(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($name, $value)
        }
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

function LogToSupabase($action, $details) {
    if ($supabaseUrl -and $supabaseKey) {
        $body = @{
            agent = "ops"
            action = $action
            details = $details
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/activity_logs" `
                -Method Post `
                -Headers @{ "apikey" = $supabaseKey; "Authorization" = "Bearer $supabaseKey"; "Content-Type" = "application/json" } `
                -Body $body
        } catch {
            Write-Warning "Failed to log to Supabase: $_"
        }
    }
}

# Check openclaw-engine (Port 18790) - SKIPPED (Engine is integrated in Gateway)
# $enginePort = Get-NetTCPConnection -LocalPort 18790 -ErrorAction SilentlyContinue
# if ($enginePort) {
#     $report += "- **openclaw-engine (18790):** ONLINE & LISTENING`n"
# } else {
#     $report += "- **openclaw-engine (18790):** OFFLINE or NOT LISTENING. Attempting restart...`n"
#     pm2 restart openclaw-engine
#     LogToSupabase "RESTART" "Restarted openclaw-engine due to port 18790 timeout"
# }

# Check openclaw gateway (Port 18789)
$voicePort = Get-NetTCPConnection -LocalPort 18789 -ErrorAction SilentlyContinue
if ($voicePort) {
    $report += "- **openclaw-gateway (18789):** ONLINE & LISTENING`n"
} else {
    $report += "- **openclaw-gateway (18789):** OFFLINE or NOT LISTENING. Attempting restart...`n"
    openclaw gateway restart
    LogToSupabase "RESTART" "Restarted openclaw gateway due to port 18789 timeout"
}

# Check PM2 status for other services
$pm2Raw = pm2 jlist | Out-String
$pm2Clean = $pm2Raw -replace '"username":".*?",', ''
$pm2Status = $pm2Clean | ConvertFrom-Json
$allHealthy = $true
foreach ($app in $pm2Status) {
    $appName = $app.name
    $appStatus = $app.pm2_env.status
    if ($appName -ne "openclaw-engine" -and $appName -ne "openclaw-voice") {
        $report += "- **${appName}:** ${appStatus}`n"
        if ($appStatus -ne "online") {
            pm2 restart $appName
            LogToSupabase "RESTART" "Restarted ${appName} (status: ${appStatus})"
            $allHealthy = $false
        }
    }
}

if ($allHealthy) {
    LogToSupabase "HEALTH_CHECK" "All services verified online and listening."
}

Add-Content -Path $logFile -Value $report
Write-Output "Health check completed."
