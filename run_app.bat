@echo off
title 10 Med Regt Arty Smart Dashboard
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
echo ============================================================
echo   10 Medium Regiment Artillery - Smart Dashboard
echo ============================================================
echo Starting local development server...
start http://localhost:3000
call npm run dev
pause
