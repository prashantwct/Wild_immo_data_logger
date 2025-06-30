/**
 * Drug & Dose Calculator Module for Wildlife Immobilization Logger
 * Handles drug repository and dose calculation
 */

const DrugDoseManager = (function() {
    // DOM Elements
    const drugNameInput = document.getElementById('new-drug-name');
    const drugCategorySelect = document.getElementById('new-drug-category');
    const addDrugBtn = document.getElementById('add-drug-to-repository');
    const drugRepositoryList = document.getElementById('drug-repository-list');
    const drugSelects = document.querySelectorAll('.drug-select');
    const saveDrugDoseBtn = document.getElementById('save-drug-dose');
    
    // Drug category containers
    const immobDrugsContainer = document.getElementById('immobilization-drugs');
    const reversalDrugsContainer = document.getElementById('reversal-drugs');
    const emergencyDrugsContainer = document.getElementById('emergency-drugs');
    
    // Add drug entry buttons
    const addDrugEntryButtons = document.querySelectorAll('.add-drug-entry');
    
    /**
     * Initialize the Drug & Dose tab
     */
    function init() {
        // Load drug repository
        loadDrugRepository();
        
        // Load saved drug entries
        loadSavedDrugEntries();
        
        // Add event listeners
        addDrugBtn.addEventListener('click', addDrugToRepository);
        saveDrugDoseBtn.addEventListener('click', saveDrugDoseData);
        
        // Add event listeners to add drug entry buttons
        addDrugEntryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                addDrugEntry(category);
            });
        });
        
        // Add input event listeners to calculate volumes when values change
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('drug-concentration') || 
                e.target.classList.contains('drug-dose')) {
                const drugEntry = e.target.closest('.drug-entry');
                if (drugEntry) {
                    calculateVolume(drugEntry);
                    
                    // Update drug repository with new dose/concentration values
                    const drugSelect = drugEntry.querySelector('.drug-select');
                    const drugName = drugSelect.value;
                    const category = drugSelect.getAttribute('data-category');
                    
                    if (drugName) {
                        const concentration = drugEntry.querySelector('.drug-concentration').value;
                        const dose = drugEntry.querySelector('.drug-dose').value;
                        
                        if (concentration && dose) {
                            StorageManager.updateDrugInRepository(drugName, category, dose, concentration);
                        }
                    }
                }
            }
        });
        
        // Handle removing drug entries
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-entry') || 
                e.target.closest('.remove-entry')) {
                const drugEntry = e.target.closest('.drug-entry');
                if (drugEntry) {
                    drugEntry.remove();
                }
            }
        });
    }
    
    /**
     * Load drug repository from storage
     */
    function loadDrugRepository() {
        const repository = StorageManager.loadDrugRepository();
        
        // Clear existing list
        drugRepositoryList.innerHTML = '';
        
        // Populate drug selects with options
        drugSelects.forEach(select => {
            // Clear existing options except the default one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            const category = select.getAttribute('data-category');
            if (repository[category] && repository[category].length > 0) {
                repository[category].forEach(drug => {
                    // Get drug name regardless of whether it's a string or object
                    const drugName = typeof drug === 'string' ? drug : drug.name;
                    
                    // Add to repository list
                    addDrugToList(drugName, category);
                    
                    // Add to select options
                    const option = document.createElement('option');
                    option.value = drugName;
                    option.textContent = drugName;
                    select.appendChild(option);
                });
            }
        });
    }
    
    /**
     * Add drug to the repository list
     * @param {string} name - Drug name
     * @param {string} category - Drug category
     */
    function addDrugToList(name, category) {
        const li = document.createElement('li');
        
        const drugName = document.createElement('span');
        drugName.textContent = name;
        
        const categoryTag = document.createElement('span');
        categoryTag.className = `drug-tag tag-${category}`;
        categoryTag.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'action-btn';
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';
        deleteButton.addEventListener('click', () => {
            removeDrugFromRepository(name, category);
        });
        
        li.appendChild(drugName);
        li.appendChild(categoryTag);
        li.appendChild(deleteButton);
        
        drugRepositoryList.appendChild(li);
    }
    
    /**
     * Add a drug to the repository
     */
    function addDrugToRepository() {
        const name = drugNameInput.value.trim();
        const category = drugCategorySelect.value;
        
        if (!name) {
            UIManager.showNotification('Please enter a drug name', 'error');
            return;
        }
        
        if (StorageManager.addDrugToRepository(name, category)) {
            UIManager.showNotification(`Added ${name} to ${category} drugs`, 'success');
            drugNameInput.value = ''; // Clear input
            
            // Reload repository to update the UI
            loadDrugRepository();
        } else {
            UIManager.showNotification(`${name} already exists in repository`, 'error');
        }
    }
    
    /**
     * Remove a drug from the repository
     * @param {string} name - Drug name
     * @param {string} category - Drug category
     */
    function removeDrugFromRepository(name, category) {
        if (StorageManager.removeDrugFromRepository(name, category)) {
            UIManager.showNotification(`Removed ${name} from repository`, 'success');
            
            // Reload repository to update the UI
            loadDrugRepository();
        } else {
            UIManager.showNotification('Failed to remove drug from repository', 'error');
        }
    }
    
    /**
     * Create a new drug entry element
     * @param {string} category - Drug category
     * @returns {HTMLElement} - The drug entry element
     */
    function createDrugEntryElement(category) {
        const drugEntry = document.createElement('div');
        drugEntry.className = 'drug-entry';
        
        // Create drug select
        const selectGroup = document.createElement('div');
        selectGroup.className = 'form-group';
        
        const selectLabel = document.createElement('label');
        selectLabel.textContent = 'Select Drug:';
        
        const drugSelect = document.createElement('select');
        drugSelect.className = 'drug-select';
        drugSelect.setAttribute('data-category', category);
        
        // Add change event to auto-fill dose and concentration
        drugSelect.addEventListener('change', function() {
            const selectedDrug = this.value;
            if (selectedDrug) {
                const drugData = StorageManager.getDrugFromRepository(selectedDrug, category);
                if (drugData && drugData.dose && drugData.concentration) {
                    const concentrationInput = this.closest('.drug-entry').querySelector('.drug-concentration');
                    const doseInput = this.closest('.drug-entry').querySelector('.drug-dose');
                    
                    // Set values from repository
                    concentrationInput.value = drugData.concentration;
                    doseInput.value = drugData.dose;
                    
                    // Recalculate volume
                    calculateVolume(this.closest('.drug-entry'));
                }
            }
        });
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select...';
        drugSelect.appendChild(defaultOption);
        
        // Add drugs from repository
        const repository = StorageManager.loadDrugRepository();
        if (repository[category] && repository[category].length > 0) {
            repository[category].forEach(drug => {
                const drugName = typeof drug === 'string' ? drug : drug.name;
                const option = document.createElement('option');
                option.value = drugName;
                option.textContent = drugName;
                drugSelect.appendChild(option);
            });
        }
        
        selectGroup.appendChild(selectLabel);
        selectGroup.appendChild(drugSelect);
        
        // Create concentration input
        const concentrationGroup = document.createElement('div');
        concentrationGroup.className = 'form-group';
        
        const concentrationLabel = document.createElement('label');
        concentrationLabel.textContent = 'Concentration (mg/ml):';
        
        const concentrationInput = document.createElement('input');
        concentrationInput.type = 'number';
        concentrationInput.step = '0.01';
        concentrationInput.className = 'drug-concentration';
        
        concentrationGroup.appendChild(concentrationLabel);
        concentrationGroup.appendChild(concentrationInput);
        
        // Create dose input
        const doseGroup = document.createElement('div');
        doseGroup.className = 'form-group';
        
        const doseLabel = document.createElement('label');
        doseLabel.textContent = 'Dose (mg/kg):';
        
        const doseInput = document.createElement('input');
        doseInput.type = 'number';
        doseInput.step = '0.001';
        doseInput.className = 'drug-dose';
        
        doseGroup.appendChild(doseLabel);
        doseGroup.appendChild(doseInput);
        
        // Create volume result display
        const result = document.createElement('div');
        result.className = 'result';
        
        const resultLabel = document.createElement('span');
        resultLabel.textContent = 'Volume to administer:';
        
        const volumeValue = document.createElement('span');
        volumeValue.className = 'calculated-volume';
        volumeValue.textContent = '0.00';
        
        result.appendChild(resultLabel);
        result.appendChild(volumeValue);
        result.appendChild(document.createTextNode(' ml'));
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-entry';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        // Add all elements to drug entry
        drugEntry.appendChild(removeBtn);
        drugEntry.appendChild(selectGroup);
        drugEntry.appendChild(concentrationGroup);
        drugEntry.appendChild(doseGroup);
        drugEntry.appendChild(result);
        
        return drugEntry;
    }
    
    /**
     * Add a new drug entry to a category
     * @param {string} category - Drug category
     */
    function addDrugEntry(category) {
        const drugEntry = createDrugEntryElement(category);
        
        // Get the container to add the entry to
        let container;
        switch (category) {
            case 'immobilization':
                container = immobDrugsContainer;
                break;
            case 'reversal':
                container = reversalDrugsContainer;
                break;
            case 'emergency':
                container = emergencyDrugsContainer;
                break;
        }
        
        // Insert before the add button
        container.insertBefore(drugEntry, container.querySelector('.add-drug-entry'));
    }
    
    /**
     * Calculate volume to administer based on drug concentration, dose, and animal weight
     * @param {HTMLElement} drugEntry - The drug entry element
     */
    function calculateVolume(drugEntry) {
        const concentrationInput = drugEntry.querySelector('.drug-concentration');
        const doseInput = drugEntry.querySelector('.drug-dose');
        const volumeOutput = drugEntry.querySelector('.calculated-volume');
        
        const concentration = parseFloat(concentrationInput.value);
        const dose = parseFloat(doseInput.value);
        const weight = window.estimatedWeight || 0;
        
        if (concentration && dose && weight) {
            // Calculate volume in milliliters
            // Volume (ml) = (Dose (mg/kg) × Weight (kg)) ÷ Concentration (mg/ml)
            const volume = (dose * weight) / concentration;
            volumeOutput.textContent = volume.toFixed(2);
        } else {
            volumeOutput.textContent = '0.00';
        }
    }
    
    /**
     * Load saved drug entries from storage
     */
    function loadSavedDrugEntries() {
        const selectedDrugs = StorageManager.loadSelectedDrugs();
        
        // Load entries for each category
        ['immobilization', 'reversal', 'emergency'].forEach(category => {
            if (selectedDrugs[category] && selectedDrugs[category].length > 0) {
                selectedDrugs[category].forEach(drug => {
                    // Clear any default entries
                    if (category === 'immobilization') {
                        const defaultEntry = immobDrugsContainer.querySelector('.drug-entry');
                        if (defaultEntry) {
                            immobDrugsContainer.removeChild(defaultEntry);
                        }
                    } else if (category === 'reversal') {
                        const defaultEntry = reversalDrugsContainer.querySelector('.drug-entry');
                        if (defaultEntry) {
                            reversalDrugsContainer.removeChild(defaultEntry);
                        }
                    } else if (category === 'emergency') {
                        const defaultEntry = emergencyDrugsContainer.querySelector('.drug-entry');
                        if (defaultEntry) {
                            emergencyDrugsContainer.removeChild(defaultEntry);
                        }
                    }
                    
                    // Add new entry with saved values
                    const drugEntry = createDrugEntryElement(category);
                    drugEntry.querySelector('.drug-select').value = drug.name;
                    drugEntry.querySelector('.drug-concentration').value = drug.concentration;
                    drugEntry.querySelector('.drug-dose').value = drug.dose;
                    
                    // Calculate and display volume
                    calculateVolume(drugEntry);
                    
                    // Add to appropriate container
                    let container;
                    if (category === 'immobilization') {
                        container = immobDrugsContainer;
                    } else if (category === 'reversal') {
                        container = reversalDrugsContainer;
                    } else if (category === 'emergency') {
                        container = emergencyDrugsContainer;
                    }
                    
                    // Insert before the add button
                    container.insertBefore(drugEntry, container.querySelector('.add-drug-entry'));
                });
            }
        });
    }
    
    /**
     * Save drug and dose data
     */
    function saveDrugDoseData() {
        // Collect all drug entries data
        const selectedDrugs = {
            immobilization: [],
            reversal: [],
            emergency: []
        };
        
        // Get all drug entries for each category
        ['immobilization', 'reversal', 'emergency'].forEach(category => {
            let container;
            switch (category) {
                case 'immobilization':
                    container = immobDrugsContainer;
                    break;
                case 'reversal':
                    container = reversalDrugsContainer;
                    break;
                case 'emergency':
                    container = emergencyDrugsContainer;
                    break;
            }
            
            const entries = container.querySelectorAll('.drug-entry');
            entries.forEach(entry => {
                const drugName = entry.querySelector('.drug-select').value;
                const concentration = entry.querySelector('.drug-concentration').value;
                const dose = entry.querySelector('.drug-dose').value;
                
                if (drugName) {
                    selectedDrugs[category].push({
                        name: drugName,
                        concentration: concentration,
                        dose: dose
                    });
                }
            });
        });
        
        // Save to storage
        if (StorageManager.saveSelectedDrugs(selectedDrugs)) {
            UIManager.showNotification('Drug and dose data saved successfully', 'success');
            UIManager.switchTab('monitoring');
        } else {
            UIManager.showNotification('Failed to save drug and dose data', 'error');
        }
    }
    
    /**
     * Get selected drugs data
     * @returns {Object} - Selected drugs object
     */
    function getSelectedDrugs() {
        return StorageManager.loadSelectedDrugs();
    }
    
    // Return public methods
    return {
        init,
        getSelectedDrugs
    };
})();
