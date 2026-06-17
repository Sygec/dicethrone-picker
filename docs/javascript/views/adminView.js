/**
 * @fileoverview Presentation view module for Admin section, Changelog modals, Section navigation, and Game History logs.
 * @module adminView
 */

import * as stateStore from '../stateStore.js';
import { 
    getImgUrl, 
    getHeroLink, 
    getPlayerColor, 
    escapeHtml, 
    normalizeColorValue,
    getHeroProbabilityText,
    isAdmin,
    isUser
} from '../utils.js';
import { isProd } from '../config.js';
import { updateSegmentedHighlights } from './filterView.js';

// DOM Element references cache helper
const getElements = () => ({
    buildInfoDiv: document.getElementById("admin-build-info"),
    changelogModal: document.getElementById("changelog-modal"),
    changelogContainer: document.getElementById("changelog-container"),
    whatsNewModal: document.getElementById("whats-new-modal"),
    whatsNewContainer: document.getElementById("whats-new-container"),
    collectionContainer: document.getElementById("collectionContainer"),
    collectionCountLabel: document.getElementById("collection-count-stats"),
    heroForm: document.getElementById("heroForm"),
    addHeroBtn: document.getElementById("addHeroBtn"),
    groupSelect: document.getElementById("charGroup"),
    formTitle: document.getElementById("formTitle"),
    charNameInput: document.getElementById("charName"),
    charSlugInput: document.getElementById("charSlug"),
    charComplexitySelect: document.getElementById("charComplexity"),
    groupsListContainer: document.getElementById("groupsListContainer"),
    heroesListContainer: document.getElementById("heroesListContainer"),
    playersListContainer: document.getElementById("playersListContainer"),
    usersListContainer: document.getElementById("usersListContainer"),
    collectionsListContainer: document.getElementById("collectionsListContainer"),
    gamesListContainer: document.getElementById("gamesContainer"),
    winnerModal: document.getElementById("winner-modal"),
    winnerContainer: document.getElementById("winner-selection-container"),
    confirmWinnerBtn: document.getElementById("confirm-winner-btn"),
    groupForm: document.getElementById("groupForm"),
    addGroupBtn: document.getElementById("addGroupBtn")
});

/**
 * Renders environmental build metadata in the admin interface.
 */
export function renderAdminBuildInfo() {
    const el = getElements();
    if (!el.buildInfoDiv) return;

    const host = window.location.hostname;
    let platform = "Localhost";
    if (host.includes("github.io")) platform = "GitHub Pages";
    else if (host.includes("workers.dev")) platform = "Cloudflare Workers";

    const env = isProd ? "Production" : "Development";
    const dbName = isProd ? "Supabase PROD" : "Supabase DEV";
    const branchHint = isProd ? "main" : "dev/local";

    el.buildInfoDiv.innerHTML = `
        <div><b>Platform:</b> ${platform} (${host})</div>
        <div><b>Environment:</b> ${env} (Targeting: ${branchHint})</div>
        <div><b>Database:</b> ${dbName}</div>
        ${!isProd ? '<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>' : ""}
    `;
}

/**
 * Opens the application changelog modal, populating it with cached version history.
 */
export function openChangelog() {
    const el = getElements();
    const cachedChangelog = stateStore.get("cachedChangelog");
    if (!cachedChangelog || !el.changelogContainer || !el.changelogModal) return;

    el.changelogContainer.innerHTML = cachedChangelog
        .map(
            (entry) => `
        <div>
            <h3>v${entry.version}</h3>
            <ul>
                ${entry.changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
        </div>
    `,
        )
        .join("");

    el.changelogModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

/**
 * Closes the application changelog modal.
 */
export function closeChangelog() {
    const el = getElements();
    if (el.changelogModal) el.changelogModal.style.display = "none";
    document.body.style.overflow = "auto";
}

/**
 * Displays the "What's New" modal with release updates for a specific version entry.
 * @param {Object} entry - Version changelog entry.
 */
export function showWhatsNew(entry) {
    const el = getElements();
    if (!el.whatsNewContainer || !el.whatsNewModal) return;

    el.whatsNewContainer.innerHTML = `
        <div>
            <h3>v${entry.version}</h3>
            <ul style="text-align: left;">
                ${entry.changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
        </div>
    `;
    el.whatsNewModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

/**
 * Closes the "What's New" version updates modal.
 */
export function closeWhatsNew() {
    const el = getElements();
    if (el.whatsNewModal) el.whatsNewModal.style.display = "none";
    document.body.style.overflow = "auto";
}

/**
 * Handles navigation switching by showing the target section and hiding others.
 * @param {string} sectionName - Section identifier ('roll', 'database', 'history', 'collection', 'admin').
 */
export function showSection(sectionName) {
    if (sectionName === "admin" && !isAdmin()) return;

    const sections = {
        roll: "rollSection",
        database: "dbSection",
        history: "gamesSection",
        collection: "collectionSection",
        admin: "adminSection"
    };

    const targetId = sections[sectionName];
    if (!targetId) return;

    Object.values(sections).forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            if (id === targetId) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        }
    });

    if (sectionName === "database") {
        setTimeout(updateSegmentedHighlights, 50);
    } else if (sectionName === "history") {
        renderGamesList();
    } else if (sectionName === "collection") {
        renderCollectionView();
    }
}

/**
 * Toggles the visibility state of an admin accordion panel.
 * @param {Event} event - Triggering click event.
 * @param {string} panelId - ID of the target panel element.
 */
export function toggleAdminPanel(event, panelId) {
    const panel = document.getElementById(panelId);
    const header = event.currentTarget.closest(".panel-header") || event.currentTarget;
    const button = header.querySelector(".panel-toggle");
    if (!panel || !button) return;

    const isHidden = panel.classList.toggle("hidden");
    button.classList.toggle("open", !isHidden);
    button.setAttribute("aria-expanded", String(!isHidden));
}

/**
 * Collapses or expands a specific hero detail panel in the admin list.
 * @param {HTMLElement} header - Header element of the panel.
 */
export function toggleHeroPanel(header) {
    const item = header.closest(".hero-item");
    const button = header.querySelector(".panel-toggle");
    if (!item || !button) return;

    const isNowCollapsed = item.classList.toggle("collapsed");
    button.classList.toggle("open", !isNowCollapsed);
    button.setAttribute("aria-expanded", String(!isNowCollapsed));
}

/**
 * Renders the user collection view.
 */
export function renderCollectionView() {
    const el = getElements();
    if (!el.collectionContainer) return;

    const characters = stateStore.get("characters");
    const groups = stateStore.get("groups");
    const currentUser = stateStore.get("currentUser");
    const expandedCollectionGroups = stateStore.get("expandedCollectionGroups");

    const totalHeroes = characters.length;
    const ownedHeroes = characters.filter(stateStore.get("isHeroOwned") || (c => c.is_owned)).length;

    if (el.collectionCountLabel) {
        el.collectionCountLabel.innerText = `Owned ${ownedHeroes} of ${totalHeroes} heroes`;
    }

    const sortedGroups = [...groups].sort((a, b) => {
        const orderA = a.order_index ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order_index ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
    });

    const isDisabled = currentUser ? "" : "disabled";

    el.collectionContainer.innerHTML = sortedGroups
        .map((group) => {
            const groupHeroes = characters
                .filter((c) => c.group_id === group.id)
                .sort((a, b) => a.name.localeCompare(b.name));

            if (groupHeroes.length === 0) return "";

            const allOwned = groupHeroes.every(stateStore.get("isHeroOwned") || (c => c.is_owned));

            const heroesHtml = groupHeroes
                .map((h) => {
                    const isSelected = h.is_owned;
                    return `
            <div class="collection-hero-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}" data-action="toggle-hero-owned" data-hero-id="${h.id}" data-selected="${isSelected}">
                <img src="${getImgUrl(h.slug)}" class="collection-hero-card-img" alt="${h.name}">
                <div class="collection-hero-card-name">${h.name}</div>
            </div>
        `;
                })
                .join("");

            const isExpanded = expandedCollectionGroups.has(group.id);
            const totalGroup = groupHeroes.length;
            const ownedGroup = groupHeroes.filter(c => c.is_owned).length;

            return `
            <div class="collection-group${isExpanded ? "" : " collapsed"}">
                <div class="collection-group-header" data-action="toggle-collection-group" data-group-id="${group.id}" style="cursor: pointer;">
                    <input type="checkbox" id="owned-group-${group.id}" ${allOwned ? "checked" : ""} ${isDisabled} data-action="toggle-group-owned" data-group-id="${group.id}">
                    <label for="owned-group-${group.id}">
                        <strong>${group.name}</strong>
                        ${group.year ? ` <span style="opacity: 0.6; font-size: 0.85em;">(${group.year})</span>` : ""}
                        <span class="stats-divider" style="margin: 0 8px;">|</span>
                        <span style="opacity: 0.6; font-size: 0.85em;">Owned: <strong style="color: #fff;">${ownedGroup}</strong>/<strong style="color: #fff;">${totalGroup}</strong></span>
                    </label>
                    <button type="button" class="panel-toggle${isExpanded ? " open" : ""}" aria-expanded="${isExpanded}">V</button>
                </div>
                <div class="collection-heroes-list">
                    ${heroesHtml}
                </div>
            </div>
        `;
        })
        .join("");
}

/**
 * Resets the active editing hero form state back to Add mode.
 */
export function resetForm() {
    const el = getElements();
    if (el.charNameInput) el.charNameInput.value = "";
    if (el.charSlugInput) el.charSlugInput.value = "";
    if (el.groupSelect) el.groupSelect.value = "";
    if (el.charComplexitySelect) el.charComplexitySelect.value = "";
    if (el.formTitle) el.formTitle.innerText = "Add New Hero";

    if (el.heroForm && el.addHeroBtn) {
        el.heroForm.classList.add("hidden");
        el.addHeroBtn.innerText = "Add Hero";
    }
}

/**
 * Collapses or expands the hero creator form.
 */
export function toggleHeroForm() {
    const el = getElements();
    if (!el.heroForm || !el.addHeroBtn) return;

    const isHidden = el.heroForm.classList.toggle("hidden");
    el.addHeroBtn.innerText = isHidden ? "Add Hero" : "Hide Hero Form";

    if (!isHidden && el.charNameInput) {
        el.charNameInput.focus();
    }
}

/**
 * Populates the hero form group dropdown with loaded seasons/groups.
 */
export function populateGroupDropdown() {
    const el = getElements();
    if (!el.groupSelect) return;
    
    const groups = stateStore.get("groups");
    const options = groups
        .map((g) => `<option value="${g.id}">${g.name}</option>`)
        .join("");
    el.groupSelect.innerHTML = '<option value="">-- Select Group --</option>' + options;
}

/**
 * Renders the list of seasons/groups in the admin management dashboard.
 */
export function renderGroupsList() {
    const el = getElements();
    if (!el.groupsListContainer) return;

    const groups = stateStore.get("groups");
    if (groups.length === 0) {
        el.groupsListContainer.innerHTML =
            '<p style="opacity: 0.6; font-style: italic;">No groups yet. Create one above.</p>';
        return;
    }

    const html = groups
        .map(
            (g) => `
        <div id="groupRow-${g.id}" class="group-row" style="margin: 5px 0; background: rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                <div>
                    <strong>${escapeHtml(g.name)}</strong>
                    ${g.year ? ` <span style="opacity: 0.6;">(${g.year})</span>` : ""}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-save btn-inline" data-action="edit-group" data-group-id="${g.id}">Edit</button>
                    <button type="button" class="btn-cancel btn-inline" data-action="delete-group" data-group-id="${g.id}">Delete</button>
                </div>
            </div>
            <div id="groupEditPanel-${g.id}" class="group-edit-panel hidden">
                <div class="form-grid">
                    <input type="text" id="groupName-${g.id}" placeholder="Group Name" value="${escapeHtml(g.name)}">
                    <input type="number" id="groupOrder-${g.id}" placeholder="Order Index" value="${g.order_index ?? ""}">
                    <input type="number" id="groupYear-${g.id}" placeholder="Release Year" value="${g.year ?? ""}">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn-save" data-action="save-group-inline" data-group-id="${g.id}">Save</button>
                    <button type="button" class="btn-cancel" data-action="cancel-group-edit" data-group-id="${g.id}">Cancel</button>
                </div>
            </div>
        </div>
    `,
        )
        .join("");

    el.groupsListContainer.innerHTML = html;
}

/**
 * Renders the admin heroes list, allowing inline configuration updates.
 */
export function renderHeroesList() {
    const el = getElements();
    if (!el.heroesListContainer) return;

    const characters = stateStore.get("characters");
    const editIndex = stateStore.get("editIndex");
    const groups = stateStore.get("groups");

    if (characters.length === 0) {
        el.heroesListContainer.innerHTML =
            '<p style="opacity: 0.6; font-style: italic;">No heroes yet. Add one above.</p>';
        return;
    }

    const html = characters
        .map((c, idx) => {
            const isEditing = editIndex === idx;
            const editBtn = isAdmin()
                ? `<button class="btn-save btn-inline" data-action="edit-hero" data-hero-idx="${idx}">Edit</button>`
                : "";
            const deleteBtn = isAdmin()
                ? `<button class="btn-cancel btn-inline" data-action="delete-hero" data-hero-id="${c.id}">Delete</button>`
                : "";
            const groupOptions = groups
                .map(
                    (g) =>
                        `<option value="${g.id}" ${g.id === c.group_id ? "selected" : ""}>${escapeHtml(g.name)}</option>`,
                )
                .join("");

            return `
            <div id="heroRow-${c.id}" class="group-row hero-admin-row${isEditing ? " editing" : ""}">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div>
                        <strong>${escapeHtml(c.name)}</strong>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${editBtn}
                        ${deleteBtn}
                    </div>
                </div>
                <div id="heroEditPanel-${c.id}" class="group-edit-panel${isEditing ? "" : " hidden"}">
                    <div class="form-grid">
                        <input type="text" id="heroName-${idx}" placeholder="Hero Name" value="${escapeHtml(c.name)}">
                        <select id="heroGroup-${idx}">
                            <option value="">-- Select Group --</option>
                            ${groupOptions}
                        </select>
                    </div>
                    <div class="form-grid">
                        <input type="text" id="heroSlug-${idx}" placeholder="Slug (for image)" value="${escapeHtml(c.slug)}">
                        <select id="heroComplexity-${idx}">
                            <option value="">-- Complexity --</option>
                            ${[1, 2, 3, 4, 5, 6].map((value) => `<option value="${value}" ${c.complexity == value ? "selected" : ""}>${value}</option>`).join("")}
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-save" data-action="save-hero-inline" data-hero-id="${c.id}" data-hero-idx="${idx}">Save</button>
                        <button class="btn-cancel" data-action="cancel-hero-edit">Cancel</button>
                    </div>
                </div>
            </div>`;
        })
        .join("");

    el.heroesListContainer.innerHTML = html;
    if (editIndex !== -1) {
        el.heroesListContainer.classList.add("group-edit-active");
    } else {
        el.heroesListContainer.classList.remove("group-edit-active");
    }
}

/**
 * Resets the active group inline editing panel form.
 * @param {string} groupId - Season/Group ID.
 */
export function resetGroupInlineEditPanel(groupId) {
    const panel = document.getElementById(`groupEditPanel-${groupId}`);
    const activeRow = document.getElementById(`groupRow-${groupId}`);
    if (panel) panel.classList.add("hidden");
    if (activeRow) activeRow.classList.remove("editing");

    const listContainer = getElements().groupsListContainer;
    if (listContainer) {
        const isAnyEditing = listContainer.querySelectorAll(".group-row.editing").length > 0;
        if (!isAnyEditing) {
            listContainer.classList.remove("group-edit-active");
        }
    }
}

/**
 * Resets the group creator form elements.
 */
export function resetGroupForm() {
    const nameEl = document.getElementById("groupName");
    const orderEl = document.getElementById("groupOrder");
    const yearEl = document.getElementById("groupYear");
    
    if (nameEl) nameEl.value = "";
    if (orderEl) orderEl.value = "";
    if (yearEl) yearEl.value = "";

    const form = getElements().groupForm;
    const button = getElements().addGroupBtn;
    if (form && button) {
        form.classList.add("hidden");
        button.innerText = "Add Group";
    }
}

/**
 * Toggles the visibility of the group creation form.
 */
export function toggleGroupForm() {
    const form = getElements().groupForm;
    const button = getElements().addGroupBtn;
    if (!form || !button) return;

    const isHidden = form.classList.toggle("hidden");
    button.innerText = isHidden ? "Add Group" : "Hide Group Form";
    if (!isHidden) {
        const nameInput = document.getElementById("groupName");
        if (nameInput) nameInput.focus();
    }
}

/**
 * Renders the player details list in the admin panel.
 */
export function renderPlayersList() {
    const el = getElements();
    if (!el.playersListContainer) return;

    const players = stateStore.get("players");
    if (players.length === 0) {
        el.playersListContainer.innerHTML = '<p style="opacity: 0.6; font-style: italic;">No players loaded.</p>';
        return;
    }

    const html = players
        .map((p, idx) => {
            const currentColor = getPlayerColor(p);
            const isEditing = false; // Add state edit logic if needed

            return `
            <div id="playerRow-${p.id}" class="group-row player-admin-row">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${currentColor}; border: 1px solid rgba(255,255,255,0.2);"></span>
                        <strong>${escapeHtml(p.name)}</strong>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label class="color-picker-button" title="Choose player color">
                            <span>🎨</span>
                            <input type="color" id="playerColor-${p.id}" value="${currentColor}" data-action="player-color-change" data-player-id="${p.id}">
                        </label>
                        <button class="btn-save btn-inline" data-action="edit-player" data-player-id="${p.id}">Edit</button>
                    </div>
                </div>
                <div id="playerEditPanel-${p.id}" class="group-edit-panel hidden">
                    <div class="form-grid">
                        <input type="text" id="playerName-${p.id}" placeholder="Player Name" value="${escapeHtml(p.name)}">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-save" data-action="save-player-inline" data-player-id="${p.id}">Save</button>
                        <button class="btn-cancel" data-action="cancel-player-edit" data-player-id="${p.id}">Cancel</button>
                    </div>
                </div>
            </div>`;
        })
        .join("");

    el.playersListContainer.innerHTML = html;
}

/**
 * Resets the player inline editing panel display.
 * @param {string} playerId - Player UUID/ID.
 */
export function resetPlayerInlineEditPanel(playerId) {
    const panel = document.getElementById(`playerEditPanel-${playerId}`);
    const activeRow = document.getElementById(`playerRow-${playerId}`);
    if (panel) panel.classList.add("hidden");
    if (activeRow) activeRow.classList.remove("editing");

    const listContainer = getElements().playersListContainer;
    if (listContainer) {
        const isAnyEditing = listContainer.querySelectorAll(".player-admin-row.editing").length > 0;
        if (!isAnyEditing) {
            listContainer.classList.remove("player-edit-active");
        }
    }
}

/**
 * Renders the system users list dashboard.
 */
export function renderUsersList() {
    const el = getElements();
    if (!el.usersListContainer) return;

    const authUsers = stateStore.get("authUsers");
    if (authUsers.length === 0) {
        el.usersListContainer.innerHTML = '<p style="opacity: 0.6; font-style: italic;">No system users loaded.</p>';
        return;
    }

    const html = authUsers
        .map((user) => {
            const role = user.role || "user";
            const isUserAdmin = role === "admin";
            const email = user.email || "No Email";
            
            return `
            <div class="user-row" style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div>
                    <div><strong>${escapeHtml(email)}</strong></div>
                    <div style="font-size: 0.8em; opacity: 0.6;">Role: ${role.toUpperCase()}</div>
                </div>
                <div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${isUserAdmin ? "checked" : ""} data-action="user-role-change" data-user-id="${user.id}">
                        <span class="toggle-slider"></span>
                    </label>
                    <span style="font-size: 0.75rem; opacity: 0.7; margin-left: 5px;">Admin</span>
                </div>
            </div>`;
        })
        .join("");

    el.usersListContainer.innerHTML = html;
}

/**
 * Renders the list of collections for administrators.
 * @param {Array<Object>} userProfiles - Profiles of players.
 * @param {Array<Object>} userHeroes - List of hero ownership records.
 */
export function renderCollectionsListUI(userProfiles, userHeroes) {
    const el = getElements();
    if (!el.collectionsListContainer) return;

    if (userProfiles.length === 0) {
        el.collectionsListContainer.innerHTML = '<p style="opacity: 0.6; font-style: italic;">No collections loaded.</p>';
        return;
    }

    const characters = stateStore.get("characters");

    // Build ownership map for easy lookup: key = `${userId}_${heroId}`
    const ownershipMap = {};
    userHeroes.forEach((row) => {
        ownershipMap[`${row.user_id}_${row.hero_id}`] = row.is_owned;
    });

    // Create table wrapper for responsive scrolling
    const tableWrapper = document.createElement("div");
    tableWrapper.style.overflowX = "auto";
    tableWrapper.style.marginTop = "10px";

    // Build header columns: Hero + user profiles
    const headersHtml = userProfiles
        .map((up) => `<th style="padding: 10px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">${escapeHtml(up.name)}</th>`)
        .join("");

    // Build rows for each hero
    const rowsHtml = characters
        .map((hero) => {
            const cellsHtml = userProfiles
                .map((up) => {
                    const key = `${up.user_id}_${hero.id}`;
                    const isOwned = ownershipMap[key] !== false; // Default to true if record doesn't exist
                    return `
                        <td style="padding: 8px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <input 
                                type="checkbox" 
                                ${isOwned ? "checked" : ""} 
                                data-action="toggle-user-hero-owned" data-user-id="${up.user_id}" data-hero-id="${hero.id}"
                                style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--accent);"
                            >
                        </td>
                    `;
                })
                .join("");

            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 500; font-size: 0.9rem;">
                        ${escapeHtml(hero.name)}
                    </td>
                    ${cellsHtml}
                </tr>
            `;
        })
        .join("");

    tableWrapper.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr>
                    <th style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">Hero</th>
                    ${headersHtml}
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;

    el.collectionsListContainer.innerHTML = "";
    el.collectionsListContainer.appendChild(tableWrapper);
}

/**
 * Displays the modal for picking a winner for a game session.
 * @param {string} gameId - Match UUID.
 */
export function openWinnerModal(gameId) {
    const el = getElements();
    const games = stateStore.get("games");
    const players = stateStore.get("players");
    const names = stateStore.get("NAMES");

    if (!el.winnerModal || !el.winnerContainer || !el.confirmWinnerBtn) return;

    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    el.confirmWinnerBtn.setAttribute("data-game-id", gameId);
    el.confirmWinnerBtn.disabled = true;

    // Check if game was a draw in its previous state
    const winners = game.game_players.filter((p) => p.is_winner === true);
    const explicitLosers = game.game_players.filter((p) => p.is_winner === false);
    const isDraw = winners.length === 0 && explicitLosers.length > 0 && explicitLosers.length === game.game_players.length;

    const isTwoRows = game.game_players.length > 3;
    const gridClass = isTwoRows ? "winner-select-grid two-rows" : "winner-select-grid";

    let playersHtml = `<div class="${gridClass}">`;

    game.game_players.forEach((gp) => {
        const pIdx = parseInt(gp.player_id.substring(1)) - 1;
        const displayName = gp.heroes?.name || "Unknown";
        const heroSlug = gp.heroes?.slug || "";
        const isSelected = gp.is_winner === true;
        const isChecked = isSelected ? "checked" : "";
        const selectedClass = isSelected ? "selected" : "";

        let playerLabelName = names[pIdx] || "Invitee";
        if (pIdx >= 4) {
            playerLabelName = `Invitee (${gp.player_id === "p5" ? "1" : "2"})`;
        }

        playersHtml += `
            <div class="winner-card ${selectedClass}" data-action="winner-card-click" data-value="${gp.player_id}">
                <input type="radio" name="winner-selection" value="${gp.player_id}" ${isChecked} style="display: none;">
                <img src="${getImgUrl(heroSlug)}" class="winner-card-img" alt="${displayName}">
                <div class="winner-card-player-name">${playerLabelName}</div>
                <div class="winner-card-hero-name">${displayName}</div>
            </div>
        `;
    });

    const isDrawChecked = isDraw ? "checked" : "";
    const drawSelectedClass = isDraw ? "selected" : "";

    playersHtml += `
            <div class="winner-draw-card ${drawSelectedClass}" data-action="winner-card-click" data-value="draw">
                <input type="radio" name="winner-selection" value="draw" ${isDrawChecked} style="display: none;">
                <span style="font-size: 1.5rem; line-height: 1;">🤝</span>
                <div style="text-align: left;">
                    <div class="winner-card-player-name" style="font-size: 0.9rem;">Select a Draw</div>
                    <div class="winner-card-hero-name" style="font-size: 0.7rem; opacity: 0.7;">No winner for this match</div>
                </div>
            </div>
        </div>
    `;

    el.winnerContainer.innerHTML = playersHtml;
    el.winnerModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

/**
 * Closes the winner modal.
 */
export function closeWinnerModal() {
    const el = getElements();
    if (el.winnerModal) el.winnerModal.style.display = "none";
    document.body.style.overflow = "auto";
}

/**
 * Renders the session game logs list.
 */
export function renderGamesList() {
    const el = getElements();
    if (!el.gamesListContainer) return;

    const games = stateStore.get("games");
    const players = stateStore.get("players");
    const names = stateStore.get("NAMES");
    const expandedGameIds = stateStore.get("expandedGameIds");
    const selectedGamePlayerIndex = stateStore.get("selectedGamePlayerIndex");
    const gamesWinnerOnly = stateStore.get("gamesWinnerOnly");
    const gamesUseHistorical = stateStore.get("gamesUseHistorical");
    const gamesHistoryStyle = stateStore.get("gamesHistoryStyle") || "gorgeous";

    const gamesSearchInput = document.getElementById("games-search");
    const searchTerm = gamesSearchInput ? gamesSearchInput.value.toLowerCase().trim() : "";

    const isGorgeous = gamesHistoryStyle === "gorgeous";

    const updateCountLabel = (filteredCount) => {
        const gamesCountLabel = document.getElementById("game-count-stats");
        if (gamesCountLabel) {
            const totalCount = games
                ? games.filter((g) => isGorgeous ? !g.is_historical : (gamesUseHistorical || !g.is_historical)).length
                : 0;
            gamesCountLabel.innerText = `Showing ${filteredCount} of ${totalCount} games`;
        }
    };

    let toggleHtml = "";
    if (isAdmin()) {
        const btnText = isGorgeous ? "Switch to Admin List View" : "Switch to Gorgeous View";
        toggleHtml = `
            <div class="admin-view-toggle-row" style="display: flex; justify-content: flex-end; margin-bottom: 15px; padding: 0 5px;">
                <button type="button" class="btn-save btn-inline" data-action="toggle-history-view-style" style="font-size: 0.85em; padding: 6px 12px; height: auto;">
                    ${btnText}
                </button>
            </div>
        `;
    }

    if (!games || games.length === 0) {
        el.gamesListContainer.innerHTML = toggleHtml + '<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No games played yet.</p>';
        updateCountLabel(0);
        return;
    }

    const filteredGames = games.filter((game) => {
        // If in gorgeous view style, historical games are completely hidden
        if (isGorgeous && game.is_historical) return false;

        // Otherwise, respect the historical filter checkbox/setting (if show is not enabled)
        if (!isGorgeous && !gamesUseHistorical && game.is_historical) return false;

        let playerMatches = true;
        if (selectedGamePlayerIndex !== null) {
            playerMatches = game.game_players.some((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                let match = false;
                if (selectedGamePlayerIndex >= 0 && selectedGamePlayerIndex <= 3) {
                    match = pIdx === selectedGamePlayerIndex;
                } else if (selectedGamePlayerIndex === 4) {
                    match = pIdx === 4 || pIdx === 5;
                }
                if (match && gamesWinnerOnly) return gp.is_winner === true;
                return match;
            });
        }
        if (!playerMatches) return false;

        if (searchTerm) {
            const heroes = (game.game_players || []).map((gp) => gp.heroes?.name || "").join(" ");
            if (!heroes.toLowerCase().includes(searchTerm)) return false;
        }

        return true;
    });

    if (filteredGames.length === 0) {
        el.gamesListContainer.innerHTML = toggleHtml + '<p style="opacity: 0.7; font-style: italic; text-align: center; padding: 20px;">No matches found matching filter criteria.</p>';
        updateCountLabel(0);
        return;
    }

    updateCountLabel(filteredGames.length);

    if (isGorgeous) {
        el.gamesListContainer.innerHTML = toggleHtml + filteredGames
            .map((game) => {
                let rawDate = game.played_at || "";
                if (rawDate && !rawDate.includes("T"))
                    rawDate = rawDate.replace(" ", "T");
                if (rawDate && !rawDate.includes("Z") && !rawDate.includes("+"))
                    rawDate += "Z";

                const dateStr = new Date(rawDate).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                });

                const winners = game.game_players.filter((p) => p.is_winner === true);
                const explicitLosers = game.game_players.filter((p) => p.is_winner === false);
                const isDraw = winners.length === 0 && explicitLosers.length > 0 && explicitLosers.length === game.game_players.length;
                const isInProgress = winners.length === 0 && !isDraw;
                const isExpanded = expandedGameIds.has(game.id);
                const expandedClass = isExpanded ? "expanded" : "";

                let bgImgHtml = "";
                if (winners.length > 0 && winners[0].heroes?.slug) {
                    bgImgHtml = `<img src="${getImgUrl(winners[0].heroes.slug)}" class="game-card-bg-img" alt="">`;
                }

                const playerNamesMap = {};
                game.game_players.forEach((gp) => {
                    const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                    let rawName = names[pIdx] || "Unknown";
                    if (rawName.toLowerCase().startsWith("player ") && rawName.length > 7) {
                        rawName = "P" + rawName.substring(7);
                    }
                    playerNamesMap[gp.player_id] = rawName;
                });

                const firstLetters = Object.values(playerNamesMap).map((name) => name.charAt(0).toUpperCase());

                const playerLabelsMap = {};
                game.game_players.forEach((gp) => {
                    const name = playerNamesMap[gp.player_id];
                    const firstChar = name.charAt(0).toUpperCase();
                    const count = firstLetters.filter((l) => l === firstChar).length;
                    let label = firstChar;
                    if (count > 1 && name.length > 1) {
                        label = firstChar + name.charAt(1).toLowerCase();
                    }
                    playerLabelsMap[gp.player_id] = label;
                });

                const sortedPlayersForSummary = [...game.game_players].sort((a, b) => {
                    if (a.is_winner && !b.is_winner) return -1;
                    if (!a.is_winner && b.is_winner) return 1;
                    return 0;
                });

                const portraitStrip = sortedPlayersForSummary
                    .map((gp) => {
                        const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                        const heroSlug = gp.heroes?.slug || "";
                        const heroName = gp.heroes?.name || "Unknown";
                        const isHeroWinner = gp.is_winner === true;
                        const winnerClass = isHeroWinner ? "winner-highlight" : "";
                        const trophyHtml = isHeroWinner ? '<span class="mini-winner-trophy">🏆</span>' : "";
                        const playerLabel = playerLabelsMap[gp.player_id];
                        return `
                            <a href="${getHeroLink(heroSlug)}" target="_blank" class="mini-portrait-wrapper ${winnerClass}" title="${heroName}">
                                ${trophyHtml}
                                <img src="${getImgUrl(heroSlug)}" class="mini-portrait-img" alt="${heroName}">
                                <div class="mini-portrait-pill" style="background-color: var(--p${pIdx + 1});">${playerLabel}</div>
                            </a>
                        `;
                    })
                    .join("");

                const statusLabel = isInProgress ? '<span class="game-card-status-badge">In Progress</span>' : "";
                const drawStampHtml = isDraw ? '<div class="player-plate-draw-badge">DRAW</div>' : "";
                
                const headerHtml = `
                <div class="game-card-header" data-action="toggle-game-expansion" data-game-id="${game.id}">
                    <div class="game-card-title-group">
                        <span class="game-card-date">${dateStr}</span>
                        ${statusLabel}
                    </div>
                    <div class="game-card-collapsed-summary">
                        <div class="mini-portrait-strip">
                            ${portraitStrip}
                            ${drawStampHtml}
                        </div>
                        <span class="chevron-icon">▼</span>
                    </div>
                </div>`;

                const canManage = isAdmin() || game.last_updated_by === (stateStore.get("currentUser")?.id);
                const gameActions = canManage
                    ? `
                    <div class="game-card-actions">
                        <button class="btn-game-action" data-action="select-winner" data-game-id="${game.id}" title="Select Winner">🏆</button>
                        <button class="btn-game-action delete" data-action="delete-game" data-game-id="${game.id}" title="Delete Game">🗑️</button>
                    </div>
                `
                    : "";

                const platesArray = game.game_players.map((gp) => {
                    const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                    const heroName = gp.heroes?.name || "Unknown";
                    const heroSlug = gp.heroes?.slug || "";
                    const isSearchMatch = Boolean(searchTerm && heroName.toLowerCase().includes(searchTerm));

                    let isPlayerFilterMatch = false;
                    if (selectedGamePlayerIndex !== null) {
                        if (selectedGamePlayerIndex >= 0 && selectedGamePlayerIndex <= 3) {
                            isPlayerFilterMatch = pIdx === selectedGamePlayerIndex;
                        } else if (selectedGamePlayerIndex === 4) {
                            isPlayerFilterMatch = pIdx === 4 || pIdx === 5;
                        }
                    }

                    let plateClass = "draw";
                    if (winners.length > 0) {
                        plateClass = gp.is_winner ? "winner" : "loser";
                    } else if (isDraw) {
                        plateClass = "draw";
                    } else if (isInProgress) {
                        plateClass = "in-progress";
                    } else {
                        plateClass = gp.is_winner === false ? "loser" : "draw";
                    }

                    let borderStyle = "";
                    if (isSearchMatch || isPlayerFilterMatch) {
                        borderStyle = "box-shadow: 0 0 8px var(--accent), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);";
                    }

                    const trophyHtml = gp.is_winner ? '<div class="player-plate-trophy">🏆</div>' : "";
                    const drawBadgeHtml = isDraw ? '<div class="player-plate-draw-badge">DRAW</div>' : "";

                    let statsHtml = "";
                    if (gp.is_winner) {
                        let heroPlayCount = 0;
                        let heroWinCount = 0;
                        const useHistorical = stateStore.get("gamesUseHistorical");
                        games.forEach((g) => {
                            if (!useHistorical && g.is_historical) return;
                            g.game_players.forEach((otherGp) => {
                                if (otherGp.player_id === gp.player_id && otherGp.hero_id === gp.hero_id) {
                                    heroPlayCount++;
                                    if (otherGp.is_winner) {
                                        heroWinCount++;
                                    }
                                }
                            });
                        });
                        const pct = heroPlayCount > 0 ? (heroWinCount / heroPlayCount).toFixed(3) : ".000";
                        const pctStr = pct.startsWith("0") ? pct.substring(1) : pct;
                        statsHtml = `
                                <div class="player-plate-winner-stats">${heroWinCount}🏆 / ${heroPlayCount}🎲</div>
                                <div class="player-plate-winner-pct">( ${pctStr})</div>
                            `;
                    }

                    return `
                        <a href="${getHeroLink(heroSlug)}" target="_blank" class="player-plate ${plateClass}" style="${borderStyle}">
                            <img src="${getImgUrl(heroSlug)}" class="player-plate-bg-art" alt="${heroName}">
                            <div class="player-plate-overlay"></div>
                            ${trophyHtml}
                            ${drawBadgeHtml}
                            <div class="player-plate-tag" style="background-color: var(--p${pIdx + 1});">${names[pIdx]}</div>
                            <div class="player-plate-info">
                                <div class="player-plate-hero-name">${heroName}</div>
                                ${statsHtml}
                            </div>
                        </a>`;
                });

                const playerPlatesHtml = platesArray.join("");

                return `
                <div class="game-history-card ${expandedClass}">
                    ${bgImgHtml}
                    ${headerHtml}
                    <div class="game-card-body">
                        <div class="player-responsive-grid">
                            ${playerPlatesHtml}
                        </div>
                        ${gameActions}
                    </div>
                </div>`;
            })
            .join("");
    } else {
        el.gamesListContainer.innerHTML = toggleHtml + filteredGames
            .map((game) => {
                const isExpanded = expandedGameIds.has(game.id);
                const dateStr = new Date(game.played_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });

                let winnersHtml = "";
                let playersListHtml = "";
                const winners = game.game_players.filter((p) => p.is_winner === true);
                const explicitLosers = game.game_players.filter((p) => p.is_winner === false);
                
                const isDraw = winners.length === 0 && explicitLosers.length === game.game_players.length;
                const isPending = winners.length === 0 && !isDraw;

                if (isDraw) {
                    winnersHtml = `<span style="color: var(--accent); font-weight: bold;">TIE</span>`;
                } else if (isPending) {
                    winnersHtml = `<span style="opacity: 0.5; font-style: italic; font-size: 0.85em;">Pending...</span>`;
                } else {
                    winnersHtml = winners
                        .map((gp) => {
                            const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                            let playerLabel = names[pIdx] || "Invitee";
                            if (pIdx >= 4) {
                                playerLabel = `Invitee (${gp.player_id === "p5" ? "1" : "2"})`;
                            }
                            return `<span style="color: var(--p${pIdx + 1}); font-weight: bold;">${playerLabel}</span>`;
                        })
                        .join(", ");
                }

                game.game_players.forEach((gp) => {
                    const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                    let colorVar = `--p${pIdx + 1}`;
                    let playerLabel = names[pIdx] || "Invitee";
                    
                    if (pIdx >= 4) {
                        colorVar = "--p5";
                        playerLabel = `Invitee (${gp.player_id === "p5" ? "1" : "2"})`;
                    }

                    let winStatus = "";
                    if (gp.is_winner === true) {
                        winStatus = '<span class="status-badge-win">WIN</span>';
                    } else if (gp.is_winner === false) {
                        winStatus = '<span class="status-badge-lose">LOSS</span>';
                    } else {
                        winStatus = '<span class="status-badge-pending">...</span>';
                    }

                    const isSearchMatch = Boolean(searchTerm && gp.heroes?.name?.toLowerCase().includes(searchTerm));
                    const heroHighlightStyle = isSearchMatch ? "color: var(--accent); font-weight: bold;" : "opacity: 0.8;";

                    playersListHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03);${isSearchMatch ? ' border: 1px solid var(--accent); padding: 6px; border-radius: 4px;' : ''}">
                            <span style="color: var(${colorVar}); font-weight: bold;">${playerLabel}</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.9em; ${heroHighlightStyle}">${gp.heroes?.name || "Unknown"}</span>
                                ${winStatus}
                            </div>
                        </div>
                    `;
                });

                const winnerBtn = isUser() && isPending
                    ? `<button type="button" class="btn-save btn-inline" data-action="open-winner-modal" data-game-id="${game.id}">Select Winner</button>`
                    : "";
                
                const deleteBtn = isAdmin()
                    ? `<button type="button" class="btn-cancel btn-inline" data-action="delete-game" data-game-id="${game.id}">Delete</button>`
                    : "";

                const historicBadge = game.is_historical
                    ? '<span style="font-size: 0.7em; letter-spacing: 0.5px; opacity: 0.5; padding: 2px 6px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-weight: 500; font-family: monospace;">HISTORICAL</span>'
                    : "";

                return `
                <div id="gameCard-${game.id}" class="game-history-card${isExpanded ? " expanded" : ""}" style="border: 1px solid rgba(255,255,255,0.08); margin: 10px 0; border-radius: 8px; background: rgba(0,0,0,0.15);">
                    <div class="game-card-summary-header" data-action="toggle-game-expansion" data-game-id="${game.id}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 12px 15px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="font-size: 0.8em; opacity: 0.6;">${dateStr} ${historicBadge}</span>
                            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.95em;">
                                <strong>Winner:</strong>
                                ${winnersHtml}
                            </div>
                        </div>
                        <button type="button" class="panel-toggle${isExpanded ? " open" : ""}">V</button>
                    </div>
                    <div class="game-card-expansion-content${isExpanded ? "" : " hidden"}" style="padding: 0 15px 15px 15px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.03);">
                        <div style="margin: 10px 0;">
                            ${playersListHtml}
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                            ${winnerBtn}
                            ${deleteBtn}
                        </div>
                    </div>
                </div>`;
            })
            .join("");
    }
}
