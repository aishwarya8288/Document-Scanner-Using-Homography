#!/usr/bin/env python3
"""
Document Scanner Web Application - Flask Backend
================================================

A production-ready Flask application that provides a web interface for 
automatic document scanning using computer vision.

Author: Senior Full Stack & Computer Vision Engineer
Date: January 2026
"""

from flask import Flask, render_template, request, jsonify, send_from_directory, url_for
from werkzeug.utils import secure_filename
import os
import time
import uuid
from datetime import datetime
import traceback

# Import our document scanner module
from scanner.scanner import DocumentScanner
from config import Config

# ============================================
# FLASK APP INITIALIZATION
# ============================================

app = Flask(__name__)
app.config.from_object(Config)

# Initialize document scanner
scanner = DocumentScanner()

# ============================================
# HELPER FUNCTIONS
# ============================================

def allowed_file(filename):
    """
    Check if the uploaded file has an allowed extension.
    
    Args:
        filename: Name of the uploaded file
        
    Returns:
        bool: True if file extension is allowed, False otherwise
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def generate_unique_filename(original_filename):
    """
    Generate a unique filename to prevent collisions.
    
    Args:
        original_filename: Original name of the uploaded file
        
    Returns:
        str: Unique filename with timestamp and UUID
    """
    # Get file extension
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
    
    # Generate unique filename: timestamp_uuid.ext
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    
    return f"{timestamp}_{unique_id}.{ext}"


def cleanup_old_files():
    """
    Remove files older than the configured maximum age.
    This helps prevent disk space issues from accumulating uploads/outputs.
    """
    try:
        max_age = app.config['FILE_MAX_AGE']  # seconds
        current_time = time.time()
        
        for folder in [app.config['UPLOAD_FOLDER'], app.config['OUTPUT_FOLDER']]:
            if not os.path.exists(folder):
                continue
                
            for filename in os.listdir(folder):
                filepath = os.path.join(folder, filename)
                
                # Skip if it's not a file
                if not os.path.isfile(filepath):
                    continue
                
                # Check file age
                file_age = current_time - os.path.getmtime(filepath)
                
                if file_age > max_age:
                    os.remove(filepath)
                    print(f"🗑️  Cleaned up old file: {filename}")
                    
    except Exception as e:
        print(f"⚠️  Error during cleanup: {str(e)}")


# ============================================
# ROUTES
# ============================================

@app.route('/')
def index():
    """
    Render the main page of the web application.
    
    Returns:
        Rendered HTML template
    """
    # Perform cleanup on each page load (production: use background task)
    cleanup_old_files()
    
    return render_template('index.html')


@app.route('/scan', methods=['POST'])
def scan_document():
    """
    Main endpoint for document scanning.
    
    Accepts:
        - file: Image file (multipart/form-data)
        - enhance_mode: Enhancement mode (adaptive, clahe, sharpen, none)
        
    Returns:
        JSON response with:
        - success: bool indicating if scan was successful
        - message: Descriptive message
        - original_url: URL to original uploaded image
        - scanned_url: URL to scanned output image
        - processing_time: Time taken for processing (seconds)
        - dimensions: Original and output image dimensions
    """
    
    start_time = time.time()
    
    # ============================================
    # 1. VALIDATE REQUEST
    # ============================================
    
    # Check if file is present in request
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'message': 'No file uploaded. Please select an image file.',
            'error_type': 'no_file'
        }), 400
    
    file = request.files['file']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({
            'success': False,
            'message': 'No file selected. Please choose an image file.',
            'error_type': 'empty_filename'
        }), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'message': f'Invalid file type. Allowed types: {", ".join(app.config["ALLOWED_EXTENSIONS"])}',
            'error_type': 'invalid_file_type'
        }), 400
    
    # Get enhancement mode from request (default: color for colorful documents)
    enhance_mode = request.form.get('enhance_mode', 'color')
    
    if enhance_mode not in ['none', 'adaptive', 'clahe', 'sharpen', 'color']:
        enhance_mode = 'color'
    
    # ============================================
    # 2. SAVE UPLOADED FILE
    # ============================================
    
    try:
        # Generate secure and unique filename
        original_filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(original_filename)
        
        # Save uploaded file
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(upload_path)
        
        print(f"📁 File saved: {unique_filename}")
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving file: {str(e)}',
            'error_type': 'save_error'
        }), 500
    
    # ============================================
    # 3. PROCESS IMAGE
    # ============================================
    
    try:
        # Generate output filename
        output_filename = f"scanned_{unique_filename}"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        # Run document scanner
        print(f"🔍 Processing document with {enhance_mode} enhancement...")
        
        result = scanner.scan_document(
            input_path=upload_path,
            output_path=output_path,
            enhance_mode=enhance_mode,
            width=app.config['PROCESSING_WIDTH']
        )
        
        # Check if document was detected
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message'],
                'error_type': 'detection_failed',
                'tips': [
                    'Ensure the document has clear, visible edges',
                    'Try better lighting conditions',
                    'Make sure the document is the largest object in the image',
                    'Avoid heavy shadows or reflections',
                    'Place the document on a contrasting background'
                ]
            }), 200  # Return 200 because it's not a server error
        
        # ============================================
        # 4. PREPARE RESPONSE
        # ============================================
        
        processing_time = time.time() - start_time
        
        # Generate URLs for frontend
        original_url = url_for('static', filename=f'uploads/{unique_filename}')
        scanned_url = url_for('static', filename=f'outputs/{output_filename}')
        
        response_data = {
            'success': True,
            'message': 'Document scanned successfully! ✨',
            'original_url': original_url,
            'scanned_url': scanned_url,
            'processing_time': round(processing_time, 2),
            'dimensions': {
                'original': result['original_size'],
                'scanned': result['output_size']
            },
            'enhance_mode': enhance_mode,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        print(f"✅ Processing complete in {processing_time:.2f}s")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        # Log the full traceback for debugging
        print(f"❌ Error during processing:")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'message': f'An error occurred during processing: {str(e)}',
            'error_type': 'processing_error',
            'details': str(e) if app.config['DEBUG'] else None
        }), 500


@app.route('/health')
def health_check():
    """
    Health check endpoint for monitoring and deployment.
    
    Returns:
        JSON with service status
    """
    return jsonify({
        'status': 'healthy',
        'service': 'Document Scanner API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'message': 'Endpoint not found',
        'error_type': 'not_found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error_type': 'server_error'
    }), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large errors"""
    max_size_mb = app.config['MAX_FILE_SIZE'] / (1024 * 1024)
    return jsonify({
        'success': False,
        'message': f'File too large. Maximum size is {max_size_mb:.0f}MB',
        'error_type': 'file_too_large'
    }), 413


# ============================================
# MAIN ENTRY POINT
# ============================================

if __name__ == '__main__':
    # Ensure required directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)
    
    print(f"\n{'='*70}")
    print("🚀 DOCUMENT SCANNER WEB APPLICATION")
    print(f"{'='*70}")
    print(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"📁 Output folder: {app.config['OUTPUT_FOLDER']}")
    print(f"📏 Max file size: {app.config['MAX_FILE_SIZE'] / (1024*1024):.0f}MB")
    print(f"🎨 Allowed extensions: {', '.join(app.config['ALLOWED_EXTENSIONS'])}")
    print(f"{'='*70}\n")
    
    # Run Flask development server
    # For production, use: gunicorn -w 4 -b 0.0.0.0:5000 app:app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config['DEBUG']
    )