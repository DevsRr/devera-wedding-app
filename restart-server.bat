@echo off
REM Restart Vite dev server for Windows

echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Starting dev server...
npm run dev
