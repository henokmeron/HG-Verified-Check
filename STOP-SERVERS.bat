@echo off
echo.
echo ===================================================================
echo          STOPPING AutoCheckPro SERVERS
echo ===================================================================
echo.
echo This will stop all Node.js processes...
echo.
pause

taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ All servers stopped successfully!
) else (
    echo ℹ No running servers found
)

echo.
echo Servers have been stopped.
echo You can now close this window or run SIMPLE-START.bat to restart.
echo.
pause

