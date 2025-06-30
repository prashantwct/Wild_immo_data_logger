/**
 * Main Application Script for Wildlife Immobilization Logger
 * Initializes and coordinates all modules
 */

// Global variables
window.estimatedWeight = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI manager
    UIManager.initTabs();
    
    // Initialize all modules
    AnimalInfoManager.init();
    DrugDoseManager.init();
    MonitoringManager.init();
    RecoveryManager.init();
    MorphometryManager.init();
    
    // Set up export functionality
    setupExportFunctionality();
    
    // Check if app can be installed as PWA
    setupPWA();
    
    // Show welcome notification
    setTimeout(() => {
        UIManager.showNotification('Welcome to Wildlife Immobilization Logger', 'info', 3000);
    }, 500);
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
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
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
