/**
 * Recovery Events Module for Wildlife Immobilization Logger
 * Handles recovery event logging
 */

const RecoveryManager = (function() {
    // DOM Elements
    const eventTimeInput = document.getElementById('event-time');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventNotesInput = document.getElementById('event-notes');
    const addEventBtn = document.getElementById('add-recovery-event');
    const eventsContainer = document.getElementById('recovery-event-entries');
    
    /**
     * Initialize the Recovery tab
     */
    function init() {
        // Set current time as default
        setCurrentTime();
        
        // Load saved events
        loadSavedEvents();
        
        // Add event listeners
        addEventBtn.addEventListener('click', addRecoveryEvent);
        
        // Handle delete event button clicks
        eventsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-event') || 
                e.target.closest('.delete-event')) {
                const row = e.target.closest('tr');
                const index = Array.from(row.parentNode.children).indexOf(row);
                removeRecoveryEvent(index);
            }
        });
    }
    
    /**
     * Set current time for event input
     */
    function setCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        eventTimeInput.value = `${hours}:${minutes}`;
    }
    
    /**
     * Add a recovery event
     */
    function addRecoveryEvent() {
        // Get values from form
        const time = eventTimeInput.value;
        const description = eventDescriptionInput.value;
        const notes = eventNotesInput.value;
        
        // Validate inputs
        if (!time || !description) {
            UIManager.showNotification('Please enter time and description', 'error');
            return;
        }
        
        // Create event object
        const event = {
            time,
            description,
            notes,
            timestamp: new Date().toISOString()
        };
        
        // Save to storage
        if (StorageManager.addRecoveryEvent(event)) {
            UIManager.showNotification('Recovery event added successfully', 'success');
            
            // Add to UI
            addEventToTable(event, StorageManager.loadRecoveryEvents().length - 1);
            
            // Clear form
            clearEventForm();
            
            // Set current time for next event
            setCurrentTime();
        } else {
            UIManager.showNotification('Failed to add recovery event', 'error');
        }
    }
    
    /**
     * Add an event to the table
     * @param {Object} event - Event object
     * @param {number} index - Index of event
     */
    function addEventToTable(event, index) {
        const row = document.createElement('tr');
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = event.time;
        row.appendChild(timeCell);
        
        // Description column
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = event.description;
        row.appendChild(descriptionCell);
        
        // Notes column
        const notesCell = document.createElement('td');
        notesCell.textContent = event.notes || '-';
        row.appendChild(notesCell);
        
        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'action-cell';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-event';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete event';
        actionsCell.appendChild(deleteBtn);
        
        row.appendChild(actionsCell);
        
        // Add row to table
        eventsContainer.appendChild(row);
    }
    
    /**
     * Remove a recovery event
     * @param {number} index - Index of event to remove
     */
    function removeRecoveryEvent(index) {
        if (StorageManager.removeRecoveryEvent(index)) {
            // Remove from UI
            eventsContainer.removeChild(eventsContainer.children[index]);
            UIManager.showNotification('Event removed', 'success');
        } else {
            UIManager.showNotification('Failed to remove event', 'error');
        }
    }
    
    /**
     * Clear event form inputs
     */
    function clearEventForm() {
        eventDescriptionInput.value = '';
        eventNotesInput.value = '';
    }
    
    /**
     * Load saved recovery events
     */
    function loadSavedEvents() {
        const events = StorageManager.loadRecoveryEvents();
        
        // Clear existing table entries
        eventsContainer.innerHTML = '';
        
        // Add each event to the table
        events.forEach((event, index) => {
            addEventToTable(event, index);
        });
    }
    
    /**
     * Get recovery events
     * @returns {Array} - Array of recovery event objects
     */
    function getRecoveryEvents() {
        return StorageManager.loadRecoveryEvents();
    }
    
    // Return public methods
    return {
        init,
        getRecoveryEvents
    };
})();
