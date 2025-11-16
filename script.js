// Capital Reclaim Frontend JavaScript
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.status = document.getElementById('formStatus');
        this.fileInput = document.getElementById('fileInput');
        this.fileList = document.getElementById('fileList');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = this.submitBtn.querySelector('.btn-text');
        this.btnLoading = this.submitBtn.querySelector('.btn-loading');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        const errors = this.validateFiles(files);
        
        if (errors.length > 0) {
            alert('Please fix file errors:\n' + errors.join('\n'));
            e.target.value = '';
            this.updateFileList([]);
            return;
        }
        
        this.updateFileList(files);
    }

    validateFiles(files, maxSize = 10 * 1024 * 1024) {
        const errors = [];
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        for (let file of files) {
            // Size validation
            if (file.size > maxSize) {
                errors.push(`"${file.name}" exceeds 10MB limit`);
            }
            
            // Type validation
            if (!allowedTypes.includes(file.type)) {
                errors.push(`"${file.name}" - file type not supported`);
            }
        }

        return errors;
    }

    updateFileList(files) {
        if (files.length === 0) {
            this.fileList.textContent = 'No files selected';
            this.fileList.className = 'file-list';
            return;
        }

        const fileNames = files.map(f => f.name).join(', ');
        this.fileList.textContent = `Selected: ${files.length} file(s) - ${fileNames}`;
        this.fileList.className = 'file-list has-files';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const files = Array.from(this.fileInput.files);

        // Validate files again before submission
        const fileErrors = this.validateFiles(files);
        if (fileErrors.length > 0) {
            this.setStatus('error', 'Please fix file errors before submitting.');
            return;
        }

        // Add files to FormData
        files.forEach(file => {
            formData.append('files', file);
        });

        this.setLoading(true);
        this.setStatus('sending', 'Submitting your case...');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Show success message with options
                const caseId = data.caseId;
                this.setStatus('success', 
                    `✅ Case ${caseId} submitted successfully!\n\n` +
                    `We've sent a confirmation email to your inbox. Our team will contact you within 24-48 hours.\n\n` +
                    `Would you like to submit another case or return to the home page?`
                );
                
                // Create action buttons
                setTimeout(() => {
                    const statusDiv = this.status;
                    if (statusDiv && statusDiv.classList.contains('status-success')) {
                        const buttonContainer = document.createElement('div');
                        buttonContainer.style.cssText = 'display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;';
                        
                        const submitAnotherBtn = document.createElement('button');
                        submitAnotherBtn.type = 'button';
                        submitAnotherBtn.className = 'btn btn-primary';
                        submitAnotherBtn.textContent = 'Submit Another Case';
                        submitAnotherBtn.onclick = () => {
                            this.form.reset();
                            this.updateFileList([]);
                            this.clearStatus();
                            // Scroll to form
                            this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            // Focus first input
                            const firstInput = this.form.querySelector('input');
                            if (firstInput) firstInput.focus();
                        };
                        
                        const homeBtn = document.createElement('button');
                        homeBtn.type = 'button';
                        homeBtn.className = 'btn btn-secondary';
                        homeBtn.textContent = 'Return to Home';
                        homeBtn.onclick = () => {
                            window.location.href = 'index.html';
                        };
                        
                        buttonContainer.appendChild(submitAnotherBtn);
                        buttonContainer.appendChild(homeBtn);
                        statusDiv.appendChild(buttonContainer);
                    }
                }, 100);
                
            } else {
                throw new Error(data.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.setStatus('error', 
                `❌ Submission failed: ${error.message}. Please try again or contact us directly.`
            );
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.btnText.style.display = 'none';
            this.btnLoading.style.display = 'inline-block';
        } else {
            this.submitBtn.disabled = false;
            this.btnText.style.display = 'inline-block';
            this.btnLoading.style.display = 'none';
        }
    }

    setStatus(type, message) {
        this.status.textContent = message;
        this.status.className = `form-status status-${type}`;
    }

    clearStatus() {
        this.status.textContent = '';
        this.status.className = 'form-status';
    }
}

class CaseStatus {
    constructor() {
        this.form = document.getElementById('checkStatusForm');
        this.statusDiv = document.getElementById('caseStatus');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.checkStatus(e));
        }
    }

    async checkStatus(e) {
        e.preventDefault();
        const caseId = document.getElementById('caseId').value.trim();

        if (!caseId) {
            this.showError('Please enter a case ID');
            return;
        }

        this.showLoading('Checking case status...');

        try {
            const response = await fetch(`/api/case/${caseId}`);
            const data = await response.json();

            if (data.success) {
                this.showCaseDetails(data.case);
            } else {
                this.showError(data.error || 'Case not found');
            }
        } catch (error) {
            console.error('Status check error:', error);
            this.showError('Failed to check status. Please try again.');
        }
    }

    showCaseDetails(caseData) {
        const statusColors = {
            'new': '#f59e0b',
            'in-progress': '#3b82f6',
            'completed': '#10b981',
            'on-hold': '#6b7280'
        };

        const statusColor = statusColors[caseData.status] || '#6b7280';
        
        let updatesHtml = '';
        if (caseData.updates && caseData.updates.length > 0) {
            updatesHtml = `
                <div class="case-updates">
                    <h5>Recent Updates:</h5>
                    ${caseData.updates.slice(-3).map(update => `
                        <div class="update-item">
                            <div class="update-message">${update.message}</div>
                            <div class="update-meta">
                                <span>${new Date(update.date).toLocaleDateString()}</span>
                                <span style="color: ${statusColor}">${update.status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.statusDiv.innerHTML = `
            <div class="case-details">
                <h4>Case ${caseData.id}</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0;">
                    <div>
                        <strong>Status</strong>
                        <div style="color: ${statusColor}">${this.formatStatus(caseData.status)}</div>
                    </div>
                    <div>
                        <strong>Created</strong>
                        <div>${new Date(caseData.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <strong>Service</strong>
                        <div>${caseData.service || 'Not specified'}</div>
                    </div>
                </div>
                ${updatesHtml}
            </div>
        `;
    }

    formatStatus(status) {
        const statusMap = {
            'new': '🆕 New',
            'in-progress': '🔄 In Progress',
            'completed': '✅ Completed',
            'on-hold': '⏸️ On Hold'
        };
        return statusMap[status] || status;
    }

    showLoading(message) {
        this.statusDiv.innerHTML = `
            <div class="form-status status-sending">
                ${message}
            </div>
        `;
    }

    showError(message) {
        this.statusDiv.innerHTML = `
            <div class="form-status status-error">
                ❌ ${message}
            </div>
        `;
    }
}

// Client Login Handler
class ClientLogin {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }

        // Simulate magic link sending
        alert(`🔐 Magic login link sent to ${email}\n\nIn a real implementation, this would send an actual login link to your email.`);
        
        // Clear form
        this.form.reset();
    }
}

// Utility functions
class Utilities {
    static init() {
        // Add any utility initialization here
        this.handleNavigation();
    }

    static handleNavigation() {
        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize utilities
    Utilities.init();

    // Initialize contact form if exists
    if (document.getElementById('contactForm')) {
        new ContactForm();
    }

    // Initialize case status checker if exists
    if (document.getElementById('checkStatusForm')) {
        new CaseStatus();
    }

    // Initialize login form if exists
    if (document.getElementById('loginForm')) {
        new ClientLogin();
    }
});

// Export classes for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContactForm, CaseStatus, ClientLogin, Utilities };
}