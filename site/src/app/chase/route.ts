import { NextResponse } from 'next/server'

const BOOTSTRAP_SCRIPT = `# Chase (LoCo) Bootstrap Script
# Run this on a fresh PC to reinstall Chase
# Usage: irm losey.co/chase | iex

$ErrorActionPreference = "Stop"

Write-Host "
╔═══════════════════════════════════════════╗
║         CHASE (LoCo) BOOTSTRAP            ║
║     AI Operations Manager for Losey.Co    ║
╚═══════════════════════════════════════════╝
" -ForegroundColor Red

# Config
$WORKSPACE = "C:\\LoCoOS"
$REPO = "https://github.com/loseyco/loco.git"

# Step 1: Check for Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Installing Node.js via winget..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}
$nodeVersion = node --version
Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green

# Step 2: Check for Git
Write-Host "[2/5] Checking Git..." -ForegroundColor Yellow
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  Installing Git via winget..." -ForegroundColor Cyan
    winget install Git.Git --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}
$gitVersion = git --version
Write-Host "  ✓ $gitVersion" -ForegroundColor Green

# Step 3: Install OpenClaw
Write-Host "[3/5] Installing OpenClaw..." -ForegroundColor Yellow
npm install -g openclaw 2>$null
Write-Host "  ✓ OpenClaw installed" -ForegroundColor Green

# Step 4: Clone workspace
Write-Host "[4/5] Setting up workspace..." -ForegroundColor Yellow
if (Test-Path $WORKSPACE) {
    Write-Host "  Workspace exists, pulling latest..." -ForegroundColor Cyan
    Push-Location $WORKSPACE
    git pull 2>$null
    Pop-Location
} else {
    Write-Host "  Cloning from GitHub..." -ForegroundColor Cyan
    git clone $REPO $WORKSPACE 2>$null
}
Write-Host "  ✓ Workspace ready at $WORKSPACE" -ForegroundColor Green

# Step 5: Configure OpenClaw
Write-Host "[5/5] Configuring OpenClaw..." -ForegroundColor Yellow

$configDir = "$env:USERPROFILE\\.openclaw"
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$configPath = "$configDir\\config.yaml"
if (!(Test-Path $configPath)) {
    Write-Host "  Creating default config..." -ForegroundColor Cyan
    Write-Host "  NOTE: You'll need to add your Discord token and other secrets" -ForegroundColor Yellow
    @"
# OpenClaw Config - Chase (LoCo)
cwd: C:\\LoCoOS

channels:
  discord:
    enabled: false
    # token: YOUR_DISCORD_BOT_TOKEN

browser:
  executablePath: C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe
  defaultProfile: openclaw
"@ | Out-File -FilePath $configPath -Encoding utf8
}

Write-Host "  ✓ Config ready" -ForegroundColor Green

Write-Host "
╔═══════════════════════════════════════════╗
║            BOOTSTRAP COMPLETE             ║
╚═══════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "Workspace: $WORKSPACE" -ForegroundColor White
Write-Host "Config:    $configPath" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Edit config: notepad $configPath" -ForegroundColor Cyan
Write-Host "  2. Add your Discord bot token" -ForegroundColor Cyan
Write-Host "  3. Start OpenClaw: openclaw gateway" -ForegroundColor Cyan
Write-Host ""
Write-Host "I'm back. ⚡" -ForegroundColor Red
`

export async function GET() {
  return new NextResponse(BOOTSTRAP_SCRIPT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
