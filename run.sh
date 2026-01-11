#!/bin/bash
# ============================================
# Document Scanner - Unix/Linux/macOS Run Script
# ============================================
# This script activates the virtual environment
# and runs the Flask application
# ============================================

echo ""
echo "===================================="
echo " Document Scanner Web Application"
echo "===================================="
echo ""

# Check if virtual environment exists
if [ ! -f "venv/bin/activate" ]; then
    echo "[!] Virtual environment not found!"
    echo "[i] Creating virtual environment..."
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo "[X] Failed to create virtual environment"
        exit 1
    fi
    
    echo "[✓] Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "[i] Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
python -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[!] Dependencies not installed!"
    echo "[i] Installing dependencies..."
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo "[X] Failed to install dependencies"
        exit 1
    fi
    
    echo "[✓] Dependencies installed"
    echo ""
fi

# Run the application
echo "[i] Starting Flask application..."
echo "[i] Open your browser to: http://localhost:5000"
echo "[i] Press Ctrl+C to stop the server"
echo ""

python app.py
