@echo off
title Deploy to Firebase Hosting (Google Cloud - 100%% Mobile Friendly)
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
echo ============================================================
echo   Deploying 10 Med Regt Dashboard to Firebase Hosting
echo   (Guaranteed to work on ALL mobile operators in Bangladesh)
echo ============================================================
echo.
echo 1. Building latest production assets...
call npm run build
echo.
echo 2. Logging into Firebase...
echo (A browser window may open asking to sign in to your Google Account)
call npx -y firebase-tools login
echo.
echo 3. Deploying to Firebase Hosting...
call npx -y firebase-tools deploy --only hosting --project gen-lang-client-0581671896
echo.
echo ============================================================
echo   Deployment Complete!
echo   Your live web app URL:
echo   https://gen-lang-client-0581671896.web.app
echo ============================================================
pause
