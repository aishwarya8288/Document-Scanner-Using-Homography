/**
 * Document Scanner - Frontend JavaScript
 * ======================================
 * 
 * Handles all client-side interactions including:
 * - File upload (drag & drop + browse)
 * - Form submission
 * - AJAX requests to backend
 * - Dynamic UI updates
 * - Error handling
 * 
 * Author: Senior Full Stack Engineer
 * Date: January 2026
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    selectedFile: null,
    isProcessing: false,
    currentResult: null
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    // Upload area
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    browseBtn: document.getElementById('browseBtn'),
    
    // Enhancement options
    enhancementOptions: document.getElementById('enhancementOptions'),
    scanBtn: document.getElementById('scanBtn'),
    
    // Loading
    loading: document.getElementById('loading'),
    
    // Results
    results: document.getElementById('results'),
    resultsInfo: document.getElementById('resultsInfo'),
    originalImage: document.getElementById('originalImage'),
    scannedImage: document.getElementById('scannedImage'),
    downloadBtn: document.getElementById('downloadBtn'),
    newScanBtn: document.getElementById('newScanBtn'),
    
    // Error
    errorMessage: document.getElementById('errorMessage'),
    errorDescription: document.getElementById('errorDescription'),
    errorTips: document.getElementById('errorTips'),
    retryBtn: document.getElementById('retryBtn')
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    console.log('✅ Document Scanner initialized');
});

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Upload area - click to browse
    elements.uploadArea.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // Browse button
    elements.browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.fileInput.click();
    });
    
    // File input change
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    
    // Scan button
    elements.scanBtn.addEventListener('click', handleScanDocument);
    
    // Download button
    elements.downloadBtn.addEventListener('click', handleDownload);
    
    // New scan button
    elements.newScanBtn.addEventListener('click', resetApp);
    
    // Retry button
    elements.retryBtn.addEventListener('click', resetApp);
    
    // Prevent default drag behaviors on document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ============================================
// FILE SELECTION HANDLERS
// ============================================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processSelectedFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processSelectedFile(files[0]);
    }
}

function processSelectedFile(file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
        showError(
            'Invalid file type. Please upload an image file.',
            ['Supported formats: JPG, PNG, GIF, BMP, TIFF, WEBP']
        );
        return;
    }
    
    // Validate file size (16MB max)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
        showError(
            'File is too large. Maximum file size is 16MB.',
            ['Try compressing the image', 'Use a different image']
        );
        return;
    }
    
    // Store file and show enhancement options
    AppState.selectedFile = file;
    
    // Update UI
    elements.uploadArea.style.display = 'none';
    elements.enhancementOptions.style.display = 'block';
    elements.enhancementOptions.classList.add('fade-in');
    
    console.log(`📁 File selected: ${file.name} (${formatFileSize(file.size)})`);
}

// ============================================
// DOCUMENT SCANNING
// ============================================

async function handleScanDocument() {
    if (!AppState.selectedFile) {
        showError('No file selected. Please select an image file.');
        return;
    }
    
    if (AppState.isProcessing) {
        return; // Prevent multiple submissions
    }
    
    AppState.isProcessing = true;
    
    // Get selected enhancement mode
    const enhanceMode = document.querySelector('input[name="enhance"]:checked').value;
    
    // Show loading state
    showLoading();
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', AppState.selectedFile);
    formData.append('enhance_mode', enhanceMode);
    
    console.log(`🔍 Scanning document with ${enhanceMode} enhancement...`);
    
    try {
        // Send request to backend
        const response = await fetch('/scan', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success - show results
            showResults(result);
        } else {
            // Error from backend
            showError(result.message, result.tips || []);
        }
        
    } catch (error) {
        // Network or other error
        console.error('Error:', error);
        showError(
            'Failed to connect to the server. Please try again.',
            ['Check your internet connection', 'Refresh the page', 'Try again in a few moments']
        );
    } finally {
        AppState.isProcessing = false;
    }
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function showLoading() {
    elements.enhancementOptions.style.display = 'none';
    elements.results.style.display = 'none';
    elements.errorMessage.style.display = 'none';
    elements.loading.style.display = 'block';
    elements.loading.classList.add('fade-in');
}

function showResults(result) {
    console.log('✅ Scan successful!', result);
    
    // Store result
    AppState.currentResult = result;
    
    // Update images
    elements.originalImage.src = result.original_url;
    elements.scannedImage.src = result.scanned_url;
    
    // Update info
    elements.resultsInfo.innerHTML = `
        <span>⏱️ ${result.processing_time}s</span>
        <span>📐 ${result.dimensions.original[0]} × ${result.dimensions.original[1]}</span>
        <span>✨ ${capitalizeFirst(result.enhance_mode)}</span>
    `;
    
    // Show results section
    elements.loading.style.display = 'none';
    elements.results.style.display = 'block';
    elements.results.classList.add('fade-in');
    
    // Scroll to results
    elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message, tips = []) {
    console.error('❌ Error:', message);
    
    // Update error message
    elements.errorDescription.textContent = message;
    
    // Update tips
    if (tips.length > 0) {
        elements.errorTips.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
        elements.errorTips.style.display = 'block';
    } else {
        elements.errorTips.style.display = 'none';
    }
    
    // Show error section
    elements.loading.style.display = 'none';
    elements.enhancementOptions.style.display = 'none';
    elements.results.style.display = 'none';
    elements.errorMessage.style.display = 'block';
    elements.errorMessage.classList.add('fade-in');
}

function resetApp() {
    // Reset state
    AppState.selectedFile = null;
    AppState.isProcessing = false;
    AppState.currentResult = null;
    
    // Reset file input
    elements.fileInput.value = '';
    
    // Reset UI
    elements.uploadArea.style.display = 'block';
    elements.enhancementOptions.style.display = 'none';
    elements.loading.style.display = 'none';
    elements.results.style.display = 'none';
    elements.errorMessage.style.display = 'none';
    
    // Reset radio buttons to default (adaptive)
    document.querySelector('input[name="enhance"][value="adaptive"]').checked = true;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('🔄 App reset');
}

// ============================================
// DOWNLOAD HANDLER
// ============================================

function handleDownload() {
    if (!AppState.currentResult) {
        return;
    }
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = AppState.currentResult.scanned_url;
    link.download = `scanned_document_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('⬇️ Download started');
    
    // Visual feedback
    const originalText = elements.downloadBtn.innerHTML;
    elements.downloadBtn.innerHTML = '<span class="btn-icon">✅</span> Downloaded!';
    elements.downloadBtn.disabled = true;
    
    setTimeout(() => {
        elements.downloadBtn.innerHTML = originalText;
        elements.downloadBtn.disabled = false;
    }, 2000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + U - Upload file
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        if (elements.uploadArea.style.display !== 'none') {
            elements.fileInput.click();
        }
    }
    
    // Escape - Reset app
    if (e.key === 'Escape') {
        if (elements.results.style.display !== 'none' || elements.errorMessage.style.display !== 'none') {
            resetApp();
        }
    }
    
    // Enter - Scan document (if enhancement options visible)
    if (e.key === 'Enter') {
        if (elements.enhancementOptions.style.display !== 'none' && !AppState.isProcessing) {
            handleScanDocument();
        }
    }
});

// ============================================
// SMOOTH SCROLLING FOR NAVIGATION
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// ONLINE/OFFLINE DETECTION
// ============================================

window.addEventListener('online', () => {
    console.log('🟢 Back online');
});

window.addEventListener('offline', () => {
    console.log('🔴 Connection lost');
    showError(
        'You appear to be offline. Please check your internet connection.',
        ['Connect to the internet', 'Try again once connected']
    );
});

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log(`
╔═══════════════════════════════════════╗
║   📄 Document Scanner Web App        ║
║   Built with Flask + OpenCV          ║
║   Author: Senior Full Stack Engineer ║
╚═══════════════════════════════════════╝
`);
