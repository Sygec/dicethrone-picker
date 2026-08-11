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
    getRecencyDot,
    getPlayerBucket,
    GAME_TYPE_FULL_LABEL,
    LEGACY_GAME_TYPE
} from '../utils.js';
import { getFilterDrawerMatchingCount, getGamesFilterDrawerMatchingCount } from '../filters.js';
import { updateHeroStatsFromHistory } from '../admin.js';

let elementsCache = null;
const getElements = () => {
    if (!elementsCache) {
        elementsCache = {
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
            gamesFilterDrawer: document.getElementById("filter-drawer-games"),
            gamesPlayersContainer: document.getElementById("games-filter-options-players"),
            gamesCountLabel: document.getElementById("games-filter-drawer-count"),
            gamesDataHistorySection: document.getElementById("games-data-history-section"),
            gamesDataHistoryDivider: document.getElementById("games-data-history-divider"),
            gamesResultHint: document.getElementById("games-result-hint"),
            gamesTitleDate: document.getElementById("games-title-date"),
            gamesTitleResult: document.getElementById("games-title-result"),
            gamesTitlePlayers: document.getElementById("games-title-players"),
            gamesTitleTypes: document.getElementById("games-title-types"),
            gamesSortTriggerBtn: document.getElementById("btn-trigger-games-sort"),
            gamesSortDropdownMenu: document.getElementById("games-sort-dropdown-menu"),
            gamesActiveFiltersContainer: document.getElementById("games-active-filters-container"),
            gamesSearchInput: document.getElementById("games-search"),
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
 * Opens the Game History Filters drawer.
 */
export function openGamesFilterDrawer() {
    renderGamesFilterDrawerDynamicSections();
    updateGamesDateRangePillsUI();
    updateGamesFilterDrawerCountUI();
    updateGamesFilterDrawerSectionTitlesUI();

    const el = getElements();
    if (el.gamesFilterDrawer) {
        el.gamesFilterDrawer.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    }
}

/**
 * Closes the Game History Filters drawer.
 * @param {Event|null} [event=null] - The triggered event context.
 * @param {boolean} [force=false] - If true, bypasses target mismatch checks.
 */
export function closeGamesFilterDrawer(event = null, force = false) {
    if (event && event.target !== event.currentTarget && !force) return;
    const el = getElements();
    if (el.gamesFilterDrawer) {
        el.gamesFilterDrawer.classList.remove("open");
        document.body.style.overflow = "auto"; // Restore background scroll
    }
}

/**
 * Updates the active pill in the date range segmented control inside the games filter drawer.
 */
export function updateGamesDateRangePillsUI() {
    const staged = stateStore.get("stagedGamesDateRange");
    document
        .querySelectorAll('#filter-drawer-games .segmented-pill[data-range]')
        .forEach((pill) => {
            pill.classList.toggle("active", pill.getAttribute("data-range") === staged);
        });
    updateSegmentedHighlights();
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
 * Returns the label for a games player filter bucket.
 * @param {number} bucket - 0..MAX_WEIGHTED_PLAYERS-1 for tracked players, MAX_WEIGHTED_PLAYERS for invitees.
 * @returns {string}
 */
export function getGamesPlayerLabel(bucket) {
    if (bucket >= MAX_WEIGHTED_PLAYERS) return "Invitee";
    const names = stateStore.get("NAMES");
    return names[bucket] || `Player ${bucket + 1}`;
}

/**
 * Re-renders the dynamic content regions inside the Game History Filters drawer: the player
 * checkbox list with per-player played/won counts, and the staged state of the static
 * checkboxes. Historical games only render in the admin list view, so the Data History
 * section is hidden (and its counts ignored) in the gorgeous view.
 */
export function renderGamesFilterDrawerDynamicSections() {
    const el = getElements();
    const games = stateStore.get("games");
    const stagedGamesPlayers = stateStore.get("stagedGamesPlayers");
    const stagedGamesResults = stateStore.get("stagedGamesResults");
    const stagedGamesTypes = stateStore.get("stagedGamesTypes");
    const isGorgeous = (stateStore.get("gamesHistoryStyle") || "gorgeous") === "gorgeous";
    const useHistorical = isGorgeous ? false : stateStore.get("stagedGamesUseHistorical");

    // Historical rows only record which hero a player used, so the toggle is meaningless in
    // the gorgeous view, where those games never render at all.
    el.gamesDataHistorySection?.classList.toggle("hidden", isGorgeous);
    el.gamesDataHistoryDivider?.classList.toggle("hidden", isGorgeous);

    if (el.gamesPlayersContainer) {
        const stats = Array.from({ length: MAX_WEIGHTED_PLAYERS + 1 }, () => ({ played: 0, won: 0 }));
        (games || []).forEach((game) => {
            if (!useHistorical && game.is_historical) return;
            (game.game_players || []).forEach((gp) => {
                const bucket = getPlayerBucket(gp);
                stats[bucket].played++;
                if (gp.is_winner) stats[bucket].won++;
            });
        });

        el.gamesPlayersContainer.innerHTML = stats
            .map((stat, bucket) => {
                const isChecked = stagedGamesPlayers.has(bucket) ? "checked" : "";
                return `
                <label class="filter-checkbox-label">
                    <input type="checkbox" value="${bucket}" data-type="games-player" ${isChecked} />
                    ${escapeHtml(getGamesPlayerLabel(bucket))}
                    <span class="filter-label-meta">P: ${stat.played} / W: ${stat.won}</span>
                </label>
            `;
            })
            .join("");
    }

    document.querySelectorAll('#filter-drawer-games input[data-type="games-result"]').forEach((cb) => {
        cb.checked = stagedGamesResults.has(cb.value);
    });

    document.querySelectorAll('#filter-drawer-games input[data-type="games-type"]').forEach((cb) => {
        cb.checked = stagedGamesTypes.has(cb.value);
    });

    const historicalCb = document.querySelector('#filter-drawer-games input[data-type="games-historical"]');
    if (historicalCb) historicalCb.checked = stateStore.get("stagedGamesUseHistorical");

    updateGamesResultAvailabilityUI();
}

/**
 * Enables the Win / Loss checkboxes only while at least one player is selected — outside of a
 * player context they would match every completed game and mean nothing.
 */
export function updateGamesResultAvailabilityUI() {
    const el = getElements();
    const hasPlayer = stateStore.get("stagedGamesPlayers").size > 0;

    ["win", "loss"].forEach((value) => {
        const cb = document.querySelector(`#filter-drawer-games input[data-type="games-result"][value="${value}"]`);
        if (!cb) return;
        cb.disabled = !hasPlayer;
        cb.closest(".filter-checkbox-label")?.classList.toggle("is-disabled", !hasPlayer);
    });

    el.gamesResultHint?.classList.toggle("hidden", hasPlayer);
}

/**
 * Updates the matching count display inside the Game History Filters drawer.
 */
export function updateGamesFilterDrawerCountUI() {
    const el = getElements();
    if (!el.gamesCountLabel) return;
    el.gamesCountLabel.innerText = `${getGamesFilterDrawerMatchingCount()} games match`;
}

/**
 * Updates section titles on the Game History Filters drawer, adding count indicator bubbles
 * where selections are made.
 */
export function updateGamesFilterDrawerSectionTitlesUI() {
    const el = getElements();
    const bubble = (count) => (count > 0 ? `<span class="filter-count-bubble">${count}</span>` : "");

    if (el.gamesTitleDate) {
        const isFiltered = stateStore.get("stagedGamesDateRange") !== "all";
        el.gamesTitleDate.innerHTML = `Date Range ${bubble(isFiltered ? 1 : 0)}`;
    }
    if (el.gamesTitleResult) {
        el.gamesTitleResult.innerHTML = `Result ${bubble(stateStore.get("stagedGamesResults").size)}`;
    }
    if (el.gamesTitlePlayers) {
        el.gamesTitlePlayers.innerHTML = `By Player ${bubble(stateStore.get("stagedGamesPlayers").size)}`;
    }
    if (el.gamesTitleTypes) {
        el.gamesTitleTypes.innerHTML = `By Game Type ${bubble(stateStore.get("stagedGamesTypes").size)}`;
    }
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

    const isGorgeous = (stateStore.get("gamesHistoryStyle") || "gorgeous") === "gorgeous";

    let activeCount = 0;
    activeCount += stateStore.get("activeGamesPlayers").size;
    activeCount += stateStore.get("activeGamesResults").size;
    activeCount += stateStore.get("activeGamesTypes").size;
    if (stateStore.get("activeGamesDateRange") !== "all") activeCount++;
    if (!isGorgeous && !stateStore.get("gamesUseHistorical")) activeCount++;

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
 * Updates the text displayed on the game history sort triggering button.
 */
export function updateGamesSortButtonText() {
    const el = getElements();
    if (!el.gamesSortTriggerBtn) return;

    const gamesSort = stateStore.get("gamesSort");
    const asc = stateStore.get("gamesSortAsc");

    let text = "Date (Newest)";
    if (gamesSort === "date") {
        text = asc ? "Date (Oldest)" : "Date (Newest)";
    } else if (gamesSort === "type") {
        text = asc ? "Game Type (A-Z)" : "Game Type (Z-A)";
    } else if (gamesSort === "status") {
        text = asc ? "Status (Completed first)" : "Status (Pending first)";
    } else if (gamesSort.startsWith("w")) {
        text = `${getGamesPlayerLabel(parseInt(gamesSort.substring(1), 10))} (Wins first)`;
    } else if (gamesSort.startsWith("g")) {
        text = `${getGamesPlayerLabel(parseInt(gamesSort.substring(1), 10))} (Games first)`;
    }

    el.gamesSortTriggerBtn.innerHTML = `<span class="action-icon">⇅</span> <strong style="font-weight: 700;">SORT:</strong> <span style="font-weight: 400; text-transform: none; margin-left: 2px;">${escapeHtml(text)}</span>`;
}

/**
 * Renders options inside the game history Sort Dropdown list element.
 */
export function renderGamesSortDropdownOptions() {
    const el = getElements();
    if (!el.gamesSortDropdownMenu) return;

    const gamesSort = stateStore.get("gamesSort");
    const asc = stateStore.get("gamesSortAsc");
    const isActive = (key, wantAsc) => (gamesSort === key && asc === wantAsc ? "active" : "");

    let html = `
        <div class="sort-dropdown-section-title">General</div>
        <button type="button" class="sort-dropdown-item ${isActive("date", false)}" data-action="select-games-sort" data-sort-key="date" data-sort-asc="false">
            Date (Newest first)
        </button>
        <button type="button" class="sort-dropdown-item ${isActive("date", true)}" data-action="select-games-sort" data-sort-key="date" data-sort-asc="true">
            Date (Oldest first)
        </button>
        <button type="button" class="sort-dropdown-item ${isActive("type", true)}" data-action="select-games-sort" data-sort-key="type" data-sort-asc="true">
            Game Type (A-Z)
        </button>
        <button type="button" class="sort-dropdown-item ${isActive("type", false)}" data-action="select-games-sort" data-sort-key="type" data-sort-asc="false">
            Game Type (Z-A)
        </button>
        <button type="button" class="sort-dropdown-item ${isActive("status", false)}" data-action="select-games-sort" data-sort-key="status" data-sort-asc="false">
            Status (Pending first)
        </button>
        <button type="button" class="sort-dropdown-item ${isActive("status", true)}" data-action="select-games-sort" data-sort-key="status" data-sort-asc="true">
            Status (Completed first)
        </button>
    `;

    for (let bucket = 0; bucket <= MAX_WEIGHTED_PLAYERS; bucket++) {
        const label = escapeHtml(getGamesPlayerLabel(bucket));
        html += `
            <div class="sort-dropdown-divider"></div>
            <div class="sort-dropdown-section-title" style="color: var(--p${bucket + 1}, #fff);">${label}</div>
            <button type="button" class="sort-dropdown-item ${isActive(`w${bucket}`, false)}" data-action="select-games-sort" data-sort-key="w${bucket}" data-sort-asc="false">
                Their wins first
            </button>
            <button type="button" class="sort-dropdown-item ${isActive(`g${bucket}`, false)}" data-action="select-games-sort" data-sort-key="g${bucket}" data-sort-asc="false">
                Their games first
            </button>
        `;
    }

    el.gamesSortDropdownMenu.innerHTML = html;
}

/**
 * Toggles the visibility of the game history sort dropdown menu.
 */
export function toggleGamesSortDropdown(event) {
    const el = getElements();
    if (!el.gamesSortDropdownMenu) return;

    event.stopPropagation();
    const isOpen = el.gamesSortDropdownMenu.classList.toggle("show");
    if (isOpen) {
        if (el.gamesSortTriggerBtn) el.gamesSortTriggerBtn.classList.add("active");
        renderGamesSortDropdownOptions();
    } else {
        if (el.gamesSortTriggerBtn) el.gamesSortTriggerBtn.classList.remove("active");
    }
}

/**
 * Closes the game history sort dropdown menu.
 */
export function closeGamesSortDropdown() {
    const el = getElements();
    if (el.gamesSortDropdownMenu) {
        el.gamesSortDropdownMenu.classList.remove("show");
    }
    if (el.gamesSortTriggerBtn) {
        el.gamesSortTriggerBtn.classList.remove("active");
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
 * Re-renders dynamic filter chip buttons based on active search terms, player selections, complexities, and group limits.
 */
export function updateActiveFilterChips() {
    const el = getElements();
    if (!el.activeFiltersContainer) return;

    const searchInput = el.heroSearchInput;
    const searchTerm = searchInput ? searchInput.value.trim() : "";

    const activeOwnershipFilter = stateStore.get("activeOwnershipFilter");
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

    if (activeOwnershipFilter && activeOwnershipFilter !== "all") {
        const label = activeOwnershipFilter === "owned" ? "Owned" : "Unowned";
        html += `
            <div class="filter-chip" title="Active Ownership Filter">
                <span class="filter-chip-remove" data-action="remove-filter-chip" data-type="ownership" data-value="${activeOwnershipFilter}" title="Remove filter">✖</span>
                <span class="filter-chip-label">${label}</span>
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
    el.activeFiltersContainer.classList.toggle("has-chips", !!html.trim());
}

/**
 * Re-renders the History page filter chips from the active search term, date range, historical
 * toggle, player, result, and game type selections.
 */
export function updateGamesActiveFilterChips() {
    const el = getElements();
    if (!el.gamesActiveFiltersContainer) return;

    const searchTerm = el.gamesSearchInput ? el.gamesSearchInput.value.trim() : "";
    const activeGamesDateRange = stateStore.get("activeGamesDateRange");
    const activeGamesPlayers = stateStore.get("activeGamesPlayers");
    const activeGamesResults = stateStore.get("activeGamesResults");
    const activeGamesTypes = stateStore.get("activeGamesTypes");
    const isGorgeous = (stateStore.get("gamesHistoryStyle") || "gorgeous") === "gorgeous";

    const chip = (label, action, attrs = "") => `
        <div class="filter-chip" title="Active Filter">
            <span class="filter-chip-remove" data-action="${action}" ${attrs} title="Remove filter">✖</span>
            <span class="filter-chip-label">${label}</span>
        </div>
    `;
    const removeChip = (type, value, label) =>
        chip(label, "remove-games-filter-chip", `data-type="${type}" data-value="${escapeHtml(String(value))}"`);

    const DATE_RANGE_LABEL = { "30d": "Last 30 days", "90d": "Last 90 days", year: "Last year" };
    const RESULT_LABEL = { win: "Win", loss: "Loss", draw: "Draw", pending: "In Progress" };
    const RESULT_ORDER = ["win", "loss", "draw", "pending"];
    const TYPE_ORDER = ["duel", "2v2", "3v3", "ffa", "koth", LEGACY_GAME_TYPE];

    let html = "";
    if (searchTerm) {
        html += chip(`Search: "${escapeHtml(searchTerm)}"`, "clear-games-search-filter");
    }

    if (activeGamesDateRange !== "all") {
        html += removeChip("date-range", activeGamesDateRange, DATE_RANGE_LABEL[activeGamesDateRange] || activeGamesDateRange);
    }

    if (!isGorgeous && !stateStore.get("gamesUseHistorical")) {
        html += removeChip("historical", "exclude", "Historical hidden");
    }

    Array.from(activeGamesPlayers)
        .sort((a, b) => a - b)
        .forEach((bucket) => {
            html += removeChip("player", bucket, escapeHtml(getGamesPlayerLabel(bucket)));
        });

    RESULT_ORDER.filter((r) => activeGamesResults.has(r)).forEach((result) => {
        html += removeChip("result", result, RESULT_LABEL[result]);
    });

    TYPE_ORDER.filter((t) => activeGamesTypes.has(t)).forEach((type) => {
        html += removeChip("type", type, GAME_TYPE_FULL_LABEL[type] || "Legacy (no type)");
    });

    el.gamesActiveFiltersContainer.innerHTML = html;
    el.gamesActiveFiltersContainer.classList.toggle("has-chips", !!html.trim());
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
