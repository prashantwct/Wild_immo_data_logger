/**
 * Morphometry Module for Wildlife Immobilization Logger
 * Handles body measurements recording
 */

const MorphometryManager = (function() {
    // DOM Elements
    const morphometryForm = document.getElementById('morphometry-form');
    const saveButton = document.getElementById('save-morphometry');
    
    // Canine measurements
    const upperLeftCanineInput = document.getElementById('upper-left-canine');
    const upperRightCanineInput = document.getElementById('upper-right-canine');
    const lowerLeftCanineInput = document.getElementById('lower-left-canine');
    const lowerRightCanineInput = document.getElementById('lower-right-canine');
    
    // Intercanine distances
    const upperIntercanineInput = document.getElementById('upper-intercanine');
    const lowerIntercanineInput = document.getElementById('lower-intercanine');
    
    // Body measurements
    const neckGirthInput = document.getElementById('neck-girth');
    const cranialLengthInput = document.getElementById('cranial-length');
    const bodyLengthInput = document.getElementById('body-length');
    const tailLengthInput = document.getElementById('tail-length');
    const forelimbLengthInput = document.getElementById('forelimb-length');
    const hindlimbLengthInput = document.getElementById('hindlimb-length');
    
    /**
     * Initialize the Morphometry tab
     */
    function init() {
        // Create information display if it doesn't exist
        const form = document.getElementById('morphometry-form');
        if (form && !document.getElementById('morphometry-info')) {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'morphometry-info';
            infoDiv.className = 'morphometry-info';
            form.parentNode.insertBefore(infoDiv, form.nextSibling);
        }
        
        // Load saved morphometry data
        loadSavedMorphometry();
        
        // Add event listeners
        saveButton.addEventListener('click', saveMorphometry);
        
        // Add input validation on blur
        const inputs = document.querySelectorAll('#morphometry-form input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value) {
                    // Basic validation
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        this.classList.add('invalid');
                    } else {
                        this.classList.remove('invalid');
                    }
                }
                
                // Update information display when any field changes
                const morphometryData = getMorphometryData();
                updateInformationDisplay(morphometryData);
            });
        });
    }
    
    /**
     * Validate a measurement value
     * @param {string} value - The value to validate
     * @param {string} fieldName - Name of the field for error messages
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @param {number} decimals - Number of decimal places allowed
     * @returns {Object} - Validation result with isValid and message
     */
    function validateMeasurement(value, fieldName, min, max, decimals = 1) {
        if (!value && value !== '0') {
            return { isValid: false, message: `${fieldName} is required` };
        }
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return { isValid: false, message: `${fieldName} must be a valid number` };
        }
        
        // Check decimal places
        const decimalPart = value.split('.')[1];
        if (decimalPart && decimalPart.length > decimals) {
            return { 
                isValid: false, 
                message: `${fieldName} can have maximum ${decimals} decimal place${decimals === 1 ? '' : 's'}` 
            };
        }
        
        // Check range
        if (numValue < min || numValue > max) {
            return { 
                isValid: false, 
                message: `${fieldName} must be between ${min} and ${max} cm` 
            };
        }
        
        return { isValid: true };
    }
    
    /**
     * Calculate derived measurements
     * @param {Object} data - Raw measurement data
     * @returns {Object} - Object with calculated values
     */
    function calculateDerivedMeasurements(data) {
        const result = {};
        
        // Calculate average canine length if all values are present
        const canineValues = [
            parseFloat(data.canines.upperLeft),
            parseFloat(data.canines.upperRight),
            parseFloat(data.canines.lowerLeft),
            parseFloat(data.canines.lowerRight)
        ].filter(v => !isNaN(v));
        
        if (canineValues.length > 0) {
            const sum = canineValues.reduce((a, b) => a + b, 0);
            result.averageCanineLength = (sum / canineValues.length).toFixed(1);
        }
        
        // Calculate body proportions if available
        if (data.bodyMeasurements.bodyLength && data.bodyMeasurements.neckGirth) {
            const bodyLength = parseFloat(data.bodyMeasurements.bodyLength);
            const neckGirth = parseFloat(data.bodyMeasurements.neckGirth);
            
            if (bodyLength > 0 && neckGirth > 0) {
                result.bodyProportionIndex = (bodyLength / neckGirth).toFixed(2);
            }
        }
        
        return result;
    }
    
    /**
     * Update the information display with calculated values
     * @param {Object} data - Raw measurement data
     */
    function updateInformationDisplay(data) {
        const infoContainer = document.getElementById('morphometry-info');
        if (!infoContainer) return;
        
        const derived = calculateDerivedMeasurements(data);
        let infoHTML = '<div class="info-section"><h3>Calculated Measurements</h3><ul>';
        
        if (derived.averageCanineLength) {
            infoHTML += `<li><strong>Average Canine Length:</strong> ${derived.averageCanineLength} cm</li>`;
        }
        
        if (derived.bodyProportionIndex) {
            infoHTML += `<li><strong>Body Proportion Index (Length/Neck Girth):</strong> ${derived.bodyProportionIndex}</li>`;
        }
        
        // Add validation status
        infoHTML += '</ul></div><div class="info-section"><h3>Validation Status</h3><ul>';
        
        // Check if all required fields are filled
        const requiredFields = [
            { id: 'upper-left-canine', name: 'Upper Left Canine' },
            { id: 'upper-right-canine', name: 'Upper Right Canine' },
            { id: 'lower-left-canine', name: 'Lower Left Canine' },
            { id: 'lower-right-canine', name: 'Lower Right Canine' },
            { id: 'upper-intercanine', name: 'Upper Intercanine' },
            { id: 'lower-intercanine', name: 'Lower Intercanine' },
            { id: 'neck-girth', name: 'Neck Girth' },
            { id: 'body-length', name: 'Body Length' }
        ];
        
        const missingFields = requiredFields.filter(field => {
            const input = document.getElementById(field.id);
            return !input.value.trim();
        });
        
        if (missingFields.length === 0) {
            infoHTML += '<li class="valid">✓ All required measurements are recorded</li>';
        } else {
            infoHTML += `<li class="warning">⚠ Missing ${missingFields.length} required measurement${missingFields.length > 1 ? 's' : ''}</li>`;
        }
        
        infoHTML += '</ul></div>';
        infoContainer.innerHTML = infoHTML;
    }
    
    /**
     * Save morphometry data
     */
    function saveMorphometry() {
        // Validate all measurements
        const validations = [
            { value: upperLeftCanineInput.value, field: upperLeftCanineInput, name: 'Upper Left Canine', min: 0.1, max: 10 },
            { value: upperRightCanineInput.value, field: upperRightCanineInput, name: 'Upper Right Canine', min: 0.1, max: 10 },
            { value: lowerLeftCanineInput.value, field: lowerLeftCanineInput, name: 'Lower Left Canine', min: 0.1, max: 10 },
            { value: lowerRightCanineInput.value, field: lowerRightCanineInput, name: 'Lower Right Canine', min: 0.1, max: 10 },
            { value: upperIntercanineInput.value, field: upperIntercanineInput, name: 'Upper Intercanine Distance', min: 1, max: 20 },
            { value: lowerIntercanineInput.value, field: lowerIntercanineInput, name: 'Lower Intercanine Distance', min: 1, max: 20 },
            { value: neckGirthInput.value, field: neckGirthInput, name: 'Neck Girth', min: 10, max: 200 },
            { value: cranialLengthInput.value, field: cranialLengthInput, name: 'Cranial Length', min: 5, max: 100, required: false },
            { value: bodyLengthInput.value, field: bodyLengthInput, name: 'Body Length', min: 20, max: 300 },
            { value: tailLengthInput.value, field: tailLengthInput, name: 'Tail Length', min: 0, max: 200, required: false },
            { value: forelimbLengthInput.value, field: forelimbLengthInput, name: 'Forelimb Length', min: 5, max: 150, required: false },
            { value: hindlimbLengthInput.value, field: hindlimbLengthInput, name: 'Hindlimb Length', min: 5, max: 150, required: false }
        ];
        
        // Check all validations
        for (const { value, field, name, min, max, required = true, decimals = 1 } of validations) {
            if (required || value) {
                const validation = validateMeasurement(value, name, min, max, decimals);
                if (!validation.isValid) {
                    UIManager.showNotification(validation.message, 'error');
                    field.focus();
                    return;
                }
            }
        }
        
        // Collect all morphometry data
        const morphometryData = {
            canines: {
                upperLeft: upperLeftCanineInput.value,
                upperRight: upperRightCanineInput.value,
                lowerLeft: lowerLeftCanineInput.value,
                lowerRight: lowerRightCanineInput.value
            },
            intercanineDistance: {
                upper: upperIntercanineInput.value,
                lower: lowerIntercanineInput.value
            },
            bodyMeasurements: {
                neckGirth: neckGirthInput.value,
                cranialLength: cranialLengthInput.value,
                bodyLength: bodyLengthInput.value,
                tailLength: tailLengthInput.value,
                forelimbLength: forelimbLengthInput.value,
                hindlimbLength: hindlimbLengthInput.value,
                timestamp: new Date().toISOString()
            }
        };
        
        // Calculate and add derived measurements
        morphometryData.calculated = calculateDerivedMeasurements(morphometryData);
        
        // Save to storage
        if (StorageManager.saveMorphometry(morphometryData)) {
            // Update information display
            updateInformationDisplay(morphometryData);
            
            UIManager.showNotification('Morphometry data saved successfully', 'success');
            UIManager.switchTab('export');
        } else {
            UIManager.showNotification('Failed to save morphometry data', 'error');
        }
    }
    
    /**
     * Load saved morphometry data
     */
    function loadSavedMorphometry() {
        const morphometryData = StorageManager.loadMorphometry();
        
        if (morphometryData) {
            // Set canine values
            if (morphometryData.canines) {
                upperLeftCanineInput.value = morphometryData.canines.upperLeft || '';
                upperRightCanineInput.value = morphometryData.canines.upperRight || '';
                lowerLeftCanineInput.value = morphometryData.canines.lowerLeft || '';
                lowerRightCanineInput.value = morphometryData.canines.lowerRight || '';
            }
            
            // Set intercanine distances
            if (morphometryData.intercanineDistance) {
                upperIntercanineInput.value = morphometryData.intercanineDistance.upper || '';
                lowerIntercanineInput.value = morphometryData.intercanineDistance.lower || '';
            }
            
            // Set body measurements
            if (morphometryData.bodyMeasurements) {
                neckGirthInput.value = morphometryData.bodyMeasurements.neckGirth || '';
                cranialLengthInput.value = morphometryData.bodyMeasurements.cranialLength || '';
                bodyLengthInput.value = morphometryData.bodyMeasurements.bodyLength || '';
                tailLengthInput.value = morphometryData.bodyMeasurements.tailLength || '';
                forelimbLengthInput.value = morphometryData.bodyMeasurements.forelimbLength || '';
                hindlimbLengthInput.value = morphometryData.bodyMeasurements.hindlimbLength || '';
            }
        }
    }
    
    /**
     * Get morphometry data
     * @returns {Object} - Morphometry data object
     */
    function getMorphometryData() {
        return StorageManager.loadMorphometry();
    }
    
    // Return public methods
    return {
        init,
        getMorphometryData
    };
})();
