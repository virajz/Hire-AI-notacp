#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting build process..."

# Define the NLTK data path within the project structure
# RENDER_PROJECT_ROOT is an environment variable provided by Render, typically /opt/render/project/src
# If RENDER_PROJECT_ROOT is not set (e.g. local testing), use current directory.
PROJECT_ROOT_DIR="${RENDER_PROJECT_ROOT:-$(pwd)}"
export NLTK_DATA_PATH_ON_RENDER="${PROJECT_ROOT_DIR}/nltk_data_local"

# Set NLTK_DATA environment variable. NLTK will use this path during the build.
export NLTK_DATA=$NLTK_DATA_PATH_ON_RENDER

echo "NLTK_DATA environment variable set to: $NLTK_DATA for the build process."
echo "Ensuring NLTK data directory exists: $NLTK_DATA"
mkdir -p $NLTK_DATA # Ensure the directory exists

echo "Installing Python dependencies from requirements.txt..."
# It's good practice to upgrade pip first
pip install --upgrade pip
pip install -r requirements.txt
echo "Python dependencies installed."

echo "Running Python script to download NLTK data (download_nltk_data.py)..."
python download_nltk_data.py
echo "NLTK data download script finished."
echo "Build process complete."
