# SIH 2025 Translation App - Quick Setup Script
# Run this to set up the frontend automatically

Write-Host "`n🚀 SIH 2025 - Frontend Setup Script" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory (use script location)
$frontendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    Write-Host "✅ Found frontend directory: $frontendPath" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory not found" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "`n📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install npm dependencies
Write-Host "`n📦 Installing npm packages (this may take 2-3 minutes)..." -ForegroundColor Yellow
Write-Host "⏳ Please wait..." -ForegroundColor Gray

$installOutput = npm install 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All packages installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    Write-Host $installOutput -ForegroundColor Red
    exit 1
}

# Check if backend is accessible (Python or Java)
Write-Host "`n🔍 Checking backend availability..." -ForegroundColor Yellow
$backendHealthy = $false

try {
    $null = Invoke-WebRequest -Uri "http://localhost:8080/health/" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Java backend is running at http://localhost:8080" -ForegroundColor Green
    $backendHealthy = $true
} catch {
    Write-Host "ℹ️  Java backend not detected on 8080" -ForegroundColor DarkYellow
}

if (-not $backendHealthy) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8000/health/" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Python backend is running at http://localhost:8000" -ForegroundColor Green
        $backendHealthy = $true
    } catch {
        Write-Host "ℹ️  Python backend not detected on 8000" -ForegroundColor DarkYellow
    }
}

if (-not $backendHealthy) {
    Write-Host "⚠️  No backend is running yet" -ForegroundColor Yellow
    Write-Host "   Java option:  cd ..\java-backend ; mvn spring-boot:run" -ForegroundColor Gray
    Write-Host "   Python option: cd ..\backend ; uvicorn main:app --reload" -ForegroundColor Gray
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✨ FRONTEND SETUP COMPLETE! ✨                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Ensure Java backend is running (recommended for Java demo)" -ForegroundColor White
Write-Host "      cd ..\java-backend ; mvn spring-boot:run" -ForegroundColor Gray
Write-Host "      Then set frontend\.env -> VITE_API_URL=http://localhost:8080" -ForegroundColor Gray
Write-Host "   2. Start frontend: " -ForegroundColor White -NoNewline
Write-Host "npm run dev" -ForegroundColor Cyan
Write-Host "   3. Open browser: " -ForegroundColor White -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n🎉 Ready to impress SIH judges! 🚀`n" -ForegroundColor Green
