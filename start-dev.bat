@echo off
echo 🚀 Starting FrameFlow Development Environment...
echo.

echo 📁 Starting Backend Server...
cd backend
start cmd /k "npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🌐 Starting Frontend Development Server...
cd ..
start cmd /k "npm run dev"

echo ✅ Both servers should be starting now!
echo 📖 Check the opened terminal windows for status
echo.
echo 🔗 URLs:
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
pause