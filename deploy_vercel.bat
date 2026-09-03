@echo off
title Deploy to Vercel (Free)
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
echo ============================================================
echo   Deploying 10 Med Regt Dashboard to Vercel
echo   (Works on all Mobile Data: GP, Robi, Banglalink, etc.)
echo ============================================================
echo.
echo 1. Building latest production assets...
call npm run build
echo.
echo 2. Starting Vercel deployment...
echo (If prompted, press Enter to accept defaults and login via browser)
call npx -y vercel --prod
echo.
pause
