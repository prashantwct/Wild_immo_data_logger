/**
 * Monitoring Module for Wildlife Immobilization Logger
 * Handles timing and vital signs monitoring
 */

const MonitoringManager = (function() {
    // DOM Elements
    const timerElement = document.getElementById('timer');
    const startTimerBtn = document.getElementById('start-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const monitoringTimeInput = document.getElementById('monitoring-time');
    const heartRateInput = document.getElementById('heart-rate');
    const respiratoryRateInput = document.getElementById('respiratory-rate');
    const temperatureInput = document.getElementById('temperature');
    const spo2Input = document.getElementById('spo2');
    const addLogBtn = document.getElementById('add-monitoring-log');
    const logEntriesContainer = document.getElementById('monitoring-log-entries');
    
    // Event buttons
    const eventButtons = {
        'dart': document.getElementById('event-dart'),
        'head-down': document.getElementById('event-head-down'),
        'induction': document.getElementById('event-induction'),
        'reversal': document.getElementById('event-reversal'),
        'ocular': document.getElementById('event-ocular'),
        'eye-twitch': document.getElementById('event-eye-twitch'),
        'head-lift': document.getElementById('event-head-lift'),
        'sternal': document.getElementById('event-sternal'),
        'stand-up': document.getElementById('event-stand-up')
    };
    
    // Timer variables
    let timer;
    let timerStartTime;
    let timerRunning = false;
    let elapsedTimeInSeconds = 0;
    
    /**
     * Initialize the Monitoring tab
     */
    function init() {
        // Set current time as default for monitoring log
        setCurrentTimeForLog();
        
        // Load saved logs
        loadSavedLogs();
        
        // Add event listeners
        startTimerBtn.addEventListener('click', toggleTimer);
        resetTimerBtn.addEventListener('click', resetTimer);
        addLogBtn.addEventListener('click', addMonitoringLog);
        
        // Add event listeners for monitoring events
        Object.entries(eventButtons).forEach(([eventType, button]) => {
            if (button) {
                button.addEventListener('click', () => addEventLog(eventType));
            }
        });
        
        // Handle delete log button clicks
        logEntriesContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-log') || 
                e.target.closest('.delete-log')) {
                const row = e.target.closest('tr');
                const index = Array.from(row.parentNode.children).indexOf(row);
                removeLogEntry(index);
            }
        });
    }
    
    /**
     * Set current time for monitoring log
     */
    function setCurrentTimeForLog() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        monitoringTimeInput.value = `${hours}:${minutes}`;
    }
    
    /**
     * Toggle timer start/pause
     */
    function toggleTimer() {
        if (!timerRunning) {
            // Start timer
            timerRunning = true;
            startTimerBtn.textContent = 'Pause Timer';
            startTimerBtn.classList.add('active');
            
            // Set start time if this is the first start
            if (!timerStartTime) {
                timerStartTime = new Date();
            } else {
                // Adjust for paused time
                const now = new Date();
                timerStartTime = new Date(now - elapsedTimeInSeconds * 1000);
            }
            
            // Start the timer
            timer = setInterval(updateTimer, 1000);
            
            // Set log time to current time
            setCurrentTimeForLog();
        } else {
            // Pause timer
            timerRunning = false;
            startTimerBtn.textContent = 'Resume Timer';
            startTimerBtn.classList.remove('active');
            
            // Stop the timer
            clearInterval(timer);
            
            // Store elapsed time
            const now = new Date();
            elapsedTimeInSeconds = Math.floor((now - timerStartTime) / 1000);
        }
    }
    
    /**
     * Update timer display
     */
    function updateTimer() {
        const now = new Date();
        const timeDiff = now - timerStartTime;
        const seconds = Math.floor(timeDiff / 1000) % 60;
        const minutes = Math.floor(timeDiff / 1000 / 60) % 60;
        const hours = Math.floor(timeDiff / 1000 / 60 / 60);
        
        timerElement.textContent = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
    
    /**
     * Reset timer
     */
    function resetTimer() {
        // Stop the timer
        clearInterval(timer);
        timerRunning = false;
        
        // Reset variables
        timerStartTime = null;
        elapsedTimeInSeconds = 0;
        
        // Update UI
        timerElement.textContent = '00:00:00';
        startTimerBtn.textContent = 'Start Timer';
        startTimerBtn.classList.remove('active');
    }
    
    /**
     * Add a monitoring log entry
     */
    function addMonitoringLog() {
        // Get values from form
        const time = monitoringTimeInput.value.trim();
        const heartRate = heartRateInput.value.trim();
        const respiratoryRate = respiratoryRateInput.value.trim();
        const temperature = temperatureInput.value.trim();
        const spo2 = spo2Input.value.trim();
        
        // Validate inputs
        if (!time) {
            UIManager.showNotification('Please enter a valid time', 'error');
            monitoringTimeInput.focus();
            return;
        }
        
        // Time format validation (HH:MM)
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            UIManager.showNotification('Please enter time in HH:MM format (24-hour)', 'error');
            monitoringTimeInput.focus();
            return;
        }
        
        // Numeric validation with ranges
        const validations = [
            { value: heartRate, field: heartRateInput, name: 'Heart Rate', min: 0, max: 300, decimals: 0 },
            { value: respiratoryRate, field: respiratoryRateInput, name: 'Respiratory Rate', min: 0, max: 100, decimals: 0 },
            { value: temperature, field: temperatureInput, name: 'Temperature', min: 30, max: 45, decimals: 1 },
            { value: spo2, field: spo2Input, name: 'SpO₂', min: 0, max: 100, decimals: 0 }
        ];
        
        for (const { value, field, name, min, max, decimals } of validations) {
            if (!value) {
                UIManager.showNotification(`${name} is required`, 'error');
                field.focus();
                return;
            }
            
            // Check if it's a valid number
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                UIManager.showNotification(`Please enter a valid number for ${name}`, 'error');
                field.focus();
                return;
            }
            
            // Check decimal places
            if (decimals === 0 && !/^\d+$/.test(value)) {
                UIManager.showNotification(`${name} must be a whole number`, 'error');
                field.focus();
                return;
            } else if (decimals > 0) {
                const decimalPart = value.split('.')[1];
                if (decimalPart && decimalPart.length > decimals) {
                    UIManager.showNotification(`${name} can have maximum ${decimals} decimal places`, 'error');
                    field.focus();
                    return;
                }
            }
            
            // Check range
            if (numValue < min || numValue > max) {
                UIManager.showNotification(`${name} must be between ${min} and ${max}`, 'error');
                field.focus();
                return;
            }
        }
        
        // Create log object
        const log = {
            time,
            heartRate,
            respiratoryRate,
            temperature,
            spo2,
            timestamp: new Date().toISOString()
        };
        
        // Save to storage
        if (StorageManager.addMonitoringLog(log)) {
            UIManager.showNotification('Monitoring log added successfully', 'success');
            
            // Add to UI
            addLogToTable(log, StorageManager.loadMonitoringLogs().length - 1);
            
            // Clear form
            clearMonitoringForm();
            
            // Set current time for next log
            setCurrentTimeForLog();
        } else {
            UIManager.showNotification('Failed to add monitoring log', 'error');
        }
    }
    
    /**
     * Add a log entry to the table
     * @param {Object} log - Log entry object
     * @param {number} index - Index of log entry
     */
    function addLogToTable(log, index) {
        const row = document.createElement('tr');
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = log.time || new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        row.appendChild(timeCell);
        
        if (log.type === 'event') {
            // Event log row
            const eventCell = document.createElement('td');
            eventCell.colSpan = 4; // Span across all data columns
            eventCell.className = 'event-log';
            
            const eventName = document.createElement('strong');
            eventName.textContent = log.event.name || formatEventName(log.event.type);
            eventCell.appendChild(eventName);
            
            if (log.event.notes) {
                const notes = document.createElement('span');
                notes.className = 'event-notes';
                notes.textContent = ` - ${log.event.notes}`;
                eventCell.appendChild(notes);
            }
            
            row.appendChild(eventCell);
        } else {
            // Vital signs log row
            // Heart rate column
            const hrCell = document.createElement('td');
            hrCell.textContent = log.heartRate;
            row.appendChild(hrCell);
            
            // Respiratory rate column
            const rrCell = document.createElement('td');
            rrCell.textContent = log.respiratoryRate;
            row.appendChild(rrCell);
            
            // Temperature column
            const tempCell = document.createElement('td');
            tempCell.textContent = log.temperature;
            row.appendChild(tempCell);
            
            // SpO2 column
            const spo2Cell = document.createElement('td');
            spo2Cell.textContent = log.spo2;
            row.appendChild(spo2Cell);
        }
        
        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'action-cell';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-log';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete log entry';
        deleteBtn.dataset.index = index;
        actionsCell.appendChild(deleteBtn);
        
        row.appendChild(actionsCell);
        
        // Add row to table (at the top for newest first)
        if (logEntriesContainer.firstChild) {
            logEntriesContainer.insertBefore(row, logEntriesContainer.firstChild);
        } else {
            logEntriesContainer.appendChild(row);
        }
    }
    
    /**
     * Remove a log entry
     * @param {number} index - Index of log to remove
     */
    function removeLogEntry(index) {
        if (StorageManager.removeMonitoringLog(index)) {
            // Remove from UI
            logEntriesContainer.removeChild(logEntriesContainer.children[index]);
            UIManager.showNotification('Log entry removed', 'success');
        } else {
            UIManager.showNotification('Failed to remove log entry', 'error');
        }
    }
    
    /**
     * Clear monitoring form inputs
     */
    function clearMonitoringForm() {
        heartRateInput.value = '';
        respiratoryRateInput.value = '';
        temperatureInput.value = '';
        spo2Input.value = '';
    }
    
    /**
     * Load saved monitoring logs
     */
    function addEventLog(eventType) {
        const eventNames = {
            'dart': 'Dart Hit',
            'head-down': 'Head Down',
            'induction': 'Induction Time',
            'reversal': 'Reversal Administered',
            'ocular': 'Ocular Reflex',
            'eye-twitch': 'Eye Twitching',
            'head-lift': 'Head Lift',
            'sternal': 'Sternal Recumbency',
            'stand-up': 'Stand Up'
        };
        
        const eventName = eventNames[eventType] || eventType;
        
        // Add to storage
        if (StorageManager.addMonitoringEvent(eventType)) {
            // Add to UI
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            
            // Create log object for the table
            const log = {
                type: 'event',
                time: timeString,
                event: {
                    type: eventType,
                    name: eventName,
                    timestamp: now.toISOString(),
                    localTime: now.toLocaleString('en-IN')
                },
                timestamp: now.toISOString()
            };
            
            // Add to table
            addLogToTable(log, -1);
            
            // Show notification
            UIManager.showNotification(`Event recorded: ${eventName}`, 'success');
        } else {
            UIManager.showNotification('Failed to record event', 'error');
        }
    }
    
    function loadSavedLogs() {
        const logs = StorageManager.loadMonitoringLogs();
        
        // Clear existing table entries
        logEntriesContainer.innerHTML = '';
        
        // Sort logs by timestamp (newest first)
        const sortedLogs = [...logs].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Add each log to the table
        sortedLogs.forEach((log, index) => {
            addLogToTable(log, index);
        });
    }
    
    function formatEventName(eventType) {
        // Convert kebab-case to Title Case
        return eventType
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Get monitoring logs
     * @returns {Array} - Array of monitoring log objects
     */
    function getMonitoringLogs() {
        return StorageManager.loadMonitoringLogs();
    }
    
    // Return public methods
    return {
        init,
        getMonitoringLogs
    };
})();
