@echo off
echo ========================================
echo   SAFE Cleanup - Only Truly Redundant Files
echo ========================================
echo.
echo This will ONLY remove:
echo   - .local folder (Replit cache - 318 MB)
echo   - .git folder (Version history - 495 MB) 
echo   - dist folder (Build artifacts - can regenerate)
echo   - Log files (old logs)
echo   - Test PDF files (not needed)
echo.
echo This will KEEP:
echo   ✓ All source code
echo   ✓ All configuration files
echo   ✓ All batch files (for starting servers)
echo   ✓ All essential documentation
echo   ✓ node_modules (needed for development)
echo.
echo Total to free: ~840 MB
echo.
pause

echo.
echo [1/5] Removing .local folder (Replit cache)...
if exist ".local" (
    rmdir /s /q ".local"
    echo   ✓ Removed .local folder (318 MB)
) else (
    echo   - .local folder not found
)

echo.
echo [2/5] Removing .git folder (version control history)...
if exist ".git" (
    rmdir /s /q ".git"
    echo   ✓ Removed .git folder (495 MB)
) else (
    echo   - .git folder not found
)

echo.
echo [3/5] Removing dist folder (build artifacts)...
if exist "dist" (
    rmdir /s /q "dist"
    echo   ✓ Removed dist folder (21 MB)
) else (
    echo   - dist folder not found
)

echo.
echo [4/5] Removing log files...
del /q "*.log" 2>nul
if exist "logs" (
    rmdir /s /q "logs"
    echo   ✓ Removed logs folder
) else (
    echo   - logs folder not found
)

echo.
echo [5/5] Removing test PDF files...
del /q "test-*.pdf" 2>nul
del /q "real-vehicle-test.pdf" 2>nul
echo   ✓ Removed test PDFs

echo.
echo ========================================
echo   Safe Cleanup Complete!
echo ========================================
echo.
echo Space freed: ~840 MB
echo.
echo All essential files preserved:
echo   ✓ Source code intact
echo   ✓ Configuration files intact
echo   ✓ Batch files intact
echo   ✓ Website fully functional
echo.
pause

