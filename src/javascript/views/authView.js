/**
 * @fileoverview Presentation view module for Authentication UI rendering, modal visibility, and inputs.
 * @module authView
 */

import * as stateStore from '../stateStore.js';
import { isAdmin } from '../utils.js';

let elementsCache = null;
const getElements = () => {
    if (!elementsCache) {
        elementsCache = {
            adminNav: document.querySelector(".bottom-nav .admin-only"),
            authBtn: document.getElementById("auth-btn"),
            actionButtons: document.getElementById("action-buttons"),
            rollBtnContainer: document.getElementById("rollBtnContainer"),
            rollBtn: document.getElementById("rollBtn"),
            rollDraftBtn: document.getElementById("rollDraftBtn"),
            loginModal: document.getElementById("login-modal"),
            loginError: document.getElementById("login-error"),
            updatePasswordModal: document.getElementById("update-password-modal"),
            updatePasswordError: document.getElementById("update-password-error"),
            updatePasswordUsername: document.getElementById("update-password-username"),
            newPasswordInput: document.getElementById("new-password"),
            playerTogglesContainer: document.getElementById("player-toggle-zone-top")
        };
    }
    return elementsCache;
};

/**
 * Updates the authentication buttons and bottom admin navigation based on session status.
 */
export function updateAuthUI() {
    const el = getElements();
    const currentUser = stateStore.get("currentUser");
    const loggedInPlayerIndex = stateStore.get("loggedInPlayerIndex");
    const names = stateStore.get("NAMES");

    if (currentUser) {
        if (loggedInPlayerIndex !== -1 && names[loggedInPlayerIndex]) {
            if (el.authBtn) el.authBtn.innerText = `Logout (${names[loggedInPlayerIndex]})`;
        } else {
            const username = currentUser.email ? currentUser.email.split("@")[0] : "User";
            if (el.authBtn) el.authBtn.innerText = `Logout (${username})`;
        }
        if (el.adminNav) el.adminNav.style.display = isAdmin() ? "flex" : "none";
    } else {
        if (el.authBtn) el.authBtn.innerText = "Login";
        if (el.adminNav) el.adminNav.style.display = "none";
        
        const adminSection = document.getElementById("adminSection");
        if (adminSection) adminSection.classList.add("hidden");
        
        if (el.actionButtons) el.actionButtons.style.display = "none";
        if (el.rollBtnContainer) el.rollBtnContainer.style.display = "flex";
        if (el.rollBtn) el.rollBtn.style.display = "block";
        if (el.rollDraftBtn) el.rollDraftBtn.style.display = "block";
    }
}

/**
 * Renders the toggle buttons for active player slots at the top of the interface.
 */
export function renderPlayerToggles() {
    const el = getElements();
    const players = stateStore.get("players");
    if (!el.playerTogglesContainer || !players || players.length === 0) return;

    el.playerTogglesContainer.innerHTML = players
        .map((p, i) => {
            const isChecked = i < 4 ? "checked" : "";
            return `
            <label class="player-card" style="--player-color: var(--${p.id})">
                <input type="checkbox" id="use${i}" ${isChecked} data-action="toggle-player-slot" data-player-idx="${i}">
                <span class="player-card-name">${p.name}</span>
            </label>`;
        })
        .join("");
}

/**
 * Displays the login modal popup.
 */
export function openLoginModal() {
    const el = getElements();
    if (el.loginModal) el.loginModal.style.display = "flex";
    if (el.loginError) el.loginError.style.display = "none";
    document.body.style.overflow = "hidden";
}

/**
 * Closes the login modal popup.
 */
export function closeLoginModal() {
    const el = getElements();
    if (el.loginModal) el.loginModal.style.display = "none";
    document.body.style.overflow = "auto";
}

/**
 * Displays an authentication error inside the login modal.
 * @param {string} message - Error message text.
 */
export function showLoginError(message) {
    const el = getElements();
    if (el.loginError) {
        el.loginError.innerText = message;
        el.loginError.style.color = "var(--danger)";
        el.loginError.style.display = "block";
    }
}

/**
 * Displays the password update modal dialog overlay.
 */
export function openUpdatePasswordModal() {
    const el = getElements();
    if (el.updatePasswordModal) el.updatePasswordModal.style.display = "block";
    if (el.updatePasswordError) el.updatePasswordError.style.display = "none";
    document.body.style.overflow = "hidden";

    const currentUser = stateStore.get("currentUser");
    if (el.updatePasswordUsername && currentUser) {
        el.updatePasswordUsername.value = currentUser.email || "";
    }
}

/**
 * Closes the password update modal.
 */
export function closeUpdatePasswordModal() {
    const el = getElements();
    if (el.updatePasswordModal) el.updatePasswordModal.style.display = "none";
    document.body.style.overflow = "auto";
}

/**
 * Displays an error inside the update password modal.
 * @param {string} message - Error message text.
 */
export function showUpdatePasswordError(message) {
    const el = getElements();
    if (el.updatePasswordError) {
        el.updatePasswordError.innerText = message;
        el.updatePasswordError.style.color = "var(--danger)";
        el.updatePasswordError.style.display = "block";
    }
}

/**
 * Displays a success feedback state for password updates.
 */
export function showUpdatePasswordSuccessFeedback() {
    const el = getElements();
    if (el.loginError) {
        el.loginError.innerText = "Password reset email sent. Please check your inbox.";
        el.loginError.style.color = "#4CAF50";
        setTimeout(() => {
            if (el.loginError) el.loginError.style.color = "var(--danger)";
        }, 5000);
    }
}

/**
 * Resets password update form inputs.
 */
export function resetPasswordUpdateForm() {
    const el = getElements();
    if (el.newPasswordInput) el.newPasswordInput.value = "";
}
