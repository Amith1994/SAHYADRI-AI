@echo off
title Sahyadri Agricultural AI Chatbot Launcher
color 0A
echo ===================================================================
echo   SAHYADRI AGRICULTURAL AI CHATBOT — KARNATAKA CROPS
echo   Groundnut (Peanut) | Rice (Paddy) | Maize | Arecanut
echo ===================================================================
echo.
echo Starting Backend API Server (Port 3001)...
start "Sahyadri Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Web App (Port 5173)...
start "Sahyadri Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak > nul
start http://localhost:5173

echo.
echo All services launched! Keep this window open.
pause
