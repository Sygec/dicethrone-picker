/**
 * @fileoverview Programmatic event bindings and event delegation setup.
 * @module eventBindings
 */

import * as randomizer from './randomizer.js';
import * as filters from './filters.js';
import * as admin from './admin.js';
import * as auth from './auth.js';
import * as stateStore from './stateStore.js';
import { handlePlayerColorChange, showConfirm } from './utils.js';

export function setupAllEventBindings() {
    // Helper to bind clicks on static elements
    const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", fn);
    };

    // 1. Static Button Clicks
    bindClick("rollBtn", randomizer.pickCharactersNormal);
    bindClick("rollDraftBtn", randomizer.pickCharactersDraft);
    bindClick("rollSettingsBtn", randomizer.openRollSettingsDrawer);
    bindClick("cancelBtn", randomizer.cancelRoll);
    bindClick("confirmBtn", randomizer.applyResults);
    bindClick("clear-search", filters.clearSearch);
    bindClick("hero-search-btn", filters.triggerSearch);
    bindClick("btn-trigger-sort", filters.toggleSortDropdown);
    bindClick("btn-trigger-filter", filters.openFilterDrawer);
    bindClick("clear-games-search", admin.clearGamesSearch);
    bindClick("btn-trigger-games-filter", filters.openHistoryFilterDrawer);

    // Bottom tab navigation
    document.querySelectorAll(".bottom-nav .nav-item").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const section = el.getAttribute("data-section");
            if (section) admin.showSection(section);
        });
    });

    // Version label and changelog
    const versionNum = document.getElementById("version-number");
    if (versionNum) versionNum.addEventListener("click", admin.openChangelog);

    const closeBtn = document.querySelector(".close-button");
    if (closeBtn) closeBtn.addEventListener("click", admin.closeChangelog);

    // Modal action buttons
    bindClick("whats-new-close", admin.closeWhatsNew);
    bindClick("whats-new-got-it", admin.closeWhatsNew);
    bindClick("winner-close", admin.closeWinnerModal);
    bindClick("winner-cancel", admin.closeWinnerModal);
    bindClick("login-close", auth.closeLoginModal);
    bindClick("forgot-password-btn", auth.handlePasswordReset);
    bindClick("update-password-close", auth.closeUpdatePasswordModal);
    bindClick("hero-select-close", randomizer.closeHeroSelectModal);

    // Inputs & Keyboard event handlers
    const heroSearch = document.getElementById("hero-search");
    if (heroSearch) {
        heroSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                filters.triggerSearch();
            }
        });
        heroSearch.addEventListener("input", filters.handleSearchInput);
    }

    const gamesSearch = document.getElementById("games-search");
    if (gamesSearch) {
        gamesSearch.addEventListener("input", admin.handleGamesSearchInput);
    }

    const heroSelectSearch = document.getElementById("hero-select-search");
    if (heroSelectSearch) {
        heroSelectSearch.addEventListener("input", randomizer.filterHeroSelectOptions);
    }

    // Modal sorting
    const modalSortName = document.getElementById("modal-sort-name");
    if (modalSortName) {
        modalSortName.addEventListener("click", () => randomizer.setModalSort("name"));
    }
    const modalSortWeight = document.getElementById("modal-sort-weight");
    if (modalSortWeight) {
        modalSortWeight.addEventListener("click", () => randomizer.setModalSort("weight"));
    }

    // Drawers close triggers
    const sortFilterDrawer = document.getElementById("sort-filter-drawer");
    if (sortFilterDrawer) {
        sortFilterDrawer.addEventListener("click", (e) => {
            filters.closeDrawer(e);
        });
    }
    const filterDrawerLeft = document.getElementById("filter-drawer-left");
    if (filterDrawerLeft) {
        filterDrawerLeft.addEventListener("click", (e) => {
            const pill = e.target.closest(".segmented-pill[data-filter]");
            if (pill) {
                const filter = pill.getAttribute("data-filter");
                if (filter) filters.handleFilterDrawerOwnershipPillClick(filter);
                return;
            }
            filters.closeFilterDrawer(e);
        });
    }

    // Drawer action buttons
    bindClick("drawer-close", () => filters.closeDrawer(null, true));
    bindClick("drawer-reset", filters.resetFilters);
    bindClick("drawer-apply", filters.applyAndCloseDrawer);
    bindClick("filter-drawer-close-btn", filters.applyFilterPanelSelections);
    bindClick("filter-drawer-reset", filters.resetFilterPanelSelections);
    bindClick("filter-drawer-apply", filters.applyFilterPanelSelections);

    // Admin Group CRUD toggles
    bindClick("addGroupBtn", admin.toggleGroupForm);
    bindClick("saveGroupBtn", admin.saveGroup);
    const cancelGroupBtn = document.getElementById("cancelGroupBtn");
    if (cancelGroupBtn) {
        cancelGroupBtn.addEventListener("click", async () => {
            if (document.getElementById('groupName').value && !(await showConfirm('Discard Changes', 'Discard unsaved changes?'))) return;
            admin.resetGroupForm();
        });
    }
    bindClick("addHeroBtn", admin.toggleHeroForm);
    bindClick("saveBtn", admin.saveCharacter);
    const cancelHeroBtn = document.getElementById("cancelHeroBtn");
    if (cancelHeroBtn) {
        cancelHeroBtn.addEventListener("click", async () => {
            if (document.getElementById('charName').value && !(await showConfirm('Discard Changes', 'Discard unsaved changes?'))) return;
            admin.resetForm();
        });
    }

    // Admin Accordion panels toggles
    document.querySelectorAll("#adminSection .panel-header").forEach(el => {
        el.addEventListener("click", (e) => {
            const panelId = el.getAttribute("data-panel");
            if (panelId) admin.toggleAdminPanel(e, panelId);
        });
    });

    // Auth forms
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            auth.handleLogin();
        });
    }

    const updatePasswordForm = document.getElementById("update-password-form");
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            auth.handleUpdatePassword();
        });
    }

    const authBtn = document.getElementById("auth-btn");
    if (authBtn) {
        authBtn.addEventListener("click", () => {
            if (stateStore.get("currentUser")) {
                auth.handleLogout();
            } else {
                auth.openLoginModal();
            }
        });
    }

    const confirmWinnerBtn = document.getElementById("confirm-winner-btn");
    if (confirmWinnerBtn) {
        confirmWinnerBtn.addEventListener("click", () => {
            const gameId = confirmWinnerBtn.getAttribute("data-game-id");
            if (gameId) admin.submitWinner(gameId);
        });
    }

    // ========================================================
    // 2. Event Delegation on dynamic containers
    // ========================================================

    // Quick sort dropdown menu clicks
    const sortMenu = document.getElementById("sort-dropdown-menu");
    if (sortMenu) {
        sortMenu.addEventListener("click", (e) => {
            const item = e.target.closest('[data-action="select-sort"]');
            if (item) {
                const key = item.getAttribute("data-sort-key");
                const asc = item.getAttribute("data-sort-asc") === "true";
                filters.selectSortOption(key, asc);
            }
        });
    }

    // Left filter drawer checkboxes
    const leftDrawer = document.getElementById("filter-drawer-left");
    if (leftDrawer) {
        leftDrawer.addEventListener("change", (e) => {
            const cb = e.target.closest('input[type="checkbox"][data-type]');
            if (cb) {
                filters.handleFilterDrawerCheckboxChange(cb);
            }
        });
    }

    // Right filter drawer settings clicks and changes
    const drawerBody = document.getElementById("drawer-body-content");
    if (drawerBody) {
        drawerBody.addEventListener("click", (e) => {
            const target = e.target;

            // Player columns toggle
            const playerFilter = target.closest('[data-action="toggle-drawer-player-filter"]');
            if (playerFilter) {
                const idx = parseInt(playerFilter.getAttribute("data-player-idx"), 10);
                filters.toggleDrawerPlayerFilter(idx);
                return;
            }

            // Staged player game filter toggle (game history)
            const gamePlayerFilter = target.closest('[data-action="toggle-staged-player-game-filter"]');
            if (gamePlayerFilter) {
                const idx = parseInt(gamePlayerFilter.getAttribute("data-player-idx"), 10);
                filters.toggleStagedPlayerGameFilter(idx);
                return;
            }

            // Staged draft count candidate pills
            const draftCount = target.closest('[data-action="set-staged-draft-count"]');
            if (draftCount) {
                const count = parseInt(draftCount.getAttribute("data-count"), 10);
                randomizer.setStagedDraftCount(count);
                return;
            }

            // Switch settings tabs
            const settingsTab = target.closest('[data-action="switch-roll-settings-tab"]');
            if (settingsTab) {
                const tab = settingsTab.getAttribute("data-tab");
                randomizer.switchRollSettingsTab(tab);
                return;
            }

            // Sort player change
            const sortPlayer = target.closest('[data-action="drawer-sort-player-change"]');
            if (sortPlayer) {
                const idx = parseInt(sortPlayer.getAttribute("data-player-idx"), 10);
                filters.handleDrawerSortPlayerChange(idx);
                return;
            }

            // Toggle drawer level (complexity dice)
            const complexityCard = target.closest('[data-action="toggle-drawer-level"]');
            if (complexityCard) {
                if (complexityCard.getAttribute("data-disabled") === "true") return;
                const levelRaw = complexityCard.getAttribute("data-level");
                const level = levelRaw === "all" ? "all" : parseInt(levelRaw, 10);
                filters.toggleDrawerLevel(level);
                return;
            }

            // Toggle drawer group (seasons)
            const groupCard = target.closest('[data-action="toggle-drawer-group"]');
            if (groupCard) {
                if (groupCard.getAttribute("data-disabled") === "true") return;
                const groupId = groupCard.getAttribute("data-group-id");
                filters.toggleDrawerGroupFilter(groupId);
                return;
            }
        });

        drawerBody.addEventListener("change", (e) => {
            const target = e.target;

            // Toggle use historical checkbox
            const histCheckbox = target.closest('[data-action="toggle-use-historical"]');
            if (histCheckbox) {
                filters.toggleStagedGamesHistorical(histCheckbox.checked);
                return;
            }

            // Staged draft mode switch checkbox
            const draftSwitch = target.closest('[data-action="toggle-staged-draft-mode"]');
            if (draftSwitch) {
                randomizer.toggleStagedDraftMode(draftSwitch.checked);
                return;
            }

            // Toggle staged winner only checkbox
            const winnerOnlyCheckbox = target.closest('[data-action="toggle-staged-winner-only"]');
            if (winnerOnlyCheckbox) {
                filters.toggleStagedGamesWinnerOnly(winnerOnlyCheckbox.checked);
                return;
            }

            // Handle drawer sort type change
            const sortTypeSelect = target.closest('[data-action="drawer-sort-type-change"]');
            if (sortTypeSelect) {
                filters.handleDrawerSortTypeChange(sortTypeSelect.value);
                return;
            }

            // Staged ban checkbox
            const banCheckbox = target.closest('[data-action="toggle-staged-ban"]');
            if (banCheckbox) {
                const heroId = banCheckbox.getAttribute("data-hero-id");
                randomizer.toggleStagedBan(heroId);
                return;
            }
        });

        drawerBody.addEventListener("input", (e) => {
            const target = e.target;
            const banSearch = target.closest('[data-action="ban-search-input"]');
            if (banSearch) {
                randomizer.handleBanSearch(banSearch.value);
            }
        });
    }

    // Active filters breadcrumbs chips
    const activeFilters = document.getElementById("active-filters-container");
    if (activeFilters) {
        activeFilters.addEventListener("click", (e) => {
            const target = e.target;
            const clearSearch = target.closest('[data-action="clear-search-filter"]');
            if (clearSearch) {
                filters.clearSearchFilter();
                return;
            }

            const removeChip = target.closest('[data-action="remove-filter-chip"]');
            if (removeChip) {
                const type = removeChip.getAttribute("data-type");
                let val = removeChip.getAttribute("data-value");
                if (type === "complexity") val = parseInt(val, 10);
                filters.removeFilterChip(type, val);
                return;
            }
        });
    }

    // Randomizer results slots (edit icons, cancel, rotation, draft pick confirmation)
    const results = document.getElementById("results");
    if (results) {
        results.addEventListener("click", (e) => {
            const target = e.target;

            // Open hero select modal
            const openModal = target.closest('[data-action="open-hero-select"]');
            if (openModal) {
                const pIdx = parseInt(openModal.getAttribute("data-player-idx"), 10);
                randomizer.openHeroSelectModal(pIdx);
                return;
            }

            // Select draft hero from card click
            const draftCard = target.closest('[data-action="select-draft-hero"]');
            if (draftCard) {
                const pIdx = parseInt(draftCard.getAttribute("data-player-idx"), 10);
                const heroName = draftCard.getAttribute("data-hero-name");
                const heroSlug = draftCard.getAttribute("data-hero-slug");
                const heroId = draftCard.getAttribute("data-hero-id");
                const cardAngle = parseFloat(draftCard.getAttribute("data-angle"));
                const cardIdx = parseInt(draftCard.getAttribute("data-card-idx"), 10);
                randomizer.selectDraftHero(pIdx, heroName, heroSlug, heroId, cardAngle, cardIdx);
                return;
            }

            // Cancel roll
            const cancelRoll = target.closest('[data-action="cancel-roll"]');
            if (cancelRoll) {
                randomizer.cancelRoll();
                return;
            }

            // Rotate draft candidate wheel
            const rotateBtn = target.closest('[data-action="rotate-draft"]');
            if (rotateBtn) {
                const pIdx = parseInt(rotateBtn.getAttribute("data-player-idx"), 10);
                const dir = parseInt(rotateBtn.getAttribute("data-direction"), 10);
                const count = parseInt(rotateBtn.getAttribute("data-draft-count"), 10);
                randomizer.rotateDraftWheelDirection(pIdx, dir, count);
                return;
            }

            // Confirm draft pick
            const confirmDraft = target.closest('[data-action="confirm-draft"]');
            if (confirmDraft) {
                const pIdx = parseInt(confirmDraft.getAttribute("data-player-idx"), 10);
                randomizer.confirmDraftPick(pIdx);
                return;
            }
        });
    }

    // Hero select options modal cards list click delegation
    const selectOptions = document.getElementById("hero-select-options-container");
    if (selectOptions) {
        selectOptions.addEventListener("click", (e) => {
            const card = e.target.closest('[data-action="select-hero-option"]');
            if (card) {
                const name = card.getAttribute("data-hero-name");
                randomizer.selectHeroForPlayer(name);
            }
        });
    }

    // Hero database expansion accordion clicks delegation
    const heroContainer = document.getElementById("heroContainer");
    if (heroContainer) {
        heroContainer.addEventListener("click", (e) => {
            const header = e.target.closest('[data-action="toggle-hero-panel"]');
            if (header) {
                // If user clicks on an Rulepop link or complexity indicator, do not toggle
                if (e.target.closest('a') || e.target.closest('.complexity-dice-bar')) {
                    return;
                }
                admin.toggleHeroPanel(header);
            }
        });
    }

    // Admin groups CRUD actions delegation
    const groupsList = document.getElementById("groupsListContainer");
    if (groupsList) {
        groupsList.addEventListener("click", (e) => {
            const target = e.target;
            const groupId = target.getAttribute("data-group-id");

            if (target.closest('[data-action="edit-group"]')) {
                admin.editGroup(groupId);
            } else if (target.closest('[data-action="delete-group"]')) {
                admin.deleteGroup(groupId);
            } else if (target.closest('[data-action="save-group-inline"]')) {
                admin.saveGroupInline(groupId);
            } else if (target.closest('[data-action="cancel-group-edit"]')) {
                admin.cancelGroupEdit(groupId);
            }
        });
    }

    // Admin heroes CRUD actions delegation
    const heroesList = document.getElementById("heroesListContainer");
    if (heroesList) {
        heroesList.addEventListener("click", (e) => {
            const target = e.target;

            if (target.closest('[data-action="edit-hero"]')) {
                const idx = parseInt(target.getAttribute("data-hero-idx"), 10);
                admin.editChar(idx);
            } else if (target.closest('[data-action="delete-hero"]')) {
                const heroId = target.getAttribute("data-hero-id");
                admin.deleteHero(heroId);
            } else if (target.closest('[data-action="save-hero-inline"]')) {
                const heroId = target.getAttribute("data-hero-id");
                const idx = parseInt(target.getAttribute("data-hero-idx"), 10);
                admin.saveHeroInline(heroId, idx);
            } else if (target.closest('[data-action="cancel-hero-edit"]')) {
                admin.cancelHeroEdit();
            }
        });
    }

    // Admin players color picking & CRUD actions delegation
    const playersList = document.getElementById("playersListContainer");
    if (playersList) {
        playersList.addEventListener("click", (e) => {
            const target = e.target;
            const playerId = target.getAttribute("data-player-id");

            if (target.closest('[data-action="edit-player"]')) {
                admin.editPlayer(playerId);
            } else if (target.closest('[data-action="save-player-inline"]')) {
                admin.savePlayerInline(playerId);
            } else if (target.closest('[data-action="cancel-player-edit"]')) {
                admin.cancelPlayerEdit(playerId);
            }
        });

        playersList.addEventListener("change", (e) => {
            const picker = e.target.closest('[data-action="player-color-change"]');
            if (picker) {
                const playerId = picker.getAttribute("data-player-id");
                handlePlayerColorChange(playerId, picker);
            }
        });
    }

    // Admin users roles checkbox updates delegation
    const usersList = document.getElementById("usersListContainer");
    if (usersList) {
        usersList.addEventListener("change", (e) => {
            const toggle = e.target.closest('[data-action="user-role-change"]');
            if (toggle) {
                // Supabase doesn't support direct roles editing on client-side Supabase client sdk
                alert("User roles must be modified directly in the Supabase Dashboard for security reasons.");
                admin.renderUsersList();
            }
        });
    }

    // User Collection matrix/accordions clicks & changes delegation
    const bindCollectionEvents = (container) => {
        if (!container) return;
        container.addEventListener("click", (e) => {
            const target = e.target;

            const card = target.closest('[data-action="toggle-hero-owned"]');
            if (card) {
                const heroId = card.getAttribute("data-hero-id");
                const isSelected = card.getAttribute("data-selected") === "true";
                admin.toggleHeroOwned(heroId, !isSelected);
                return;
            }

            const header = target.closest('[data-action="toggle-collection-group"]');
            if (header) {
                if (e.target.closest('input[type="checkbox"]') || e.target.closest('label')) {
                    return;
                }
                const groupId = header.getAttribute("data-group-id");
                admin.toggleCollectionGroup(groupId, e);
                return;
            }
        });

        container.addEventListener("change", (e) => {
            const target = e.target;

            const groupOwned = target.closest('[data-action="toggle-group-owned"]');
            if (groupOwned) {
                const groupId = groupOwned.getAttribute("data-group-id");
                admin.toggleGroupOwned(groupId, groupOwned.checked);
                return;
            }

            const userHeroOwned = target.closest('[data-action="toggle-user-hero-owned"]');
            if (userHeroOwned) {
                const userId = userHeroOwned.getAttribute("data-user-id");
                const heroId = userHeroOwned.getAttribute("data-hero-id");
                admin.toggleUserHeroOwned(userId, heroId, userHeroOwned.checked);
                return;
            }
        });
    };

    bindCollectionEvents(document.getElementById("collectionsListContainer"));
    bindCollectionEvents(document.getElementById("collectionContainer"));

    // History log sections: winner modals, delete game logs, Gorgeous toggles delegation
    const gamesSection = document.getElementById("gamesSection");
    if (gamesSection) {
        gamesSection.addEventListener("click", (e) => {
            const target = e.target;

            const toggleStyle = target.closest('[data-action="toggle-history-view-style"]');
            if (toggleStyle) {
                admin.toggleHistoryViewStyle();
                return;
            }

            const toggleExpand = target.closest('[data-action="toggle-game-expansion"]');
            if (toggleExpand) {
                const gameId = toggleExpand.getAttribute("data-game-id");
                admin.toggleGameExpansion(gameId);
                return;
            }

            const selectWinner = target.closest('[data-action="select-winner"]');
            if (selectWinner) {
                const gameId = selectWinner.getAttribute("data-game-id");
                admin.selectWinner(gameId);
                return;
            }

            const deleteGame = target.closest('[data-action="delete-game"]');
            if (deleteGame) {
                const gameId = deleteGame.getAttribute("data-game-id");
                admin.deleteGame(gameId);
                return;
            }

            const openWinner = target.closest('[data-action="open-winner-modal"]');
            if (openWinner) {
                const gameId = openWinner.getAttribute("data-game-id");
                admin.selectWinner(gameId);
                return;
            }
        });
    }

    // Winner selection card click handler (updates selected states and radio inputs)
    const winnerSelection = document.getElementById("winner-selection-container");
    if (winnerSelection) {
        winnerSelection.addEventListener("click", (e) => {
            const card = e.target.closest('[data-action="winner-card-click"]');
            if (card) {
                const radio = card.querySelector('input[name="winner-selection"]');
                if (radio) {
                    radio.checked = true;
                    winnerSelection.querySelectorAll('.winner-card, .winner-draw-card').forEach(c => {
                        c.classList.toggle('selected', c === card);
                    });
                    const confirmWinnerBtn = document.getElementById("confirm-winner-btn");
                    if (confirmWinnerBtn) confirmWinnerBtn.disabled = false;
                }
            }
        });
    }

    // Global click listener to dismiss modal backdrops
    window.addEventListener("click", (event) => {
        const modalChangelog = document.getElementById("changelog-modal");
        const modalLogin = document.getElementById("login-modal");
        const modalWhatsNew = document.getElementById("whats-new-modal");
        const modalUpdatePassword = document.getElementById("update-password-modal");
        const modalHeroSelect = document.getElementById("hero-select-modal");

        if (event.target === modalChangelog) admin.closeChangelog();
        if (event.target === modalLogin) auth.closeLoginModal();
        if (event.target === modalWhatsNew) admin.closeWhatsNew();
        if (event.target === modalUpdatePassword) auth.closeUpdatePasswordModal();
        if (event.target === modalHeroSelect) randomizer.closeHeroSelectModal();

        const sortDropdown = document.getElementById("sort-dropdown-menu");
        const sortContainer = document.getElementById("sort-dropdown-container");
        if (
            sortDropdown &&
            sortDropdown.classList.contains("show") &&
            sortContainer &&
            !sortContainer.contains(event.target)
        ) {
            filters.closeSortDropdown();
        }
    });

    // Escape key listener to dismiss manual select modal
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            randomizer.closeHeroSelectModal();
        }
    });
}
