@echo off
setlocal
cd /d "%~dp0"
node build-launcher-and-run.js
if errorlevel 1 (
  echo.
  echo Failed. Press any key to close...
  pause >nul
  exit /b 1
)
echo.
echo Done. Closing in 5 seconds...
timeout /t 5 /nobreak >nul
exit /b 0
