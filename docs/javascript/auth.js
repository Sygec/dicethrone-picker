/**
 * @fileoverview Authentication UI and business logic module wrapping Supabase Auth APIs.
 * @module auth
 */

import { db } from './db.js';

/**
 * Synchronizes the UI elements, buttons, and navigation options based on the user's login status.
 * Shows or hides administrator components and triggers list redraws.
 * @function updateAuthUI
 */
export function updateAuthUI() {
    const adminNav = document.querySelector(".bottom-nav .admin-only");

    if (window.currentUser) {
        if (window.loggedInPlayerIndex !== -1) {
            authBtn.innerText = `Logout (${window.NAMES[window.loggedInPlayerIndex]})`;
        } else {
            authBtn.innerText = `Logout (${window.currentUser.email.split("@")[0]})`;
        }
        authBtn.onclick = handleLogout;
        if (adminNav) adminNav.style.display = window.isAdmin() ? "flex" : "none";
    } else {
        authBtn.innerText = "Login";
        authBtn.onclick = openLoginModal;
        if (adminNav) adminNav.style.display = "none";
        if (document.getElementById("adminSection"))
            document.getElementById("adminSection").classList.add("hidden");
        const actionButtons = document.getElementById("action-buttons");
        if (actionButtons) actionButtons.style.display = "none";
        const rollBtnContainer = document.getElementById("rollBtnContainer");
        if (rollBtnContainer) rollBtnContainer.style.display = "flex";
        const rollBtn = document.getElementById("rollBtn");
        if (rollBtn) rollBtn.style.display = "block";
    }

    // Refresh lists to show/hide edit buttons
    if (typeof window.renderList === "function") window.renderList();
    if (typeof window.renderGamesList === "function") window.renderGamesList();
    if (typeof window.renderHeroesList === "function") window.renderHeroesList();
}
window.updateAuthUI = updateAuthUI;

/**
 * Renders the toggle buttons/checkboxes for player slots at the top of the interface.
 * @function renderPlayerToggles
 */
export function renderPlayerToggles() {
    const container = document.getElementById("player-toggle-zone-top");
    if (!container || window.players.length === 0) return;

    container.innerHTML = window.players
        .map((p, i) => {
            const isChecked = i < 4 ? "checked" : "";
            return `
            <label class="player-card" style="--player-color: var(--${p.id})">
                <input type="checkbox" id="use${i}" ${isChecked} onclick="handlePlayerToggleClick(event, ${i})">
                <span class="player-card-name">${p.name}</span>
            </label>`;
        })
        .join("");
}
window.renderPlayerToggles = renderPlayerToggles;

/**
 * Displays the login modal popup, sets page scroll behavior, and registers keybind handlers.
 * @function openLoginModal
 */
export function openLoginModal() {
    loginModal.style.display = "flex";
    document.getElementById("login-error").style.display = "none";
    document.body.style.overflow = "hidden";
    // Add key handler so Escape cancels (form submit handles Enter)
    window.loginModalKeyHandler = (e) => {
        if (e.key === "Escape") {
            closeLoginModal();
        }
    };
    document.addEventListener("keydown", window.loginModalKeyHandler);
}
window.openLoginModal = openLoginModal;

/**
 * Closes the login modal popup, restores page scrolling, and removes keybind event listeners.
 * @function closeLoginModal
 */
export function closeLoginModal() {
    loginModal.style.display = "none";
    document.body.style.overflow = "auto";
    // Remove key handler when modal is closed
    if (window.loginModalKeyHandler) {
        document.removeEventListener("keydown", window.loginModalKeyHandler);
        window.loginModalKeyHandler = null;
    }
}
window.closeLoginModal = closeLoginModal;

/**
 * Authenticates the user with Supabase using email and password credentials from login inputs.
 * Displays error messages if login fails.
 * @function handleLogin
 * @async
 * @returns {Promise<void>}
 */
export async function handleLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorDiv = document.getElementById("login-error");

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = "block";
    }
}
window.handleLogin = handleLogin;

/**
 * Requests a password reset email via Supabase Auth for the email filled in the login input.
 * Displays success feedback or error message.
 * @function handlePasswordReset
 * @async
 * @returns {Promise<void>}
 */
export async function handlePasswordReset() {
    const email = document.getElementById("login-email").value;
    const errorDiv = document.getElementById("login-error");

    if (!email) {
        errorDiv.innerText =
            "Please enter your email address first to reset password.";
        errorDiv.style.display = "block";
        return;
    }

    const { error } = await db.auth.resetPasswordForEmail(email);

    if (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = "block";
    } else {
        errorDiv.innerText =
            "Password reset email sent. Please check your inbox.";
        errorDiv.style.color = "#4CAF50";
        errorDiv.style.display = "block";
        setTimeout(() => {
            errorDiv.style.color = "var(--danger)";
        }, 5000);
    }
}
window.handlePasswordReset = handlePasswordReset;

/**
 * Displays the password update modal dialog overlay.
 * @function openUpdatePasswordModal
 */
export function openUpdatePasswordModal() {
    updatePasswordModal.style.display = "block";
    document.getElementById("update-password-error").style.display = "none";
    document.body.style.overflow = "hidden";
}
window.openUpdatePasswordModal = openUpdatePasswordModal;

/**
 * Closes the password update modal dialog overlay.
 * @function closeUpdatePasswordModal
 */
export function closeUpdatePasswordModal() {
    updatePasswordModal.style.display = "none";
    document.body.style.overflow = "auto";
}
window.closeUpdatePasswordModal = closeUpdatePasswordModal;

/**
 * Updates the logged-in user's password using the value inside the password reset form.
 * @function handleUpdatePassword
 * @async
 * @returns {Promise<void>}
 */
export async function handleUpdatePassword() {
    const newPassword = document.getElementById("new-password").value;
    const errorDiv = document.getElementById("update-password-error");

    if (!newPassword) {
        errorDiv.innerText = "Please enter a new password.";
        errorDiv.style.display = "block";
        return;
    }

    const { error } = await db.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = "block";
    } else {
        alert("Password updated successfully!");
        closeUpdatePasswordModal();
        document.getElementById("new-password").value = "";
    }
}
window.handleUpdatePassword = handleUpdatePassword;

/**
 * Prompts the user and logs out of the active Supabase session.
 * @function handleLogout
 * @async
 * @returns {Promise<void>}
 */
export async function handleLogout() {
    if (confirm("Log out now?")) {
        await db.auth.signOut();
    }
}
window.handleLogout = handleLogout;

