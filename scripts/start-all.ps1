# JECRC Alumni Diwali 2026 - Master Launch Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  JECRC UNIVERSITY - ALUMNI DIWALI GET-TOGETHER 2026      " -ForegroundColor Yellow
Write-Host "  QR-Based Registration & Entry Management System         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start PostgreSQL if not already running on port 5433
$pgRunning = Test-NetConnection -ComputerName 127.0.0.1 -Port 5433 -WarningAction SilentlyContinue
if (-not $pgRunning.TcpTestSucceeded) {
  Write-Host "[1/3] Starting Local PostgreSQL Server on port 5433..." -ForegroundColor Green
  & "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "$PSScriptRoot\..\.pgdata" -o "-p 5433" -l "$PSScriptRoot\..\.pgdata\postgres.log" start
  Start-Sleep -Seconds 2
} else {
  Write-Host "[1/3] PostgreSQL is already active on port 5433." -ForegroundColor Green
}

# 2. Check Database
Write-Host "[2/3] Checking Database connection..." -ForegroundColor Green
Set-Location "$PSScriptRoot\..\server"
npx prisma db push --skip-generate

# 3. Start Server & Client
Write-Host "[3/3] Launching Backend API & Web Application..." -ForegroundColor Yellow
Write-Host "      Backend API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "      Frontend Client: http://localhost:5173" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

npm run dev
