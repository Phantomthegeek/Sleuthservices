// Terms and Conditions Acceptance Modal
// This must be accepted before users can access the site

(function() {
    'use strict';
    
    const TERMS_ACCEPTED_KEY = 'sleuthservice_termsAccepted';
    const TERMS_VERSION = '1.0'; // Update this when terms change
    
    function initTermsAcceptance() {
        // Check if terms have been accepted
        const accepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
        const acceptedVersion = localStorage.getItem(TERMS_ACCEPTED_KEY + '_version');
        
        // If not accepted or version changed, show modal
        if (!accepted || acceptedVersion !== TERMS_VERSION) {
            showTermsModal();
        }
    }
    
    function showTermsModal() {
        // Prevent scrolling of body
        document.body.style.overflow = 'hidden';
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'termsModal';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            animation: fadeIn 0.3s ease;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 1rem;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="padding: 2rem; border-bottom: 2px solid var(--border);">
                <h2 style="margin: 0; color: var(--text); font-size: 1.75rem;">
                    Terms and Conditions
                </h2>
                <p style="margin: 0.5rem 0 0 0; color: var(--text-light);">
                    Please read and accept our terms to continue
                </p>
            </div>
            
            <div style="padding: 2rem; max-height: 50vh; overflow-y: auto;">
                <div style="color: var(--text); line-height: 1.6;">
                    <h3 style="color: var(--primary); margin-top: 0;">Important Notice</h3>
                    <p>By accessing and using Sleuthservice services, you agree to be bound by our Terms of Service and Privacy Policy.</p>
                    
                    <h4 style="color: var(--text); margin-top: 1.5rem;">Key Points:</h4>
                    <ul>
                        <li>You must provide accurate and truthful information</li>
                        <li>All information is kept confidential and secure</li>
                        <li>Services are provided subject to our Terms of Service</li>
                        <li>We process personal data in accordance with our Privacy Policy</li>
                    </ul>
                    
                    <p style="margin-top: 1.5rem;">
                        <strong>Please review our full policies:</strong>
                    </p>
                    <p>
                        <a href="terms-of-service.html" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 600;">
                            📄 Terms of Service
                        </a>
                        <span style="margin: 0 1rem;">|</span>
                        <a href="privacy-policy.html" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 600;">
                            🔒 Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
            
            <div style="padding: 1.5rem 2rem; background: var(--background); border-top: 2px solid var(--border); display: flex; gap: 1rem; align-items: center; justify-content: flex-end;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
                    <input type="checkbox" id="termsCheckbox" required style="width: 18px; height: 18px; cursor: pointer;">
                    <span style="color: var(--text);">
                        I have read and agree to the 
                        <a href="terms-of-service.html" target="_blank" style="color: var(--primary); text-decoration: none;">Terms of Service</a>
                        and 
                        <a href="privacy-policy.html" target="_blank" style="color: var(--primary); text-decoration: none;">Privacy Policy</a>
                    </span>
                </label>
            </div>
            
            <div style="padding: 1.5rem 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="acceptTermsBtn" disabled style="
                    padding: 0.875rem 2rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    opacity: 0.5;
                ">
                    Accept and Continue
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Enable/disable accept button based on checkbox
        const checkbox = document.getElementById('termsCheckbox');
        const acceptBtn = document.getElementById('acceptTermsBtn');
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                acceptBtn.disabled = false;
                acceptBtn.style.opacity = '1';
                acceptBtn.style.cursor = 'pointer';
            } else {
                acceptBtn.disabled = true;
                acceptBtn.style.opacity = '0.5';
                acceptBtn.style.cursor = 'not-allowed';
            }
        });
        
        // Handle accept button
        acceptBtn.addEventListener('click', function() {
            if (checkbox.checked) {
                acceptTerms();
            }
        });
        
        // Prevent closing by clicking outside (force acceptance)
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                // Optional: Show message that terms must be accepted
                alert('You must accept the Terms and Conditions to use this website.');
            }
        });
        
        // Prevent ESC key from closing (force acceptance)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('termsModal')) {
                alert('You must accept the Terms and Conditions to use this website.');
            }
        });
    }
    
    function acceptTerms() {
        // Store acceptance
        localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
        localStorage.setItem(TERMS_ACCEPTED_KEY + '_version', TERMS_VERSION);
        localStorage.setItem(TERMS_ACCEPTED_KEY + '_date', new Date().toISOString());
        
        // Remove modal
        const modal = document.getElementById('termsModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        #acceptTermsBtn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }
        
        #termsModal a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTermsAcceptance);
    } else {
        initTermsAcceptance();
    }
})();

