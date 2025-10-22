// KSR College No Due Form - Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('noDueForm');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const formSections = document.querySelectorAll('.form-section');
    const modal = document.getElementById('successModal');
    const applicationId = document.getElementById('applicationId');
    
    // Form validation rules
    const validationRules = {
        studentName: {
            required: true,
            pattern: /^[A-Za-z\s]{2,50}$/,
            message: 'Please enter a valid name (2-50 characters, letters only)'
        },
        registerNumber: {
            required: true,
            pattern: /^[0-9]{10,15}$/,
            message: 'Please enter a valid register number (10-15 digits)'
        },
        rollNumber: {
            required: true,
            pattern: /^[A-Z0-9]{5,15}$/,
            message: 'Please enter a valid roll number (5-15 alphanumeric characters)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: true,
            pattern: /^[0-9]{10}$/,
            message: 'Please enter a valid 10-digit phone number'
        },
        parentPhone: {
            required: true,
            pattern: /^[0-9]{10}$/,
            message: 'Please enter a valid 10-digit parent phone number'
        }
    };

    // Initialize form animations
    function initializeAnimations() {
        // Animate form sections on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        formSections.forEach(section => {
            observer.observe(section);
        });

        // Logo hover animation
        const logo = document.querySelector('.logo');
        logo.addEventListener('mouseenter', () => {
            logo.style.transform = 'scale(1.1) rotate(5deg)';
        });
        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'scale(1) rotate(0deg)';
        });
    }

    // Form progress calculation
    function calculateProgress() {
        const requiredFields = form.querySelectorAll('[required]');
        const checkboxes = form.querySelectorAll('input[type="checkbox"][name="clearance[]"]');
        let filledFields = 0;
        let totalFields = requiredFields.length;

        // Count filled required fields
        requiredFields.forEach(field => {
            if (field.type === 'checkbox') {
                // For declaration checkbox
                if (field.checked) filledFields++;
            } else if (field.value.trim() !== '') {
                filledFields++;
            }
        });

        // Check if at least one clearance checkbox is selected
        const clearanceSelected = Array.from(checkboxes).some(cb => cb.checked);
        if (clearanceSelected) {
            filledFields += 0.5; // Partial credit for clearance selection
        }

        const progress = Math.round((filledFields / totalFields) * 100);
        progressFill.style.width = progress + '%';
        progressPercentage.textContent = progress + '%';

        // Add color coding for progress
        if (progress < 30) {
            progressFill.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
        } else if (progress < 70) {
            progressFill.style.background = 'linear-gradient(90deg, #f39c12 0%, #e67e22 100%)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
        }
    }

    // Field validation
    function validateField(field) {
        const fieldName = field.name;
        const rule = validationRules[fieldName];
        
        if (!rule) return true;

        const value = field.value.trim();
        
        // Remove existing error styling
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Check if required field is empty
        if (rule.required && value === '') {
            showFieldError(field, 'This field is required');
            return false;
        }

        // Check pattern validation
        if (value !== '' && rule.pattern && !rule.pattern.test(value)) {
            showFieldError(field, rule.message);
            return false;
        }

        // Show success state
        field.classList.add('success');
        return true;
    }

    // Show field error
    function showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        field.parentNode.appendChild(errorDiv);
    }

    // Enhanced form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        // Check if at least one clearance is selected
        const clearanceCheckboxes = form.querySelectorAll('input[name="clearance[]"]');
        const clearanceSelected = Array.from(clearanceCheckboxes).some(cb => cb.checked);
        
        if (!clearanceSelected) {
            showNotification('Please select at least one clearance type', 'error');
            isValid = false;
        }

        if (!isValid) {
            showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            // Generate application ID
            const appId = 'KSR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
            applicationId.textContent = appId;
            
            // Show success modal
            modal.style.display = 'block';
            
            // Reset form
            form.reset();
            calculateProgress();
            
            // Reset submit button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show success notification
            showNotification('Application submitted successfully!', 'success');
            
            // Store application data (in real application, this would be sent to server)
            const formData = new FormData(form);
            const applicationData = {
                id: appId,
                submittedAt: new Date().toISOString(),
                data: Object.fromEntries(formData)
            };
            
            localStorage.setItem('lastApplication', JSON.stringify(applicationData));
            
        }, 2000);
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease-out;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Close modal
    window.closeModal = function() {
        modal.style.display = 'none';
    };

    // File upload handling
    function handleFileUpload() {
        const fileInput = document.getElementById('documents');
        const uploadArea = document.querySelector('.upload-area');
        const uploadBtn = document.querySelector('.upload-btn');
        
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                let fileText = `${files.length} file(s) selected: `;
                Array.from(files).forEach(file => {
                    fileText += `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) `;
                });
                
                const fileDisplay = document.createElement('div');
                fileDisplay.className = 'file-display';
                fileDisplay.innerHTML = `
                    <i class="fas fa-file-upload"></i>
                    <p>${fileText}</p>
                `;
                fileDisplay.style.cssText = `
                    background: #e8f5e8;
                    border: 2px solid #27ae60;
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 10px;
                    color: #27ae60;
                    font-weight: 500;
                `;
                
                // Remove existing file display
                const existingDisplay = uploadArea.querySelector('.file-display');
                if (existingDisplay) {
                    existingDisplay.remove();
                }
                
                uploadArea.appendChild(fileDisplay);
                uploadBtn.textContent = 'Change Files';
                uploadBtn.style.background = '#27ae60';
            }
        });
    }

    // Department-specific validation
    function handleDepartmentChange() {
        const departmentSelect = document.getElementById('department');
        const yearSelect = document.getElementById('year');
        const semesterSelect = document.getElementById('semester');
        
        departmentSelect.addEventListener('change', (e) => {
            const department = e.target.value;
            
            // Add department-specific logic here
            if (department === 'cyber' || department === 'iot') {
                // These are newer programs, may have different year structures
                showNotification('Please verify year and semester options with your department', 'info');
            }
        });
    }

    // Auto-fill functionality (for testing)
    function addAutoFillFeature() {
        const logoContainer = document.querySelector('.logo-container');
        const autoFillBtn = document.createElement('button');
        autoFillBtn.innerHTML = '<i class="fas fa-magic"></i> Auto Fill (Demo)';
        autoFillBtn.className = 'auto-fill-btn';
        autoFillBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        logoContainer.style.position = 'relative';
        logoContainer.appendChild(autoFillBtn);
        
        autoFillBtn.addEventListener('click', () => {
            document.getElementById('studentName').value = 'John Doe';
            document.getElementById('registerNumber').value = '1234567890';
            document.getElementById('rollNumber').value = 'CSE20001';
            document.getElementById('email').value = 'john.doe@example.com';
            document.getElementById('phone').value = '9876543210';
            document.getElementById('parentPhone').value = '9876543211';
            document.getElementById('department').value = 'cse';
            document.getElementById('year').value = '4';
            document.getElementById('semester').value = '8';
            document.getElementById('batch').value = '2020-2024';
            document.getElementById('reason').value = 'graduation';
            document.getElementById('additionalInfo').value = 'Completing my final semester and need no due certificate for graduation.';
            
            // Check some clearance options
            document.getElementById('library').checked = true;
            document.getElementById('lab').checked = true;
            document.getElementById('accounts').checked = true;
            document.getElementById('department-clearance').checked = true;
            
            calculateProgress();
            showNotification('Form auto-filled with sample data', 'success');
        });
    }

    // Real-time validation
    function initializeRealTimeValidation() {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                validateField(input);
                calculateProgress();
            });
            
            input.addEventListener('change', () => {
                validateField(input);
                calculateProgress();
            });
        });
    }

    // Keyboard navigation
    function initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                showNotification('Press Tab to navigate fields, Enter to submit', 'info');
            }
        });
    }

    // Initialize all features
    function initialize() {
        initializeAnimations();
        calculateProgress();
        handleFileUpload();
        handleDepartmentChange();
        addAutoFillFeature();
        initializeRealTimeValidation();
        initializeKeyboardNavigation();
        
        // Add event listeners
        form.addEventListener('submit', handleFormSubmit);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Initial progress calculation
        setTimeout(calculateProgress, 100);
        
        console.log('KSR College No Due Form initialized successfully!');
    }

    // Start the application
    initialize();
});

// Additional utility functions
function formatApplicationId(id) {
    return id.toUpperCase().replace(/(.{3})/g, '$1-').slice(0, -1);
}

function printApplicationForm() {
    window.print();
}

function downloadFormData() {
    const formData = new FormData(document.getElementById('noDueForm'));
    const data = Object.fromEntries(formData);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'no-due-form-data.json';
    a.click();
    URL.revokeObjectURL(url);
}
