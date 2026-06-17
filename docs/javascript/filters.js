/**
 * @fileoverview Logic for hero listing layout rendering, table sort columns, sidebar drawers, active filter chips, search queries, and recency calculations.
 * @module filters
 */

import * as stateStore from './stateStore.js';

/**
 * Toggles the visibility state of the sorting options section in the UI.
 * @function toggleSortSection
 */
export function toggleSortSection() {
    const sortSection = document.getElementById("sort-section");
    const button = document.getElementById("sort-panel-toggle");
    if (!sortSection) return;
    const isHidden = sortSection.classList.toggle("hidden");
    if (button) {
        button.classList.toggle("open", !isHidden);
        button.setAttribute("aria-expanded", String(!isHidden));
    }
}
window.toggleSortSection = toggleSortSection;

/**
 * Toggles the visibility state of the filtering options section in the UI.
 * @function toggleFilterSection
 */
export function toggleFilterSection() {
    const filterSection = document.getElementById("filter-section");
    const button = document.getElementById("filter-panel-toggle");
    if (!filterSection) return;
    const isHidden = filterSection.classList.toggle("hidden");
    if (button) {
        button.classList.toggle("open", !isHidden);
        button.setAttribute("aria-expanded", String(!isHidden));
    }
}
window.toggleFilterSection = toggleFilterSection;

/**
 * Opens the Sort & Filter drawer overlay, staging current settings values.
 * @function openSortFilterDrawer
 */
export function openSortFilterDrawer() {
    window.currentDrawerMode = "sort-filter";
    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");
    if (!drawer) return;

    title.innerText = "Sort & Filter";
    footer.style.display = "flex";

    // Stage current states
    window.stagedSort = window.currentSort;
    window.stagedSortAsc = window.sortAsc;
    window.stagedSortPlayerIndex = window.currentSortPlayerIndex;
    window.stagedLevels = new Set(window.activeLevels);
    window.stagedGroups = new Set(window.activeGroups);

    renderDrawerBody();
    drawer.classList.add("open");
}
window.openSortFilterDrawer = openSortFilterDrawer;

/**
 * Opens the Columns & Historical Data configuration drawer, staging active stats.
 * @function openColumnsDrawer
 */
export function openColumnsDrawer() {
    window.currentDrawerMode = "columns";
    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");
    if (!drawer) return;

    title.innerText = "Columns & Historical Data";
    footer.style.display = "flex";

    // Stage current states
    window.stagedPlayerIndices = [...window.activePlayerIndices];
    window.stagedUseHistorical = window.dbUseHistorical;

    renderDrawerBody();
    drawer.classList.add("open");
}
window.openColumnsDrawer = openColumnsDrawer;

/**
 * Opens the Game History filter settings drawer, staging selected parameters.
 * @function openHistoryFilterDrawer
 */
export function openHistoryFilterDrawer() {
    window.currentDrawerMode = "history-filter";
    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");
    if (!drawer) return;

    title.innerText = "Filter History";
    footer.style.display = "flex";

    // Stage current states
    window.stagedSelectedGamePlayerIndex = window.selectedGamePlayerIndex;
    window.stagedGamesWinnerOnly = window.gamesWinnerOnly;
    window.stagedGamesUseHistorical = window.gamesUseHistorical;

    renderDrawerBody();
    drawer.classList.add("open");
}
window.openHistoryFilterDrawer = openHistoryFilterDrawer;

/**
 * Opens the Left Filters drawer, staging active player, group, and complexity parameters.
 * @function openFilterDrawer
 */
export function openFilterDrawer() {
    window.stagedFilterDataHistories = new Set(window.activeFilterDataHistories);
    window.stagedFilterPlayers = new Set(window.activeFilterPlayers);
    window.stagedFilterComplexities = new Set(window.activeFilterComplexities);
    window.stagedFilterGroups = new Set(window.activeFilterGroups);

    renderFilterDrawerDynamicSections();
    updateFilterDrawerHeroCountUI();
    updateFilterDrawerSectionTitlesUI();

    const drawer = document.getElementById("filter-drawer-left");
    if (drawer) {
        drawer.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    }
}
window.openFilterDrawer = openFilterDrawer;

/**
 * Closes the Left Filters drawer, restoring page scroll behavior.
 * @function closeFilterDrawer
 * @param {Event|null} [event=null] - The triggered event context.
 * @param {boolean} [force=false] - If true, bypasses target mismatch checks.
 */
export function closeFilterDrawer(event = null, force = false) {
    if (event && event.target !== event.currentTarget && !force) return;
    const drawer = document.getElementById("filter-drawer-left");
    if (drawer) {
        drawer.classList.remove("open");
        document.body.style.overflow = "auto"; // Restore background scroll
    }
}
window.closeFilterDrawer = closeFilterDrawer;

/**
 * Re-renders the dynamic content regions inside the Left Filters drawer panel.
 * @function renderFilterDrawerDynamicSections
 */
export function renderFilterDrawerDynamicSections() {
    // 1. Render Players alphabetically (excluding Invitees)
    const playersContainer = document.getElementById("filter-options-players");
    if (playersContainer) {
        const sortedPlayers = window.players
            .filter(p => p.name && !p.name.toLowerCase().includes("invitee"))
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
        playersContainer.innerHTML = sortedPlayers.map(p => {
            const isChecked = window.stagedFilterPlayers.has(p.id) ? "checked" : "";
            return `
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${p.id}" data-type="player" ${isChecked} onchange="handleFilterDrawerCheckboxChange(this)" />
                    ${p.name}
                </label>
            `;
        }).join("");
    }

    // 2. Render Groups by order_index
    const groupsContainer = document.getElementById("filter-options-groups");
    if (groupsContainer) {
        const sortedGroups = window.groups.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        groupsContainer.innerHTML = sortedGroups.map(g => {
            const isChecked = window.stagedFilterGroups.has(g.id) ? "checked" : "";
            return `
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${g.id}" data-type="group" ${isChecked} onchange="handleFilterDrawerCheckboxChange(this)" />
                    ${g.name}
                </label>
            `;
        }).join("");
    }

    // Update static checkboxes (Complexity and Data History)
    document.querySelectorAll('#filter-drawer-left input[data-type="data-history"]').forEach(cb => {
        cb.checked = window.stagedFilterDataHistories.has(cb.value);
    });

    document.querySelectorAll('#filter-drawer-left input[data-type="complexity"]').forEach(cb => {
        cb.checked = window.stagedFilterComplexities.has(Number(cb.value));
    });
}
window.renderFilterDrawerDynamicSections = renderFilterDrawerDynamicSections;

/**
 * Handles checking and unchecking events inside the left filter drawer, updating staged states.
 * @function handleFilterDrawerCheckboxChange
 * @param {HTMLInputElement} checkbox - The checkbox element toggled by the user.
 */
export function handleFilterDrawerCheckboxChange(checkbox) {
    const type = checkbox.getAttribute("data-type");
    const val = checkbox.value;
    const checked = checkbox.checked;

    if (type === "data-history") {
        stateStore.updateSet("stagedFilterDataHistories", checked ? "add" : "delete", val);
    } else if (type === "player") {
        stateStore.updateSet("stagedFilterPlayers", checked ? "add" : "delete", val);
    } else if (type === "complexity") {
        const numVal = Number(val);
        stateStore.updateSet("stagedFilterComplexities", checked ? "add" : "delete", numVal);
    } else if (type === "group") {
        stateStore.updateSet("stagedFilterGroups", checked ? "add" : "delete", val);
    }

    updateFilterDrawerHeroCountUI();
    updateFilterDrawerSectionTitlesUI();
}
window.handleFilterDrawerCheckboxChange = handleFilterDrawerCheckboxChange;

/**
 * Clears all filters currently staged inside the Left Filters drawer.
 * @function resetFilterPanelSelections
 */
export function resetFilterPanelSelections() {
    window.stagedFilterDataHistories.clear();
    window.stagedFilterPlayers.clear();
    window.stagedFilterComplexities.clear();
    window.stagedFilterGroups.clear();

    const checkboxes = document.querySelectorAll('#filter-drawer-left input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });

    updateFilterDrawerHeroCountUI();
    updateFilterDrawerSectionTitlesUI();
}
window.resetFilterPanelSelections = resetFilterPanelSelections;

/**
 * Promotes staged left filter parameters to active filters, closing the drawer and updating the layout.
 * @function applyFilterPanelSelections
 */
export function applyFilterPanelSelections() {
    window.activeFilterDataHistories = new Set(window.stagedFilterDataHistories);
    window.activeFilterPlayers = new Set(window.stagedFilterPlayers);
    window.activeFilterComplexities = new Set(window.stagedFilterComplexities);
    window.activeFilterGroups = new Set(window.stagedFilterGroups);

    // Sync with the global dbUseHistorical variable
    window.dbUseHistorical = !window.activeFilterDataHistories.has("Normal only") || window.activeFilterDataHistories.has("Historical only");

    closeFilterDrawer(null, true);
    
    renderList();

    updateActiveFilterBadge();
    updateActiveFilterChips();
}
window.applyFilterPanelSelections = applyFilterPanelSelections;

/**
 * Computes the quantity of heroes matching the filter values currently staged inside the drawer.
 * @function getFilterDrawerMatchingCount
 * @returns {number} The quantity of matching hero records.
 */
export function getFilterDrawerMatchingCount() {
    const searchTerm = document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned = document.getElementById("db-show-not-owned")?.checked ?? false;

    const matched = window.characters.filter((c) => {
        // Complexity Match
        let complexityMatch = true;
        if (window.stagedFilterComplexities.size > 0) {
            complexityMatch = window.stagedFilterComplexities.has(Number(c.complexity));
        }

        // Group Match
        let groupFilterMatch = true;
        if (window.stagedFilterGroups.size > 0) {
            groupFilterMatch = window.stagedFilterGroups.has(c.group_id);
        }

        // Data History Filter
        let dataHistoryMatch = true;
        const hasNormalOnlyStaged = window.stagedFilterDataHistories.has("Normal only");
        const hasHistoricalOnlyStaged = window.stagedFilterDataHistories.has("Historical only");
        if (hasNormalOnlyStaged && !hasHistoricalOnlyStaged) {
            const heroGames = window.games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
            dataHistoryMatch = heroGames.some(g => !g.is_historical);
        } else if (hasHistoricalOnlyStaged && !hasNormalOnlyStaged) {
            const heroGames = window.games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
            dataHistoryMatch = heroGames.some(g => g.is_historical);
        }

        // Players Match
        let playersMatch = true;
        if (window.stagedFilterPlayers.size > 0) {
            const heroGames = window.games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
            const playedBySelected = heroGames.some(g => 
                g.game_players.some(gp => gp.hero_id === c.id && window.stagedFilterPlayers.has(gp.player_id))
            );
            playersMatch = playedBySelected;
        }

        // Ownership Match
        const ownershipMatch =
            (window.isHeroOwned(c) && showOwned) ||
            (!window.isHeroOwned(c) && showNotOwned);

        return (
            matchesSearchTerm(c, searchTerm) &&
            complexityMatch &&
            groupFilterMatch &&
            dataHistoryMatch &&
            playersMatch &&
            ownershipMatch
        );
    });

    return matched.length;
}
window.getFilterDrawerMatchingCount = getFilterDrawerMatchingCount;

/**
 * Updates the hero search results quantity text in the Left Filter drawer UI.
 * @function updateFilterDrawerHeroCountUI
 */
export function updateFilterDrawerHeroCountUI() {
    const total = getFilterDrawerMatchingCount();
    const countLabel = document.getElementById("filter-drawer-hero-count");
    if (countLabel) {
        countLabel.innerText = `Showing ${total} of ${window.characters.length} heroes`;
    }
}
window.updateFilterDrawerHeroCountUI = updateFilterDrawerHeroCountUI;

/**
 * Updates section titles inside the Left Filter drawer, displaying staged badge counts.
 * @function updateFilterDrawerSectionTitlesUI
 */
export function updateFilterDrawerSectionTitlesUI() {
    const titleDataHistory = document.getElementById("title-data-history");
    const titlePlayers = document.getElementById("title-players");
    const titleComplexity = document.getElementById("title-complexity");
    const titleGroups = document.getElementById("title-groups");

    if (titleDataHistory) {
        const count = window.stagedFilterDataHistories.size;
        titleDataHistory.innerText = count > 0 ? `By Data History (${count})` : "By Data History";
    }
    if (titlePlayers) {
        const count = window.stagedFilterPlayers.size;
        titlePlayers.innerText = count > 0 ? `By Player (${count})` : "By Player";
    }
    if (titleComplexity) {
        const count = window.stagedFilterComplexities.size;
        titleComplexity.innerText = count > 0 ? `By Complexity (${count})` : "By Complexity";
    }
    if (titleGroups) {
        const count = window.stagedFilterGroups.size;
        titleGroups.innerText = count > 0 ? `By Group (${count})` : "By Group";
    }
}
window.updateFilterDrawerSectionTitlesUI = updateFilterDrawerSectionTitlesUI;

/**
 * Closes the Sort/Filter/Settings overlay drawer.
 * @function closeDrawer
 * @param {Event|null} [event=null] - The triggered event context.
 * @param {boolean} [force=false] - If true, bypasses target mismatch checks.
 */
export function closeDrawer(event = null, force = false) {
    if (event && event.target !== event.currentTarget && !force) return;
    const drawer = document.getElementById("sort-filter-drawer");
    if (drawer) {
        drawer.classList.remove("open");
    }
}
window.closeDrawer = closeDrawer;

/**
 * Renders the body content of the active sidebar drawer based on the current drawer mode (e.g., sort, filter, column layout, settings).
 * @function renderDrawerBody
 */
export function renderDrawerBody() {
    const body = document.getElementById("drawer-body-content");
    if (!body) return;

    body.style.overflowY = "auto";

    if (window.currentDrawerMode === "sort-filter") {
        body.innerHTML = `
            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700;">Sort Visible Heroes:</span>
                <div class="sort-controls-new" style="margin-top: 10px;">
                    <select id="drawer-sort-type-select" class="sort-select-new" onchange="handleDrawerSortTypeChange(this.value)">
                        <option value="name">Hero Name</option>
                        <option value="group">Group (Season)</option>
                        <option value="probability">Roll Probability (%)</option>
                        <option value="lastPlayed">Last Played Date</option>
                    </select>
                    
                    <button type="button" id="drawer-sort-direction-btn" class="btn-direction-new" onclick="toggleDrawerSortDirection()">
                        <span id="drawer-sort-direction-text">Ascending</span>
                        <span id="drawer-sort-direction-arrow">▲</span>
                    </button>
                </div>
            </div>

            <div id="drawer-player-sort-sub-section" class="panel-row-new" style="display: none;">
                <span class="panel-row-title">For Player:</span>
                <div class="pill-group" id="drawer-player-sort-pills" style="margin-top: 10px;"></div>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0;">

            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700;">Complexity Level:</span>
                <div class="filter-bar-track" id="drawer-complexity-filter-bar" style="margin-top: 10px; flex-wrap: wrap;"></div>
            </div>

            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700; margin-bottom: 8px; display: block;">Hero Group / Season:</span>
                <div class="group-filter-grid-container" id="drawer-group-filter-bar"></div>
            </div>
        `;

        let sortType = "name";
        if (window.stagedSort === "group") {
            sortType = "group";
        } else if (window.stagedSort.startsWith("w")) {
            sortType = "probability";
            window.stagedSortPlayerIndex = parseInt(window.stagedSort.substring(1));
        } else if (window.stagedSort.startsWith("d")) {
            sortType = "lastPlayed";
            window.stagedSortPlayerIndex = parseInt(window.stagedSort.substring(1));
        }

        const select = document.getElementById("drawer-sort-type-select");
        if (select) select.value = sortType;

        updateDrawerSortDirectionUI();
        updateDrawerPlayerSortPillsUI();
        renderDrawerComplexityFilters();
        renderDrawerGroupFilters();
    } else if (window.currentDrawerMode === "columns") {
        const mainPlayerNames = window.NAMES.slice(0, 4);
        const visibilityPillsHtml = mainPlayerNames
            .map((name, i) => {
                const isActive = window.stagedPlayerIndices.includes(i);
                const activeClass = isActive
                    ? `active p${i + 1}-color`
                    : "inactive";
                return `
                <button type="button" class="pill-toggle ${activeClass}" onclick="toggleDrawerPlayerFilter(${i})">
                    ${name}
                </button>
            `;
            })
            .join("");

        body.innerHTML = `
            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700; margin-bottom: 10px; display: block;">Show Player Stat Rows:</span>
                <div class="pill-group">
                    ${visibilityPillsHtml}
                </div>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0;">

            <div class="panel-row-new">
                <div class="dropdown-sort-options" style="margin: 0; justify-content: flex-start;">
                    <label style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                        <input
                            type="checkbox"
                            id="drawer-use-historical-data"
                            ${window.stagedUseHistorical ? "checked" : ""}
                            onchange="stagedUseHistorical = this.checked"
                            style="width: 18px; height: 18px;" />
                        Include Historical Data (before May 8th 2026)
                    </label>
                </div>
            </div>
        `;
    } else if (window.currentDrawerMode === "history-filter") {
        if (typeof window.renderHistoryFilterDrawerBody === "function") {
            window.renderHistoryFilterDrawerBody(body);
        }
    } else if (window.currentDrawerMode === "roll-settings") {
        body.style.overflowY = "hidden";

        const draftModeChecked = window.stagedDraftModeEnabled ? "checked" : "";
        const draftCountOptions = [2, 3];
        const countPills = draftCountOptions
            .map((c) => {
                const isActive = window.stagedDraftCount === c;
                const activeClass = isActive ? "active" : "";
                return `
                    <button type="button" class="pill-toggle active-red ${activeClass}" onclick="setStagedDraftCount(${c})">
                        ${c} Candidates
                    </button>
                `;
            })
            .join("");

        body.innerHTML = `
            <div class="drawer-tabs-container" style="flex-shrink: 0;">
                <div class="drawer-tabs">
                    <button type="button" class="drawer-tab-btn ${window.stagedRollSettingsTab === "draft" ? "active" : ""}" onclick="switchRollSettingsTab('draft')">Draft Mode</button>
                    <button type="button" class="drawer-tab-btn ${window.stagedRollSettingsTab === "ban" ? "active" : ""}" onclick="switchRollSettingsTab('ban')">Ban List</button>
                    <div class="drawer-tab-underline" style="left: ${window.stagedRollSettingsTab === "draft" ? "0%" : "50%"};"></div>
                </div>
            </div>

            <div id="roll-settings-draft-tab" style="display: ${window.stagedRollSettingsTab === "draft" ? "block" : "none"};">
                <div class="panel-row-new">
                    <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                        <label class="toggle-switch">
                            <input type="checkbox" id="drawer-draft-mode-checkbox" onchange="toggleStagedDraftMode(this.checked)" ${draftModeChecked}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span style="font-size: 0.9em; opacity: 0.8;">Enable Turn-Based Drafting</span>
                    </div>
                </div>

                <div id="drawer-draft-count-section" class="panel-row-new" style="display: ${window.stagedDraftModeEnabled ? "block" : "none"};">
                    <span class="panel-row-title" style="font-weight: 700;">Draft Candidates Count:</span>
                    <div class="pill-group" style="margin-top: 10px;">
                        ${countPills}
                    </div>
                </div>
            </div>

            <div id="roll-settings-ban-tab" style="display: ${window.stagedRollSettingsTab === "ban" ? "flex" : "none"}; flex-direction: column; flex: 1; min-height: 0; font-size: 1rem;">
                <div class="panel-row-new" style="display: flex; flex-direction: column; flex: 1; min-height: 0; margin-top: 8px;">
                    <input type="text" id="ban-search-input" class="ban-search-input" placeholder="Search heroes to ban..." oninput="handleBanSearch(this.value)" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; margin-bottom: 15px; flex-shrink: 0;" value="${window.stagedBanSearchQuery || ""}">
                    <div id="drawer-ban-list-container" class="ban-list-container" style="flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; max-height: 350px;">
                    </div>
                </div>
            </div>
        `;

        if (typeof window.renderDrawerBanList === "function") {
            window.renderDrawerBanList();
        }
    }
}
window.renderDrawerBody = renderDrawerBody;

/**
 * Generates the game history filters inside the history drawer, calculating played/won stats.
 * @function renderHistoryFilterDrawerBody
 * @param {HTMLElement} body - The container element to append the filter controls to.
 */
export function renderHistoryFilterDrawerBody(body) {
    const useHistorical = window.stagedGamesUseHistorical;
    const playerStats = window.players.map(() => ({ played: 0, won: 0 }));
    let inviteePlayed = 0;
    let inviteeWon = 0;

    if (window.games) {
        window.games.forEach((game) => {
            if (!useHistorical && game.is_historical) return;

            game.game_players.forEach((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                if (pIdx >= 0 && pIdx < 4) {
                    playerStats[pIdx].played++;
                    if (gp.is_winner) playerStats[pIdx].won++;
                } else if (pIdx === 4 || pIdx === 5) {
                    inviteePlayed++;
                    if (gp.is_winner) inviteeWon++;
                }
            });
        });
    }

    let playersHtml = "";
    for (let i = 0; i < 4; i++) {
        const p = window.players[i];
        if (!p) continue;
        const isActive = window.stagedSelectedGamePlayerIndex === i;
        playersHtml += `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1;">
                <button type="button" class="player-filter-btn ${isActive ? "active" : ""}" 
                        style="background-color: var(--p${i + 1}); width: 100%; min-width: 60px; padding: 8px 4px; font-size: 0.8rem; font-weight: bold; border-radius: 6px;" 
                        onclick="toggleStagedPlayerGameFilter(${i})">
                    ${p.name}
                </button>
                <div style="font-size: 0.75rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                    P: ${playerStats[i].played}<br>
                    W: ${playerStats[i].won}
                </div>
            </div>
        `;
    }

    const isInviteeActive = window.stagedSelectedGamePlayerIndex === 4;
    playersHtml += `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1;">
            <button type="button" class="player-filter-btn ${isInviteeActive ? "active" : ""}" 
                    style="background-color: var(--p5); width: 100%; min-width: 60px; padding: 8px 4px; font-size: 0.8rem; font-weight: bold; border-radius: 6px;" 
                    onclick="toggleStagedPlayerGameFilter(4)">
                Invitee
            </button>
            <div style="font-size: 0.75rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                P: ${inviteePlayed}<br>
                W: ${inviteeWon}
            </div>
        </div>
    `;

    const showWinnerOnlyCheckbox = window.stagedSelectedGamePlayerIndex !== null;

    body.innerHTML = `
        <div class="panel-row-new">
            <div class="dropdown-sort-options" style="margin: 0; justify-content: flex-start;">
                <label style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                    <input
                        type="checkbox"
                        id="drawer-games-use-historical"
                        ${useHistorical ? "checked" : ""}
                        onchange="toggleStagedGamesHistorical(this.checked)"
                        style="width: 18px; height: 18px;" />
                    Include Historical Data (before May 8th 2026)
                </label>
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0;">

        <div class="panel-row-new">
            <span class="panel-row-title" style="font-weight: 700; margin-bottom: 10px; display: block;">Filter by Player:</span>
            <div style="display: flex; justify-content: space-between; gap: 8px; width: 100%;">
                ${playersHtml}
            </div>
        </div>

        <div id="drawer-winner-filter-wrapper" class="panel-row-new ${showWinnerOnlyCheckbox ? "" : "hidden"}" style="margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <input
                    type="checkbox"
                    id="drawer-games-winner-only"
                    ${window.stagedGamesWinnerOnly ? "checked" : ""}
                    onchange="window.stagedGamesWinnerOnly = this.checked"
                    style="
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                        accent-color: var(--accent);
                    " />
                <label
                    for="drawer-games-winner-only"
                    style="cursor: pointer; user-select: none; font-size: 0.9rem;"
                    >Wins Only</label
                >
            </div>
        </div>
    `;
}
window.renderHistoryFilterDrawerBody = renderHistoryFilterDrawerBody;

/**
 * Stages the player index context for game history filters in the drawer.
 * @function toggleStagedPlayerGameFilter
 * @param {number} idx - Player index context (0-3, or 4 for invitee).
 */
export function toggleStagedPlayerGameFilter(idx) {
    if (window.stagedSelectedGamePlayerIndex === idx) {
        window.stagedSelectedGamePlayerIndex = null;
    } else {
        window.stagedSelectedGamePlayerIndex = idx;
    }

    if (window.stagedSelectedGamePlayerIndex === null) {
        window.stagedGamesWinnerOnly = false;
    }

    renderDrawerBody();
}
window.toggleStagedPlayerGameFilter = toggleStagedPlayerGameFilter;

/**
 * Stages toggle specifying whether historical game entries are included in history results.
 * @function toggleStagedGamesHistorical
 * @param {boolean} checked - True if historical logs are to be listed.
 */
export function toggleStagedGamesHistorical(checked) {
    window.stagedGamesUseHistorical = checked;
    renderDrawerBody();
}
window.toggleStagedGamesHistorical = toggleStagedGamesHistorical;

/**
 * Handles drawer sort criteria selection mutations, adjusting defaults.
 * @function handleDrawerSortTypeChange
 * @param {string} value - Select value representation ("name", "group", "probability", "lastPlayed").
 */
export function handleDrawerSortTypeChange(value) {
    if (value === "name") {
        window.stagedSort = "name";
    } else if (value === "group") {
        window.stagedSort = "group";
    } else if (value === "probability") {
        window.stagedSort = `w${window.stagedSortPlayerIndex}`;
    } else if (value === "lastPlayed") {
        window.stagedSort = `d${window.stagedSortPlayerIndex}`;
    }

    window.stagedSortAsc = value === "name" || value === "group";
    updateDrawerSortDirectionUI();
    updateDrawerPlayerSortPillsUI();
}
window.handleDrawerSortTypeChange = handleDrawerSortTypeChange;

/**
 * Alternates staged sorting direction between ascending and descending.
 * @function toggleDrawerSortDirection
 */
export function toggleDrawerSortDirection() {
    window.stagedSortAsc = !window.stagedSortAsc;
    updateDrawerSortDirectionUI();
}
window.toggleDrawerSortDirection = toggleDrawerSortDirection;

/**
 * Refreshes direction buttons inside the drawer, highlighting correct arrows and descriptions.
 * @function updateDrawerSortDirectionUI
 */
export function updateDrawerSortDirectionUI() {
    const dirText = document.getElementById("drawer-sort-direction-text");
    const dirArrow = document.getElementById("drawer-sort-direction-arrow");
    if (dirText && dirArrow) {
        dirText.innerText = window.stagedSortAsc ? "Ascending" : "Descending";
        dirArrow.innerText = window.stagedSortAsc ? "▲" : "▼";
    }
}
window.updateDrawerSortDirectionUI = updateDrawerSortDirectionUI;

/**
 * Redraws active sorting player context selector pills.
 * @function updateDrawerPlayerSortPillsUI
 */
export function updateDrawerPlayerSortPillsUI() {
    const subSection = document.getElementById("drawer-player-sort-sub-section");
    const pillsContainer = document.getElementById("drawer-player-sort-pills");
    if (!subSection || !pillsContainer) return;

    const showPlayers =
        window.stagedSort.startsWith("w") || window.stagedSort.startsWith("d");
    subSection.style.display = showPlayers ? "block" : "none";

    if (showPlayers) {
        const mainPlayerNames = window.NAMES.slice(0, 4);
        pillsContainer.innerHTML = mainPlayerNames
            .map((name, i) => {
                const isActive = window.stagedSortPlayerIndex === i;
                const activeClass = isActive ? `active p${i + 1}-color` : "";
                const isColumnActive = window.activePlayerIndices.includes(i);
                const columnStyle = isColumnActive ? "" : "opacity: 0.5;";
                return `
                <button type="button" class="pill-toggle ${activeClass}" style="${columnStyle}" onclick="handleDrawerSortPlayerChange(${i})">
                    ${name}
                </button>
            `;
            })
            .join("");
    }
}
window.updateDrawerPlayerSortPillsUI = updateDrawerPlayerSortPillsUI;

/**
 * Updates staged player sort context index values.
 * @function handleDrawerSortPlayerChange
 * @param {number} playerIndex - Selected target player index.
 */
export function handleDrawerSortPlayerChange(playerIndex) {
    window.stagedSortPlayerIndex = playerIndex;
    if (window.stagedSort.startsWith("w")) {
        window.stagedSort = `w${playerIndex}`;
    } else if (window.stagedSort.startsWith("d")) {
        window.stagedSort = `d${playerIndex}`;
    }
    updateDrawerPlayerSortPillsUI();
}
window.handleDrawerSortPlayerChange = handleDrawerSortPlayerChange;

/**
 * Toggles column visibility filters on player index values.
 * @function toggleDrawerPlayerFilter
 * @param {number} playerIndex - Selected player index.
 */
export function toggleDrawerPlayerFilter(playerIndex) {
    const idx = window.stagedPlayerIndices.indexOf(playerIndex);
    if (idx > -1) {
        window.stagedPlayerIndices.splice(idx, 1);
    } else {
        window.stagedPlayerIndices.push(playerIndex);
    }
    renderDrawerBody();
}
window.toggleDrawerPlayerFilter = toggleDrawerPlayerFilter;

/**
 * Draws complexity badge items inside the drawer, highlighting candidate counts.
 * @function renderDrawerComplexityFilters
 */
export function renderDrawerComplexityFilters() {
    const container = document.getElementById("drawer-complexity-filter-bar");
    if (!container) return;

    const searchTerm =
        document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned =
        document.getElementById("db-show-not-owned")?.checked ?? false;

    let html = "";
    for (let i = 1; i <= 6; i++) {
        const potentialMatchesCount = window.characters.filter((c) => {
            if (Number(c.complexity) !== i) return false;
            const groupFilterMatch = window.stagedGroups.has(c.group_id);
            const ownershipMatch =
                (window.isHeroOwned(c) && showOwned) ||
                (!window.isHeroOwned(c) && showNotOwned);
            return (
                matchesSearchTerm(c, searchTerm) &&
                groupFilterMatch &&
                ownershipMatch
            );
        }).length;

        const isDisabled = potentialMatchesCount === 0;
        const isActive = window.stagedLevels.has(i);
        const activeClass = isActive && !isDisabled ? "active-die" : "";

        html += `
            <div class="group-badge-card group-complexity ${activeClass} ${isDisabled ? "disabled" : ""}" 
                 onclick="${isDisabled ? "" : `toggleDrawerLevel(${i})`}" 
                 title="Level ${i} (${potentialMatchesCount} heroes)">
                <img src="images/dice/d${i}.png" class="complexity-dice-img" alt="Level ${i}">
                <span class="group-badge-count">${potentialMatchesCount}</span>
            </div>`;
    }

    const totalMatchingHeroes = window.characters.filter((c) => {
        const groupFilterMatch = window.stagedGroups.has(c.group_id);
        const ownershipMatch =
            (window.isHeroOwned(c) && showOwned) || (!window.isHeroOwned(c) && showNotOwned);
        return (
            matchesSearchTerm(c, searchTerm) && groupFilterMatch && ownershipMatch
        );
    }).length;

    const isAllDisabled = totalMatchingHeroes === 0;
    const allActive = window.stagedLevels.size === 6;
    const allActiveClass = allActive && !isAllDisabled ? "active-die" : "";

    html += `
        <div class="group-badge-card group-complexity group-complexity-all ${allActiveClass} ${isAllDisabled ? "disabled" : ""}" 
             onclick="${isAllDisabled ? "" : "toggleDrawerLevel('all')"}" 
             title="All Levels (${totalMatchingHeroes} heroes)">
            <img src="images/dice/d_all.png" class="complexity-dice-img" alt="All">
            <span class="group-badge-count">${totalMatchingHeroes}</span>
        </div>`;

    container.innerHTML = html;
}
window.renderDrawerComplexityFilters = renderDrawerComplexityFilters;

/**
 * Toggles complexity levels within the staged state filters.
 * @function toggleDrawerLevel
 * @param {number|string} level - Level identifier (1-6) or "all".
 */
export function toggleDrawerLevel(level) {
    if (level === "all") {
        stateStore.set("stagedLevels", stateStore.get("stagedLevels").size === 6 ? new Set() : new Set([1, 2, 3, 4, 5, 6]));
    } else {
        stateStore.updateSet("stagedLevels", "toggle", level);
    }
    renderDrawerComplexityFilters();
    renderDrawerGroupFilters();
}
window.toggleDrawerLevel = toggleDrawerLevel;

/**
 * Resolves a unique theme string token based on expansion pack or season group metadata.
 * @function getGroupThemeClass
 * @param {string} groupName - Group/season name text.
 * @returns {string} The resolved CSS group identifier class.
 */
export function getGroupThemeClass(groupName) {
    const name = (groupName || "").toLowerCase();
    if (name.includes("season 1") || name.includes("s1")) return "group-s1";
    if (name.includes("season 2") || name.includes("s2")) return "group-s2";
    if (name.includes("marvel")) return "group-marvel";
    if (name.includes("x-men") || name.includes("xmen")) return "group-xmen";
    if (name.includes("adventures")) return "group-adventures";
    if (name.includes("solo")) return "group-solo";
    if (name.includes("outcast")) return "group-outcast";
    if (
        name.includes("santa") ||
        name.includes("krampus") ||
        name.includes("svk")
    )
        return "group-svk";
    if (name.includes("vanguard")) return "group-vanguard";
    return "group-default";
}
window.getGroupThemeClass = getGroupThemeClass;

/**
 * Resolves abbreviation short codes representing seasons/expansions.
 * @function getGroupAbbreviation
 * @param {string} name - Group name.
 * @returns {string} Short code text.
 */
export function getGroupAbbreviation(name) {
    if (!name) return "?";
    const cleanName = name.trim().toLowerCase();
    if (cleanName.includes("season 1")) return "S1";
    if (cleanName.includes("season 2")) return "S2";
    if (cleanName.includes("marvel")) return "MRVL";
    if (cleanName.includes("x-men") || cleanName.includes("xmen"))
        return "XMEN";
    if (cleanName.includes("adventure")) return "ADV";
    if (cleanName.includes("santa") && cleanName.includes("krampus"))
        return "SvK";
    if (cleanName.includes("solo")) return "SOLO";
    if (cleanName.includes("outcast")) return "OUTC";
    if (cleanName.includes("vanguard")) return "VNGD";

    const words = name.split(/\s+/);
    if (words.length > 1) {
        return words
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .substring(0, 3);
    }
    return name.substring(0, 3).toUpperCase();
}
window.getGroupAbbreviation = getGroupAbbreviation;


/**
 * Renders the group/season filters inside the drawer.
 * @function renderDrawerGroupFilters
 */
export function renderDrawerGroupFilters() {
    const container = document.getElementById("drawer-group-filter-bar");
    if (!container) return;

    const searchTerm =
        document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned =
        document.getElementById("db-show-not-owned")?.checked ?? false;

    let html = window.groups
        .map((g) => {
            const initials = getGroupAbbreviation(g.name);
            const isActive = window.stagedGroups.has(g.id);
            const themeClass = getGroupThemeClass(g.name);

            const potentialMatchesCount = window.characters.filter((c) => {
                if (c.group_id !== g.id) return false;
                const complexityMatch = window.stagedLevels.has(Number(c.complexity));
                const ownershipMatch =
                    (window.isHeroOwned(c) && showOwned) ||
                    (!window.isHeroOwned(c) && showNotOwned);
                return (
                    matchesSearchTerm(c, searchTerm) &&
                    complexityMatch &&
                    ownershipMatch
                );
            }).length;

            const isDisabled = potentialMatchesCount === 0;
            const activeClass = isActive && !isDisabled ? "active-die" : "";

            return `
                <div class="group-badge-card ${themeClass} ${activeClass} ${isDisabled ? "disabled" : ""}" 
                     onclick="${isDisabled ? "" : `toggleDrawerGroupFilter('${g.id}')`}" 
                     title="${window.escapeHtml(g.name)} (${potentialMatchesCount} heroes)">
                    <span class="group-badge-initials">${initials}</span>
                    <span class="group-badge-count">${potentialMatchesCount}</span>
                </div>`;
        })
        .join("");

    const totalMatchingHeroes = window.characters.filter((c) => {
        const complexityMatch = window.stagedLevels.has(Number(c.complexity));
        const ownershipMatch =
            (window.isHeroOwned(c) && showOwned) || (!window.isHeroOwned(c) && showNotOwned);
        return (
            matchesSearchTerm(c, searchTerm) && complexityMatch && ownershipMatch
        );
    }).length;

    const isAllDisabled = totalMatchingHeroes === 0;
    const allActive = window.stagedGroups.size === window.groups.length;
    const allActiveClass = allActive && !isAllDisabled ? "active-die" : "";

    const allHtml = `
        <div class="group-badge-card group-all ${allActiveClass} ${isAllDisabled ? "disabled" : ""}" 
             onclick="${isAllDisabled ? "" : "toggleDrawerGroupFilter('all')"}" 
             title="All Groups" style="height: 100%;">
            <span class="group-badge-initials">ALL</span>
            <span class="group-badge-count">${totalMatchingHeroes}</span>
        </div>`;

    container.innerHTML = `
        <div class="seasons-grid-left">
            ${html}
        </div>
        <div class="all-column-right">
            ${allHtml}
        </div>
    `;
}
window.renderDrawerGroupFilters = renderDrawerGroupFilters;

/**
 * Toggles a group filtering criterion inside the staged state.
 * @function toggleDrawerGroupFilter
 * @param {string} groupId - Unique ID of the group/season, or "all".
 */
export function toggleDrawerGroupFilter(groupId) {
    if (groupId === "all") {
        if (stateStore.get("stagedGroups").size === window.groups.length) {
            stateStore.updateSet("stagedGroups", "clear");
        } else {
            window.groups.forEach((g) => stateStore.updateSet("stagedGroups", "add", g.id));
        }
    } else {
        stateStore.updateSet("stagedGroups", "toggle", groupId);
    }
    renderDrawerComplexityFilters();
    renderDrawerGroupFilters();
}
window.toggleDrawerGroupFilter = toggleDrawerGroupFilter;

/**
 * Resets the active settings/filters inside the active drawer panel.
 * @function resetFilters
 */
export function resetFilters() {
    if (window.currentDrawerMode === "sort-filter") {
        window.stagedSort = "name";
        window.stagedSortAsc = true;
        window.stagedSortPlayerIndex = 0;
        window.stagedLevels = new Set([1, 2, 3, 4, 5, 6]);
        window.stagedGroups = new Set(window.groups.map((g) => g.id));
        renderDrawerBody();
    } else if (window.currentDrawerMode === "columns") {
        window.stagedPlayerIndices = [0, 1, 2, 3];
        window.stagedUseHistorical = true;
        renderDrawerBody();
    } else if (window.currentDrawerMode === "history-filter") {
        window.stagedSelectedGamePlayerIndex = null;
        window.stagedGamesWinnerOnly = false;
        window.stagedGamesUseHistorical = true;
        renderDrawerBody();
    } else if (window.currentDrawerMode === "roll-settings") {
        window.stagedDraftModeEnabled = false;
        window.stagedDraftCount = 3;
        window.stagedBannedHeroIds = new Set();
        window.stagedBanSearchQuery = "";
        renderDrawerBody();
    }
}
window.resetFilters = resetFilters;

/**
 * Applies all filters staged in the drawer and closes the drawer.
 * @function applyAndCloseDrawer
 */
export function applyAndCloseDrawer() {
    if (window.currentDrawerMode === "sort-filter") {
        window.currentSort = window.stagedSort;
        window.sortAsc = window.stagedSortAsc;
        window.currentSortPlayerIndex = window.stagedSortPlayerIndex;
        window.activeLevels = new Set(window.stagedLevels);
        window.activeGroups = new Set(window.stagedGroups);
        updateActiveFilterBadge();
        closeDrawer(null, true);
        renderList();
    } else if (window.currentDrawerMode === "columns") {
        window.activePlayerIndices = [...window.stagedPlayerIndices];
        window.dbUseHistorical = window.stagedUseHistorical;
        updateActiveFilterBadge();
        closeDrawer(null, true);
        renderList();
    } else if (window.currentDrawerMode === "history-filter") {
        window.selectedGamePlayerIndex = window.stagedSelectedGamePlayerIndex;
        window.gamesWinnerOnly = window.stagedGamesWinnerOnly;
        window.gamesUseHistorical = window.stagedGamesUseHistorical;
        updateGamesActiveFilterBadge();
        closeDrawer(null, true);
        if (typeof window.renderGamesList === "function") window.renderGamesList();
    } else if (window.currentDrawerMode === "roll-settings") {
        window.draftModeEnabled = window.stagedDraftModeEnabled;
        window.draftCount = window.stagedDraftCount;
        window.bannedHeroIds = new Set(window.stagedBannedHeroIds);

        localStorage.setItem("draftModeEnabled", window.draftModeEnabled);
        localStorage.setItem("draftCount", window.draftCount);
        localStorage.setItem(
            "bannedHeroIds",
            JSON.stringify(Array.from(window.bannedHeroIds)),
        );

        if (typeof window.updateRollSettingsBadge === "function") {
            window.updateRollSettingsBadge();
        }
        closeDrawer(null, true);
    }
}
window.applyAndCloseDrawer = applyAndCloseDrawer;

/**
 * Updates the quantity badge displaying active filters counts.
 * @function updateActiveFilterBadge
 */
export function updateActiveFilterBadge() {
    const badge = document.getElementById("filter-active-badge");
    if (!badge) return;

    let activeCount = 0;
    activeCount += window.activeFilterDataHistories.size;
    activeCount += window.activeFilterPlayers.size;
    activeCount += window.activeFilterComplexities.size;
    activeCount += window.activeFilterGroups.size;

    if (activeCount > 0) {
        badge.innerText = activeCount;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}
window.updateActiveFilterBadge = updateActiveFilterBadge;

/**
 * Updates the active filter badge on the games history tab.
 * @function updateGamesActiveFilterBadge
 */
export function updateGamesActiveFilterBadge() {
    const badge = document.getElementById("games-filter-active-badge");
    if (!badge) return;

    let activeCount = 0;
    if (window.selectedGamePlayerIndex !== null) activeCount++;
    if (window.gamesWinnerOnly) activeCount++;
    if (!window.gamesUseHistorical) activeCount++;

    if (activeCount > 0) {
        badge.innerText = activeCount;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}
window.updateGamesActiveFilterBadge = updateGamesActiveFilterBadge;

/**
 * Repositions sliding highlighting backdrops behind segmented control items.
 * @function updateSegmentedHighlights
 */
export function updateSegmentedHighlights() {
    document
        .querySelectorAll(".ownership-segmented-control, .segmented-control")
        .forEach((control) => {
            const activePill = control.querySelector(".segmented-pill.active");
            let highlight = control.querySelector(".segmented-highlight");
            if (!highlight) {
                highlight = document.createElement("div");
                highlight.className = "segmented-highlight";
                control.insertBefore(highlight, control.firstChild);
            }
            if (activePill) {
                highlight.style.width = `${activePill.offsetWidth}px`;
                highlight.style.transform = `translateX(${activePill.offsetLeft}px)`;
                highlight.style.height = `${activePill.offsetHeight}px`;
            }
        });
}
window.updateSegmentedHighlights = updateSegmentedHighlights;

/**
 * Sets sorting parameters and triggers a reload of the character lists.
 * @function setSort
 * @param {string} key - Sort attribute selector.
 */
export function setSort(key) {
    if (window.currentSort === key) {
        window.sortAsc = !window.sortAsc;
    } else {
        window.currentSort = key;
        window.sortAsc = !key.startsWith("d") && !key.startsWith("w");
    }

    if (key.startsWith("w") || key.startsWith("d")) {
        window.currentSortPlayerIndex = parseInt(key.substring(1));
    }

    updateActiveFilterBadge();
    updateSortButtonText();
    renderList();
}
window.setSort = setSort;

/**
 * Retrieves list of player indices representing player columns currently enabled in UI view.
 * @function getVisiblePlayerIndices
 * @returns {number[]} Array of player indices.
 */
export function getVisiblePlayerIndices() {
    if (window.activeFilterPlayers && window.activeFilterPlayers.size > 0) {
        return Array.from(window.activeFilterPlayers)
            .map(pId => parseInt(pId.substring(1)) - 1)
            .filter(idx => idx >= 0 && idx < window.NAMES.length);
    }
    return window.activePlayerIndices || [0, 1, 2, 3];
}
window.getVisiblePlayerIndices = getVisiblePlayerIndices;

/**
 * Refreshes button label representing active sorting state.
 * @function updateSortButtonText
 */
export function updateSortButtonText() {
    const btn = document.getElementById("btn-trigger-sort");
    if (!btn) return;

    let text = "Hero (A-Z)";

    if (window.currentSort === "name") {
        text = window.sortAsc ? "Hero (A-Z)" : "Hero (Z-A)";
    } else if (window.currentSort === "complexity") {
        text = window.sortAsc ? "Complexity (1-6)" : "Complexity (6-1)";
    } else if (window.currentSort.startsWith("w")) {
        const idx = parseInt(window.currentSort.substring(1));
        const playerName = window.NAMES[idx] || `Player ${idx + 1}`;
        text = window.sortAsc ? `${playerName} % (Low to High)` : `${playerName} % (High to Low)`;
    } else if (window.currentSort.startsWith("d")) {
        const idx = parseInt(window.currentSort.substring(1));
        const playerName = window.NAMES[idx] || `Player ${idx + 1}`;
        text = window.sortAsc ? `${playerName} Played (Oldest)` : `${playerName} Played (Newest)`;
    } else if (window.currentSort === "group") {
        text = window.sortAsc ? "Group (A-Z)" : "Group (Z-A)";
    }

    btn.innerHTML = `<span class="action-icon">⇅</span> <strong style="font-weight: 700;">SORT:</strong> <span style="font-weight: 400; text-transform: none; margin-left: 2px;">${text}</span>`;
}
window.updateSortButtonText = updateSortButtonText;

/**
 * Builds HTML buttons populate the sort dropdown selection overlay.
 * @function renderSortDropdownOptions
 */
export function renderSortDropdownOptions() {
    const menu = document.getElementById("sort-dropdown-menu");
    if (!menu) return;

    const visibleIdxs = getVisiblePlayerIndices();

    let html = `
        <div class="sort-dropdown-section-title">General</div>
        <button type="button" class="sort-dropdown-item ${window.currentSort === 'name' && window.sortAsc ? 'active' : ''}" onclick="selectSortOption('name', true)">
            Hero Name (A-Z)
        </button>
        <button type="button" class="sort-dropdown-item ${window.currentSort === 'name' && !window.sortAsc ? 'active' : ''}" onclick="selectSortOption('name', false)">
            Hero Name (Z-A)
        </button>
        <button type="button" class="sort-dropdown-item ${window.currentSort === 'complexity' && window.sortAsc ? 'active' : ''}" onclick="selectSortOption('complexity', true)">
            Complexity (1-6)
        </button>
        <button type="button" class="sort-dropdown-item ${window.currentSort === 'complexity' && !window.sortAsc ? 'active' : ''}" onclick="selectSortOption('complexity', false)">
            Complexity (6-1)
        </button>
    `;

    if (visibleIdxs.length > 0) {
        html += `<div class="sort-dropdown-divider"></div>`;
        visibleIdxs.forEach(idx => {
            const playerName = window.NAMES[idx] || `Player ${idx + 1}`;
            html += `
                <div class="sort-dropdown-section-title" style="color: var(--p${idx + 1}, #fff);">${playerName}</div>
                <button type="button" class="sort-dropdown-item ${window.currentSort === 'w' + idx && !window.sortAsc ? 'active' : ''}" onclick="selectSortOption('w${idx}', false)">
                    Probability (High to Low)
                </button>
                <button type="button" class="sort-dropdown-item ${window.currentSort === 'w' + idx && window.sortAsc ? 'active' : ''}" onclick="selectSortOption('w${idx}', true)">
                    Probability (Low to High)
                </button>
                <button type="button" class="sort-dropdown-item ${window.currentSort === 'd' + idx && !window.sortAsc ? 'active' : ''}" onclick="selectSortOption('d${idx}', false)">
                    Last Played (Newest)
                </button>
                <button type="button" class="sort-dropdown-item ${window.currentSort === 'd' + idx && window.sortAsc ? 'active' : ''}" onclick="selectSortOption('d${idx}', true)">
                    Last Played (Oldest)
                </button>
            `;
        });
    }

    menu.innerHTML = html;
}
window.renderSortDropdownOptions = renderSortDropdownOptions;

/**
 * Toggles visibility of the sort option selection dropdown list.
 * @function toggleSortDropdown
 * @param {Event} event - The triggered event.
 */
export function toggleSortDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById("sort-dropdown-menu");
    if (!dropdown) return;

    const isShown = dropdown.classList.contains("show");
    if (isShown) {
        closeSortDropdown();
    } else {
        renderSortDropdownOptions();
        dropdown.classList.add("show");
        document.getElementById("btn-trigger-sort")?.classList.add("active");
    }
}
window.toggleSortDropdown = toggleSortDropdown;

/**
 * Closes sort option selection dropdown list overlay.
 * @function closeSortDropdown
 */
export function closeSortDropdown() {
    const dropdown = document.getElementById("sort-dropdown-menu");
    if (dropdown) {
        dropdown.classList.remove("show");
    }
    document.getElementById("btn-trigger-sort")?.classList.remove("active");
}
window.closeSortDropdown = closeSortDropdown;

/**
 * Applies a selected sort option, closing the dropdown and redrawing lists.
 * @function selectSortOption
 * @param {string} key - Sort attribute identifier.
 * @param {boolean} asc - Sort direction.
 */
export function selectSortOption(key, asc) {
    window.currentSort = key;
    window.sortAsc = asc;
    if (key.startsWith("w") || key.startsWith("d")) {
        window.currentSortPlayerIndex = parseInt(key.substring(1));
    }
    updateActiveFilterBadge();
    updateSortButtonText();
    renderList();
    closeSortDropdown();
}
window.selectSortOption = selectSortOption;

/**
 * Handles text mutations inside the search input box, displaying or hiding the clear button.
 * @function handleSearchInput
 */
export function handleSearchInput() {
    const searchInput = document.getElementById("hero-search");
    const clearBtn = document.getElementById("clear-search");

    if (searchInput && clearBtn) {
        clearBtn.classList.toggle("hidden", searchInput.value.trim().length === 0);
    }
}
window.handleSearchInput = handleSearchInput;

/**
 * Clears search fields, focusing input back and retriggering queries.
 * @function clearSearch
 */
export function clearSearch() {
    const searchInput = document.getElementById("hero-search");
    if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }

    handleSearchInput();
    triggerSearch();
}
window.clearSearch = clearSearch;

/**
 * Intercepts keyboard input to fire search queries upon pressing Enter.
 * @function handleSearchKeyDown
 * @param {KeyboardEvent} event - The keyboard event.
 */
export function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
        triggerSearch();
    }
}
window.handleSearchKeyDown = handleSearchKeyDown;

/**
 * Refreshes layouts and filter display badges when a query is executed.
 * @function triggerSearch
 */
export function triggerSearch() {
    renderList();
    updateActiveFilterChips();
}
window.triggerSearch = triggerSearch;

/**
 * Re-renders dynamic filter chip buttons based on active search terms, player selections, complexities, and group limits.
 * @function updateActiveFilterChips
 */
export function updateActiveFilterChips() {
    const container = document.getElementById("active-filters-container");
    if (!container) return;

    const searchInput = document.getElementById("hero-search");
    const searchTerm = searchInput ? searchInput.value.trim() : "";

    let html = "";
    if (searchTerm) {
        html += `
            <div class="filter-chip" title="Active Search Filter">
                <span class="filter-chip-remove" onclick="clearSearchFilter()" title="Remove search filter">✖</span>
                <span class="filter-chip-label">Search: "${searchTerm}"</span>
            </div>
        `;
    }

    const sortedDataHistories = Array.from(window.activeFilterDataHistories).sort((a, b) => {
        const order = ["Normal only", "Historical only"];
        return order.indexOf(a) - order.indexOf(b);
    });
    sortedDataHistories.forEach(dh => {
        html += `
            <div class="filter-chip" title="Active Data History Filter">
                <span class="filter-chip-remove" onclick="removeFilterChip('data-history', '${dh}')" title="Remove filter">✖</span>
                <span class="filter-chip-label">Data: ${dh}</span>
            </div>
        `;
    });

    const sortedPlayerIds = Array.from(window.activeFilterPlayers).sort((a, b) => {
        const pA = window.players.find(p => p.id === a);
        const pB = window.players.find(p => p.id === b);
        const nameA = pA ? pA.name : "";
        const nameB = pB ? pB.name : "";
        return nameA.localeCompare(nameB);
    });
    sortedPlayerIds.forEach(pId => {
        const pObj = window.players.find(p => p.id === pId);
        const name = pObj ? pObj.name : pId;
        html += `
            <div class="filter-chip" title="Active Player Filter">
                <span class="filter-chip-remove" onclick="removeFilterChip('player', '${pId}')" title="Remove filter">✖</span>
                <span class="filter-chip-label">${name}</span>
            </div>
        `;
    });

    const sortedComplexities = Array.from(window.activeFilterComplexities).sort((a, b) => a - b);
    sortedComplexities.forEach(cVal => {
        html += `
            <div class="filter-chip" title="Active Complexity Filter">
                <span class="filter-chip-remove" onclick="removeFilterChip('complexity', ${cVal})" title="Remove filter">✖</span>
                <span class="filter-chip-label">Complexity: ${cVal}</span>
            </div>
        `;
    });

    const sortedGroupIds = Array.from(window.activeFilterGroups).sort((a, b) => {
        const gA = window.groups.find(g => g.id === a);
        const gB = window.groups.find(g => g.id === b);
        const orderA = gA ? (gA.order_index ?? 0) : 0;
        const orderB = gB ? (gB.order_index ?? 0) : 0;
        return orderA - orderB;
    });
    sortedGroupIds.forEach(gId => {
        const gObj = window.groups.find(g => g.id === gId);
        const name = gObj ? gObj.name : gId;
        html += `
            <div class="filter-chip" title="Active Group Filter">
                <span class="filter-chip-remove" onclick="removeFilterChip('group', '${gId}')" title="Remove filter">✖</span>
                <span class="filter-chip-label">${name}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}
window.updateActiveFilterChips = updateActiveFilterChips;

/**
 * Removes a filter criteria chip, updating search parameters and refreshing layouts.
 * @function removeFilterChip
 * @param {string} type - Category key ("data-history", "player", "complexity", "group").
 * @param {string|number} val - Selected value of target filter criteria to drop.
 */
export function removeFilterChip(type, val) {
    if (type === 'data-history') {
        stateStore.updateSet("activeFilterDataHistories", "delete", val);
        stateStore.set("dbUseHistorical", !stateStore.get("activeFilterDataHistories").has("Normal only") || stateStore.get("activeFilterDataHistories").has("Historical only"));
    } else if (type === 'player') {
        stateStore.updateSet("activeFilterPlayers", "delete", val);
    } else if (type === 'complexity') {
        stateStore.updateSet("activeFilterComplexities", "delete", Number(val));
    } else if (type === 'group') {
        stateStore.updateSet("activeFilterGroups", "delete", val);
    }

    renderList();
    updateActiveFilterBadge();
    updateActiveFilterChips();
}
window.removeFilterChip = removeFilterChip;

/**
 * Resets search string inputs.
 * @function clearSearchFilter
 */
export function clearSearchFilter() {
    clearSearch();
}
window.clearSearchFilter = clearSearchFilter;

/**
 * Evaluates whether a hero's details (name, group abbreviation, or player associations) match a given search query term.
 * @function matchesSearchTerm
 * @param {Object} c - The character/hero object.
 * @param {string} searchTerm - Query string term.
 * @returns {boolean} True if matched, false otherwise.
 */
export function matchesSearchTerm(c, searchTerm) {
    if (!searchTerm) return true;
    const term = searchTerm.trim().toLowerCase();

    const nameMatch = c.name && c.name.toLowerCase().includes(term);

    const groupAbbreviation = getGroupAbbreviation(c.group || "");
    const groupMatch = (c.group || "").toLowerCase().includes(term) ||
                       groupAbbreviation.toLowerCase().includes(term);

    const isPlayerName = window.NAMES.some(playerName => playerName && playerName.toLowerCase().includes(term));

    return nameMatch || groupMatch || isPlayerName;
}
window.matchesSearchTerm = matchesSearchTerm;

/**
 * Monitors inputs in game log searches, updating logs table lists.
 * @function handleGamesSearchInput
 */
export function handleGamesSearchInput() {
    const searchInput = document.getElementById("games-search");
    const clearBtn = document.getElementById("clear-games-search");

    if (!searchInput || !clearBtn) return;

    clearBtn.classList.toggle("hidden", searchInput.value.trim().length === 0);
    if (typeof window.renderGamesList === "function") {
        window.renderGamesList();
    }
}
window.handleGamesSearchInput = handleGamesSearchInput;

/**
 * Clears search strings on game log views.
 * @function clearGamesSearch
 */
export function clearGamesSearch() {
    const searchInput = document.getElementById("games-search");
    if (!searchInput) return;
    searchInput.value = "";
    searchInput.focus();
    handleGamesSearchInput();
}
window.clearGamesSearch = clearGamesSearch;

/**
 * Toggles column visibility filters on player index values, sorting tables.
 * @function togglePlayerFilter
 * @param {number} index - Selected player index.
 */
export function togglePlayerFilter(index) {
    const position = window.activePlayerIndices.indexOf(index);

    if (position === -1) {
        window.activePlayerIndices.push(index);
        window.activePlayerIndices.sort((a, b) => a - b);
    } else {
        window.activePlayerIndices.splice(position, 1);
        if (window.currentSort === `w${index}` || window.currentSort === `d${index}`) {
            window.currentSort = "name";
            window.sortAsc = true;
        }
    }

    updateActiveFilterBadge();
    const activeKey = window.currentSort;
    window.currentSort = null;
    setSort(activeKey);
}
window.togglePlayerFilter = togglePlayerFilter;

/**
 * Computes sorting and renders the main grid hero list.
 * @function renderList
 */
export function renderList() {
    const container = document.getElementById("heroContainer");
    if (!container) return;

    if (typeof window.updateHeroStatsFromHistory === "function") {
        window.updateHeroStatsFromHistory();
    }

    const searchTerm =
        document.getElementById("hero-search")?.value.toLowerCase() || "";
    const countLabel = document.getElementById("count-stats");
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned =
        document.getElementById("db-show-not-owned")?.checked ?? false;

    const matchingPlayerIdxs = [];
    if (searchTerm) {
        window.NAMES.forEach((playerName, playerIdx) => {
            if (playerName && playerName.toLowerCase().includes(searchTerm)) {
                matchingPlayerIdxs.push(playerIdx);
            }
        });
    }

    const totals = [0, 0, 0, 0];
    window.characters.filter(window.isHeroOwned).forEach((c) => {
        for (let i = 0; i < 4; i++) {
            totals[i] += window.getSoftWeight(c, i);
        }
    });

    const processedList = window.characters
        .map((char, index) => ({ ...char, originalIndex: index }))
        .filter((c) => {
            let complexityMatch = true;
            if (window.activeFilterComplexities.size > 0) {
                complexityMatch = window.activeFilterComplexities.has(Number(c.complexity));
            }

            let groupFilterMatch = true;
            if (window.activeFilterGroups.size > 0) {
                groupFilterMatch = window.activeFilterGroups.has(c.group_id);
            }

            let dataHistoryMatch = true;
            const hasNormalOnlyActive = window.activeFilterDataHistories.has("Normal only");
            const hasHistoricalOnlyActive = window.activeFilterDataHistories.has("Historical only");
            if (hasNormalOnlyActive && !hasHistoricalOnlyActive) {
                const heroGames = window.games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
                dataHistoryMatch = heroGames.some(g => !g.is_historical);
            } else if (hasHistoricalOnlyActive && !hasNormalOnlyActive) {
                const heroGames = window.games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
                dataHistoryMatch = heroGames.some(g => g.is_historical);
            }

            let playersMatch = true;
            if (window.activeFilterPlayers.size > 0) {
                const heroGames = window.games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
                const playedBySelected = heroGames.some(g => 
                    g.game_players.some(gp => gp.hero_id === c.id && window.activeFilterPlayers.has(gp.player_id))
                );
                playersMatch = playedBySelected;
            }

            const ownershipMatch =
                (window.isHeroOwned(c) && showOwned) ||
                (!window.isHeroOwned(c) && showNotOwned);

            return (
                matchesSearchTerm(c, searchTerm) &&
                complexityMatch &&
                groupFilterMatch &&
                dataHistoryMatch &&
                playersMatch &&
                ownershipMatch
            );
        });

    if (countLabel) {
        countLabel.innerText = `Showing ${processedList.length} of ${window.characters.length} heroes`;
    }

    processedList.sort((a, b) => {
        let valA, valB;

        if (window.currentSort.startsWith("w")) {
            const idx = parseInt(window.currentSort[1]);
            valA = window.getSoftWeight(a, idx);
            valB = window.getSoftWeight(b, idx);
        } else if (window.currentSort.startsWith("d")) {
            const idx = parseInt(window.currentSort[1]);
            valA = (a.lastPlayed && a.lastPlayed[idx]) || "";
            valB = (b.lastPlayed && b.lastPlayed[idx]) || "";
            if (valA === "Never" || valA === "Unknown") valA = "";
            if (valB === "Never" || valB === "Unknown") valB = "";
        } else if (window.currentSort === "group") {
            valA = (a.group || "").toLowerCase();
            valB = (b.group || "").toLowerCase();
            if (valA === valB) {
                const nameA = (a.name || "").toLowerCase();
                const nameB = (b.name || "").toLowerCase();
                return window.sortAsc
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            }
        } else if (window.currentSort === "complexity") {
            valA = Number(a.complexity) || 0;
            valB = Number(b.complexity) || 0;
            if (valA === valB) {
                const nameA = (a.name || "").toLowerCase();
                const nameB = (b.name || "").toLowerCase();
                return nameA.localeCompare(nameB);
            }
        } else {
            valA = (a[window.currentSort] || "").toLowerCase();
            valB = (b[window.currentSort] || "").toLowerCase();
        }

        if (valA === valB) return 0;
        const comparison = valA < valB ? -1 : 1;
        return window.sortAsc ? comparison : -comparison;
    });

    container.innerHTML = processedList
        .map((c) => {
            let playersToRender = window.activePlayerIndices;
            if (window.activeFilterPlayers.size > 0) {
                playersToRender = Array.from(window.activeFilterPlayers)
                    .map(pId => parseInt(pId.substring(1)) - 1)
                    .filter(idx => idx >= 0 && idx < 4);
            } else if (matchingPlayerIdxs.length > 0) {
                playersToRender = window.activePlayerIndices.filter(p => matchingPlayerIdxs.includes(p));
            }

            const playerStatsList = playersToRender.map((p) => {
                const weight = (c.weights && c.weights[p]) || 0;
                const softWeight = window.getSoftWeight(c, p);
                const owned = window.isHeroOwned(c);
                const percentage =
                    owned && totals[p] > 0
                        ? ((softWeight / totals[p]) * 100).toFixed(2)
                        : "0.00";
                const playCount = (c.playCount && c.playCount[p]) || 0;
                const lastPlayed = (c.lastPlayed && c.lastPlayed[p]) || "Never";
                const winCount = (c.winCount && c.winCount[p]) || 0;
                const winRate =
                    playCount > 0
                        ? ((winCount / playCount) * 100).toFixed(1)
                        : "0.0";
                return {
                    p,
                    percentage: parseFloat(percentage),
                    percentageStr: percentage,
                    playCount,
                    lastPlayed,
                    winCount,
                    winRate,
                };
            });

            playerStatsList.sort((x, y) => {
                const nameX = (window.NAMES[x.p] || "").toLowerCase();
                const nameY = (window.NAMES[y.p] || "").toLowerCase();
                return nameX.localeCompare(nameY);
            });

            const collapsedPlayersHtml = playerStatsList
                .map((item) => {
                    const recencyDot = getRecencyDot(item.lastPlayed);
                    return `
                <div class="collapsed-player-row-simple">
                    <span class="collapsed-player-name" style="color: var(--p${item.p + 1});">${window.NAMES[item.p]}</span>
                    <span class="collapsed-player-prob">${item.percentageStr}%</span>
                    <span class="collapsed-player-plays">🎲 ${item.playCount}</span>
                    <span class="collapsed-player-wins">🏆 ${item.winCount} <span class="collapsed-player-rate">(${item.winRate}%)</span></span>
                    <span class="collapsed-player-recency" title="Last played: ${item.lastPlayed}">${recencyDot}</span>
                </div>`;
                })
                .join("");

            const expandedPlayersHtml = playerStatsList
                .map((item) => {
                    const relativeText = getDaysAgoClean(item.lastPlayed);
                    const dot = getRecencyDot(item.lastPlayed);
                    const relativeLine = relativeText
                        ? `<span class="expanded-player-relative">${relativeText} ${dot}</span>`
                        : "";
                    return `
                <div class="expanded-player-row">
                    <div class="expanded-player-main">
                        <span class="expanded-player-name" style="color: var(--p${item.p + 1});">${window.NAMES[item.p]}</span>
                        <span class="expanded-player-prob">${item.percentageStr}%</span>
                        <span class="expanded-player-plays">🎲 ${item.playCount}</span>
                        <span class="expanded-player-wins">🏆 ${item.winCount} <span class="collapsed-player-rate">(${item.winRate}%)</span></span>
                    </div>
                    <div class="expanded-player-date">
                        <span>📅 Last played: ${item.lastPlayed}</span>
                        ${relativeLine}
                    </div>
                </div>`;
                })
                .join("");

            const complexityVal = Number(c.complexity) || 1;
            const complexityDiceHtml = [1, 2, 3, 4, 5, 6]
                .map((i) => {
                    const activeClass = i === complexityVal ? "active" : "";
                    return `<img src="images/dice/d${i}.png" class="complexity-bar-dice ${activeClass}" alt="Level ${i}">`;
                })
                .join("");

            return `
            <div class="hero-item collapsed">
                <img src="${window.getImgUrl(c.slug)}" class="char-bg-img" alt="${c.name}">
                
                <div class="hero-header" onclick="toggleHeroPanel(this)">
                    <div class="header-title-collapsed">
                        <a href="${window.getHeroLink(c.slug)}" target="_blank" class="hero-name-link" onclick="event.stopPropagation()">
                            <span class="hero-name">${c.name}</span>
                        </a>
                    </div>
                    
                    <div class="header-title-expanded">
                        <a href="${window.getHeroLink(c.slug)}" target="_blank" class="hero-name-link" onclick="event.stopPropagation()">
                            <div class="expanded-name">${c.name}</div>
                        </a>
                        <div class="expanded-group">${c.group || "Season ?"}</div>
                    </div>
                    
                    <div class="complexity-dice-bar" onclick="event.stopPropagation()">
                        ${complexityDiceHtml}
                    </div>
                    
                    <button type="button" class="panel-toggle" aria-expanded="false">
                        <svg class="panel-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                
                <div class="hero-collapsed-info">
                    ${collapsedPlayersHtml}
                </div>
                
                <div class="hero-body">
                    <div class="expanded-players-list">
                        ${expandedPlayersHtml}
                    </div>
                </div>
            </div>`;
        })
        .join("");
}
window.renderList = renderList;

/**
 * Parses dynamic date string inputs, normalizing timezone tokens.
 * @function parseDateString
 * @param {string} dateString - Input date string.
 * @returns {Date|null} Evaluated JavaScript Date object or null.
 */
export function parseDateString(dateString) {
    if (!dateString) return null;
    try {
        let cleanDate = dateString.trim();
        if (cleanDate && !cleanDate.includes("T"))
            cleanDate = cleanDate.replace(" ", "T");
        if (
            cleanDate &&
            cleanDate.includes(":") &&
            !cleanDate.includes("Z") &&
            !cleanDate.includes("+")
        )
            cleanDate += "Z";
        const dateObj = new Date(cleanDate);
        return isNaN(dateObj.getTime()) ? null : dateObj;
    } catch (e) {
        return null;
    }
}
window.parseDateString = parseDateString;

/**
 * Calculates human readable relative elapsed duration string from active dates.
 * @function getDaysAgoClean
 * @param {string} dateString - Input date string.
 * @returns {string} Relative timestamp phrase (e.g., "today", "yesterday", "5 days ago").
 */
export function getDaysAgoClean(dateString) {
    if (!dateString || dateString === "Never") return "";
    if (dateString === "Unknown") return "Date unknown (historical)";
    const lastDate = parseDateString(dateString);
    if (!lastDate) return "";
    try {
        const today = new Date();
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "";
        if (diffDays === 0) return "today";
        if (diffDays === 1) return "yesterday";
        return `${diffDays} days ago`;
    } catch (e) {
        return "";
    }
}
window.getDaysAgoClean = getDaysAgoClean;

/**
 * Computes color indicators based on elapsed days since last played.
 * @function getRecencyDot
 * @param {string} lastPlayed - Date string token.
 * @returns {string} Colored circle emoji indicator.
 */
export function getRecencyDot(lastPlayed) {
    let recencyDot = "⚫";
    if (lastPlayed && lastPlayed === "Unknown") {
        recencyDot = "🔴";
    } else if (
        lastPlayed &&
        lastPlayed !== "Never" &&
        lastPlayed !== "Unknown"
    ) {
        const lastDate = parseDateString(lastPlayed);
        if (lastDate) {
            try {
                const today = new Date();
                lastDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                const diffTime = today - lastDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 15) {
                    recencyDot = "🟢";
                } else if (diffDays <= 60) {
                    recencyDot = "🟡";
                } else {
                    recencyDot = "🔴";
                }
            } catch (e) {
                recencyDot = "⚪";
            }
        } else {
            recencyDot = "⚪";
        }
    }
    return recencyDot;
}
window.getRecencyDot = getRecencyDot;
