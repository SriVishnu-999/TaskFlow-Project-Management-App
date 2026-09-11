@echo off
title TaskFlow - 1-Click Launch
echo ===================================================
echo     TaskFlow - Enterprise Project Management System
echo ===================================================
echo Starting ASP.NET Core 9.0 Web API on http://localhost:5000...
start "TaskFlow Backend API" cmd /k "cd /d %~dp0backend && dotnet run --project src/TaskFlow.Api/TaskFlow.Api.csproj --launch-profile http"

echo Starting React.js Frontend on http://localhost:5173...
start "TaskFlow Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening TaskFlow in your browser...
start http://localhost:5173

echo ===================================================
echo Both Backend (Port 5000) and Frontend (Port 5173) are running!
echo Swagger Documentation: http://localhost:5000/swagger
echo ===================================================
