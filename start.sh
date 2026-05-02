#!/bin/bash

echo "========================================"
echo "  Income-Expense-Stock Portfolio"
echo "  Starting Application..."
echo "========================================"
echo ""

echo "[1/2] Checking PostgreSQL connection..."
echo "Make sure PostgreSQL is running on port 5432"
echo ""

echo "[2/2] Starting Backend and Frontend..."
echo ""
echo "========================================"
echo "  Application is starting!"
echo "========================================"
echo ""
echo "Backend will run on:  http://localhost:3000"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the servers"
echo "========================================"
echo ""

npm run dev
