/**
 * Saved Sessions Module
 * Handles viewing and managing saved immobilization sessions
 */

const SavedSessions = (function() {
    // DOM Elements
    const sessionsList = document.getElementById('sessions-list');
    const sessionDetails = document.getElementById('session-details');
    
    // Initialize the module
    function init() {
        loadSessions();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Event delegation for session items
        sessionsList.addEventListener('click', function(e) {
            const sessionItem = e.target.closest('.session-item');
            if (!sessionItem) return;
            
            const sessionId = sessionItem.dataset.id;
            if (e.target.classList.contains('delete-session')) {
                e.stopPropagation();
                deleteSession(sessionId);
            } else if (e.target.classList.contains('load-session')) {
                e.stopPropagation();
                loadSession(sessionId);
            } else {
                displaySessionDetails(sessionId);
            }
        });
    }
    
    // Load all saved sessions
    function loadSessions() {
        const sessions = getAllSessions();
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<p class="no-sessions">No saved sessions found.</p>';
            return;
        }
        
        sessionsList.innerHTML = '';
        
        sessions.forEach(session => {
            const sessionDate = new Date(parseInt(session.id)).toLocaleString();
            const animalInfo = session.animalInfo || {};
            
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session-item';
            sessionElement.dataset.id = session.id;
            
            sessionElement.innerHTML = `
                <div>
                    <span class="session-animal">${animalInfo.species || 'Unknown'} - ${animalInfo.animalId || 'No ID'}</span>
                    <span class="session-date">${sessionDate}</span>
                </div>
                <div class="session-actions">
                    <button class="btn-load load-session" title="Load Session"><i class="fas fa-folder-open"></i></button>
                    <button class="btn-delete delete-session" title="Delete Session"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            sessionsList.appendChild(sessionElement);
        });
    }
    
    // Get all saved sessions from storage
    function getAllSessions() {
        const sessions = [];
        
        // Get all keys from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Check if the key is a session key (starts with 'immo_' and has a timestamp)
            if (key.startsWith('immo_') && key.includes('_session_')) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key));
                    if (sessionData) {
                        // Extract timestamp from key (format: immo_session_TIMESTAMP)
                        const timestamp = key.split('_').pop();
                        sessions.push({
                            id: timestamp,
                            key: key,
                            ...sessionData
                        });
                    }
                } catch (e) {
                    console.error('Error parsing session data:', e);
                }
            }
        }
        
        // Sort by most recent first
        return sessions.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }
    
    // Display session details in the right panel
    function displaySessionDetails(sessionId) {
        const session = getSessionById(sessionId);
        if (!session) return;
        
        const sessionDate = new Date(parseInt(sessionId)).toLocaleString();
        const animalInfo = session.animalInfo || {};
        const drugInfo = session.drugInfo || {};
        const monitoringLogs = session.monitoringLogs || [];
        const recoveryEvents = session.recoveryEvents || [];
        const morphometry = session.morphometry || {};
        
        // Update active state in the list
        document.querySelectorAll('.session-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === sessionId);
        });
        
        // Format monitoring logs
        const monitoringLogsHtml = monitoringLogs.length > 0 
            ? monitoringLogs.map(log => `
                <div class="log-entry">
                    <strong>${log.time}</strong>: HR: ${log.hr} bpm, RR: ${log.rr} bpm, 
                    Temp: ${log.temp}°C, SpO₂: ${log.spo2}%
                    ${log.notes ? `<br><em>${log.notes}</em>` : ''}
                </div>`).join('')
            : '<p>No monitoring data available.</p>';
        
        // Format recovery events
        const recoveryEventsHtml = recoveryEvents.length > 0 
            ? recoveryEvents.map(event => `
                <div class="event-entry">
                    <strong>${event.time}</strong>: ${event.event}
                    ${event.notes ? `<br><em>${event.notes}</em>` : ''}
                </div>`).join('')
            : '<p>No recovery events recorded.</p>';
        
        // Format morphometry data if available
        let morphometryHtml = '';
        if (Object.keys(morphometry).length > 0) {
            morphometryHtml = `
                <div class="session-section">
                    <h4>Morphometry</h4>
                    <p><strong>Body Length:</strong> ${morphometry.bodyLength || 'N/A'} cm</p>
                    <p><strong>Neck Girth:</strong> ${morphometry.neckGirth || 'N/A'} cm</p>
                    <p><strong>Chest Girth:</strong> ${morphometry.chestGirth || 'N/A'} cm</p>
                    <p><strong>Weight:</strong> ${morphometry.weight || 'N/A'} kg</p>
                </div>
            `;
        }
        
        // Update the details panel
        sessionDetails.innerHTML = `
            <h3>Session Details</h3>
            <p><strong>Date:</strong> ${sessionDate}</p>
            
            <div class="session-section">
                <h4>Animal Information</h4>
                <p><strong>Species:</strong> ${animalInfo.species || 'Not specified'}</p>
                <p><strong>ID:</strong> ${animalInfo.animalId || 'Not specified'}</p>
                <p><strong>Estimated Weight:</strong> ${animalInfo.estimatedWeight || 'Not specified'}</p>
                <p><strong>Location:</strong> ${animalInfo.gpsLatitude && animalInfo.gpsLongitude 
                    ? `${animalInfo.gpsLatitude}, ${animalInfo.gpsLongitude}` 
                    : 'Not specified'}</p>
            </div>
            
            ${Object.keys(drugInfo).length > 0 ? `
                <div class="session-section">
                    <h4>Drugs Administered</h4>
                    <ul>${Object.entries(drugInfo).map(([drug, details]) => 
                        `<li>${drug}: ${details.dose} mg (${details.volume} ml)</li>`
                    ).join('')}</ul>
                </div>
            ` : ''}
            
            ${morphometryHtml}
            
            <div class="session-section">
                <h4>Monitoring Logs</h4>
                <div class="monitoring-logs">${monitoringLogsHtml}</div>
            </div>
            
            <div class="session-section">
                <h4>Recovery Events</h4>
                <div class="recovery-events">${recoveryEventsHtml}</div>
            </div>
            
            <div class="session-actions">
                <button class="btn-load load-session" data-id="${sessionId}">
                    <i class="fas fa-folder-open"></i> Load This Session
                </button>
                <button class="btn-delete delete-session" data-id="${sessionId}">
                    <i class="fas fa-trash"></i> Delete Session
                </button>
            </div>
        `;
    }
    
    // Get a session by ID
    function getSessionById(sessionId) {
        const sessions = getAllSessions();
        return sessions.find(session => session.id === sessionId);
    }
    
    // Load a session into the application
    function loadSession(sessionId) {
        const session = getSessionById(sessionId);
        if (!session) {
            UIManager.showNotification('Session not found', 'error');
            return;
        }
        
        // Confirm with the user before loading
        if (!confirm('Loading this session will replace your current data. Continue?')) {
            return;
        }
        
        try {
            // Save current session data with a backup key
            const currentData = {
                animalInfo: StorageManager.loadAnimalInfo(),
                drugInfo: StorageManager.loadSelectedDrugs(),
                monitoringLogs: StorageManager.loadMonitoringLogs(),
                recoveryEvents: StorageManager.loadRecoveryEvents(),
                morphometry: StorageManager.loadMorphometry()
            };
            
            // Save current session as a backup
            const backupKey = `immo_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(currentData));
            
            // Clear current data
            StorageManager.clearSessionData();
            
            // Load the selected session data
            if (session.animalInfo) StorageManager.saveAnimalInfo(session.animalInfo);
            if (session.drugInfo) StorageManager.saveSelectedDrugs(session.drugInfo);
            if (session.monitoringLogs) StorageManager.saveMonitoringLogs(session.monitoringLogs);
            if (session.recoveryEvents) StorageManager.saveRecoveryEvents(session.recoveryEvents);
            if (session.morphometry) StorageManager.saveMorphometry(session.morphometry);
            
            // Notify the user
            UIManager.showNotification('Session loaded successfully', 'success');
            
            // Reload the page to update all UI elements
            setTimeout(() => {
                location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading session:', error);
            UIManager.showNotification('Failed to load session', 'error');
        }
    }
    
    // Delete a session
    function deleteSession(sessionId) {
        if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) {
            return;
        }
        
        try {
            const session = getSessionById(sessionId);
            if (!session) {
                UIManager.showNotification('Session not found', 'error');
                return;
            }
            
            // Remove the session from localStorage
            localStorage.removeItem(session.key);
            
            // Update the UI
            const sessionElement = document.querySelector(`.session-item[data-id="${sessionId}"]`);
            if (sessionElement) {
                sessionElement.remove();
            }
            
            // Clear the details panel if the deleted session was being viewed
            if (sessionDetails.querySelector(`[data-id="${sessionId}"]`)) {
                sessionDetails.innerHTML = '<p>Select a session to view details</p>';
            }
            
            // Show notification
            UIManager.showNotification('Session deleted successfully', 'success');
            
            // If no sessions left, show the "no sessions" message
            if (document.querySelectorAll('.session-item').length === 0) {
                sessionsList.innerHTML = '<p class="no-sessions">No saved sessions found.</p>';
                sessionDetails.innerHTML = '<p>No session selected</p>';
            }
            
        } catch (error) {
            console.error('Error deleting session:', error);
            UIManager.showNotification('Failed to delete session', 'error');
        }
    }
    
    // Public API
    return {
        init
    };
})();

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the saved-sessions tab
    if (document.getElementById('sessions-list')) {
        SavedSessions.init();
    }
});
