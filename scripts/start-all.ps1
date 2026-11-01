# JECRC Alumni Diwali 2026 - Master Launch Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  JECRC UNIVERSITY - ALUMNI DIWALI GET-TOGETHER 2026      " -ForegroundColor Yellow
Write-Host "  QR-Based Registration & Entry Management System         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Sync & Deploy Latest Migrations to Neon Database
Write-Host "[1/2] Connecting to Neon Cloud PostgreSQL & applying migrations..." -ForegroundColor Green
Set-Location "$PSScriptRoot\..\server"
npx prisma migrate deploy

# 2. Start Server & Client
Write-Host "[2/2] Launching Backend API & Web Application..." -ForegroundColor Yellow
Write-Host "      Backend API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "      Frontend Client: http://localhost:5173" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\.."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- JECRC Backend API ---' -ForegroundColor Green; npm --prefix server run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- JECRC Frontend Vite ---' -ForegroundColor Cyan; npm --prefix client run dev"
Write-Host "Both Backend (port 5000) and Frontend (port 5173) launched successfully in dedicated terminals." -ForegroundColor Green
