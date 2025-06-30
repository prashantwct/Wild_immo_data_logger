/**
 * UI Manager for Wildlife Immobilization Logger
 * Handles UI interactions and notifications
 */

const UIManager = (function() {
    // DOM Elements
    const tabNavigationItems = document.querySelectorAll('#tab-navigation li');
    const tabContents = document.querySelectorAll('.tab-content');
    const notificationElement = document.getElementById('notification');
    
    /**
     * Initialize tab navigation
     */
    function initTabs() {
        tabNavigationItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }
    
    /**
     * Switch active tab
     * @param {string} tabId - ID of tab to switch to
     */
    function switchTab(tabId) {
        // Remove active class from all tabs and contents
        tabNavigationItems.forEach(item => {
            item.classList.remove('active');
        });
        
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to selected tab and content
        document.querySelector(`#tab-navigation li[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }
    
    /**
     * Show notification to user
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info)
     * @param {number} duration - Duration in ms before auto-hiding
     */
    function showNotification(message, type = 'success', duration = 3000) {
        // Set notification color based on type
        let backgroundColor;
        switch (type) {
            case 'success':
                backgroundColor = 'var(--success-color)';
                break;
            case 'error':
                backgroundColor = 'var(--danger-color)';
                break;
            default:
                backgroundColor = 'var(--primary-color)';
        }
        
        notificationElement.textContent = message;
        notificationElement.style.backgroundColor = backgroundColor;
        notificationElement.style.display = 'block';
        
        // Auto-hide after duration
        setTimeout(() => {
            hideNotification();
        }, duration);
    }
    
    /**
     * Hide the notification
     */
    function hideNotification() {
        notificationElement.style.display = 'none';
    }
    
    /**
     * Create input element with label
     * @param {string} type - Input type
     * @param {string} id - Input ID
     * @param {string} labelText - Label text
     * @param {boolean} required - Whether input is required
     * @returns {HTMLDivElement} - Form group element
     */
    function createFormGroup(type, id, labelText, required = false) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = labelText;
        
        const input = document.createElement('input');
        input.setAttribute('type', type);
        input.setAttribute('id', id);
        input.setAttribute('name', id);
        if (required) {
            input.setAttribute('required', 'required');
        }
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        
        return formGroup;
    }
    
    /**
     * Create a select element with options
     * @param {string} id - Select ID
     * @param {string} labelText - Label text
     * @param {Array} options - Array of option values
     * @param {boolean} required - Whether select is required
     * @returns {HTMLDivElement} - Form group element
     */
    function createSelect(id, labelText, options, required = false) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = labelText;
        
        const select = document.createElement('select');
        select.setAttribute('id', id);
        select.setAttribute('name', id);
        
        if (required) {
            select.setAttribute('required', 'required');
        }
        
        // Add a default empty option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select...';
        select.appendChild(defaultOption);
        
        // Add all options
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            select.appendChild(optionEl);
        });
        
        formGroup.appendChild(label);
        formGroup.appendChild(select);
        
        return formGroup;
    }
    
    /**
     * Create button element
     * @param {string} text - Button text
     * @param {string} type - Button type (primary, secondary, danger)
     * @param {string} id - Button ID
     * @returns {HTMLButtonElement} - Button element
     */
    function createButton(text, type, id) {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('id', id);
        button.className = `${type}-btn`;
        button.textContent = text;
        
        return button;
    }
    
    /**
     * Format date as YYYY-MM-DD
     * @param {Date} date - Date to format
     * @returns {string} - Formatted date string
     */
    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Format time as HH:MM
     * @param {Date} date - Date to format
     * @returns {string} - Formatted time string
     */
    function formatTime(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }
    
    /**
     * Format datetime for input[type="datetime-local"]
     * @param {Date} date - Date to format
     * @returns {string} - Formatted datetime string
     */
    function formatDatetime(date) {
        const d = new Date(date);
        
        // Format as YYYY-MM-DDTHH:MM
        return d.toISOString().slice(0, 16);
    }
    
    /**
     * Check if an element is in the viewport
     * @param {HTMLElement} el - Element to check
     * @returns {boolean} - Whether element is in viewport
     */
    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Scroll an element into view smoothly
     * @param {HTMLElement} el - Element to scroll to
     */
    function scrollIntoView(el) {
        if (!isInViewport(el)) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    /**
     * Validate form inputs
     * @param {HTMLFormElement} form - Form to validate
     * @returns {boolean} - Whether form is valid
     */
    function validateForm(form) {
        const requiredInputs = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
                
                // Add event listener to remove invalid class when input changes
                input.addEventListener('input', function() {
                    if (this.value.trim()) {
                        this.classList.remove('invalid');
                    }
                }, { once: true });
                
                // Scroll to first invalid input
                if (isValid === false) {
                    scrollIntoView(input);
                }
            } else {
                input.classList.remove('invalid');
            }
        });
        
        if (!isValid) {
            showNotification('Please fill in all required fields', 'error');
        }
        
        return isValid;
    }
    
    /**
     * Toggle loading state of a button
     * @param {HTMLButtonElement} button - Button to toggle
     * @param {boolean} isLoading - Whether button is loading
     */
    function toggleButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
    
    /**
     * Create a delete button
     * @returns {HTMLButtonElement} - Delete button
     */
    function createDeleteButton() {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete';
        
        return deleteBtn;
    }
    
    /**
     * Create an edit button
     * @returns {HTMLButtonElement} - Edit button
     */
    function createEditButton() {
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit';
        
        return editBtn;
    }
    
    // Return public methods
    return {
        initTabs,
        switchTab,
        showNotification,
        hideNotification,
        createFormGroup,
        createSelect,
        createButton,
        formatDate,
        formatTime,
        formatDatetime,
        scrollIntoView,
        validateForm,
        toggleButtonLoading,
        createDeleteButton,
        createEditButton
    };
})();
