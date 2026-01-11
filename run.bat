@echo off
REM ============================================
REM Document Scanner - Windows Run Script
REM ============================================
REM This script activates the virtual environment
REM and runs the Flask application
REM ============================================

echo.
echo ====================================
echo  Document Scanner Web Application
echo ====================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo [!] Virtual environment not found!
    echo [i] Creating virtual environment...
    python -m venv venv
    
    if errorlevel 1 (
        echo [X] Failed to create virtual environment
        pause
        exit /b 1
    )
    
    echo [✓] Virtual environment created
    echo.
)

REM Activate virtual environment
echo [i] Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo [!] Dependencies not installed!
    echo [i] Installing dependencies...
    pip install -r requirements.txt
    
    if errorlevel 1 (
        echo [X] Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo [✓] Dependencies installed
    echo.
)

REM Run the application
echo [i] Starting Flask application...
echo [i] Open your browser to: http://localhost:5000
echo [i] Press Ctrl+C to stop the server
echo.

python app.py

pause
