@echo off
title Update 10 Med Regt Live Site
cd /d "%~dp0"
echo ============================================================
echo   Updating 10 Med Regt Live Web App
echo ============================================================
echo Building latest changes...
cmd /c "npm run build"
copy /y dist\index.html dist\200.html
echo.
echo Deploying to https://10med-parade.surge.sh ...
cmd /c "npx surge ./dist 10med-parade.surge.sh"
echo.
echo ============================================================
echo   Deployment Complete!
echo   Live URL: https://10med-parade.surge.sh
echo ============================================================
pause
