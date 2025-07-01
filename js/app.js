/**
 * Main Application Script for Wildlife Immobilization Logger
 * Initializes and coordinates all modules
 */

// Define the App namespace
const App = {};

// Global variables
window.estimatedWeight = 0;

// Initialize the application
App.init = function() {
    console.log('App initialization started');
    
    try {
        // Initialize UI manager
        if (typeof UIManager !== 'undefined') {
            console.log('Initializing UI Manager');
            UIManager.initTabs();
        } else {
            console.error('UIManager not found');
        }
        
        // Initialize all modules
        if (typeof AnimalInfoManager !== 'undefined') {
            console.log('Initializing Animal Info Manager');
            AnimalInfoManager.init();
        }
        
        if (typeof DrugDoseManager !== 'undefined') {
            console.log('Initializing Drug Dose Manager');
            DrugDoseManager.init();
        }
        
        if (typeof MonitoringManager !== 'undefined') {
            console.log('Initializing Monitoring Manager');
            MonitoringManager.init();
        }
        
        if (typeof RecoveryManager !== 'undefined') {
            console.log('Initializing Recovery Manager');
            RecoveryManager.init();
        }
        
        if (typeof MorphometryManager !== 'undefined') {
            console.log('Initializing Morphometry Manager');
            MorphometryManager.init();
        }
        
        // Set up export functionality
        console.log('Setting up export functionality');
        setupExportFunctionality();
        
        // Setup saved sessions
        if (typeof SavedSessions !== 'undefined') {
            console.log('Initializing Saved Sessions');
            SavedSessions.init();
        }
        
        // Set up Progressive Web App functionality
        console.log('Setting up PWA functionality');
        setupPWA();
        
        // Show welcome notification
        setTimeout(() => {
            if (typeof UIManager !== 'undefined') {
                UIManager.showNotification('Welcome to Wildlife Immobilization Logger', 'info', 3000);
            }
        }, 500);
        
        console.log('App initialization completed successfully');
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting app initialization');
    App.init();
});

/**
 * Set up export tab functionality
 */
function setupExportFunctionality() {
    const generatePdfBtn = document.getElementById('generate-pdf');
    const saveSessionBtn = document.getElementById('save-session');
    const clearSessionBtn = document.getElementById('clear-session');
    
    // Generate PDF report
    generatePdfBtn.addEventListener('click', function() {
        PDFGenerator.generatePDF();
    });
    
    // Save session to local storage
    saveSessionBtn.addEventListener('click', function() {
        const data = StorageManager.exportAllData();
        const dataStr = JSON.stringify(data);
        
        // Create download link
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `Immobilization_Session_${dateStr}.json`;
        
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UIManager.showNotification('Session saved successfully', 'success');
    });
    
    // Clear session data (preserves drug repository)
    clearSessionBtn.addEventListener('click', function() {
        if (confirm('This will clear all current session data (animal info, monitoring logs, etc.) but will preserve your drug repository. Are you sure?')) {
            if (StorageManager.clearSessionData()) {
                UIManager.showNotification('Session data cleared successfully', 'success');
                
                // Reload page to reset all forms
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                UIManager.showNotification('Failed to clear session data', 'error');
            }
        }
    });
}

/**
 * Set up Progressive Web App functionality
 */
function setupPWA() {
    // Register service worker if supported
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = 'service-worker.js'; // Use relative path
            console.log('Attempting to register service worker at:', swUrl);
            navigator.serviceWorker.register(swUrl)
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.error('ServiceWorker registration failed: ', err);
                    // Try a different path if the first one fails
                    console.log('Trying alternative service worker path...');
                    navigator.serviceWorker.register('./service-worker.js')
                        .then(reg => {
                            console.log('ServiceWorker registration successful with alternative path, scope:', reg.scope);
                        })
                        .catch(error => {
                            console.error('ServiceWorker registration failed with alternative path:', error);
                        });
                });
        });
    } else {
        console.warn('Service workers are not supported in this browser');
    }
    
    // Handle PWA install prompt
    let deferredPrompt;
    const addBtn = document.createElement('button');
    addBtn.style.display = 'none';
    addBtn.className = 'install-button';
    addBtn.textContent = 'Install App';
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        addBtn.style.display = 'block';
        
        addBtn.addEventListener('click', () => {
            // Hide our user interface that shows our install button
            addBtn.style.display = 'none';
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        });
    });
}
