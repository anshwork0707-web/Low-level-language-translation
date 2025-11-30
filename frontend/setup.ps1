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

# Navigate to frontend directory
$frontendPath = "d:\sih_datasets\frontend"
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    Write-Host "✅ Found frontend directory" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory not found at $frontendPath" -ForegroundColor Red
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

# Check if backend is accessible
Write-Host "`n🔍 Checking backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ Backend is running and healthy!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend is not running yet" -ForegroundColor Yellow
    Write-Host "   Start it with: cd backend && uvicorn app:app --reload" -ForegroundColor Gray
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✨ FRONTEND SETUP COMPLETE! ✨                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Ensure backend is running (see above)" -ForegroundColor White
Write-Host "   2. Start frontend: " -ForegroundColor White -NoNewline
Write-Host "npm run dev" -ForegroundColor Cyan
Write-Host "   3. Open browser: " -ForegroundColor White -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n🎉 Ready to impress SIH judges! 🚀`n" -ForegroundColor Green
