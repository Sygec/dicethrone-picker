/**
 * @fileoverview View module for displaying non-blocking toast notifications and custom confirmation modals.
 * @module notificationView
 */

/**
 * Displays a toast notification on the screen.
 * @param {string} message - The message to display.
 * @param {'success'|'error'|'warning'|'info'} [type='info'] - The type of toast.
 */
export function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
        <span class="toast-message"></span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;
    
    // Safely set text content to avoid XSS
    toast.querySelector('.toast-message').textContent = message;

    container.appendChild(toast);

    // Trigger animation after append
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const removeToast = () => {
        if (!toast.parentNode) return;
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    };

    // Auto-dismiss after 4 seconds
    const autoDismissTimeout = setTimeout(removeToast, 4000);

    // Close button click listener
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoDismissTimeout);
        removeToast();
    });
}

/**
 * Displays a custom confirmation modal.
 * @param {string} title - The title of the confirmation modal.
 * @param {string} message - The message text.
 * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled.
 */
export function showConfirm(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'confirm-modal-overlay';
        
        overlay.innerHTML = `
            <div class="confirm-modal-content">
                <h3 class="confirm-modal-title"></h3>
                <p class="confirm-modal-message"></p>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn confirm-btn-cancel" id="confirm-cancel-btn">Cancel</button>
                    <button class="confirm-btn confirm-btn-confirm" id="confirm-confirm-btn">Confirm</button>
                </div>
            </div>
        `;

        // Safely set text to avoid XSS
        overlay.querySelector('.confirm-modal-title').textContent = title;
        overlay.querySelector('.confirm-modal-message').textContent = message;

        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        const cleanUp = () => {
            overlay.classList.remove('show');
            overlay.addEventListener('transitionend', () => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            });
        };

        overlay.querySelector('#confirm-cancel-btn').addEventListener('click', () => {
            cleanUp();
            resolve(false);
        });

        overlay.querySelector('#confirm-confirm-btn').addEventListener('click', () => {
            cleanUp();
            resolve(true);
        });

        // Close on background click (treated as cancel)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanUp();
                resolve(false);
            }
        });
    });
}
