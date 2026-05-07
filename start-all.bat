@echo off
setlocal

REM One-tap launcher for MealLane
set "ROOT_DIR=%~dp0"

echo Starting MealLane services...

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on this machine.
  pause
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found on this machine.
  pause
  exit /b 1
)

if not exist "%ROOT_DIR%backend\server.js" (
  echo Backend files were not found.
  pause
  exit /b 1
)

if not exist "%ROOT_DIR%ml-service\app.py" (
  echo ML service files were not found.
  pause
  exit /b 1
)

start "MealLane Backend" /D "%ROOT_DIR%backend" node server.js
start "MealLane ML Service" /D "%ROOT_DIR%ml-service" python app.py
start "MealLane Frontend" /D "%ROOT_DIR%" npm run dev

echo.
echo All services are launching in separate windows.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:4000
echo ML API:   http://localhost:5000
echo.
pause
