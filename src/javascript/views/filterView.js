/**
 * @fileoverview Presentation view module for sidebar drawers, sort dropdowns, active filter chips, and database list rendering.
 * @module filterView
 */

import * as stateStore from '../stateStore.js';
import { 
    getImgUrl, 
    getHeroLink, 
    isHeroOwned, 
    getSoftWeight, 
    escapeHtml,
    isAdmin,
    isUser,
    parseDateString,
    MAX_WEIGHTED_PLAYERS,
    getDaysAgoClean,
    getRecencyDot
} from '../utils.js';
import { getFilterDrawerMatchingCount } from '../filters.js';
import { updateHeroStatsFromHistory } from '../admin.js';
import { renderDrawerBanList } from './rollView.js';

let elementsCache = null;
const getElements = () => {
    if (!elementsCache) {
        elementsCache = {
            sortSection: document.getElementById("sort-section"),
            sortToggleBtn: document.getElementById("sort-panel-toggle"),
            filterSection: document.getElementById("filter-section"),
            filterToggleBtn: document.getElementById("filter-panel-toggle"),
            sortFilterDrawer: document.getElementById("sort-filter-drawer"),
            drawerTitle: document.getElementById("drawer-title-text"),
            drawerFooter: document.getElementById("drawer-footer-content"),
            drawerBody: document.getElementById("drawer-body-content"),
            leftFilterDrawer: document.getElementById("filter-drawer-left"),
            leftPlayersContainer: document.getElementById("filter-options-players"),
            leftGroupsContainer: document.getElementById("filter-options-groups"),
            leftHeroCountLabel: document.getElementById("filter-drawer-hero-count"),
            leftTitleDataHistory: document.getElementById("title-data-history"),
            leftTitlePlayers: document.getElementById("title-players"),
            leftTitleComplexity: document.getElementById("title-complexity"),
            leftTitleGroups: document.getElementById("title-groups"),
            filterActiveBadge: document.getElementById("filter-active-badge"),
            gamesFilterActiveBadge: document.getElementById("games-filter-active-badge"),
            sortTriggerBtn: document.getElementById("btn-trigger-sort"),
            sortDropdownMenu: document.getElementById("sort-dropdown-menu"),
            activeFiltersContainer: document.getElementById("active-filters-container"),
            heroContainer: document.getElementById("heroContainer"),
            countStatsLabel: document.getElementById("count-stats"),
            heroSearchInput: document.getElementById("hero-search"),
            dbShowOwnedCheckbox: document.getElementById("db-show-owned"),
            dbShowNotOwnedCheckbox: document.getElementById("db-show-not-owned")
        };
    }
    return elementsCache;
};

/**
 * Toggles the visibility state of the sorting options section in the UI.
 */
export function toggleSortSection() {
    const el = getElements();
    if (!el.sortSection) return;
    const isHidden = el.sortSection.classList.toggle("hidden");
    if (el.sortToggleBtn) {
        el.sortToggleBtn.classList.toggle("open", !isHidden);
        el.sortToggleBtn.setAttribute("aria-expanded", String(!isHidden));
    }
}

/**
 * Toggles the visibility state of the filtering options section in the UI.
 */
export function toggleFilterSection() {
    const el = getElements();
    if (!el.filterSection) return;
    const isHidden = el.filterSection.classList.toggle("hidden");
    if (el.filterToggleBtn) {
        el.filterToggleBtn.classList.toggle("open", !isHidden);
        el.filterToggleBtn.setAttribute("aria-expanded", String(!isHidden));
    }
}

/**
 * Opens the Sort & Filter drawer overlay.
 */
export function openSortFilterDrawer() {
    const el = getElements();
    if (!el.sortFilterDrawer) return;

    if (el.drawerTitle) el.drawerTitle.innerText = "Sort & Filter";
    if (el.drawerFooter) el.drawerFooter.style.display = "flex";

    renderDrawerBody();
    el.sortFilterDrawer.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scroll
}

/**
 * Opens the Columns & Historical Data configuration drawer.
 */
export function openColumnsDrawer() {
    const el = getElements();
    if (!el.sortFilterDrawer) return;

    if (el.drawerTitle) el.drawerTitle.innerText = "Columns & Historical Data";
    if (el.drawerFooter) el.drawerFooter.style.display = "flex";

    renderDrawerBody();
    el.sortFilterDrawer.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scroll
}

/**
 * Opens the Game History filter settings drawer.
 */
export function openHistoryFilterDrawer() {
    const el = getElements();
    if (!el.sortFilterDrawer) return;

    if (el.drawerTitle) el.drawerTitle.innerText = "Filter History";
    if (el.drawerFooter) el.drawerFooter.style.display = "flex";

    renderDrawerBody();
    el.sortFilterDrawer.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scroll
}

/**
 * Updates the active pill in the ownership segmented control inside the filter drawer.
 */
export function updateOwnershipPillsUI() {
    const staged = stateStore.get("stagedOwnershipFilter");
    const map = { owned: "pill-show-owned", unowned: "pill-show-not-owned", all: "pill-show-all" };
    Object.entries(map).forEach(([key, id]) => {
        document.getElementById(id)?.classList.toggle("active", key === staged);
    });
    updateSegmentedHighlights();
}

/**
 * Opens the Left Filters drawer.
 */
export function openFilterDrawer() {
    renderFilterDrawerDynamicSections();
    updateOwnershipPillsUI();
    updateFilterDrawerHeroCountUI();
    updateFilterDrawerSectionTitlesUI();

    const el = getElements();
    if (el.leftFilterDrawer) {
        el.leftFilterDrawer.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    }
}

/**
 * Closes the Left Filters drawer.
 * @param {Event|null} [event=null] - The triggered event context.
 * @param {boolean} [force=false] - If true, bypasses target mismatch checks.
 */
export function closeFilterDrawer(event = null, force = false) {
    if (event && event.target !== event.currentTarget && !force) return;
    const el = getElements();
    if (el.leftFilterDrawer) {
        el.leftFilterDrawer.classList.remove("open");
        document.body.style.overflow = "auto"; // Restore background scroll
    }
}

/**
 * Closes the Sort & Filter / settings drawer.
 * @param {Event|null} [event=null] - The triggered event context.
 * @param {boolean} [force=false] - If true, bypasses target mismatch checks.
 */
export function closeDrawer(event = null, force = false) {
    if (event && event.target !== event.currentTarget && !force) return;
    const el = getElements();
    if (el.sortFilterDrawer) {
        el.sortFilterDrawer.classList.remove("open");
        document.body.style.overflow = "auto"; // Restore background scroll
    }
}

/**
 * Re-renders the dynamic content regions inside the Left Filters drawer panel.
 */
export function renderFilterDrawerDynamicSections() {
    const el = getElements();
    const players = stateStore.get("players");
    const groups = stateStore.get("groups");
    const stagedFilterPlayers = stateStore.get("stagedFilterPlayers");
    const stagedFilterGroups = stateStore.get("stagedFilterGroups");
    const stagedFilterDataHistories = stateStore.get("stagedFilterDataHistories");
    const stagedFilterComplexities = stateStore.get("stagedFilterComplexities");

    // 1. Render Players alphabetically (excluding Invitees)
    if (el.leftPlayersContainer && players) {
        const sortedPlayers = players
            .filter(p => p.name && !p.name.toLowerCase().includes("invitee"))
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
        el.leftPlayersContainer.innerHTML = sortedPlayers.map(p => {
            const isChecked = stagedFilterPlayers.has(p.id) ? "checked" : "";
            return `
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${p.id}" data-type="player" ${isChecked} />
                    ${p.name}
                </label>
            `;
        }).join("");
    }

    // 2. Render Groups by order_index
    if (el.leftGroupsContainer && groups) {
        const sortedGroups = groups.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        el.leftGroupsContainer.innerHTML = sortedGroups.map(g => {
            const isChecked = stagedFilterGroups.has(g.id) ? "checked" : "";
            return `
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${g.id}" data-type="group" ${isChecked} />
                    ${g.name}
                </label>
            `;
        }).join("");
    }

    // Update static checkboxes (Complexity and Data History)
    document.querySelectorAll('#filter-drawer-left input[data-type="data-history"]').forEach(cb => {
        cb.checked = stagedFilterDataHistories.has(cb.value);
    });

    document.querySelectorAll('#filter-drawer-left input[data-type="complexity"]').forEach(cb => {
        cb.checked = stagedFilterComplexities.has(Number(cb.value));
    });
}

/**
 * Updates the quantity badge displaying active filters counts.
 */
export function updateActiveFilterBadge() {
    const el = getElements();
    if (!el.filterActiveBadge) return;

    const activeFilterDataHistories = stateStore.get("activeFilterDataHistories");
    const activeFilterPlayers = stateStore.get("activeFilterPlayers");
    const activeFilterComplexities = stateStore.get("activeFilterComplexities");
    const activeFilterGroups = stateStore.get("activeFilterGroups");

    const activeOwnership = stateStore.get("activeOwnershipFilter");

    let activeCount = 0;
    if (activeFilterDataHistories) activeCount += activeFilterDataHistories.size;
    if (activeFilterPlayers) activeCount += activeFilterPlayers.size;
    if (activeFilterComplexities) activeCount += activeFilterComplexities.size;
    if (activeFilterGroups) activeCount += activeFilterGroups.size;
    if (activeOwnership && activeOwnership !== "all") activeCount++;

    if (activeCount > 0) {
        el.filterActiveBadge.innerText = activeCount;
        el.filterActiveBadge.style.display = "inline-block";
    } else {
        el.filterActiveBadge.style.display = "none";
    }
}

/**
 * Updates the active filter badge on the games history tab.
 */
export function updateGamesActiveFilterBadge() {
    const el = getElements();
    if (!el.gamesFilterActiveBadge) return;

    const selectedGamePlayerIndex = stateStore.get("selectedGamePlayerIndex");
    const gamesWinnerOnly = stateStore.get("gamesWinnerOnly");
    const gamesUseHistorical = stateStore.get("gamesUseHistorical");

    let activeCount = 0;
    if (selectedGamePlayerIndex !== null) activeCount++;
    if (gamesWinnerOnly) activeCount++;
    if (!gamesUseHistorical) activeCount++;

    if (activeCount > 0) {
        el.gamesFilterActiveBadge.innerText = activeCount;
        el.gamesFilterActiveBadge.style.display = "inline-block";
    } else {
        el.gamesFilterActiveBadge.style.display = "none";
    }
}

/**
 * Repositions sliding highlighting backdrops behind segmented control items.
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

/**
 * Updates the text displayed on the main database sort triggering button.
 */
export function updateSortButtonText() {
    const el = getElements();
    if (!el.sortTriggerBtn) return;

    const currentSort = stateStore.get("currentSort");
    const sortAsc = stateStore.get("sortAsc");
    const currentSortPlayerIndex = stateStore.get("currentSortPlayerIndex");
    const names = stateStore.get("NAMES");

    let text = "Hero (A-Z)"; // Default

    if (currentSort === "name") {
        text = sortAsc ? "Hero (A-Z)" : "Hero (Z-A)";
    } else if (currentSort === "complexity") {
        text = sortAsc ? "Complexity (1-6)" : "Complexity (6-1)";
    } else if (currentSort.startsWith("w")) {
        const pName = names[currentSortPlayerIndex] || `Player ${currentSortPlayerIndex + 1}`;
        text = sortAsc ? `${pName} % (Low to High)` : `${pName} % (High to Low)`;
    } else if (currentSort.startsWith("d")) {
        const pName = names[currentSortPlayerIndex] || `Player ${currentSortPlayerIndex + 1}`;
        text = sortAsc ? `${pName} Played (Oldest)` : `${pName} Played (Newest)`;
    } else if (currentSort === "group") {
        text = sortAsc ? "Group (A-Z)" : "Group (Z-A)";
    }

    el.sortTriggerBtn.innerHTML = `<span class="action-icon">⇅</span> <strong style="font-weight: 700;">SORT:</strong> <span style="font-weight: 400; text-transform: none; margin-left: 2px;">${text}</span>`;
}

/**
 * Renders options inside the database Sort Dropdown list element.
 */
export function renderSortDropdownOptions() {
    const el = getElements();
    if (!el.sortDropdownMenu) return;

    const currentSort = stateStore.get("currentSort");
    const sortAsc = stateStore.get("sortAsc");
    const activePlayerIndices = stateStore.get("activePlayerIndices");
    const names = stateStore.get("NAMES");

    let html = `
        <div class="sort-dropdown-section-title">General</div>
        <button type="button" class="sort-dropdown-item ${currentSort === 'name' && sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="name" data-sort-asc="true">
            Hero Name (A-Z)
        </button>
        <button type="button" class="sort-dropdown-item ${currentSort === 'name' && !sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="name" data-sort-asc="false">
            Hero Name (Z-A)
        </button>
        <button type="button" class="sort-dropdown-item ${currentSort === 'complexity' && sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="complexity" data-sort-asc="true">
            Complexity (1-6)
        </button>
        <button type="button" class="sort-dropdown-item ${currentSort === 'complexity' && !sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="complexity" data-sort-asc="false">
            Complexity (6-1)
        </button>
    `;

    if (activePlayerIndices && activePlayerIndices.length > 0) {
        html += `<div class="sort-dropdown-divider"></div>`;
        activePlayerIndices.forEach(idx => {
            const playerName = names[idx] || `Player ${idx + 1}`;
            html += `
                <div class="sort-dropdown-section-title" style="color: var(--p${idx + 1}, #fff);">${playerName}</div>
                <button type="button" class="sort-dropdown-item ${currentSort === 'w' + idx && !sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="w${idx}" data-sort-asc="false">
                    Probability (High to Low)
                </button>
                <button type="button" class="sort-dropdown-item ${currentSort === 'w' + idx && sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="w${idx}" data-sort-asc="true">
                    Probability (Low to High)
                </button>
                <button type="button" class="sort-dropdown-item ${currentSort === 'd' + idx && !sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="d${idx}" data-sort-asc="false">
                    Last Played (Newest)
                </button>
                <button type="button" class="sort-dropdown-item ${currentSort === 'd' + idx && sortAsc ? 'active' : ''}" data-action="select-sort" data-sort-key="d${idx}" data-sort-asc="true">
                    Last Played (Oldest)
                </button>
            `;
        });
    }

    el.sortDropdownMenu.innerHTML = html;
}

/**
 * Toggles the visibility of the quick sort dropdown menu.
 */
export function toggleSortDropdown(event) {
    const el = getElements();
    if (!el.sortDropdownMenu) return;

    event.stopPropagation();
    const isOpen = el.sortDropdownMenu.classList.toggle("show");
    if (isOpen) {
        if (el.sortTriggerBtn) el.sortTriggerBtn.classList.add("active");
        renderSortDropdownOptions();
    } else {
        if (el.sortTriggerBtn) el.sortTriggerBtn.classList.remove("active");
    }
}

/**
 * Closes the quick sort dropdown menu.
 */
export function closeSortDropdown() {
    const el = getElements();
    if (el.sortDropdownMenu) {
        el.sortDropdownMenu.classList.remove("show");
    }
    if (el.sortTriggerBtn) {
        el.sortTriggerBtn.classList.remove("active");
    }
}

/**
 * Updates the matching count display inside the Left Filter drawer.
 */
export function updateFilterDrawerHeroCountUI() {
    const el = getElements();
    if (!el.leftHeroCountLabel) return;
    const matchingCount = getFilterDrawerMatchingCount();
    el.leftHeroCountLabel.innerText = `${matchingCount} heroes match`;
}

/**
 * Updates section titles on Left Filter Drawer, adding count indicator bubbles where selections are made.
 */
export function updateFilterDrawerSectionTitlesUI() {
    const el = getElements();
    const stagedFilterDataHistories = stateStore.get("stagedFilterDataHistories");
    const stagedFilterPlayers = stateStore.get("stagedFilterPlayers");
    const stagedFilterComplexities = stateStore.get("stagedFilterComplexities");
    const stagedFilterGroups = stateStore.get("stagedFilterGroups");

    if (el.leftTitleDataHistory) {
        const count = stagedFilterDataHistories.size;
        el.leftTitleDataHistory.innerHTML = `Data Type ${count > 0 ? `<span class="filter-count-bubble">${count}</span>` : ""}`;
    }
    if (el.leftTitlePlayers) {
        const count = stagedFilterPlayers.size;
        el.leftTitlePlayers.innerHTML = `Players ${count > 0 ? `<span class="filter-count-bubble">${count}</span>` : ""}`;
    }
    if (el.leftTitleComplexity) {
        const count = stagedFilterComplexities.size;
        el.leftTitleComplexity.innerHTML = `Complexity ${count > 0 ? `<span class="filter-count-bubble">${count}</span>` : ""}`;
    }
    if (el.leftTitleGroups) {
        const count = stagedFilterGroups.size;
        el.leftTitleGroups.innerHTML = `Group / Season ${count > 0 ? `<span class="filter-count-bubble">${count}</span>` : ""}`;
    }
}

/**
 * Generates the game history filters inside the history drawer, calculating played/won stats.
 * @param {HTMLElement} body - The container element to append the filter controls to.
 */
export function renderHistoryFilterDrawerBody(body) {
    const players = stateStore.get("players");
    const games = stateStore.get("games");
    const NAMES = stateStore.get("NAMES");
    const stagedGamesUseHistorical = stateStore.get("stagedGamesUseHistorical");
    const stagedSelectedGamePlayerIndex = stateStore.get("stagedSelectedGamePlayerIndex");
    const stagedGamesWinnerOnly = stateStore.get("stagedGamesWinnerOnly");

    const useHistorical = stagedGamesUseHistorical;
    const playerStats = players.map(() => ({ played: 0, won: 0 }));
    let inviteePlayed = 0;
    let inviteeWon = 0;

    if (games) {
        games.forEach((game) => {
            if (!useHistorical && game.is_historical) return;

            game.game_players.forEach((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                if (pIdx >= 0 && pIdx < MAX_WEIGHTED_PLAYERS) {
                    playerStats[pIdx].played++;
                    if (gp.is_winner) playerStats[pIdx].won++;
                } else if (pIdx === MAX_WEIGHTED_PLAYERS || pIdx === MAX_WEIGHTED_PLAYERS + 1) {
                    inviteePlayed++;
                    if (gp.is_winner) inviteeWon++;
                }
            });
        });
    }

    let playersHtml = "";
    for (let i = 0; i < MAX_WEIGHTED_PLAYERS; i++) {
        const p = players[i];
        if (!p) continue;
        const isActive = stagedSelectedGamePlayerIndex === i;
        playersHtml += `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1;">
                <button type="button" class="player-filter-btn ${isActive ? "active" : ""}" 
                        style="background-color: var(--p${i + 1}); width: 100%; min-width: 60px; padding: 8px 4px; font-size: 0.8rem; font-weight: bold; border-radius: 6px;" 
                        data-action="toggle-staged-player-game-filter" data-player-idx="${i}">
                    ${p.name}
                </button>
                <div style="font-size: 0.75rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                     P: ${playerStats[i].played}<br>
                     W: ${playerStats[i].won}
                </div>
            </div>
        `;
    }

    const isInviteeActive = stagedSelectedGamePlayerIndex === MAX_WEIGHTED_PLAYERS;
    playersHtml += `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1;">
            <button type="button" class="player-filter-btn ${isInviteeActive ? "active" : ""}" 
                    style="background-color: var(--p5); width: 100%; min-width: 60px; padding: 8px 4px; font-size: 0.8rem; font-weight: bold; border-radius: 6px;" 
                    data-action="toggle-staged-player-game-filter" data-player-idx="${MAX_WEIGHTED_PLAYERS}">
                Invitee
            </button>
            <div style="font-size: 0.75rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                P: ${inviteePlayed}<br>
                W: ${inviteeWon}
            </div>
        </div>
    `;

    const showWinnerOnlyCheckbox = stagedSelectedGamePlayerIndex !== null;

    body.innerHTML = `
        <div class="panel-row-new">
            <div class="dropdown-sort-options" style="margin: 0; justify-content: flex-start;">
                <label style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                    <input
                        type="checkbox"
                        id="drawer-games-use-historical"
                        ${useHistorical ? "checked" : ""}
                        data-action="toggle-use-historical"
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
                    ${stagedGamesWinnerOnly ? "checked" : ""}
                    data-action="toggle-staged-winner-only"
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

/**
 * Renders the body content of the active sidebar drawer based on the current drawer mode.
 */
export function renderDrawerBody() {
    const el = getElements();
    if (!el.drawerBody) return;

    const currentDrawerMode = stateStore.get("currentDrawerMode");
    const stagedSort = stateStore.get("stagedSort");
    const stagedSortPlayerIndex = stateStore.get("stagedSortPlayerIndex");
    const stagedPlayerIndices = stateStore.get("stagedPlayerIndices");
    const stagedUseHistorical = stateStore.get("stagedUseHistorical");
    const NAMES = stateStore.get("NAMES");
    const activePlayerIndices = stateStore.get("activePlayerIndices");
    const stagedDraftModeEnabled = stateStore.get("stagedDraftModeEnabled");
    const stagedDraftCount = stateStore.get("stagedDraftCount");
    const stagedRollSettingsTab = stateStore.get("stagedRollSettingsTab");
    const stagedBanSearchQuery = stateStore.get("stagedBanSearchQuery");

    el.drawerBody.style.overflowY = "auto";

    if (currentDrawerMode === "sort-filter") {
        el.drawerBody.innerHTML = `
            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700;">Sort Visible Heroes:</span>
                <div class="sort-controls-new" style="margin-top: 10px;">
                    <select id="drawer-sort-type-select" class="sort-select-new" data-action="drawer-sort-type-change">
                        <option value="name">Hero Name</option>
                        <option value="group">Group (Season)</option>
                        <option value="probability">Roll Probability (%)</option>
                        <option value="lastPlayed">Last Played Date</option>
                    </select>
                    
                    <button type="button" id="drawer-sort-direction-btn" class="btn-direction-new" data-action="toggle-drawer-sort-direction">
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
        if (stagedSort === "group") {
            sortType = "group";
        } else if (stagedSort.startsWith("w")) {
            sortType = "probability";
        } else if (stagedSort.startsWith("d")) {
            sortType = "lastPlayed";
        }

        const select = document.getElementById("drawer-sort-type-select");
        if (select) select.value = sortType;

        updateDrawerSortDirectionUI();
        updateDrawerPlayerSortPillsUI();
        renderDrawerComplexityFilters();
        renderDrawerGroupFilters();
    } else if (currentDrawerMode === "columns") {
        const mainPlayerNames = NAMES.slice(0, MAX_WEIGHTED_PLAYERS);
        const visibilityPillsHtml = mainPlayerNames
            .map((name, i) => {
                const isActive = stagedPlayerIndices.includes(i);
                const activeClass = isActive
                    ? `active p${i + 1}-color`
                    : "inactive";
                return `
                <button type="button" class="pill-toggle ${activeClass}" data-action="toggle-drawer-player-filter" data-player-idx="${i}">
                    ${name}
                </button>
            `;
            })
            .join("");

        el.drawerBody.innerHTML = `
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
                            ${stagedUseHistorical ? "checked" : ""}
                            data-action="toggle-use-historical"
                            style="width: 18px; height: 18px;" />
                        Include Historical Data (before May 8th 2026)
                    </label>
                </div>
            </div>
        `;
    } else if (currentDrawerMode === "history-filter") {
        renderHistoryFilterDrawerBody(el.drawerBody);
    } else if (currentDrawerMode === "roll-settings") {
        el.drawerBody.style.overflowY = "hidden";

        const draftModeChecked = stagedDraftModeEnabled ? "checked" : "";
        const draftCountOptions = [2, 3];
        const countPills = draftCountOptions
            .map((c) => {
                const isActive = stagedDraftCount === c;
                const activeClass = isActive ? "active" : "";
                return `
                    <button type="button" class="pill-toggle active-red ${activeClass}" data-action="set-staged-draft-count" data-count="${c}">
                        ${c} Candidates
                    </button>
                `;
            })
            .join("");

        el.drawerBody.innerHTML = `
            <div class="drawer-tabs-container" style="flex-shrink: 0;">
                <div class="drawer-tabs">
                    <button type="button" class="drawer-tab-btn ${stagedRollSettingsTab === "draft" ? "active" : ""}" data-action="switch-roll-settings-tab" data-tab="draft">Draft Mode</button>
                    <button type="button" class="drawer-tab-btn ${stagedRollSettingsTab === "ban" ? "active" : ""}" data-action="switch-roll-settings-tab" data-tab="ban">Ban List</button>
                    <div class="drawer-tab-underline" style="left: ${stagedRollSettingsTab === "draft" ? "0%" : "50%"};"></div>
                </div>
            </div>

            <div id="roll-settings-draft-tab" style="display: ${stagedRollSettingsTab === "draft" ? "block" : "none"};">
                <div class="panel-row-new">
                    <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                        <label class="toggle-switch">
                            <input type="checkbox" id="drawer-draft-mode-checkbox" data-action="toggle-staged-draft-mode" ${draftModeChecked}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span style="font-size: 0.9em; opacity: 0.8;">Enable Turn-Based Drafting</span>
                    </div>
                </div>

                <div id="drawer-draft-count-section" class="panel-row-new" style="display: ${stagedDraftModeEnabled ? "block" : "none"};">
                    <span class="panel-row-title" style="font-weight: 700;">Draft Candidates Count:</span>
                    <div class="pill-group" style="margin-top: 10px;">
                        ${countPills}
                    </div>
                </div>
            </div>

            <div id="roll-settings-ban-tab" style="display: ${stagedRollSettingsTab === "ban" ? "flex" : "none"}; flex-direction: column; flex: 1; min-height: 0; font-size: 1rem;">
                <div class="panel-row-new" style="display: flex; flex-direction: column; flex: 1; min-height: 0; margin-top: 8px;">
                    <input type="text" id="ban-search-input" class="ban-search-input" placeholder="Search heroes to ban..." data-action="ban-search-input" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; margin-bottom: 15px; flex-shrink: 0;" value="${stagedBanSearchQuery || ""}">
                    <div id="drawer-ban-list-container" class="ban-list-container" style="flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; max-height: 350px;">
                    </div>
                </div>
            </div>
        `;

        renderDrawerBanList();
    }
}

/**
 * Refreshes direction buttons inside the drawer, highlighting correct arrows and descriptions.
 */
export function updateDrawerSortDirectionUI() {
    const dirText = document.getElementById("drawer-sort-direction-text");
    const dirArrow = document.getElementById("drawer-sort-direction-arrow");
    const stagedSortAsc = stateStore.get("stagedSortAsc");
    if (dirText && dirArrow) {
        dirText.innerText = stagedSortAsc ? "Ascending" : "Descending";
        dirArrow.innerText = stagedSortAsc ? "▲" : "▼";
    }
}

/**
 * Redraws active sorting player context selector pills.
 */
export function updateDrawerPlayerSortPillsUI() {
    const subSection = document.getElementById("drawer-player-sort-sub-section");
    const pillsContainer = document.getElementById("drawer-player-sort-pills");
    if (!subSection || !pillsContainer) return;

    const stagedSort = stateStore.get("stagedSort");
    const stagedSortPlayerIndex = stateStore.get("stagedSortPlayerIndex");
    const activePlayerIndices = stateStore.get("activePlayerIndices");
    const NAMES = stateStore.get("NAMES");

    const showPlayers = stagedSort.startsWith("w") || stagedSort.startsWith("d");
    subSection.style.display = showPlayers ? "block" : "none";

    if (showPlayers) {
        const mainPlayerNames = NAMES.slice(0, MAX_WEIGHTED_PLAYERS);
        pillsContainer.innerHTML = mainPlayerNames
            .map((name, i) => {
                const isActive = stagedSortPlayerIndex === i;
                const activeClass = isActive ? `active p${i + 1}-color` : "";
                const isColumnActive = activePlayerIndices.includes(i);
                const columnStyle = isColumnActive ? "" : "opacity: 0.5;";
                return `
                <button type="button" class="pill-toggle ${activeClass}" style="${columnStyle}" data-action="drawer-sort-player-change" data-player-idx="${i}">
                    ${name}
                </button>
            `;
            })
            .join("");
    }
}

/**
 * Draws complexity badge items inside the drawer, highlighting candidate counts.
 */
export function renderDrawerComplexityFilters() {
    const container = document.getElementById("drawer-complexity-filter-bar");
    if (!container) return;

    const searchInput = document.getElementById("hero-search");
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned = document.getElementById("db-show-not-owned")?.checked ?? false;
    const stagedGroups = stateStore.get("stagedGroups");
    const stagedLevels = stateStore.get("stagedLevels");
    const characters = stateStore.get("characters");

    const matchesSearch = (c, term) => {
        if (!term) return true;
        return c.name.toLowerCase().includes(term) || (c.group && c.group.toLowerCase().includes(term));
    };

    let html = "";
    for (let i = 1; i <= 6; i++) {
        const potentialMatchesCount = characters.filter((c) => {
            if (Number(c.complexity) !== i) return false;
            const groupFilterMatch = stagedGroups.has(c.group_id);
            const ownershipMatch =
                (isHeroOwned(c) && showOwned) ||
                (!isHeroOwned(c) && showNotOwned);
            return (
                matchesSearch(c, searchTerm) &&
                groupFilterMatch &&
                ownershipMatch
            );
        }).length;

        const isDisabled = potentialMatchesCount === 0;
        const isActive = stagedLevels.has(i);
        const activeClass = isActive && !isDisabled ? "active-die" : "";

        html += `
            <div class="group-badge-card group-complexity ${activeClass} ${isDisabled ? "disabled" : ""}" 
                 data-action="toggle-drawer-level" data-level="${i}" data-disabled="${isDisabled}"
                 title="Level ${i} (${potentialMatchesCount} heroes)">
                <img src="images/dice/d${i}.png" class="complexity-dice-img" alt="Level ${i}">
                <span class="group-badge-count">${potentialMatchesCount}</span>
            </div>`;
    }

    const totalMatchingHeroes = characters.filter((c) => {
        const groupFilterMatch = stagedGroups.has(c.group_id);
        const ownershipMatch =
            (isHeroOwned(c) && showOwned) || (!isHeroOwned(c) && showNotOwned);
        return (
            matchesSearch(c, searchTerm) && groupFilterMatch && ownershipMatch
        );
    }).length;

    const isAllDisabled = totalMatchingHeroes === 0;
    const allActive = stagedLevels.size === 6;
    const allActiveClass = allActive && !isAllDisabled ? "active-die" : "";

    html += `
        <div class="group-badge-card group-complexity group-complexity-all ${allActiveClass} ${isAllDisabled ? "disabled" : ""}" 
             data-action="toggle-drawer-level" data-level="all" data-disabled="${isAllDisabled}"
             title="All Levels (${totalMatchingHeroes} heroes)">
            <img src="images/dice/d_all.png" class="complexity-dice-img" alt="All">
            <span class="group-badge-count">${totalMatchingHeroes}</span>
        </div>`;

    container.innerHTML = html;
}

/**
 * Resolves a unique theme string token based on expansion pack or season group metadata.
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

/**
 * Resolves abbreviation short codes representing seasons/expansions.
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

/**
 * Renders the group/season filters inside the drawer.
 */
export function renderDrawerGroupFilters() {
    const container = document.getElementById("drawer-group-filter-bar");
    if (!container) return;

    const searchInput = document.getElementById("hero-search");
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned = document.getElementById("db-show-not-owned")?.checked ?? false;
    const stagedLevels = stateStore.get("stagedLevels");
    const stagedGroups = stateStore.get("stagedGroups");
    const groups = stateStore.get("groups");
    const characters = stateStore.get("characters");

    const matchesSearch = (c, term) => {
        if (!term) return true;
        return c.name.toLowerCase().includes(term) || (c.group && c.group.toLowerCase().includes(term));
    };

    let html = groups
        .map((g) => {
            const initials = getGroupAbbreviation(g.name);
            const isActive = stagedGroups.has(g.id);
            const themeClass = getGroupThemeClass(g.name);

            const potentialMatchesCount = characters.filter((c) => {
                if (c.group_id !== g.id) return false;
                const complexityMatch = stagedLevels.has(Number(c.complexity));
                const ownershipMatch =
                    (isHeroOwned(c) && showOwned) ||
                    (!isHeroOwned(c) && showNotOwned);
                return (
                    matchesSearch(c, searchTerm) &&
                    complexityMatch &&
                    ownershipMatch
                );
            }).length;

            const isDisabled = potentialMatchesCount === 0;
            const activeClass = isActive && !isDisabled ? "active-die" : "";

            return `
                <div class="group-badge-card ${themeClass} ${activeClass} ${isDisabled ? "disabled" : ""}" 
                     data-action="toggle-drawer-group" data-group-id="${g.id}" data-disabled="${isDisabled}"
                     title="${escapeHtml(g.name)} (${potentialMatchesCount} heroes)">
                    <span class="group-badge-initials">${initials}</span>
                    <span class="group-badge-count">${potentialMatchesCount}</span>
                </div>`;
        })
        .join("");

    const totalMatchingHeroes = characters.filter((c) => {
        const complexityMatch = stagedLevels.has(Number(c.complexity));
        const ownershipMatch =
            (isHeroOwned(c) && showOwned) || (!isHeroOwned(c) && showNotOwned);
        return (
            matchesSearch(c, searchTerm) && complexityMatch && ownershipMatch
        );
    }).length;

    const isAllDisabled = totalMatchingHeroes === 0;
    const allActive = stagedGroups.size === groups.length;
    const allActiveClass = allActive && !isAllDisabled ? "active-die" : "";

    const allHtml = `
        <div class="group-badge-card group-all ${allActiveClass} ${isAllDisabled ? "disabled" : ""}" 
             data-action="toggle-drawer-group" data-group-id="all" data-disabled="${isAllDisabled}"
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

/**
 * Re-renders dynamic filter chip buttons based on active search terms, player selections, complexities, and group limits.
 */
export function updateActiveFilterChips() {
    const el = getElements();
    if (!el.activeFiltersContainer) return;

    const searchInput = el.heroSearchInput;
    const searchTerm = searchInput ? searchInput.value.trim() : "";

    const activeFilterDataHistories = stateStore.get("activeFilterDataHistories");
    const activeFilterPlayers = stateStore.get("activeFilterPlayers");
    const activeFilterComplexities = stateStore.get("activeFilterComplexities");
    const activeFilterGroups = stateStore.get("activeFilterGroups");
    const players = stateStore.get("players");
    const groups = stateStore.get("groups");

    let html = "";
    if (searchTerm) {
        html += `
            <div class="filter-chip" title="Active Search Filter">
                <span class="filter-chip-remove" data-action="clear-search-filter" title="Remove search filter">✖</span>
                <span class="filter-chip-label">Search: "${searchTerm}"</span>
            </div>
        `;
    }

    if (activeFilterDataHistories) {
        const sortedDataHistories = Array.from(activeFilterDataHistories).sort((a, b) => {
            const order = ["Normal only", "Historical only"];
            return order.indexOf(a) - order.indexOf(b);
        });
        sortedDataHistories.forEach(dh => {
            html += `
                <div class="filter-chip" title="Active Data History Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="data-history" data-value="${dh}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">Data: ${dh}</span>
                </div>
            `;
        });
    }

    if (activeFilterPlayers && players) {
        const sortedPlayerIds = Array.from(activeFilterPlayers).sort((a, b) => {
            const pA = players.find(p => p.id === a);
            const pB = players.find(p => p.id === b);
            const nameA = pA ? pA.name : "";
            const nameB = pB ? pB.name : "";
            return nameA.localeCompare(nameB);
        });
        sortedPlayerIds.forEach(pId => {
            const pObj = players.find(p => p.id === pId);
            const name = pObj ? pObj.name : pId;
            html += `
                <div class="filter-chip" title="Active Player Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="player" data-value="${pId}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">${name}</span>
                </div>
            `;
        });
    }

    if (activeFilterComplexities) {
        const sortedComplexities = Array.from(activeFilterComplexities).sort((a, b) => a - b);
        sortedComplexities.forEach(cVal => {
            html += `
                <div class="filter-chip" title="Active Complexity Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="complexity" data-value="${cVal}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">Complexity: ${cVal}</span>
                </div>
            `;
        });
    }

    if (activeFilterGroups && groups) {
        const sortedGroupIds = Array.from(activeFilterGroups).sort((a, b) => {
            const gA = groups.find(g => g.id === a);
            const gB = groups.find(g => g.id === b);
            const orderA = gA ? (gA.order_index ?? 0) : 0;
            const orderB = gB ? (gB.order_index ?? 0) : 0;
            return orderA - orderB;
        });
        sortedGroupIds.forEach(gId => {
            const gObj = groups.find(g => g.id === gId);
            const name = gObj ? gObj.name : gId;
            html += `
                <div class="filter-chip" title="Active Group Filter">
                    <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="group" data-value="${gId}" title="Remove filter">✖</span>
                    <span class="filter-chip-label">${name}</span>
                </div>
            `;
        });
    }

    el.activeFiltersContainer.innerHTML = html;
}

/**
 * Computes sorting and renders the main grid hero list.
 */
export function renderList() {
    const el = getElements();
    if (!el.heroContainer) return;

    updateHeroStatsFromHistory();

    const searchTerm = el.heroSearchInput?.value.toLowerCase() || "";
    const showOwned = el.dbShowOwnedCheckbox?.checked ?? true;
    const showNotOwned = el.dbShowNotOwnedCheckbox?.checked ?? false;

    const NAMES = stateStore.get("NAMES");
    const characters = stateStore.get("characters");
    const activeFilterComplexities = stateStore.get("activeFilterComplexities");
    const activeFilterGroups = stateStore.get("activeFilterGroups");
    const activeFilterDataHistories = stateStore.get("activeFilterDataHistories");
    const activeFilterPlayers = stateStore.get("activeFilterPlayers");
    const games = stateStore.get("games");
    const activePlayerIndices = stateStore.get("activePlayerIndices");
    const currentSort = stateStore.get("currentSort");
    const sortAsc = stateStore.get("sortAsc");
    const currentSortPlayerIndex = stateStore.get("currentSortPlayerIndex");

    const matchesSearchTerm = (c, term) => {
        if (!term) return true;
        const clean = term.trim().toLowerCase();
        return (c.name || "").toLowerCase().includes(clean) || (c.group || "").toLowerCase().includes(clean);
    };



    const matchingPlayerIdxs = [];
    if (searchTerm) {
        NAMES.forEach((playerName, playerIdx) => {
            if (playerName && playerName.toLowerCase().includes(searchTerm)) {
                matchingPlayerIdxs.push(playerIdx);
            }
        });
    }

    const totals = Array(MAX_WEIGHTED_PLAYERS).fill(0);
    characters.filter(isHeroOwned).forEach((c) => {
        for (let i = 0; i < MAX_WEIGHTED_PLAYERS; i++) {
            totals[i] += getSoftWeight(c, i);
        }
    });

    const processedList = characters
        .map((char, index) => ({ ...char, originalIndex: index }))
        .filter((c) => {
            let complexityMatch = true;
            if (activeFilterComplexities.size > 0) {
                complexityMatch = activeFilterComplexities.has(Number(c.complexity));
            }

            let groupFilterMatch = true;
            if (activeFilterGroups.size > 0) {
                groupFilterMatch = activeFilterGroups.has(c.group_id);
            }

            let dataHistoryMatch = true;
            const hasNormalOnlyActive = activeFilterDataHistories.has("Normal only");
            const hasHistoricalOnlyActive = activeFilterDataHistories.has("Historical only");
            if (hasNormalOnlyActive && !hasHistoricalOnlyActive) {
                const heroGames = games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
                dataHistoryMatch = heroGames.some(g => !g.is_historical);
            } else if (hasHistoricalOnlyActive && !hasNormalOnlyActive) {
                const heroGames = games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
                dataHistoryMatch = heroGames.some(g => g.is_historical);
            }

            let playersMatch = true;
            if (activeFilterPlayers.size > 0) {
                const heroGames = games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
                const playedBySelected = heroGames.some(g => 
                    g.game_players.some(gp => gp.hero_id === c.id && activeFilterPlayers.has(gp.player_id))
                );
                playersMatch = playedBySelected;
            }

            const ownershipMatch =
                (isHeroOwned(c) && showOwned) ||
                (!isHeroOwned(c) && showNotOwned);

            return (
                matchesSearchTerm(c, searchTerm) &&
                complexityMatch &&
                groupFilterMatch &&
                dataHistoryMatch &&
                playersMatch &&
                ownershipMatch
            );
        });

    if (el.countStatsLabel) {
        el.countStatsLabel.innerText = `Showing ${processedList.length} of ${characters.length} heroes`;
    }

    processedList.sort((a, b) => {
        let valA, valB;

        if (currentSort.startsWith("w")) {
            const idx = parseInt(currentSort[1]);
            valA = getSoftWeight(a, idx);
            valB = getSoftWeight(b, idx);
        } else if (currentSort.startsWith("d")) {
            const idx = parseInt(currentSort[1]);
            valA = (a.lastPlayed && a.lastPlayed[idx]) || "";
            valB = (b.lastPlayed && b.lastPlayed[idx]) || "";
            if (valA === "Never" || valA === "Unknown") valA = "";
            if (valB === "Never" || valB === "Unknown") valB = "";
        } else if (currentSort === "group") {
            valA = (a.group || "").toLowerCase();
            valB = (b.group || "").toLowerCase();
            if (valA === valB) {
                const nameA = (a.name || "").toLowerCase();
                const nameB = (b.name || "").toLowerCase();
                return sortAsc
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            }
        } else if (currentSort === "complexity") {
            valA = Number(a.complexity) || 0;
            valB = Number(b.complexity) || 0;
            if (valA === valB) {
                const nameA = (a.name || "").toLowerCase();
                const nameB = (b.name || "").toLowerCase();
                return nameA.localeCompare(nameB);
            }
        } else {
            valA = (a[currentSort] || "").toLowerCase();
            valB = (b[currentSort] || "").toLowerCase();
        }

        if (valA === valB) return 0;
        const comparison = valA < valB ? -1 : 1;
        return sortAsc ? comparison : -comparison;
    });

    el.heroContainer.innerHTML = processedList
        .map((c) => {
            let playersToRender = activePlayerIndices;
            if (activeFilterPlayers.size > 0) {
                playersToRender = Array.from(activeFilterPlayers)
                    .map(pId => parseInt(pId.substring(1)) - 1)
                    .filter(idx => idx >= 0 && idx < MAX_WEIGHTED_PLAYERS);
            } else if (matchingPlayerIdxs.length > 0) {
                playersToRender = activePlayerIndices.filter(p => matchingPlayerIdxs.includes(p));
            }

            const playerStatsList = playersToRender.map((p) => {
                const softWeight = getSoftWeight(c, p);
                const owned = isHeroOwned(c);
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
                const nameX = (NAMES[x.p] || "").toLowerCase();
                const nameY = (NAMES[y.p] || "").toLowerCase();
                return nameX.localeCompare(nameY);
            });

            const collapsedPlayersHtml = playerStatsList
                .map((item) => {
                    const recencyDot = getRecencyDot(item.lastPlayed);
                    return `
                <div class="collapsed-player-row-simple">
                    <span class="collapsed-player-name" style="color: var(--p${item.p + 1});">${NAMES[item.p]}</span>
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
                        <span class="expanded-player-name" style="color: var(--p${item.p + 1});">${NAMES[item.p]}</span>
                        <span class="expanded-player-prob">${item.percentageStr}%</span>
                        <span class="collapsed-player-plays">🎲 ${item.playCount}</span>
                        <span class="collapsed-player-wins">🏆 ${item.winCount} <span class="collapsed-player-rate">(${item.winRate}%)</span></span>
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
                <img src="${getImgUrl(c.slug)}" class="char-bg-img" alt="${c.name}">
                
                <div class="hero-header" data-action="toggle-hero-panel">
                    <div class="header-title-collapsed">
                        <a href="${getHeroLink(c.slug)}" target="_blank" class="hero-name-link">
                            <span class="hero-name">${c.name}</span>
                        </a>
                    </div>
                    
                    <div class="header-title-expanded">
                        <a href="${getHeroLink(c.slug)}" target="_blank" class="hero-name-link">
                            <div class="expanded-name">${c.name}</div>
                        </a>
                        <div class="expanded-group">${c.group || "Season ?"}</div>
                    </div>
                    
                    <div class="complexity-dice-bar">
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
