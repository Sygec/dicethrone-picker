/**
 * @fileoverview Authentication UI and business logic module wrapping Supabase Auth APIs.
 * @module auth
 */
let loginModalKeyHandler = null;
import { renderList } from './filters.js';
import { renderGamesList, renderHeroesList } from './admin.js';
import { showConfirm } from './utils.js';


import * as apiService from './services/apiService.js';
import * as authView from './views/authView.js';

/**
 * Synchronizes the UI elements, buttons, and navigation options based on the user's login status.
 * Shows or hides administrator components and triggers list redraws.
 * @function updateAuthUI
 */
export function updateAuthUI() {
    authView.updateAuthUI();

    // Refresh lists to show/hide edit buttons
    renderList();
    renderGamesList();
    renderHeroesList();
}
/**
 * Renders the toggle buttons/checkboxes for player slots at the top of the interface.
 * @function renderPlayerToggles
 */
export function renderPlayerToggles() {
    authView.renderPlayerToggles();
}
/**
 * Displays the login modal popup, sets page scroll behavior, and registers keybind handlers.
 * @function openLoginModal
 */
export function openLoginModal() {
    authView.openLoginModal();
    // Add key handler so Escape cancels (form submit handles Enter)
    loginModalKeyHandler = (e) => {
        if (e.key === "Escape") {
            closeLoginModal();
        }
    };
    document.addEventListener("keydown", loginModalKeyHandler);
}
/**
 * Closes the login modal popup, restores page scrolling, and removes keybind event listeners.
 * @function closeLoginModal
 */
export function closeLoginModal() {
    authView.closeLoginModal();
    // Remove key handler when modal is closed
    if (loginModalKeyHandler) {
        document.removeEventListener("keydown", loginModalKeyHandler);
    }
}
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

    const { error } = await apiService.signInWithPassword({ email, password });

    if (error) {
        authView.showLoginError(error.message);
    }
}
/**
 * Requests a password reset email via Supabase Auth for the email filled in the login input.
 * Displays success feedback or error message.
 * @function handlePasswordReset
 * @async
 * @returns {Promise<void>}
 */
export async function handlePasswordReset() {
    const email = document.getElementById("login-email").value;

    if (!email) {
        authView.showLoginError("Please enter your email address first to reset password.");
        return;
    }

    const { error } = await apiService.resetPasswordForEmail(email);

    if (error) {
        authView.showLoginError(error.message);
    } else {
        authView.showUpdatePasswordSuccessFeedback();
    }
}
/**
 * Displays the password update modal dialog overlay.
 * @function openUpdatePasswordModal
 */
export function openUpdatePasswordModal() {
    authView.openUpdatePasswordModal();
}
/**
 * Closes the password update modal dialog overlay.
 * @function closeUpdatePasswordModal
 */
export function closeUpdatePasswordModal() {
    authView.closeUpdatePasswordModal();
}
/**
 * Updates the logged-in user's password using the value inside the password reset form.
 * @function handleUpdatePassword
 * @async
 * @returns {Promise<void>}
 */
export async function handleUpdatePassword() {
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!newPassword) {
        authView.showUpdatePasswordError("Please enter a new password.");
        return;
    }

    if (newPassword !== confirmPassword) {
        authView.showUpdatePasswordError("Passwords do not match.");
        return;
    }

    const { error } = await apiService.updateUser({
        password: newPassword,
    });

    if (error) {
        authView.showUpdatePasswordError(error.message);
    } else {
        alert("Password updated successfully!");
        closeUpdatePasswordModal();
        authView.resetPasswordUpdateForm();
    }
}
/**
 * Prompts the user and logs out of the active Supabase session.
 * @function handleLogout
 * @async
 * @returns {Promise<void>}
 */
export async function handleLogout() {
    if (await showConfirm("Log Out", "Log out now?")) {
        await apiService.signOut();
    }
}
