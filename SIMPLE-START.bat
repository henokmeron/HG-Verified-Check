@echo off
title AutoCheckPro - Simple Start
color 0A

echo.
echo ========================================
echo   AutoCheckPro - Simple Startup
echo ========================================
echo.

REM Kill everything first
echo [Step 1/4] Cleaning up...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Done!
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

echo [Step 2/4] Installing dependencies (if needed)...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install --silent
)
if not exist "client\node_modules\" (
    echo Installing client dependencies...
    cd client
    call npm install --silent
    cd ..
)
echo Done!
echo.

echo [Step 3/4] Starting backend server...
start "AutoCheckPro Backend" cmd /k "cd /d %~dp0 && node start-server.js"
timeout /t 5 /nobreak >nul

echo [Step 4/4] Starting frontend client...
start "AutoCheckPro Frontend" cmd /k "cd /d %~dp0 && npm run dev:client"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo Two windows opened:
echo   - Backend (Port 5000)
echo   - Frontend (Port 5173)
echo.
echo Wait 10 seconds, then visit:
echo   http://localhost:5173
echo.
echo Or wait for browser to open automatically...
echo.
timeout /t 10 /nobreak >nul

REM Try to open browser
start http://localhost:5173 2>nul

echo.
echo Opening browser now...
echo.
echo If page doesn't load:
echo   1. Check both command windows are still open
echo   2. Look for error messages in those windows
echo   3. Wait a few more seconds and refresh browser
echo.
pause

