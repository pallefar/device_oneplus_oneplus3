#!/bin/bash

# Career Framework App - Linux/Mac Startup Script
# This script starts the Career Framework application on Linux/Mac

echo "========================================"
echo "Career Framework App - Startup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from https://nodejs.org"
    echo "Download version 18.x or higher"
    echo ""
    echo "On macOS with Homebrew: brew install node"
    echo "On Ubuntu/Debian: sudo apt install nodejs npm"
    echo "On Fedora: sudo dnf install nodejs npm"
    echo ""
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo ""
    echo "npm should come with Node.js"
    echo "Please reinstall Node.js from https://nodejs.org"
    echo ""
    exit 1
fi

echo "Checking Node.js version..."
node --version
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to install dependencies!"
        echo ""
        exit 1
    fi
    echo ""
    echo "Dependencies installed successfully!"
    echo ""
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "Database not found. Setting up database..."
    echo ""
    npm run prisma:push
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to create database!"
        echo ""
        exit 1
    fi
    echo ""
    echo "Seeding database with sample data..."
    npm run prisma:seed
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to seed database!"
        echo ""
        exit 1
    fi
    echo ""
    echo "Database setup complete!"
    echo ""
fi

echo "Starting Career Framework App..."
echo ""
echo "Once started, the app will open in your browser automatically."
echo "To share with your team, look for the 'Network URL' in the output below."
echo ""
echo "Press Ctrl+C to stop the server when done."
echo "========================================"
echo ""

# Start the server
npm run server

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "========================================"
    echo "Server stopped with an error"
    echo "========================================"
    echo ""
    exit $EXIT_CODE
fi
