# TaskFlow Launch Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    TaskFlow - Enterprise Project Management System" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting ASP.NET Core 9 Web API on http://localhost:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\backend'; dotnet run --project src/TaskFlow.Api/TaskFlow.Api.csproj --launch-profile http"

Write-Host "Starting React Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\frontend'; npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "`nTaskFlow is launching! Swagger: http://localhost:5000/swagger" -ForegroundColor Yellow
