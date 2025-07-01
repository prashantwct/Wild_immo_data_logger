/**
 * UI Manager - Handles all UI interactions and updates
 */

const UIManager = (function() {
    // Private variables
    let currentTab = 'animal-info';
    
    // Initialize tabs
    function initTabs() {
        console.log('Initializing tabs...');
        const tabLinks = document.querySelectorAll('.tabs li');
        
        tabLinks.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                console.log('Tab clicked:', tabId);
                showTab(tabId);
            });
        });
        
        // Show the first tab by default
        if (tabLinks.length > 0) {
            showTab(tabLinks[0].getAttribute('data-tab'));
        }
    }
    
    // Show a specific tab
    function showTab(tabId) {
        console.log('Showing tab:', tabId);
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Deactivate all tab links
        document.querySelectorAll('.tabs li').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show the selected tab content
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.classList.add('active');
        } else {
            console.error('Tab content not found:', tabId);
        }
        
        // Activate the clicked tab
        const tabLink = document.querySelector(`.tabs li[data-tab="${tabId}"]`);
        if (tabLink) {
            tabLink.classList.add('active');
        }
        
        currentTab = tabId;
        
        // Trigger a custom event when tab changes
        const event = new CustomEvent('tabChanged', { detail: { tabId } });
        document.dispatchEvent(event);
    }
    
    // Show a notification to the user
    function showNotification(message, type = 'info', duration = 3000) {
        console.log(`[${type}] ${message}`);
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        // Hide after duration
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }
    
    // Toggle loading state
    function setLoading(loading = true) {
        const app = document.getElementById('app');
        if (loading) {
            app.classList.add('loading');
        } else {
            app.classList.remove('loading');
        }
    }
    
    // Toggle loading state for a specific button
    function toggleButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            // Store original text
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            button.disabled = true;
        } else {
            // Restore original text if exists
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            } else {
                button.textContent = 'Done';
            }
            button.disabled = false;
        }
    }
    
    // Public API
    return {
        initTabs,
        showTab,
        showNotification,
        setLoading,
        toggleButtonLoading,
        getCurrentTab: () => currentTab
    };
})();

// Make UIManager globally available
window.UIManager = UIManager;
