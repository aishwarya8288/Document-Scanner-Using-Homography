# """
# Configuration Settings for Document Scanner Web Application
# ===========================================================

# Centralized configuration management following best practices.
# Environment-specific settings can be overridden via environment variables.

# Author: Senior Full Stack Engineer
# Date: January 2026
# """

# import os


# class Config:
#     """
#     Base configuration class.
    
#     All settings are defined here and can be overridden by environment variables.
#     This follows the 12-factor app methodology for configuration management.
#     """
    
#     # ============================================
#     # FLASK SETTINGS
#     # ============================================
    
#     # Secret key for session management (change in production!)
#     SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
#     # Debug mode (disable in production)
#     DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
#     # ============================================
#     # FILE UPLOAD SETTINGS
#     # ============================================
    
#     # Base directory (where app.py is located)
#     BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
#     # Upload and output folders
#     UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
#     OUTPUT_FOLDER = os.path.join(BASE_DIR, 'static', 'outputs')
    
#     # Maximum file size (16 MB)
#     MAX_FILE_SIZE = 16 * 1024 * 1024
#     MAX_CONTENT_LENGTH = MAX_FILE_SIZE
    
#     # Allowed file extensions
#     ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
    
#     # ============================================
#     # DOCUMENT SCANNER SETTINGS
#     # ============================================
    
#     # Image processing width (larger = better quality but slower)
#     PROCESSING_WIDTH = 800
    
#     # Default enhancement mode
#     DEFAULT_ENHANCE_MODE = 'adaptive'
    
#     # ============================================
#     # CLEANUP SETTINGS
#     # ============================================
    
#     # Maximum age for files in seconds (1 hour = 3600 seconds)
#     # Files older than this will be automatically deleted
#     FILE_MAX_AGE = 3600
    
#     # ============================================
#     # CORS SETTINGS (if needed for API)
#     # ============================================
    
#     # Enable CORS for cross-origin requests
#     CORS_ENABLED = os.environ.get('CORS_ENABLED', 'False').lower() == 'true'
    
#     # ============================================
#     # LOGGING SETTINGS
#     # ============================================
    
#     LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
#     # ============================================
#     # PRODUCTION SETTINGS
#     # ============================================
    
#     @staticmethod
#     def init_app(app):
#         """
#         Initialize application with configuration.
#         Can be extended for production-specific setup.
#         """
#         # Ensure upload and output directories exist
#         os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
#         os.makedirs(Config.OUTPUT_FOLDER, exist_ok=True)


# class DevelopmentConfig(Config):
#     """Development environment configuration"""
#     DEBUG = True
#     PROCESSING_WIDTH = 800


# class ProductionConfig(Config):
#     """Production environment configuration"""
#     DEBUG = False
#     PROCESSING_WIDTH = 1200
    
#     # Use environment variable for secret key in production
#     SECRET_KEY = os.environ.get('SECRET_KEY')
    
#     @classmethod
#     def init_app(cls, app):
#         Config.init_app(app)
        
#         # Production-specific initialization
#         # e.g., configure logging, error reporting, etc.
#         pass


# class TestingConfig(Config):
#     """Testing environment configuration"""
#     TESTING = True
#     DEBUG = True
#     PROCESSING_WIDTH = 600


# # Configuration dictionary
# config = {
#     'development': DevelopmentConfig,
#     'production': ProductionConfig,
#     'testing': TestingConfig,
#     'default': DevelopmentConfig
# }
"""
Configuration Settings for Document Scanner Web Application
===========================================================

Centralized configuration management following best practices.
Environment-specific settings can be overridden via environment variables.

Author: Senior Full Stack Engineer
Date: January 2026
"""

import os


class Config:
    """
    Base configuration class.
    
    All settings are defined here and can be overridden by environment variables.
    This follows the 12-factor app methodology for configuration management.
    """
    
    # ============================================
    # FLASK SETTINGS
    # ============================================
    
    # Secret key for session management (change in production!)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Debug mode (disable in production)
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # ============================================
    # FILE UPLOAD SETTINGS
    # ============================================
    
    # Base directory (where app.py is located)
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # Upload and output folders
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    OUTPUT_FOLDER = os.path.join(BASE_DIR, 'static', 'outputs')
    
    # Maximum file size (16 MB)
    MAX_FILE_SIZE = 16 * 1024 * 1024
    MAX_CONTENT_LENGTH = MAX_FILE_SIZE
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
    
    # ============================================
    # DOCUMENT SCANNER SETTINGS
    # ============================================
    
    # Image processing width (larger = better quality but slower)
    PROCESSING_WIDTH = 800
    
    # Default enhancement mode
    DEFAULT_ENHANCE_MODE = 'adaptive'
    
    # ============================================
    # CLEANUP SETTINGS
    # ============================================
    
    # Maximum age for files in seconds (1 hour = 3600 seconds)
    # Files older than this will be automatically deleted
    FILE_MAX_AGE = 3600
    
    # ============================================
    # CORS SETTINGS (if needed for API)
    # ============================================
    
    # Enable CORS for cross-origin requests
    CORS_ENABLED = os.environ.get('CORS_ENABLED', 'False').lower() == 'true'
    
    # ============================================
    # LOGGING SETTINGS
    # ============================================
    
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
    # ============================================
    # PRODUCTION SETTINGS
    # ============================================
    
    @staticmethod
    def init_app(app):
        """
        Initialize application with configuration.
        Can be extended for production-specific setup.
        """
        # Ensure upload and output directories exist
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.OUTPUT_FOLDER, exist_ok=True)


class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    PROCESSING_WIDTH = 800


class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False
    PROCESSING_WIDTH = 1200
    
    # Use environment variable for secret key in production
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Production-specific initialization
        # e.g., configure logging, error reporting, etc.
        pass


class TestingConfig(Config):
    """Testing environment configuration"""
    TESTING = True
    DEBUG = True
    PROCESSING_WIDTH = 600


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
