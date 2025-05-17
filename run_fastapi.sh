#!/bin/bash

# HireAI FastAPI Server Startup Script
# This script starts the FastAPI server for resume upload, parsing, and search

# Check if Python virtual environment exists, if not create it
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export PORT=3001
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Start the FastAPI server
echo "Starting FastAPI server on port 3001..."
uvicorn app:app --host 0.0.0.0 --port 3001 --reload

# Note: Press CTRL+C to stop the server 