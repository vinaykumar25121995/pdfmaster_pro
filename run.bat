@echo off
title PDFMaster Pro Launcher
echo ============================================================
echo           PDFMASTER PRO - DEVELOPMENT LAUNCHER
echo ============================================================
echo.

:: Check for node command
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b
)

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Backend install returned warning codes.
)

echo [2/4] Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Frontend install returned warning codes.
)

echo [3/4] Starting servers in parallel...
echo.
echo [INFO] Opening Backend server console on port 5000...
start "PDFMaster Pro Backend API" cmd /k "cd ../backend && npm run dev"

echo [INFO] Opening Frontend Next.js console on port 3000...
start "PDFMaster Pro Next.js Web" cmd /k "cd ../frontend && npm run dev"

echo.
echo ============================================================
echo [SUCCESS] PDFMaster Pro development launchers are running!
echo ============================================================
echo.
echo 1. Backend API: http://localhost:5000
echo 2. Web Application: http://localhost:3000
echo.
echo Press any key to close this console. (The server consoles will remain open).
echo ============================================================
pause
