/**
 * Document Scanner - Futuristic Frontend
 * =======================================
 * Enhanced with smooth animations, micro-interactions, and premium UX
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
    heroUploadBtn: document.getElementById('heroUploadBtn'),
    
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
    initializeAnimations();
    initializeParallax();
    console.log('✨ Futuristic Document Scanner initialized');
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
    
    // Hero upload button
    if (elements.heroUploadBtn) {
        elements.heroUploadBtn.addEventListener('click', () => {
            elements.uploadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                elements.fileInput.click();
            }, 500);
        });
    }
    
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
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Add ripple effect to all buttons
    addRippleEffects();
    
    // Smooth scroll for nav links
    initializeSmoothScroll();
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ============================================
// ANIMATIONS & MICRO-INTERACTIONS
// ============================================

function initializeAnimations() {
    // Animate counters on hero section
    animateCounters();
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.feature-card, .step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

function addRippleEffects() {
    document.querySelectorAll('.glass-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = this.querySelector('.ripple');
            if (ripple) {
                ripple.classList.remove('active');
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                ripple.classList.add('active');
            }
        });
    });
}

function initializeParallax() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                
                // Parallax effect on gradient orbs
                const orbs = document.querySelectorAll('.orb');
                orbs.forEach((orb, index) => {
                    const speed = 0.1 + (index * 0.05);
                    orb.style.transform = `translateY(${scrolled * speed}px)`;
                });
                
                // Parallax on particles
                const particles = document.querySelectorAll('.particle');
                particles.forEach((particle, index) => {
                    const speed = 0.05 + (index * 0.02);
                    particle.style.transform = `translateY(${scrolled * speed}px)`;
                });
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

function initializeSmoothScroll() {
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
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
        showError(
            'File is too large. Maximum file size is 16MB.',
            ['Try compressing the image', 'Use a different image']
        );
        return;
    }
    
    // Store file
    AppState.selectedFile = file;
    
    // Animate transition
    animateTransition(elements.uploadArea, elements.enhancementOptions, () => {
        elements.uploadArea.style.display = 'none';
        elements.enhancementOptions.style.display = 'block';
    });
    
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
        return;
    }
    
    AppState.isProcessing = true;
    
    // Get selected enhancement mode
    const enhanceMode = document.querySelector('input[name="enhance"]:checked').value;
    
    // Show loading with animation
    animateTransition(elements.enhancementOptions, elements.loading, () => {
        elements.enhancementOptions.style.display = 'none';
        elements.loading.style.display = 'block';
    });
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', AppState.selectedFile);
    formData.append('enhance_mode', enhanceMode);
    
    console.log(`🔍 Scanning document with ${enhanceMode} enhancement...`);
    
    try {
        const response = await fetch('/scan', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResults(result);
        } else {
            showError(result.message, result.tips || []);
        }
        
    } catch (error) {
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

function showResults(result) {
    console.log('✅ Scan successful!', result);
    
    AppState.currentResult = result;
    
    // Update images
    elements.originalImage.src = result.original_url;
    elements.scannedImage.src = result.scanned_url;
    
    // Update info with animation
    elements.resultsInfo.innerHTML = `
        <span style="opacity: 0; animation: fadeInUp 0.5s ease-out forwards;">⏱️ ${result.processing_time}s</span>
        <span style="opacity: 0; animation: fadeInUp 0.5s 0.1s ease-out forwards;">📐 ${result.dimensions.original[0]} × ${result.dimensions.original[1]}</span>
        <span style="opacity: 0; animation: fadeInUp 0.5s 0.2s ease-out forwards;">✨ ${capitalizeFirst(result.enhance_mode)}</span>
    `;
    
    // Animate transition
    animateTransition(elements.loading, elements.results, () => {
        elements.loading.style.display = 'none';
        elements.results.style.display = 'block';
        
        // Animate images
        setTimeout(() => {
            elements.originalImage.style.opacity = '0';
            elements.scannedImage.style.opacity = '0';
            elements.originalImage.style.transform = 'scale(0.9)';
            elements.scannedImage.style.transform = 'scale(0.9)';
            
            elements.originalImage.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            elements.scannedImage.style.transition = 'all 0.5s 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                elements.originalImage.style.opacity = '1';
                elements.scannedImage.style.opacity = '1';
                elements.originalImage.style.transform = 'scale(1)';
                elements.scannedImage.style.transform = 'scale(1)';
            }, 50);
        }, 100);
    });
    
    // Scroll to results with delay
    setTimeout(() => {
        elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

function showError(message, tips = []) {
    console.error('❌ Error:', message);
    
    elements.errorDescription.textContent = message;
    
    if (tips.length > 0) {
        elements.errorTips.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
        elements.errorTips.style.display = 'block';
    } else {
        elements.errorTips.style.display = 'none';
    }
    
    // Animate error display
    const currentVisible = elements.loading.style.display !== 'none' ? elements.loading :
                          elements.enhancementOptions.style.display !== 'none' ? elements.enhancementOptions : null;
    
    if (currentVisible) {
        animateTransition(currentVisible, elements.errorMessage, () => {
            elements.loading.style.display = 'none';
            elements.enhancementOptions.style.display = 'none';
            elements.results.style.display = 'none';
            elements.errorMessage.style.display = 'block';
        });
    } else {
        elements.errorMessage.style.display = 'block';
    }
}

function resetApp() {
    AppState.selectedFile = null;
    AppState.isProcessing = false;
    AppState.currentResult = null;
    
    elements.fileInput.value = '';
    
    // Animate reset
    const currentVisible = elements.enhancementOptions.style.display !== 'none' ? elements.enhancementOptions :
                          elements.results.style.display !== 'none' ? elements.results :
                          elements.errorMessage.style.display !== 'none' ? elements.errorMessage : null;
    
    if (currentVisible) {
        animateTransition(currentVisible, elements.uploadArea, () => {
            elements.uploadArea.style.display = 'block';
            elements.enhancementOptions.style.display = 'none';
            elements.loading.style.display = 'none';
            elements.results.style.display = 'none';
            elements.errorMessage.style.display = 'none';
        });
    } else {
        elements.uploadArea.style.display = 'block';
    }
    
    // Reset radio buttons
    document.querySelector('input[name="enhance"][value="adaptive"]').checked = true;
    
    // Scroll to top
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
    
    console.log('🔄 App reset');
}

// ============================================
// DOWNLOAD HANDLER
// ============================================

function handleDownload() {
    if (!AppState.currentResult) {
        return;
    }
    
    const link = document.createElement('a');
    link.href = AppState.currentResult.scanned_url;
    link.download = `scanned_document_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('⬇️ Download started');
    
    // Success animation
    const originalHTML = elements.downloadBtn.innerHTML;
    elements.downloadBtn.innerHTML = `
        <span class="btn-content">
            <span class="btn-icon" style="animation: bounce-subtle 0.5s ease-out;">✅</span>
            <span>Downloaded!</span>
        </span>
    `;
    elements.downloadBtn.style.background = 'linear-gradient(135deg, #00D9A3 0%, #00B88C 100%)';
    elements.downloadBtn.disabled = true;
    
    setTimeout(() => {
        elements.downloadBtn.innerHTML = originalHTML;
        elements.downloadBtn.style.background = '';
        elements.downloadBtn.disabled = false;
    }, 2500);
}

// ============================================
// ANIMATION UTILITIES
// ============================================

function animateTransition(fromElement, toElement, callback) {
    // Fade out current element
    fromElement.style.transition = 'all 0.3s ease-out';
    fromElement.style.opacity = '0';
    fromElement.style.transform = 'translateY(-20px) scale(0.95)';
    
    setTimeout(() => {
        callback();
        
        // Fade in new element
        toElement.style.opacity = '0';
        toElement.style.transform = 'translateY(20px) scale(0.95)';
        
        setTimeout(() => {
            toElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            toElement.style.opacity = '1';
            toElement.style.transform = 'translateY(0) scale(1)';
        }, 50);
    }, 300);
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
        if (elements.results.style.display !== 'none' || 
            elements.errorMessage.style.display !== 'none') {
            resetApp();
        }
    }
    
    // Enter - Scan document
    if (e.key === 'Enter') {
        if (elements.enhancementOptions.style.display !== 'none' && !AppState.isProcessing) {
            handleScanDocument();
        }
    }
});

// ============================================
// ONLINE/OFFLINE DETECTION
// ============================================

window.addEventListener('online', () => {
    console.log('🟢 Connection restored');
    
    // Show subtle notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #00D9A3, #00B88C);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 217, 163, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: fadeInRight 0.4s ease-out;
    `;
    notification.textContent = '✓ Back online';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease-out';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
});

window.addEventListener('offline', () => {
    console.log('🔴 Connection lost');
    showError(
        'You appear to be offline. Please check your internet connection.',
        ['Connect to the internet', 'Try again once connected']
    );
});

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

const welcomeStyles = [
    'color: #3D8BFF',
    'font-size: 16px',
    'font-weight: bold',
    'text-shadow: 0 0 10px rgba(61, 139, 255, 0.5)'
].join(';');

console.log('%c✨ Futuristic Document Scanner', welcomeStyles);
console.log('%cBuilt with modern web technologies', 'color: #4DF2FF; font-size: 12px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3D8BFF;');
console.log('🎨 Glassmorphism UI');
console.log('⚡ Smooth Animations');
console.log('🚀 AI-Powered Processing');
console.log('📱 Fully Responsive');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3D8BFF;');
console.log('Keyboard Shortcuts:');
console.log('  Ctrl/Cmd + U: Upload file');
console.log('  Enter: Scan document');
console.log('  Escape: Reset');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3D8BFF;');