/**
 * @fileoverview Logic for hero listing layout rendering, table sort columns, sidebar drawers, active filter chips, search queries, and recency calculations.
 * @module filters
 */

import * as stateStore from './stateStore.js';
import * as filterView from './views/filterView.js';

export function toggleSortSection() {
    filterView.toggleSortSection();
}
window.toggleSortSection = toggleSortSection;

export function toggleFilterSection() {
    filterView.toggleFilterSection();
}
window.toggleFilterSection = toggleFilterSection;

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
window.openSortFilterDrawer = openSortFilterDrawer;

export function openColumnsDrawer() {
    stateStore.set("currentDrawerMode", "columns");

    // Stage current states
    stateStore.set("stagedPlayerIndices", [...stateStore.get("activePlayerIndices")]);
    stateStore.set("stagedUseHistorical", stateStore.get("dbUseHistorical"));

    filterView.openColumnsDrawer();
}
window.openColumnsDrawer = openColumnsDrawer;

export function openHistoryFilterDrawer() {
    stateStore.set("currentDrawerMode", "history-filter");

    // Stage current states
    stateStore.set("stagedSelectedGamePlayerIndex", stateStore.get("selectedGamePlayerIndex"));
    stateStore.set("stagedGamesWinnerOnly", stateStore.get("gamesWinnerOnly"));
    stateStore.set("stagedGamesUseHistorical", stateStore.get("gamesUseHistorical"));

    filterView.openHistoryFilterDrawer();
}
window.openHistoryFilterDrawer = openHistoryFilterDrawer;

export function openFilterDrawer() {
    stateStore.set("stagedFilterDataHistories", new Set(stateStore.get("activeFilterDataHistories")));
    stateStore.set("stagedFilterPlayers", new Set(stateStore.get("activeFilterPlayers")));
    stateStore.set("stagedFilterComplexities", new Set(stateStore.get("activeFilterComplexities")));
    stateStore.set("stagedFilterGroups", new Set(stateStore.get("activeFilterGroups")));

    filterView.openFilterDrawer();
}
window.openFilterDrawer = openFilterDrawer;

export function closeFilterDrawer(event = null, force = false) {
    filterView.closeFilterDrawer(event, force);
}
window.closeFilterDrawer = closeFilterDrawer;

export function renderFilterDrawerDynamicSections() {
    filterView.renderFilterDrawerDynamicSections();
}
window.renderFilterDrawerDynamicSections = renderFilterDrawerDynamicSections;

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
window.handleFilterDrawerCheckboxChange = handleFilterDrawerCheckboxChange;

export function resetFilterPanelSelections() {
    stateStore.get("stagedFilterDataHistories").clear();
    stateStore.get("stagedFilterPlayers").clear();
    stateStore.get("stagedFilterComplexities").clear();
    stateStore.get("stagedFilterGroups").clear();

    const checkboxes = document.querySelectorAll('#filter-drawer-left input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });

    filterView.updateFilterDrawerHeroCountUI();
    filterView.updateFilterDrawerSectionTitlesUI();
}
window.resetFilterPanelSelections = resetFilterPanelSelections;

export function applyFilterPanelSelections() {
    stateStore.set("activeFilterDataHistories", new Set(stateStore.get("stagedFilterDataHistories")));
    stateStore.set("activeFilterPlayers", new Set(stateStore.get("stagedFilterPlayers")));
    stateStore.set("activeFilterComplexities", new Set(stateStore.get("stagedFilterComplexities")));
    stateStore.set("activeFilterGroups", new Set(stateStore.get("stagedFilterGroups")));

    stateStore.set("dbUseHistorical", !stateStore.get("activeFilterDataHistories").has("Normal only") || stateStore.get("activeFilterDataHistories").has("Historical only"));

    closeFilterDrawer(null, true);
    
    renderList();

    updateActiveFilterBadge();
    updateActiveFilterChips();
}
window.applyFilterPanelSelections = applyFilterPanelSelections;

export function getFilterDrawerMatchingCount() {
    const searchTerm = document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned = document.getElementById("db-show-not-owned")?.checked ?? false;
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

export function updateFilterDrawerHeroCountUI() {
    filterView.updateFilterDrawerHeroCountUI();
}
window.updateFilterDrawerHeroCountUI = updateFilterDrawerHeroCountUI;

export function updateFilterDrawerSectionTitlesUI() {
    filterView.updateFilterDrawerSectionTitlesUI();
}
window.updateFilterDrawerSectionTitlesUI = updateFilterDrawerSectionTitlesUI;

export function closeDrawer(event = null, force = false) {
    filterView.closeDrawer(event, force);
}
window.closeDrawer = closeDrawer;

export function renderDrawerBody() {
    filterView.renderDrawerBody();
}
window.renderDrawerBody = renderDrawerBody;

export function renderHistoryFilterDrawerBody(body) {
    filterView.renderHistoryFilterDrawerBody(body);
}
window.renderHistoryFilterDrawerBody = renderHistoryFilterDrawerBody;

export function toggleStagedPlayerGameFilter(idx) {
    const stagedSelectedGamePlayerIndex = stateStore.get("stagedSelectedGamePlayerIndex");
    if (stagedSelectedGamePlayerIndex === idx) {
        stateStore.set("stagedSelectedGamePlayerIndex", null);
    } else {
        stateStore.set("stagedSelectedGamePlayerIndex", idx);
    }

    if (stateStore.get("stagedSelectedGamePlayerIndex") === null) {
        stateStore.set("stagedGamesWinnerOnly", false);
    }

    renderDrawerBody();
}
window.toggleStagedPlayerGameFilter = toggleStagedPlayerGameFilter;

export function toggleStagedGamesHistorical(checked) {
    stateStore.set("stagedGamesUseHistorical", checked);
    renderDrawerBody();
}
window.toggleStagedGamesHistorical = toggleStagedGamesHistorical;

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
window.handleDrawerSortTypeChange = handleDrawerSortTypeChange;

export function toggleDrawerSortDirection() {
    stateStore.set("stagedSortAsc", !stateStore.get("stagedSortAsc"));
    filterView.updateDrawerSortDirectionUI();
}
window.toggleDrawerSortDirection = toggleDrawerSortDirection;

export function updateDrawerSortDirectionUI() {
    filterView.updateDrawerSortDirectionUI();
}
window.updateDrawerSortDirectionUI = updateDrawerSortDirectionUI;

export function updateDrawerPlayerSortPillsUI() {
    filterView.updateDrawerPlayerSortPillsUI();
}
window.updateDrawerPlayerSortPillsUI = updateDrawerPlayerSortPillsUI;

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
window.handleDrawerSortPlayerChange = handleDrawerSortPlayerChange;

export function toggleDrawerPlayerFilter(playerIndex) {
    const stagedPlayerIndices = stateStore.get("stagedPlayerIndices");
    const idx = stagedPlayerIndices.indexOf(playerIndex);
    if (idx > -1) {
        stagedPlayerIndices.splice(idx, 1);
    } else {
        stagedPlayerIndices.push(playerIndex);
    }
    stateStore.set("stagedPlayerIndices", stagedPlayerIndices);
    renderDrawerBody();
}
window.toggleDrawerPlayerFilter = toggleDrawerPlayerFilter;

export function renderDrawerComplexityFilters() {
    filterView.renderDrawerComplexityFilters();
}
window.renderDrawerComplexityFilters = renderDrawerComplexityFilters;

export function toggleDrawerLevel(level) {
    if (level === "all") {
        stateStore.set("stagedLevels", stateStore.get("stagedLevels").size === 6 ? new Set() : new Set([1, 2, 3, 4, 5, 6]));
    } else {
        stateStore.updateSet("stagedLevels", "toggle", level);
    }
    filterView.renderDrawerComplexityFilters();
    filterView.renderDrawerGroupFilters();
}
window.toggleDrawerLevel = toggleDrawerLevel;

export function renderDrawerGroupFilters() {
    filterView.renderDrawerGroupFilters();
}
window.renderDrawerGroupFilters = renderDrawerGroupFilters;

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
window.toggleDrawerGroupFilter = toggleDrawerGroupFilter;

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
    } else if (currentDrawerMode === "columns") {
        stateStore.set("stagedPlayerIndices", [0, 1, 2, 3]);
        stateStore.set("stagedUseHistorical", true);
        renderDrawerBody();
    } else if (currentDrawerMode === "history-filter") {
        stateStore.set("stagedSelectedGamePlayerIndex", null);
        stateStore.set("stagedGamesWinnerOnly", false);
        stateStore.set("stagedGamesUseHistorical", true);
        renderDrawerBody();
    } else if (currentDrawerMode === "roll-settings") {
        stateStore.set("stagedDraftModeEnabled", false);
        stateStore.set("stagedDraftCount", 3);
        stateStore.set("stagedBannedHeroIds", new Set());
        stateStore.set("stagedBanSearchQuery", "");
        renderDrawerBody();
    }
}
window.resetFilters = resetFilters;

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
    } else if (currentDrawerMode === "columns") {
        stateStore.set("activePlayerIndices", [...stateStore.get("stagedPlayerIndices")]);
        stateStore.set("dbUseHistorical", stateStore.get("stagedUseHistorical"));
        updateActiveFilterBadge();
        closeDrawer(null, true);
        renderList();
    } else if (currentDrawerMode === "history-filter") {
        stateStore.set("selectedGamePlayerIndex", stateStore.get("stagedSelectedGamePlayerIndex"));
        stateStore.set("gamesWinnerOnly", stateStore.get("stagedGamesWinnerOnly"));
        stateStore.set("gamesUseHistorical", stateStore.get("stagedGamesUseHistorical"));
        updateGamesActiveFilterBadge();
        closeDrawer(null, true);
        if (typeof window.renderGamesList === "function") window.renderGamesList();
    } else if (currentDrawerMode === "roll-settings") {
        stateStore.set("draftModeEnabled", stateStore.get("stagedDraftModeEnabled"));
        stateStore.set("draftCount", stateStore.get("stagedDraftCount"));
        stateStore.set("bannedHeroIds", new Set(stateStore.get("stagedBannedHeroIds")));

        localStorage.setItem("draftModeEnabled", stateStore.get("draftModeEnabled"));
        localStorage.setItem("draftCount", stateStore.get("draftCount"));
        localStorage.setItem(
            "bannedHeroIds",
            JSON.stringify(Array.from(stateStore.get("bannedHeroIds"))),
        );

        if (typeof window.updateRollSettingsBadge === "function") {
            window.updateRollSettingsBadge();
        }
        closeDrawer(null, true);
    }
}
window.applyAndCloseDrawer = applyAndCloseDrawer;

export function updateActiveFilterBadge() {
    filterView.updateActiveFilterBadge();
}
window.updateActiveFilterBadge = updateActiveFilterBadge;

export function updateGamesActiveFilterBadge() {
    filterView.updateGamesActiveFilterBadge();
}
window.updateGamesActiveFilterBadge = updateGamesActiveFilterBadge;

export function updateSegmentedHighlights() {
    filterView.updateSegmentedHighlights();
}
window.updateSegmentedHighlights = updateSegmentedHighlights;

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
window.setSort = setSort;

export function getVisiblePlayerIndices() {
    return stateStore.get("activePlayerIndices");
}
window.getVisiblePlayerIndices = getVisiblePlayerIndices;

export function updateSortButtonText() {
    filterView.updateSortButtonText();
}
window.updateSortButtonText = updateSortButtonText;

export function renderSortDropdownOptions() {
    filterView.renderSortDropdownOptions();
}
window.renderSortDropdownOptions = renderSortDropdownOptions;

export function toggleSortDropdown(event) {
    filterView.toggleSortDropdown(event);
}
window.toggleSortDropdown = toggleSortDropdown;

export function closeSortDropdown() {
    filterView.closeSortDropdown();
}
window.closeSortDropdown = closeSortDropdown;

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
window.selectSortOption = selectSortOption;

export function handleSearchInput() {
    const searchInput = document.getElementById("hero-search");
    const clearBtn = document.getElementById("clear-search");
    if (searchInput && clearBtn) {
        clearBtn.classList.toggle("hidden", searchInput.value.trim().length === 0);
    }
}
window.handleSearchInput = handleSearchInput;

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

export function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
        triggerSearch();
    } else if (event.key === "Escape") {
        clearSearch();
    }
}
window.handleSearchKeyDown = handleSearchKeyDown;

export function triggerSearch() {
    renderList();
    updateActiveFilterChips();
}
window.triggerSearch = triggerSearch;

export function updateActiveFilterChips() {
    filterView.updateActiveFilterChips();
}
window.updateActiveFilterChips = updateActiveFilterChips;

export function removeFilterChip(type, val) {
    if (type === 'data-history') {
        stateStore.updateSet("activeFilterDataHistories", "delete", val);
        stateStore.set("dbUseHistorical", !stateStore.get("activeFilterDataHistories").has("Normal only") || stateStore.get("activeFilterDataHistories").has("Historical only"));
    } else if (type === 'player') {
        stateStore.updateSet("activeFilterPlayers", "delete", val);
    } else if (type === 'complexity') {
        stateStore.updateSet("activeFilterComplexities", "delete", val);
    } else if (type === 'group') {
        stateStore.updateSet("activeFilterGroups", "delete", val);
    }
    
    // Uncheck in Left Drawer
    const cb = document.querySelector(`#filter-drawer-left input[value="${val}"][data-type="${type}"]`);
    if (cb) cb.checked = false;

    renderList();
    updateActiveFilterChips();
    updateActiveFilterBadge();
}
window.removeFilterChip = removeFilterChip;

export function clearSearchFilter() {
    clearSearch();
}
window.clearSearchFilter = clearSearchFilter;

export function renderList() {
    filterView.renderList();
}
window.renderList = renderList;

export function matchesSearchTerm(c, term) {
    if (!term) return true;
    const clean = term.trim().toLowerCase();
    return (
        (c.name || "").toLowerCase().includes(clean) ||
        (c.group || "").toLowerCase().includes(clean)
    );
}
window.matchesSearchTerm = matchesSearchTerm;

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
