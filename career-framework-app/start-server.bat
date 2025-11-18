@echo off
REM Career Framework App - Windows Startup Script
REM This script starts the Career Framework application on Windows

echo ========================================
echo Career Framework App - Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Download version 18.x or higher
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    echo.
    echo npm should come with Node.js
    echo Please reinstall Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Checking Node.js version...
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

REM Check if database exists
if not exist "prisma\dev.db" (
    echo Database not found. Setting up database...
    echo.
    call npm run prisma:push
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to create database!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Seeding database with sample data...
    call npm run prisma:seed
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to seed database!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Database setup complete!
    echo.
)

echo Starting Career Framework App...
echo.
echo Once started, the app will open in your browser automatically.
echo To share with your team, look for the "Network URL" in the output below.
echo.
echo Press Ctrl+C to stop the server when done.
echo ========================================
echo.

REM Start the server
call npm run server

REM If server exits with error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo Server stopped with an error
    echo ========================================
    echo.
    pause
    exit /b %ERRORLEVEL%
)

pause
