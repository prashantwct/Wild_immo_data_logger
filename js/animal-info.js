/**
 * Animal Information Module for Wildlife Immobilization Logger
 * Handles animal information form functionality
 */

const AnimalInfoManager = (function() {
    // DOM Elements
    const form = document.getElementById('animal-info-form');
    const dateTimeInput = document.getElementById('date-time');
    const gpsLatitudeInput = document.getElementById('gps-latitude');
    const gpsLongitudeInput = document.getElementById('gps-longitude');
    const getLocationBtn = document.getElementById('get-location');
    const animalIdInput = document.getElementById('animal-id');
    const speciesSelect = document.getElementById('species');
    const weightInput = document.getElementById('estimated-weight');
    const saveButton = document.getElementById('save-animal-info');
    
    /**
     * Initialize the Animal Info tab
     */
    function init() {
        // Set current date and time as default
        setCurrentDateTime();
        
        // Load saved data if exists
        loadSavedData();
        
        // Add event listeners
        getLocationBtn.addEventListener('click', getCurrentLocation);
        saveButton.addEventListener('click', saveAnimalInfo);
        
        // Update weight when changing between tabs
        document.querySelectorAll('#tab-navigation li').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update global weight value when navigating away from animal info tab
                if (document.querySelector('#tab-navigation li.active').getAttribute('data-tab') === 'animal-info') {
                    if (weightInput.value) {
                        window.estimatedWeight = parseFloat(weightInput.value);
                    }
                }
            });
        });
    }
    
    /**
     * Set current date and time as default value
     */
    function setCurrentDateTime() {
        const now = new Date();
        const formattedDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
        dateTimeInput.value = formattedDateTime;
    }
    
    /**
     * Load saved animal information
     */
    function loadSavedData() {
        const animalInfo = StorageManager.loadAnimalInfo();
        
        if (animalInfo) {
            if (animalInfo.dateTime) dateTimeInput.value = animalInfo.dateTime;
            if (animalInfo.gpsLatitude) gpsLatitudeInput.value = animalInfo.gpsLatitude;
            if (animalInfo.gpsLongitude) gpsLongitudeInput.value = animalInfo.gpsLongitude;
            if (animalInfo.animalId) animalIdInput.value = animalInfo.animalId;
            if (animalInfo.species) speciesSelect.value = animalInfo.species;
            if (animalInfo.estimatedWeight) {
                weightInput.value = animalInfo.estimatedWeight;
                // Set global weight for calculations
                window.estimatedWeight = parseFloat(animalInfo.estimatedWeight);
            }
        }
    }
    
    /**
     * Get current geolocation
     */
    function getCurrentLocation() {
        UIManager.toggleButtonLoading(getLocationBtn, true);
        
        // Check if using HTTPS or localhost (required for geolocation in modern browsers)
        const isSecureContext = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
                           
        if (!isSecureContext) {
            console.error('Geolocation requires HTTPS');
            UIManager.toggleButtonLoading(getLocationBtn, false);
            UIManager.showNotification('Geolocation requires HTTPS. Please use a secure connection.', 'error');
            return;
        }
        
        if (navigator.geolocation) {
            try {
                navigator.permissions.query({name: 'geolocation'})
                    .then(permissionStatus => {
                        console.log('Geolocation permission status:', permissionStatus.state);
                        
                        if (permissionStatus.state === 'denied') {
                            UIManager.toggleButtonLoading(getLocationBtn, false);
                            UIManager.showNotification('Location permission denied. Please enable in browser settings.', 'error');
                            return;
                        }
                        
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                console.log('Got position:', position.coords);
                                gpsLatitudeInput.value = position.coords.latitude.toFixed(6);
                                gpsLongitudeInput.value = position.coords.longitude.toFixed(6);
                                UIManager.toggleButtonLoading(getLocationBtn, false);
                                UIManager.showNotification('Location updated successfully', 'success');
                            },
                            (error) => {
                                console.error('Error getting location:', error);
                                let errorMessage = 'Failed to get location. ';
                                
                                switch(error.code) {
                                    case error.PERMISSION_DENIED:
                                        errorMessage += 'Location permission denied.';
                                        break;
                                    case error.POSITION_UNAVAILABLE:
                                        errorMessage += 'Location information is unavailable.';
                                        break;
                                    case error.TIMEOUT:
                                        errorMessage += 'Location request timed out.';
                                        break;
                                    default:
                                        errorMessage += 'Unknown error occurred.';
                                }
                                
                                UIManager.toggleButtonLoading(getLocationBtn, false);
                                UIManager.showNotification(errorMessage, 'error');
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 15000,
                                maximumAge: 0
                            }
                        );
                    })
                    .catch(error => {
                        console.error('Error checking permission:', error);
                        // Fall back to standard geolocation request
                        fallbackGeolocation();
                    });
            } catch (error) {
                console.error('Error with permissions API:', error);
                // Fallback if permissions API is not available
                fallbackGeolocation();
            }
        } else {
            UIManager.toggleButtonLoading(getLocationBtn, false);
            UIManager.showNotification('Geolocation is not supported by this browser.', 'error');
        }
    }
    
    /**
     * Fallback geolocation function when permissions API is not available
     */
    function fallbackGeolocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                gpsLatitudeInput.value = position.coords.latitude.toFixed(6);
                gpsLongitudeInput.value = position.coords.longitude.toFixed(6);
                UIManager.toggleButtonLoading(getLocationBtn, false);
                UIManager.showNotification('Location updated successfully', 'success');
            },
            (error) => {
                console.error('Error getting location (fallback):', error);
                UIManager.toggleButtonLoading(getLocationBtn, false);
                UIManager.showNotification('Failed to get location. Please check browser permissions.', 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    }
    
    /**
     * Save animal information
     */
    function saveAnimalInfo() {
        // Validate form
        if (!UIManager.validateForm(form)) {
            return;
        }
        
        const animalInfo = {
            dateTime: dateTimeInput.value,
            gpsLatitude: gpsLatitudeInput.value,
            gpsLongitude: gpsLongitudeInput.value,
            animalId: animalIdInput.value,
            species: speciesSelect.value,
            estimatedWeight: weightInput.value
        };
        
        // Set global weight for calculations
        window.estimatedWeight = parseFloat(weightInput.value);
        
        // Save to storage
        if (StorageManager.saveAnimalInfo(animalInfo)) {
            UIManager.showNotification('Animal information saved successfully', 'success');
            UIManager.switchTab('drug-dose');
        } else {
            UIManager.showNotification('Failed to save animal information', 'error');
        }
    }
    
    /**
     * Get animal information
     * @returns {Object} - Animal information object
     */
    function getAnimalInfo() {
        return StorageManager.loadAnimalInfo();
    }
    
    // Return public methods
    return {
        init,
        getAnimalInfo
    };
})();
