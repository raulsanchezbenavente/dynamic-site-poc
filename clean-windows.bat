@echo off
cd /d "%~dp0"
rmdir /s /q node_modules 2>nul
rmdir /s /q dist 2>nul
rmdir /s /q dist-electron 2>nul
del /f /q package-lock.json 2>nul
