@echo off
title dileep.dev Local Server
echo ========================================================
echo   Starting dileep.dev Portfolio Local Dev Server
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python detected. Starting server at http://localhost:3000 ...
    start http://localhost:3000
    python -m http.server 3000
    goto :eof
)

where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js/npx detected. Starting server at http://localhost:3000 ...
    npx -y serve . -l 3000
    goto :eof
)

echo No Python or Node.js detected.
echo Opening index.html directly in your default browser...
start index.html
