import { db } from './db.js';

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

export function openUpdatePasswordModal() {
    updatePasswordModal.style.display = "block";
    document.getElementById("update-password-error").style.display = "none";
    document.body.style.overflow = "hidden";
}
window.openUpdatePasswordModal = openUpdatePasswordModal;

export function closeUpdatePasswordModal() {
    updatePasswordModal.style.display = "none";
    document.body.style.overflow = "auto";
}
window.closeUpdatePasswordModal = closeUpdatePasswordModal;

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

export async function handleLogout() {
    if (confirm("Log out now?")) {
        await db.auth.signOut();
    }
}
window.handleLogout = handleLogout;
