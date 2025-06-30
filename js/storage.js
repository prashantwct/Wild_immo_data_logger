/**
 * Storage Manager for Wildlife Immobilization Logger
 * Handles persistent data storage using localStorage
 */

const StorageManager = (function() {
    // Storage keys
    const KEYS = {
        ANIMAL_INFO: 'immo_animal_info',
        DRUG_REPOSITORY: 'immo_drug_repository',
        SELECTED_DRUGS: 'immo_selected_drugs',
        MONITORING_LOGS: 'immo_monitoring_logs',
        RECOVERY_EVENTS: 'immo_recovery_events',
        MORPHOMETRY: 'immo_morphometry'
    };

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     */
    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Retrieved data or default value
     */
    function loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading data:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    function removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data:', error);
            return false;
        }
    }

    /**
     * Clear all app data from localStorage
     */
    function clearAllData() {
        try {
            Object.values(KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }
    
    /**
     * Clear only session-specific data (preserves drug repository)
     */
    function clearSessionData() {
        try {
            // Keep these keys (drug repository and other persistent data)
            const keysToPreserve = [KEYS.DRUG_REPOSITORY];
            
            // Remove all keys except the ones to preserve
            Object.values(KEYS).forEach(key => {
                if (!keysToPreserve.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing session data:', error);
            return false;
        }
    }

    // Animal Information methods
    function saveAnimalInfo(animalInfo) {
        return saveData(KEYS.ANIMAL_INFO, animalInfo);
    }

    function loadAnimalInfo() {
        return loadData(KEYS.ANIMAL_INFO, {
            dateTime: '',
            gpsLatitude: '',
            gpsLongitude: '',
            animalId: '',
            species: '',
            estimatedWeight: ''
        });
    }

    // Drug Repository methods
    function loadDrugRepository() {
        return loadData(KEYS.DRUG_REPOSITORY, {
            immobilization: [],
            reversal: [],
            emergency: []
        });
    }

    function saveDrugRepository(repository) {
        return saveData(KEYS.DRUG_REPOSITORY, repository);
    }

    function addDrugToRepository(name, category, dose = null, concentration = null) {
        const repository = loadDrugRepository();
        if (repository[category]) {
            // Check if drug already exists by name
            const existingIndex = repository[category].findIndex(drug => 
                typeof drug === 'string' ? drug === name : drug.name === name
            );
            
            if (existingIndex === -1) {
                // Add new drug with dose and concentration if provided
                if (dose !== null && concentration !== null) {
                    repository[category].push({
                        name: name,
                        dose: dose,
                        concentration: concentration
                    });
                } else {
                    repository[category].push(name);
                }
                return saveData(KEYS.DRUG_REPOSITORY, repository);
            } else if (dose !== null && concentration !== null) {
                // If drug exists but we want to update dose/concentration
                if (typeof repository[category][existingIndex] === 'string') {
                    // Convert string to object
                    repository[category][existingIndex] = {
                        name: repository[category][existingIndex],
                        dose: dose,
                        concentration: concentration
                    };
                } else {
                    // Update existing object
                    repository[category][existingIndex].dose = dose;
                    repository[category][existingIndex].concentration = concentration;
                }
                return saveData(KEYS.DRUG_REPOSITORY, repository);
            }
        }
        return false;
    }

    function removeDrugFromRepository(name, category) {
        // Validate inputs
        if (!name || !category || !['immobilization', 'reversal', 'emergency'].includes(category)) {
            console.error('Invalid parameters for removeDrugFromRepository:', { name, category });
            return false;
        }
        
        const repository = loadDrugRepository();
        if (repository[category]) {
            try {
                // Find the drug by name (handles both string and object entries)
                const index = repository[category].findIndex(drug => 
                    typeof drug === 'string' ? drug === name : drug.name === name
                );
                
                if (index !== -1) {
                    repository[category].splice(index, 1);
                    return saveData(KEYS.DRUG_REPOSITORY, repository);
                }
            } catch (error) {
                console.error('Error removing drug from repository:', error);
                return false;
            }
        }
        return false;
    }

    // Selected Drugs methods
    function saveSelectedDrugs(selectedDrugs) {
        return saveData(KEYS.SELECTED_DRUGS, selectedDrugs);
    }

    function loadSelectedDrugs() {
        return loadData(KEYS.SELECTED_DRUGS, {
            immobilization: [],
            reversal: [],
            emergency: []
        });
    }

    // Monitoring Logs methods
    function saveMonitoringLogs(logs) {
        return saveData(KEYS.MONITORING_LOGS, logs);
    }

    function loadMonitoringLogs() {
        return loadData(KEYS.MONITORING_LOGS, []);
    }

    function addMonitoringLog(log) {
        const logs = loadMonitoringLogs();
        logs.push(log);
        return saveData(KEYS.MONITORING_LOGS, logs);
    }

    function removeMonitoringLog(index) {
        const logs = loadMonitoringLogs();
        if (index >= 0 && index < logs.length) {
            logs.splice(index, 1);
            return saveData(KEYS.MONITORING_LOGS, logs);
        }
        return false;
    }
    
    // Monitoring Events
    function addMonitoringEvent(eventType, notes = '') {
        const now = new Date();
        const event = {
            type: eventType,
            timestamp: now.toISOString(),
            localTime: now.toLocaleString('en-IN'), // Using India timezone
            notes: notes
        };
        
        const logs = loadMonitoringLogs();
        logs.push({
            type: 'event',
            event: event,
            timestamp: now.toISOString()
        });
        
        return saveData(KEYS.MONITORING_LOGS, logs);
    }
    
    function getMonitoringEvents() {
        const logs = loadMonitoringLogs();
        return logs.filter(log => log.type === 'event');
    }

    // Recovery Events methods
    function saveRecoveryEvents(events) {
        return saveData(KEYS.RECOVERY_EVENTS, events);
    }

    function loadRecoveryEvents() {
        return loadData(KEYS.RECOVERY_EVENTS, []);
    }

    function addRecoveryEvent(event) {
        const events = loadRecoveryEvents();
        events.push(event);
        return saveData(KEYS.RECOVERY_EVENTS, events);
    }

    function removeRecoveryEvent(index) {
        const events = loadRecoveryEvents();
        if (index >= 0 && index < events.length) {
            events.splice(index, 1);
            return saveData(KEYS.RECOVERY_EVENTS, events);
        }
        return false;
    }

    // Morphometry methods
    function saveMorphometry(data) {
        return saveData(KEYS.MORPHOMETRY, data);
    }

    function loadMorphometry() {
        return loadData(KEYS.MORPHOMETRY, {
            canines: {
                upperLeft: '',
                upperRight: '',
                lowerLeft: '',
                lowerRight: ''
            },
            intercanineDistance: {
                upper: '',
                lower: ''
            },
            bodyMeasurements: {
                neckGirth: '',
                cranialLength: '',
                bodyLength: '',
                tailLength: '',
                forelimbLength: '',
                hindlimbLength: ''
            }
        });
    }

    // Export all data
    function exportAllData() {
        const allData = {
            animalInfo: loadAnimalInfo(),
            drugRepository: loadDrugRepository(),
            selectedDrugs: loadSelectedDrugs(),
            monitoringLogs: loadMonitoringLogs(),
            recoveryEvents: loadRecoveryEvents(),
            morphometry: loadMorphometry(),
            exportDate: new Date().toISOString()
        };
        return allData;
    }

    /**
     * Update drug data in repository (dose and concentration)
     * @param {string} name - Drug name
     * @param {string} category - Drug category
     * @param {number} dose - Drug dose in mg/kg
     * @param {number} concentration - Drug concentration in mg/ml
     * @returns {boolean} - Success status
     */
    function updateDrugInRepository(name, category, dose, concentration) {
        return addDrugToRepository(name, category, dose, concentration);
    }
    
    /**
     * Get drug data from repository
     * @param {string} name - Drug name
     * @param {string} category - Drug category
     * @returns {Object|null} - Drug data object or null if not found
     */
    function getDrugFromRepository(name, category) {
        const repository = loadDrugRepository();
        if (repository[category]) {
            const drugItem = repository[category].find(drug => 
                typeof drug === 'string' ? drug === name : drug.name === name
            );
            
            if (drugItem) {
                if (typeof drugItem === 'string') {
                    return { name: drugItem, dose: null, concentration: null };
                } else {
                    return drugItem;
                }
            }
        }
        return null;
    }
    
    return {
        // Core storage methods
        saveData,
        loadData,
        removeData,
        clearAllData,
        clearSessionData,
        
        // Specific data methods
        saveAnimalInfo,
        loadAnimalInfo,
        loadDrugRepository,
        saveDrugRepository,
        addDrugToRepository,
        removeDrugFromRepository,
        updateDrugInRepository,
        getDrugFromRepository,
        saveSelectedDrugs,
        loadSelectedDrugs,
        saveMonitoringLogs,
        loadMonitoringLogs,
        addMonitoringLog,
        removeMonitoringLog,
        addMonitoringEvent,
        getMonitoringEvents,
        saveRecoveryEvents,
        loadRecoveryEvents,
        addRecoveryEvent,
        removeRecoveryEvent,
        saveMorphometry,
        loadMorphometry,
        exportAllData
    };    
})();
