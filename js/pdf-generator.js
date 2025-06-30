/**
 * PDF Generator for Wildlife Immobilization Logger
 * Creates PDF reports from collected data
 */

const PDFGenerator = (function() {
    /**
     * Generate a PDF report from all collected data
     */
    function generatePDF() {
        try {
            // Show loading notification
            UIManager.showNotification('Generating PDF report...', 'info', 3000);
            
            // Debug logging
            console.log('Starting PDF generation process');
            
            // First check if libraries are loaded correctly
            if (typeof window.jspdf === 'undefined') {
                console.error('jsPDF library not loaded');
                UIManager.showNotification('PDF generation failed: jsPDF library not loaded', 'error');
                return;
            }
            
            // Get all data
            const allData = StorageManager.exportAllData();
            if (!allData.animalInfo || !allData.animalInfo.animalId) {
                UIManager.showNotification('Please complete Animal Information tab first', 'error');
                UIManager.switchTab('animal-info');
                return;
            }
            
            // Initialize jsPDF
            console.log('Creating jsPDF instance');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            console.log('jsPDF instance created successfully');
            
            // Check if autoTable plugin is available
            if (typeof doc.autoTable === 'undefined') {
                console.error('jsPDF-AutoTable plugin not loaded');
                UIManager.showNotification('PDF generation failed: AutoTable plugin not loaded', 'error');
                return;
            }
            
            console.log('autoTable plugin detected and available');
            
            // Define dimensions
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 15;
            const contentWidth = pageWidth - 2 * margin;
        
            // Helper function to add page with header and footer
            let currentPage = 1;
            const addPageWithHeaderFooter = () => {
                if (currentPage > 1) {
                    doc.addPage();
                }
                
                // Header
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('Wildlife Immobilization Report', margin, margin - 5);
                
                // Footer
                const footerText = `Page ${currentPage} | Generated on ${new Date().toLocaleString()}`;
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(footerText, margin, pageHeight - 10);
                
                currentPage++;
                
                // Reset position for content
                return margin;
        };
        
            // Helper to add section title
            const addSectionTitle = (title, y) => {
                doc.setFontSize(14);
                doc.setTextColor(0, 100, 0); // Green color
                doc.setFont(undefined, 'bold');
                doc.text(title, margin, y);
                doc.setDrawColor(0, 100, 0);
                doc.line(margin, y + 1, margin + contentWidth, y + 1);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0);
                doc.setFontSize(10);
                return y + 8;
            };
        
            // Helper to add key-value item
            const addKeyValue = (key, value, y) => {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(key, margin, y);
                doc.setFont(undefined, 'normal');
                
                // Check if value is defined
                const displayValue = value !== null && value !== undefined ? String(value) : 'Not recorded';
                doc.text(displayValue, margin + 60, y);
                
                return y + 5;
            };
            
            // Helper to check if new page is needed
            const checkForNewPage = (currentY, neededSpace) => {
                if (currentY + neededSpace > pageHeight - margin) {
                    return addPageWithHeaderFooter();
                }
                return currentY;
            };
        
            // Start adding content
            let yPos = addPageWithHeaderFooter();
            
            // Add title
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('CARNIVORE IMMOBILIZATION RECORD', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            // Animal Information section
            yPos = addSectionTitle('1. Animal Information', yPos);
            yPos = addKeyValue('Animal ID', allData.animalInfo.animalId, yPos);
            yPos = addKeyValue('Species', allData.animalInfo.species, yPos);
            yPos = addKeyValue('Date & Time', new Date(allData.animalInfo.dateTime).toLocaleString(), yPos);
            yPos = addKeyValue('GPS Coordinates', `${allData.animalInfo.gpsLatitude}, ${allData.animalInfo.gpsLongitude}`, yPos);
            yPos = addKeyValue('Estimated Weight', `${allData.animalInfo.estimatedWeight} kg`, yPos);
            yPos += 5;
            
            // Drugs section
            yPos = checkForNewPage(yPos, 40);
            yPos = addSectionTitle('2. Drugs Used', yPos);
        
            // Add immobilization drugs
            if (allData.selectedDrugs.immobilization && allData.selectedDrugs.immobilization.length > 0) {
                yPos += 2;
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text('Immobilization Drugs:', margin, yPos);
                yPos += 5;
                
                allData.selectedDrugs.immobilization.forEach(drug => {
                    yPos = checkForNewPage(yPos, 8);
                    const drugText = `• ${drug.name}: ${drug.dose || 0} mg/kg (${drug.concentration || 0} mg/ml)`;
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'normal');
                    doc.text(drugText, margin + 5, yPos);
                    yPos += 5;
                });
            }
        
            // Add reversal drugs
            if (allData.selectedDrugs.reversal && allData.selectedDrugs.reversal.length > 0) {
                yPos = checkForNewPage(yPos, 20);
                yPos += 2;
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text('Reversal Drugs:', margin, yPos);
                yPos += 5;
                
                allData.selectedDrugs.reversal.forEach(drug => {
                    yPos = checkForNewPage(yPos, 8);
                    const drugText = `• ${drug.name}: ${drug.dose || 0} mg/kg (${drug.concentration || 0} mg/ml)`;
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'normal');
                    doc.text(drugText, margin + 5, yPos);
                    yPos += 5;
                });
            }
        
            // Add emergency drugs
            if (allData.selectedDrugs.emergency && allData.selectedDrugs.emergency.length > 0) {
                yPos = checkForNewPage(yPos, 20);
                yPos += 2;
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text('Emergency Drugs:', margin, yPos);
                yPos += 5;
                
                allData.selectedDrugs.emergency.forEach(drug => {
                    yPos = checkForNewPage(yPos, 8);
                    const drugText = `• ${drug.name}: ${drug.dose || 0} mg/kg (${drug.concentration || 0} mg/ml)`;
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'normal');
                    doc.text(drugText, margin + 5, yPos);
                    yPos += 5;
                });
            }
            yPos += 3;
        
            // Monitoring logs and events
            yPos = checkForNewPage(yPos, 30);
            yPos = addSectionTitle('3. Monitoring Logs & Events', yPos);
            
            // Separate vital signs logs and event logs
            const vitalLogs = [];
            const eventLogs = [];
            
            if (allData.monitoringLogs && allData.monitoringLogs.length > 0) {
                allData.monitoringLogs.forEach(log => {
                    if (log.type === 'event') {
                        eventLogs.push(log);
                    } else if (log.heartRate || log.respiratoryRate || log.temperature || log.spo2) {
                        vitalLogs.push(log);
                    }
                });
            }
            
            // Show vital signs logs
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Vital Signs Logs:', margin, yPos);
            yPos += 6;
            
            if (vitalLogs.length > 0) {
                // Sort logs by timestamp (oldest first)
                vitalLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                // Create table for monitoring logs
                const tableData = [];
                const tableColumns = [
                    { header: 'Time', dataKey: 'time', width: 25 },
                    { header: 'HR (bpm)', dataKey: 'hr', width: 25 },
                    { header: 'RR (bpm)', dataKey: 'rr', width: 25 },
                    { header: 'Temp (°C)', dataKey: 'temp', width: 30 },
                    { header: 'SpO₂ (%)', dataKey: 'spo2', width: 25 }
                ];
                
                vitalLogs.forEach(log => {
                    tableData.push({
                        time: log.time || new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        hr: log.heartRate || '-',
                        rr: log.respiratoryRate || '-',
                        temp: log.temperature || '-',
                        spo2: log.spo2 || '-'
                    });
                });
                
                // Add table
                yPos = checkForNewPage(yPos, 20 + tableData.length * 8);
                
                // If table won't fit on current page, add a new page
                if (yPos + 20 + tableData.length * 8 > pageHeight - margin) {
                    yPos = addPageWithHeaderFooter();
                    yPos = addSectionTitle('3. Monitoring Logs & Events (continued)', yPos);
                    yPos += 6;
                }
            
                doc.autoTable({
                    startY: yPos,
                    head: [tableColumns.map(col => col.header)],
                    body: tableData.map(row => [
                        row.time,
                        row.hr,
                        row.rr,
                        row.temp,
                        row.spo2
                    ]),
                    margin: { top: yPos, left: margin, right: margin },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 25 },
                        2: { cellWidth: 25 },
                        3: { cellWidth: 30 },
                        4: { cellWidth: 25 }
                    },
                    headStyles: {
                        fillColor: [46, 125, 50],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    }
                });
                
                // Update yPos after table
                yPos = doc.previousAutoTable.finalY + 8;
            } else {
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('No vital signs logs recorded', margin, yPos);
                yPos += 10;
            }
            
            // Show event logs
            yPos = checkForNewPage(yPos, 30);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Event Logs:', margin, yPos);
            yPos += 6;
            
            if (eventLogs.length > 0) {
                // Sort events by timestamp (oldest first)
                eventLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                // Create table for event logs
                const tableData = [];
                
                eventLogs.forEach(log => {
                    if (log.event) {
                        tableData.push({
                            time: log.time || new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                            event: log.event.name || log.event.type.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' '),
                            notes: log.event.notes || ''
                        });
                    }
                });
                
                // Add table if there are events
                if (tableData.length > 0) {
                    yPos = checkForNewPage(yPos, 20 + tableData.length * 10);
                    
                    // If table won't fit on current page, add a new page
                    if (yPos + 20 + tableData.length * 10 > pageHeight - margin) {
                        yPos = addPageWithHeaderFooter();
                        yPos = addSectionTitle('3. Monitoring Logs & Events (continued)', yPos);
                        yPos += 6;
                    }
                    
                    doc.autoTable({
                        startY: yPos,
                        head: [['Time', 'Event', 'Notes']],
                        body: tableData.map(row => [row.time, row.event, row.notes]),
                        margin: { top: yPos, left: margin, right: margin },
                        columnStyles: {
                            0: { cellWidth: 25 },
                            1: { cellWidth: 45 },
                            2: { cellWidth: contentWidth - 70 }
                        },
                        headStyles: {
                            fillColor: [46, 125, 50],
                            textColor: 255,
                            fontStyle: 'bold'
                        },
                        alternateRowStyles: {
                            fillColor: [245, 245, 245]
                        }
                    });
                    
                    // Update yPos after table
                    yPos = doc.previousAutoTable.finalY + 8;
                }
            } else {
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('No event logs recorded', margin, yPos);
                yPos += 10;
            }
        
            // Recovery events
            yPos = checkForNewPage(yPos, 30);
            yPos = addSectionTitle('4. Recovery Events', yPos);
            
            if (allData.recoveryEvents && allData.recoveryEvents.length > 0) {
                // Create table for recovery events
                const tableData = [];
                
                allData.recoveryEvents.forEach(event => {
                    tableData.push({
                        time: event.time,
                        description: event.description,
                        notes: event.notes || ''
                    });
                });
                
                // Add table
                yPos = checkForNewPage(yPos, 20 + tableData.length * 10);
                
                // If table won't fit on current page, add a new page
                if (yPos + 20 + tableData.length * 10 > pageHeight - margin) {
                    yPos = addPageWithHeaderFooter();
                    yPos = addSectionTitle('4. Recovery Events (continued)', yPos);
                }
                
                doc.autoTable({
                    startY: yPos,
                    head: [['Time', 'Description', 'Notes']],
                    body: tableData.map(row => [
                        row.time,
                        row.description,
                        row.notes
                    ]),
                    margin: { top: yPos, left: margin, right: margin },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: contentWidth - 85 }
                    },
                    headStyles: {
                        fillColor: [46, 125, 50],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    }
                });
                
                // Update yPos after table
                yPos = doc.previousAutoTable.finalY + 8;
            } else {
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('No recovery events recorded', margin, yPos);
                yPos += 8;
            }
        
            // Morphometry data
            yPos = checkForNewPage(yPos, 70);
            if (yPos + 70 > pageHeight - margin) {
                yPos = addPageWithHeaderFooter();
            }
            yPos = addSectionTitle('5. Morphometry', yPos);
            
            // Format morphometry data
            const morphometry = allData.morphometry;
            
            // Canine measurements
            yPos += 2;
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Canine Measurements (cm):', margin, yPos);
            yPos += 5;
            
            if (morphometry && morphometry.canines) {
                yPos = addKeyValue('Upper Left', morphometry.canines.upperLeft, yPos);
                yPos = addKeyValue('Upper Right', morphometry.canines.upperRight, yPos);
                yPos = addKeyValue('Lower Left', morphometry.canines.lowerLeft, yPos);
                yPos = addKeyValue('Lower Right', morphometry.canines.lowerRight, yPos);
            }
            yPos += 2;
            
            // Intercanine distances
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Intercanine Distances (cm):', margin, yPos);
            yPos += 5;
            
            if (morphometry && morphometry.intercanineDistance) {
                yPos = addKeyValue('Upper', morphometry.intercanineDistance.upper, yPos);
                yPos = addKeyValue('Lower', morphometry.intercanineDistance.lower, yPos);
            }
            yPos += 2;
            
            // Body measurements
            yPos = checkForNewPage(yPos, 40);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Body Measurements (cm):', margin, yPos);
            yPos += 5;
        
            if (morphometry && morphometry.bodyMeasurements) {
                yPos = addKeyValue('Neck Girth', morphometry.bodyMeasurements.neckGirth, yPos);
                yPos = addKeyValue('Cranial Length', morphometry.bodyMeasurements.cranialLength, yPos);
                yPos = addKeyValue('Body Length', morphometry.bodyMeasurements.bodyLength, yPos);
                yPos = addKeyValue('Tail Length', morphometry.bodyMeasurements.tailLength, yPos);
                yPos = addKeyValue('Forelimb Length', morphometry.bodyMeasurements.forelimbLength, yPos);
                yPos = addKeyValue('Hindlimb Length', morphometry.bodyMeasurements.hindlimbLength, yPos);
            }
            
            // Generate filename based on animal info
            const dateStr = new Date(allData.animalInfo.dateTime).toISOString().split('T')[0];
            const filename = `Immobilization_${allData.animalInfo.animalId}_${dateStr}.pdf`;
            
            // Add a direct download button to the page
            try {
                console.log('Preparing PDF for download...');
                
                // Use data URI approach (most compatible across browsers)
                const pdfOutput = doc.output('datauristring');
                console.log('PDF data URI created');
                
                // Create a visible download link for the user to click
                const exportSection = document.getElementById('export');
                
                // Remove any existing download links
                const existingLink = document.getElementById('pdf-download-link');
                if (existingLink) {
                    existingLink.remove();
                }
                
                // Create new download link
                const downloadDiv = document.createElement('div');
                downloadDiv.className = 'download-ready';
                downloadDiv.innerHTML = `
                    <p>Your PDF report is ready!</p>
                    <a id="pdf-download-link" href="${pdfOutput}" download="${filename}" class="download-btn">
                        <i class="fas fa-download"></i> Download PDF Report
                    </a>
                    <p class="small-text">Click the button above to download your report</p>
                `;
                
                // Add to export section
                const exportOptions = exportSection.querySelector('.export-options');
                exportOptions.appendChild(downloadDiv);
                
                // Show success message
                UIManager.showNotification('PDF report generated successfully! Click the download button to save it.', 'success');
                
                // Add some basic styles
                const style = document.createElement('style');
                style.textContent = `
                    .download-ready { 
                        margin: 20px 0; 
                        padding: 15px; 
                        background-color: #e8f5e9; 
                        border-radius: 5px; 
                        border: 1px solid #4caf50;
                        text-align: center;
                    }
                    .download-btn {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                        margin: 10px 0;
                        font-weight: bold;
                    }
                    .download-btn:hover {
                        background-color: #46a049;
                    }
                    .small-text {
                        font-size: 12px;
                        color: #666;
                    }
                `;
                document.head.appendChild(style);
            } catch (error) {
                console.error('Error generating PDF:', error);
                UIManager.showNotification(`Failed to generate PDF report: ${error.message}`, 'error');
            }
        } catch (mainError) {
            console.error('Error in PDF generation process:', mainError);
            UIManager.showNotification(`Error creating PDF: ${mainError.message}`, 'error');
        }
    }
    
    // Return public methods
    return {
        generatePDF
    };
})();
