@echo off
title Deploy to Cloudflare Pages (Free, Ultra-Fast & Mobile-Ready)
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
echo ============================================================
echo   Deploying 10 Med Regt Dashboard to Cloudflare Pages
echo   (Fastest CDN in Bangladesh, works on all Mobile Operators)
echo ============================================================
echo.
echo 1. Building latest production assets...
call npm run build
echo.
echo 2. Deploying to Cloudflare Pages...
echo (If prompted, log in with your Cloudflare account in the browser)
call npx -y wrangler pages deploy dist --project-name=10med-parade
echo.
pause
