/**
 * @fileoverview Logic for hero listing layout rendering, table sort columns, sidebar drawers, active filter chips, search queries, and recency calculations.
 * @module filters
 */
import { isHeroOwned, parseDateString, getDaysAgoClean, getRecencyDot, matchesGameFilters } from './utils.js';
import { renderGamesList, setOwnershipFilter as adminSetOwnershipFilter } from './admin.js';
import { updateRollSettingsBadge } from './randomizer.js';


import * as stateStore from './stateStore.js';
import * as filterView from './views/filterView.js';

export function toggleSortSection() {
    filterView.toggleSortSection();
}
export function toggleFilterSection() {
    filterView.toggleFilterSection();
}
export function openSortFilterDrawer() {
    stateStore.set("currentDrawerMode", "sort-filter");

    // Stage current states
    stateStore.set("stagedSort", stateStore.get("currentSort"));
    stateStore.set("stagedSortAsc", stateStore.get("sortAsc"));
    stateStore.set("stagedSortPlayerIndex", stateStore.get("currentSortPlayerIndex"));
    stateStore.set("stagedLevels", new Set(stateStore.get("activeLevels")));
    stateStore.set("stagedGroups", new Set(stateStore.get("activeGroups")));

    filterView.openSortFilterDrawer();
}
export function openFilterDrawer() {
    stateStore.set("stagedFilterDataHistories", new Set(stateStore.get("activeFilterDataHistories")));
    stateStore.set("stagedFilterPlayers", new Set(stateStore.get("activeFilterPlayers")));
    stateStore.set("stagedFilterComplexities", new Set(stateStore.get("activeFilterComplexities")));
    stateStore.set("stagedFilterGroups", new Set(stateStore.get("activeFilterGroups")));
    stateStore.set("stagedOwnershipFilter", stateStore.get("activeOwnershipFilter"));

    filterView.openFilterDrawer();
}
export function handleFilterDrawerOwnershipPillClick(filter) {
    stateStore.set("stagedOwnershipFilter", filter);
    filterView.updateOwnershipPillsUI();
    filterView.updateFilterDrawerHeroCountUI();
}
export function closeFilterDrawer(event = null, force = false) {
    filterView.closeFilterDrawer(event, force);
}
export function renderFilterDrawerDynamicSections() {
    filterView.renderFilterDrawerDynamicSections();
}
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

    filterView.updateFilterDrawerHeroCountUI();
    filterView.updateFilterDrawerSectionTitlesUI();
}
export function resetFilterPanelSelections() {
    stateStore.get("stagedFilterDataHistories").clear();
    stateStore.get("stagedFilterPlayers").clear();
    stateStore.get("stagedFilterComplexities").clear();
    stateStore.get("stagedFilterGroups").clear();
    stateStore.set("stagedOwnershipFilter", "all");

    const checkboxes = document.querySelectorAll('#filter-drawer-left input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });

    filterView.updateOwnershipPillsUI();
    filterView.updateFilterDrawerHeroCountUI();
    filterView.updateFilterDrawerSectionTitlesUI();
}
export function applyFilterPanelSelections() {
    stateStore.set("activeFilterDataHistories", new Set(stateStore.get("stagedFilterDataHistories")));
    stateStore.set("activeFilterPlayers", new Set(stateStore.get("stagedFilterPlayers")));
    stateStore.set("activeFilterComplexities", new Set(stateStore.get("stagedFilterComplexities")));
    stateStore.set("activeFilterGroups", new Set(stateStore.get("stagedFilterGroups")));

    const stagedOwnership = stateStore.get("stagedOwnershipFilter");
    stateStore.set("activeOwnershipFilter", stagedOwnership);
    adminSetOwnershipFilter(stagedOwnership);

    closeFilterDrawer(null, true);

    renderList();

    updateActiveFilterBadge();
    updateActiveFilterChips();
}
export function getFilterDrawerMatchingCount() {
    const searchTerm = document.getElementById("hero-search")?.value.toLowerCase() || "";
    const stagedOwnership = stateStore.get("stagedOwnershipFilter");
    const showOwned = stagedOwnership === "owned" || stagedOwnership === "all";
    const showNotOwned = stagedOwnership === "unowned" || stagedOwnership === "all";
    const characters = stateStore.get("characters");
    const games = stateStore.get("games");
    const stagedFilterComplexities = stateStore.get("stagedFilterComplexities");
    const stagedFilterGroups = stateStore.get("stagedFilterGroups");
    const stagedFilterDataHistories = stateStore.get("stagedFilterDataHistories");
    const stagedFilterPlayers = stateStore.get("stagedFilterPlayers");

    const matched = characters.filter((c) => {
        let complexityMatch = true;
        if (stagedFilterComplexities.size > 0) {
            complexityMatch = stagedFilterComplexities.has(Number(c.complexity));
        }

        let groupFilterMatch = true;
        if (stagedFilterGroups.size > 0) {
            groupFilterMatch = stagedFilterGroups.has(c.group_id);
        }

        let dataHistoryMatch = true;
        const hasNormalOnlyStaged = stagedFilterDataHistories.has("Normal only");
        const hasHistoricalOnlyStaged = stagedFilterDataHistories.has("Historical only");
        if (hasNormalOnlyStaged && !hasHistoricalOnlyStaged) {
            const heroGames = games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
            dataHistoryMatch = heroGames.some(g => !g.is_historical);
        } else if (hasHistoricalOnlyStaged && !hasNormalOnlyStaged) {
            const heroGames = games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
            dataHistoryMatch = heroGames.some(g => g.is_historical);
        }

        let playersMatch = true;
        if (stagedFilterPlayers.size > 0) {
            const heroGames = games.filter(g => g.game_players.some(gp => gp.hero_id === c.id));
            const playedBySelected = heroGames.some(g => 
                g.game_players.some(gp => gp.hero_id === c.id && stagedFilterPlayers.has(gp.player_id))
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

    return matched.length;
}
export function updateFilterDrawerHeroCountUI() {
    filterView.updateFilterDrawerHeroCountUI();
}
export function updateFilterDrawerSectionTitlesUI() {
    filterView.updateFilterDrawerSectionTitlesUI();
}
export function closeDrawer(event = null, force = false) {
    filterView.closeDrawer(event, force);
}
export function renderDrawerBody() {
    filterView.renderDrawerBody();
}

// ============================================================
// Game History filters (left drawer, sort dropdown, chips)
// ============================================================

/**
 * Opens the Game History Filters drawer, staging the currently applied selections.
 */
export function openGamesFilterDrawer() {
    stateStore.set("stagedGamesPlayers", new Set(stateStore.get("activeGamesPlayers")));
    stateStore.set("stagedGamesResults", new Set(stateStore.get("activeGamesResults")));
    stateStore.set("stagedGamesTypes", new Set(stateStore.get("activeGamesTypes")));
    stateStore.set("stagedGamesDateRange", stateStore.get("activeGamesDateRange"));
    stateStore.set("stagedGamesUseHistorical", stateStore.get("gamesUseHistorical"));

    filterView.openGamesFilterDrawer();
}
export function closeGamesFilterDrawer(event = null, force = false) {
    filterView.closeGamesFilterDrawer(event, force);
}

/**
 * Applies a checkbox change inside the Game History Filters drawer to the staged selections.
 * @param {HTMLInputElement} checkbox - The checkbox that changed.
 */
export function handleGamesFilterDrawerCheckboxChange(checkbox) {
    const type = checkbox.getAttribute("data-type");
    const checked = checkbox.checked;
    const action = checked ? "add" : "delete";

    if (type === "games-player") {
        stateStore.updateSet("stagedGamesPlayers", action, Number(checkbox.value));
        // Win / Loss are only meaningful in a player context, so drop them when the last
        // player is unticked, mirroring how the drawer disables those checkboxes.
        if (stateStore.get("stagedGamesPlayers").size === 0) {
            stateStore.updateSet("stagedGamesResults", "delete", "win");
            stateStore.updateSet("stagedGamesResults", "delete", "loss");
            filterView.renderGamesFilterDrawerDynamicSections();
        } else {
            filterView.updateGamesResultAvailabilityUI();
        }
    } else if (type === "games-result") {
        stateStore.updateSet("stagedGamesResults", action, checkbox.value);
    } else if (type === "games-type") {
        stateStore.updateSet("stagedGamesTypes", action, checkbox.value);
    } else if (type === "games-historical") {
        stateStore.set("stagedGamesUseHistorical", checked);
        filterView.renderGamesFilterDrawerDynamicSections();
    }

    filterView.updateGamesFilterDrawerCountUI();
    filterView.updateGamesFilterDrawerSectionTitlesUI();
}

/**
 * Stages a date range selection from the drawer's segmented control.
 * @param {string} range - 'all' | '30d' | '90d' | 'year'.
 */
export function handleGamesDateRangePillClick(range) {
    stateStore.set("stagedGamesDateRange", range);
    filterView.updateGamesDateRangePillsUI();
    filterView.updateGamesFilterDrawerCountUI();
    filterView.updateGamesFilterDrawerSectionTitlesUI();
}

/**
 * Clears every staged selection in the Game History Filters drawer.
 */
export function resetGamesFilterPanelSelections() {
    stateStore.get("stagedGamesPlayers").clear();
    stateStore.get("stagedGamesResults").clear();
    stateStore.get("stagedGamesTypes").clear();
    stateStore.set("stagedGamesDateRange", "all");
    stateStore.set("stagedGamesUseHistorical", true);

    filterView.renderGamesFilterDrawerDynamicSections();
    filterView.updateGamesDateRangePillsUI();
    filterView.updateGamesFilterDrawerCountUI();
    filterView.updateGamesFilterDrawerSectionTitlesUI();
}

/**
 * Commits the staged selections, closes the drawer, and re-renders the history list.
 */
export function applyGamesFilterPanelSelections() {
    stateStore.set("activeGamesPlayers", new Set(stateStore.get("stagedGamesPlayers")));
    stateStore.set("activeGamesResults", new Set(stateStore.get("stagedGamesResults")));
    stateStore.set("activeGamesTypes", new Set(stateStore.get("stagedGamesTypes")));
    stateStore.set("activeGamesDateRange", stateStore.get("stagedGamesDateRange"));
    stateStore.set("gamesUseHistorical", stateStore.get("stagedGamesUseHistorical"));

    closeGamesFilterDrawer(null, true);

    renderGamesList();
}

/**
 * Counts the games matching the drawer's staged selections, for its live header count.
 * @returns {number}
 */
export function getGamesFilterDrawerMatchingCount() {
    const games = stateStore.get("games") || [];
    const isGorgeous = (stateStore.get("gamesHistoryStyle") || "gorgeous") === "gorgeous";
    const searchInput = document.getElementById("games-search");

    const criteria = {
        searchTerm: searchInput ? searchInput.value : "",
        useHistorical: stateStore.get("stagedGamesUseHistorical"),
        playerIndices: stateStore.get("stagedGamesPlayers"),
        results: stateStore.get("stagedGamesResults"),
        gameTypes: stateStore.get("stagedGamesTypes"),
        dateRange: stateStore.get("stagedGamesDateRange"),
        names: stateStore.get("NAMES"),
    };

    return games.filter((game) => {
        if (isGorgeous && game.is_historical) return false;
        return matchesGameFilters(game, criteria);
    }).length;
}

/**
 * Applies a sort selection from the history sort dropdown.
 * @param {string} key - Sort key.
 * @param {boolean} asc - Sort direction.
 */
export function selectGamesSortOption(key, asc) {
    stateStore.set("gamesSort", key);
    stateStore.set("gamesSortAsc", asc);

    closeGamesSortDropdown();
    renderGamesList();
}
export function toggleGamesSortDropdown(event) {
    filterView.toggleGamesSortDropdown(event);
}
export function closeGamesSortDropdown() {
    filterView.closeGamesSortDropdown();
}

/**
 * Removes a single active History filter from its breadcrumb chip.
 * @param {string} type - 'date-range' | 'historical' | 'player' | 'result' | 'type'.
 * @param {string} val - The chip's value.
 */
export function removeGamesFilterChip(type, val) {
    if (type === "date-range") {
        stateStore.set("activeGamesDateRange", "all");
        stateStore.set("stagedGamesDateRange", "all");
    } else if (type === "historical") {
        stateStore.set("gamesUseHistorical", true);
        stateStore.set("stagedGamesUseHistorical", true);
    } else if (type === "player") {
        stateStore.updateSet("activeGamesPlayers", "delete", Number(val));
        stateStore.updateSet("stagedGamesPlayers", "delete", Number(val));
        // Win / Loss lose their meaning once the last player is gone.
        if (stateStore.get("activeGamesPlayers").size === 0) {
            ["win", "loss"].forEach((result) => {
                stateStore.updateSet("activeGamesResults", "delete", result);
                stateStore.updateSet("stagedGamesResults", "delete", result);
            });
        }
    } else if (type === "result") {
        stateStore.updateSet("activeGamesResults", "delete", val);
        stateStore.updateSet("stagedGamesResults", "delete", val);
    } else if (type === "type") {
        stateStore.updateSet("activeGamesTypes", "delete", val);
        stateStore.updateSet("stagedGamesTypes", "delete", val);
    }

    filterView.renderGamesFilterDrawerDynamicSections();
    filterView.updateGamesDateRangePillsUI();
    renderGamesList();
}

/**
 * Clears the History search box from its breadcrumb chip.
 */
export function clearGamesSearchFilter() {
    const searchInput = document.getElementById("games-search");
    if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }
    document.getElementById("clear-games-search")?.classList.add("hidden");
    renderGamesList();
}
export function handleDrawerSortTypeChange(value) {
    if (value === "name") {
        stateStore.set("stagedSort", "name");
    } else if (value === "group") {
        stateStore.set("stagedSort", "group");
    } else if (value === "probability") {
        stateStore.set("stagedSort", `w${stateStore.get("stagedSortPlayerIndex")}`);
    } else if (value === "lastPlayed") {
        stateStore.set("stagedSort", `d${stateStore.get("stagedSortPlayerIndex")}`);
    }

    stateStore.set("stagedSortAsc", value === "name" || value === "group");
    filterView.updateDrawerSortDirectionUI();
    filterView.updateDrawerPlayerSortPillsUI();
}
export function toggleDrawerSortDirection() {
    stateStore.set("stagedSortAsc", !stateStore.get("stagedSortAsc"));
    filterView.updateDrawerSortDirectionUI();
}
export function updateDrawerSortDirectionUI() {
    filterView.updateDrawerSortDirectionUI();
}
export function updateDrawerPlayerSortPillsUI() {
    filterView.updateDrawerPlayerSortPillsUI();
}
export function handleDrawerSortPlayerChange(playerIndex) {
    stateStore.set("stagedSortPlayerIndex", playerIndex);
    const stagedSort = stateStore.get("stagedSort");
    if (stagedSort.startsWith("w")) {
        stateStore.set("stagedSort", `w${playerIndex}`);
    } else if (stagedSort.startsWith("d")) {
        stateStore.set("stagedSort", `d${playerIndex}`);
    }
    filterView.updateDrawerPlayerSortPillsUI();
}
export function renderDrawerComplexityFilters() {
    filterView.renderDrawerComplexityFilters();
}
export function toggleDrawerLevel(level) {
    if (level === "all") {
        stateStore.set("stagedLevels", stateStore.get("stagedLevels").size === 6 ? new Set() : new Set([1, 2, 3, 4, 5, 6]));
    } else {
        stateStore.updateSet("stagedLevels", "toggle", level);
    }
    filterView.renderDrawerComplexityFilters();
    filterView.renderDrawerGroupFilters();
}
export function renderDrawerGroupFilters() {
    filterView.renderDrawerGroupFilters();
}
export function toggleDrawerGroupFilter(groupId) {
    const groups = stateStore.get("groups");
    if (groupId === "all") {
        if (stateStore.get("stagedGroups").size === groups.length) {
            stateStore.updateSet("stagedGroups", "clear");
        } else {
            groups.forEach((g) => stateStore.updateSet("stagedGroups", "add", g.id));
        }
    } else {
        stateStore.updateSet("stagedGroups", "toggle", groupId);
    }
    filterView.renderDrawerComplexityFilters();
    filterView.renderDrawerGroupFilters();
}
export function resetFilters() {
    const groups = stateStore.get("groups");
    const currentDrawerMode = stateStore.get("currentDrawerMode");
    if (currentDrawerMode === "sort-filter") {
        stateStore.set("stagedSort", "name");
        stateStore.set("stagedSortAsc", true);
        stateStore.set("stagedSortPlayerIndex", 0);
        stateStore.set("stagedLevels", new Set([1, 2, 3, 4, 5, 6]));
        stateStore.set("stagedGroups", new Set(groups.map((g) => g.id)));
        renderDrawerBody();
    } else if (currentDrawerMode === "roll-settings") {
        stateStore.set("stagedBannedHeroIds", new Set());
        stateStore.set("stagedBanSearchQuery", "");
        renderDrawerBody();
    }
}
export function applyAndCloseDrawer() {
    const currentDrawerMode = stateStore.get("currentDrawerMode");
    if (currentDrawerMode === "sort-filter") {
        stateStore.set("currentSort", stateStore.get("stagedSort"));
        stateStore.set("sortAsc", stateStore.get("stagedSortAsc"));
        stateStore.set("currentSortPlayerIndex", stateStore.get("stagedSortPlayerIndex"));
        stateStore.set("activeLevels", new Set(stateStore.get("stagedLevels")));
        stateStore.set("activeGroups", new Set(stateStore.get("stagedGroups")));
        updateActiveFilterBadge();
        closeDrawer(null, true);
        renderList();
    } else if (currentDrawerMode === "roll-settings") {
        stateStore.set("bannedHeroIds", new Set(stateStore.get("stagedBannedHeroIds")));

        localStorage.setItem(
            "bannedHeroIds",
            JSON.stringify(Array.from(stateStore.get("bannedHeroIds"))),
        );

        updateRollSettingsBadge();
        closeDrawer(null, true);
    }
}
export function updateActiveFilterBadge() {
    filterView.updateActiveFilterBadge();
}
export function updateSegmentedHighlights() {
    filterView.updateSegmentedHighlights();
}
export function setSort(key) {
    const currentSort = stateStore.get("currentSort");
    const sortAsc = stateStore.get("sortAsc");
    if (currentSort === key) {
        stateStore.set("sortAsc", !sortAsc);
    } else {
        stateStore.set("currentSort", key);
        stateStore.set("sortAsc", true);
    }
    updateSortButtonText();
    renderList();
}
export function getVisiblePlayerIndices() {
    return stateStore.get("activePlayerIndices");
}
export function updateSortButtonText() {
    filterView.updateSortButtonText();
}
export function renderSortDropdownOptions() {
    filterView.renderSortDropdownOptions();
}
export function toggleSortDropdown(event) {
    filterView.toggleSortDropdown(event);
}
export function closeSortDropdown() {
    filterView.closeSortDropdown();
}
export function selectSortOption(key, asc) {
    stateStore.set("currentSort", key);
    stateStore.set("sortAsc", asc);

    if (key.startsWith("w")) {
        stateStore.set("currentSortPlayerIndex", parseInt(key.substring(1)));
    } else if (key.startsWith("d")) {
        stateStore.set("currentSortPlayerIndex", parseInt(key.substring(1)));
    }

    closeSortDropdown();
    updateSortButtonText();
    renderList();
}
export function handleSearchInput() {
    const searchInput = document.getElementById("hero-search");
    const clearBtn = document.getElementById("clear-search");
    if (searchInput && clearBtn) {
        clearBtn.classList.toggle("hidden", searchInput.value.trim().length === 0);
    }
}
export function clearSearch() {
    const searchInput = document.getElementById("hero-search");
    if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }
    handleSearchInput();
    triggerSearch();
}
export function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
        triggerSearch();
    } else if (event.key === "Escape") {
        clearSearch();
    }
}
export function triggerSearch() {
    renderList();
    updateActiveFilterChips();
}
export function updateActiveFilterChips() {
    filterView.updateActiveFilterChips();
}
export function removeFilterChip(type, val) {
    if (type === 'data-history') {
        stateStore.updateSet("activeFilterDataHistories", "delete", val);
    } else if (type === 'player') {
        stateStore.updateSet("activeFilterPlayers", "delete", val);
    } else if (type === 'complexity') {
        stateStore.updateSet("activeFilterComplexities", "delete", val);
    } else if (type === 'group') {
        stateStore.updateSet("activeFilterGroups", "delete", val);
    } else if (type === 'ownership') {
        stateStore.set("activeOwnershipFilter", "all");
        stateStore.set("stagedOwnershipFilter", "all");
        const ownedCb = document.getElementById("db-show-owned");
        const unownedCb = document.getElementById("db-show-not-owned");
        if (ownedCb) ownedCb.checked = true;
        if (unownedCb) unownedCb.checked = true;
    }

    // Uncheck in Left Drawer (only applies to checkbox-based filters)
    if (type !== 'ownership') {
        const cb = document.querySelector(`#filter-drawer-left input[value="${val}"][data-type="${type}"]`);
        if (cb) cb.checked = false;
    }

    renderList();
    updateActiveFilterChips();
    updateActiveFilterBadge();
}
export function clearSearchFilter() {
    clearSearch();
}
export function renderList() {
    filterView.renderList();
}
export function matchesSearchTerm(c, term) {
    if (!term) return true;
    const clean = term.trim().toLowerCase();
    return (
        (c.name || "").toLowerCase().includes(clean) ||
        (c.group || "").toLowerCase().includes(clean)
    );
}
