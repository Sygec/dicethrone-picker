import { isHeroOwned, escapeHtml, showConfirm, MAX_WEIGHTED_PLAYERS } from './utils.js';
import { renderList, updateSegmentedHighlights } from './filters.js';
import { updateDropdownSort } from './randomizer.js';
import { init } from './main.js';
import * as apiService from './services/apiService.js';
import * as stateStore from './stateStore.js';
import * as adminView from './views/adminView.js';

export function renderAdminBuildInfo() {
    adminView.renderAdminBuildInfo();
}
export function openChangelog() {
    adminView.openChangelog();
}
export function closeChangelog() {
    adminView.closeChangelog();
}
export function showWhatsNew(entry) {
    adminView.showWhatsNew(entry);
    localStorage.setItem("lastSeenVersion", entry.version);
}
export function closeWhatsNew() {
    adminView.closeWhatsNew();
}
export function showSection(sectionName) {
    adminView.showSection(sectionName);
}
export function toggleAdminPanel(event, panelId) {
    adminView.toggleAdminPanel(event, panelId);
}
export function toggleHeroPanel(header) {
    adminView.toggleHeroPanel(header);
}
export function toggleCollectionGroup(groupId, event) {
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "LABEL" ||
        event.target.closest("label")
    ) {
        return;
    }
    stateStore.updateSet("expandedCollectionGroups", "toggle", groupId);
    renderCollectionView();
}
export function setOwnershipFilter(filterState) {
    const showOwnedCheckbox = document.getElementById("db-show-owned");
    const showNotOwnedCheckbox = document.getElementById("db-show-not-owned");

    if (showOwnedCheckbox && showNotOwnedCheckbox) {
        if (filterState === "owned") {
            showOwnedCheckbox.checked = true;
            showNotOwnedCheckbox.checked = false;
        } else if (filterState === "unowned") {
            showOwnedCheckbox.checked = false;
            showNotOwnedCheckbox.checked = true;
        } else {
            showOwnedCheckbox.checked = true;
            showNotOwnedCheckbox.checked = true;
        }
    }

    const pills = {
        owned: document.getElementById("pill-show-owned"),
        unowned: document.getElementById("pill-show-not-owned"),
        all: document.getElementById("pill-show-all"),
    };

    Object.keys(pills).forEach((key) => {
        const pill = pills[key];
        if (pill) {
            pill.classList.toggle("active", key === filterState);
        }
    });

    updateSegmentedHighlights();
    renderList();
}
export function renderCollectionView() {
    adminView.renderCollectionView();
}
export async function toggleHeroOwned(heroId, isOwned) {
    if (!stateStore.get("currentUser")) {
        alert("Please log in to manage your collection.");
        return;
    }

    const characters = stateStore.get("characters");
    const hero = characters.find((h) => h.id === heroId);
    if (hero) hero.is_owned = isOwned;
    
    renderCollectionView();
    renderList();
    updateDropdownSort();

    const adminCheckbox = document.getElementById(
        `admin-owned-${stateStore.get("currentUser").id}-${heroId}`,
    );
    if (adminCheckbox) {
        adminCheckbox.checked = isOwned;
    }

    const { error } = await apiService.upsertUserHero(
        stateStore.get("currentUser").id,
        heroId,
        isOwned,
    );

    if (error) {
        alert("Error updating ownership: " + error.message);
        if (hero) hero.is_owned = !isOwned;
        renderCollectionView();
        updateDropdownSort();
        renderList();

        if (adminCheckbox) {
            adminCheckbox.checked = !isOwned;
        }
    }
}
export async function toggleGroupOwned(groupId, isOwned) {
    if (!stateStore.get("currentUser")) {
        alert("Please log in to manage your collection.");
        return;
    }

    const characters = stateStore.get("characters");
    characters.forEach((h) => {
        if (h.group_id === groupId) {
            h.is_owned = isOwned;
            const adminCheckbox = document.getElementById(
                `admin-owned-${stateStore.get("currentUser").id}-${h.id}`,
            );
            if (adminCheckbox) {
                adminCheckbox.checked = isOwned;
            }
        }
    });
    renderCollectionView();
    renderList();
    updateDropdownSort();

    const groupHeroIds = characters
        .filter((h) => h.group_id === groupId)
        .map((h) => ({
            user_id: stateStore.get("currentUser").id,
            hero_id: h.id,
            is_owned: isOwned,
        }));

    const { error } = await apiService.upsertUserHeroesGroup(groupHeroIds);

    if (error) {
        alert("Error updating group ownership: " + error.message);
        characters.forEach((h) => {
            if (h.group_id === groupId) h.is_owned = !isOwned;
        });
        renderCollectionView();
        updateDropdownSort();
        renderList();
    }
}
export async function saveCharacter() {
    const name = document.getElementById("charName").value.trim();
    const groupId = document.getElementById("charGroup").value;
    const slug = document.getElementById("charSlug").value.trim();
    const complexity = document.getElementById("charComplexity").value.trim();

    if (!name) return alert("Name is required");
    if (!groupId) return alert("Group is required");

    const charData = {
        name,
        slug,
        complexity: complexity ? parseInt(complexity) : null,
        group_id: groupId,
        last_updated_by: stateStore.get("currentUser").id,
    };

    const { error } = await apiService.insertHero(charData);

    if (error) return alert("Error saving: " + error.message);

    await init();
    resetForm();
}
export function editChar(idx) {
    stateStore.set("editIndex", idx);
    renderHeroesList();

    const adminSection = document.getElementById("adminSection");
    if (adminSection.classList.contains("hidden")) showSection("admin");

    const characters = stateStore.get("characters");
    const editPanel = document.getElementById(
        `heroEditPanel-${characters[idx]?.id}`,
    );
    if (editPanel && !isElementFullyVisible(editPanel)) {
        editPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}
export function isElementFullyVisible(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight)
    );
}
export function resetForm() {
    stateStore.set("editIndex", -1);
    adminView.resetForm();
}
export function toggleHeroForm() {
    adminView.toggleHeroForm();
}
export function populateGroupDropdown() {
    adminView.populateGroupDropdown();
}
export function renderGroupsList() {
    adminView.renderGroupsList();
}
export function renderHeroesList() {
    adminView.renderHeroesList();
}
export function cancelHeroEdit() {
    stateStore.set("editIndex", -1);
    renderHeroesList();
}
export async function saveHeroInline(heroId, idx) {
    const name = document.getElementById(`heroName-${idx}`).value.trim();
    const groupId = document.getElementById(`heroGroup-${idx}`).value;
    const slug = document.getElementById(`heroSlug-${idx}`).value.trim();
    const complexity = document
        .getElementById(`heroComplexity-${idx}`)
        .value.trim();

    if (!name) return alert("Name is required");
    if (!groupId) return alert("Group is required");

    const charData = {
        id: heroId,
        name,
        slug,
        complexity: complexity ? parseInt(complexity) : null,
        group_id: groupId,
        last_updated_by: stateStore.get("currentUser").id,
    };

    const { error } = await apiService.upsertHero(charData);

    if (error) return alert("Error saving: " + error.message);

    stateStore.set("editIndex", -1);
    await init();
}
export async function deleteHero(heroId) {
    if (!(await showConfirm("Delete Hero", "Delete this hero? This action cannot be undone."))) return;

    const { error } = await apiService.deleteHero(heroId);
    if (error) return alert("Error deleting hero: " + error.message);

    await init();
}
export async function saveGroup() {
    const name = document.getElementById("groupName").value.trim();
    const order_index = document.getElementById("groupOrder").value.trim();
    const year = document.getElementById("groupYear").value.trim();

    if (!name) return alert("Group name is required");

    const groupData = {
        name,
        order_index: order_index ? parseInt(order_index) : null,
        year: year ? parseInt(year) : null,
        is_active: true,
    };

    const { error } = await apiService.upsertGroup(groupData);

    if (error) return alert("Error saving group: " + error.message);

    resetGroupForm();
    init();
}
export function editGroup(groupId) {
    const groups = stateStore.get("groups");
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const listContainer = document.getElementById("groupsListContainer");
    if (listContainer) {
        listContainer.classList.add("group-edit-active");
        listContainer
            .querySelectorAll(".group-row")
            .forEach((row) => row.classList.remove("editing"));
    }

    const panel = document.getElementById(`groupEditPanel-${groupId}`);
    const activeRow = document.getElementById(`groupRow-${groupId}`);
    if (!panel || !activeRow) return;

    activeRow.classList.add("editing");
    document.getElementById(`groupName-${groupId}`).value = group.name;
    document.getElementById(`groupOrder-${groupId}`).value =
        group.order_index || "";
    document.getElementById(`groupYear-${groupId}`).value = group.year || "";
    panel.classList.remove("hidden");
}
export function cancelGroupEdit(groupId) {
    adminView.resetGroupInlineEditPanel(groupId);
}
export async function saveGroupInline(groupId) {
    const name = document.getElementById(`groupName-${groupId}`).value.trim();
    const order_index = document
        .getElementById(`groupOrder-${groupId}`)
        .value.trim();
    const year = document.getElementById(`groupYear-${groupId}`).value.trim();

    if (!name) return alert("Group name is required");

    const { error } = await apiService.upsertGroup({
        id: groupId,
        name,
        order_index: order_index ? parseInt(order_index) : null,
        year: year ? parseInt(year) : null,
        is_active: true,
    });

    if (error) return alert("Error saving group: " + error.message);

    init();
}
export function resetGroupForm() {
    adminView.resetGroupForm();
}
export function toggleGroupForm() {
    adminView.toggleGroupForm();
}
export function renderPlayersList() {
    adminView.renderPlayersList();
}
export function editPlayer(playerId) {
    const player = stateStore.get("players").find((p) => p.id === playerId);
    if (!player) return;

    const listContainer = document.getElementById("playersListContainer");
    if (listContainer) {
        listContainer.classList.add("player-edit-active");
        listContainer
            .querySelectorAll(".player-admin-row")
            .forEach((row) => row.classList.remove("editing"));
    }

    const panel = document.getElementById(`playerEditPanel-${playerId}`);
    const activeRow = document.getElementById(`playerRow-${playerId}`);
    if (!panel || !activeRow) return;

    activeRow.classList.add("editing");
    document.getElementById(`playerName-${playerId}`).value = player.name;
    panel.classList.remove("hidden");
}
export function cancelPlayerEdit(playerId) {
    adminView.resetPlayerInlineEditPanel(playerId);
}
export async function savePlayerInline(playerId) {
    const name = document.getElementById(`playerName-${playerId}`).value.trim();

    if (!name) return alert("Player name is required");

    const { error } = await apiService.updatePlayerName(playerId, name);

    if (error) return alert("Error saving player: " + error.message);

    const players = stateStore.get("players");
    const NAMES = stateStore.get("NAMES");
    const playerIndex = players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
        players[playerIndex].name = name;
        NAMES[playerIndex] = name;
    }

    cancelPlayerEdit(playerId);
    renderPlayersList();
}
export function renderUsersList() {
    adminView.renderUsersList();
}
export async function renderCollectionsList() {
    const container = document.getElementById("collectionsListContainer");
    if (!container) return;

    container.innerHTML =
        '<p style="opacity: 0.7; font-style: italic; padding: 10px;">Loading collections...</p>';

    let allUserHeroes = [];
    try {
        const { data, error } = await apiService.getAllUserHeroes();

        if (error) {
            container.innerHTML = `<p style="color: var(--danger); padding: 10px;">Error loading collections: ${escapeHtml(error.message)}</p>`;
            return;
        }
        allUserHeroes = data || [];
    } catch (e) {
        container.innerHTML = `<p style="color: var(--danger); padding: 10px;">Error connecting to database: ${escapeHtml(e.message)}</p>`;
        return;
    }

    const userProfiles = [];
    const players = stateStore.get("players");

    players.forEach((p) => {
        if (p.user_id) {
            userProfiles.push({
                user_id: p.user_id,
                name: p.name,
                isLinked: true,
            });
        }
    });

    allUserHeroes.forEach((row) => {
        if (!userProfiles.some((up) => up.user_id === row.user_id)) {
            userProfiles.push({
                user_id: row.user_id,
                name: `User (${row.user_id.substring(0, 8)})`,
                isLinked: false,
            });
        }
    });

    const currentUser = stateStore.get("currentUser");
    if (
        currentUser &&
        !userProfiles.some((up) => up.user_id === currentUser.id)
    ) {
        const linkedPlayer = players.find((p) => p.user_id === currentUser.id);
        const name = linkedPlayer
            ? linkedPlayer.name
            : currentUser.email
              ? currentUser.email.split("@")[0]
              : "Admin";
        userProfiles.push({
            user_id: currentUser.id,
            name: name,
            isLinked: !!linkedPlayer,
        });
    }

    adminView.renderCollectionsListUI(userProfiles, allUserHeroes);
}
export async function toggleUserHeroOwned(userId, heroId, isOwned) {
    const currentUser = stateStore.get("currentUser");
    if (userId === currentUser?.id) {
        const characters = stateStore.get("characters");
        const hero = characters.find((h) => h.id === heroId);
        if (hero) hero.is_owned = isOwned;
        renderCollectionView();
        renderList();
        updateDropdownSort();
    }

    const { error } = await apiService.upsertUserHero(
        userId,
        heroId,
        isOwned,
    );

    if (error) {
        alert("Error updating user collection: " + error.message);
        if (userId === currentUser?.id) {
            const characters = stateStore.get("characters");
            const hero = characters.find((h) => h.id === heroId);
            if (hero) hero.is_owned = !isOwned;
            renderCollectionView();
            renderList();
            updateDropdownSort();
        }
        renderCollectionsList();
    }
}
export async function deleteGroup(groupId) {
    if (!(await showConfirm("Delete Group", "Delete this group?"))) return;

    const { error } = await apiService.deleteGroup(groupId);

    if (error) return alert("Error deleting group: " + error.message);

    resetGroupForm();
    init();
}
export function renderGamesList() {
    adminView.renderGamesList();
}
export function handleGamesSearchInput() {
    const searchInput = document.getElementById("games-search");
    const clearBtn = document.getElementById("clear-games-search");
    if (searchInput && clearBtn) {
        clearBtn.classList.toggle("hidden", searchInput.value.trim().length === 0);
    }
    renderGamesList();
}
export function clearGamesSearch() {
    const searchInput = document.getElementById("games-search");
    if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }
    handleGamesSearchInput();
}
export function toggleGameExpansion(gameId) {
    stateStore.updateSet("expandedGameIds", "toggle", gameId);
    renderGamesList();
}
export function toggleHistoryViewStyle() {
    const current = stateStore.get("gamesHistoryStyle") || "gorgeous";
    const next = current === "gorgeous" ? "admin" : "gorgeous";
    stateStore.set("gamesHistoryStyle", next);
    renderGamesList();
}
export function selectWinner(gameId) {
    adminView.openWinnerModal(gameId);
}
export function closeWinnerModal() {
    adminView.closeWinnerModal();
}
export async function submitWinner(gameId) {
    const selectedRadio = document.querySelector(
        'input[name="winner-selection"]:checked'
    );
    if (!selectedRadio) return alert("Please select a winner.");

    const winnerPlayerId = selectedRadio.value;
    const btn = document.getElementById("confirm-winner-btn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    try {
        const { error } = await apiService.updateGameWinner(
            gameId,
            winnerPlayerId,
            stateStore.get("currentUser").id,
        );
        if (error) throw error;

        closeWinnerModal();
        await init();
    } catch (err) {
        alert("Error updating winner: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Result";
    }
}
export async function deleteGame(gameId) {
    if (
        !(await showConfirm(
            "Delete Game Record",
            "Are you sure you want to delete this game record? This cannot be undone.",
        ))
    )
        return;

    const { error } = await apiService.deleteGame(gameId);

    if (error) {
        console.error("Error deleting game:", error);
        return alert("Failed to delete game: " + error.message);
    }

    await init();
}
export function updateHeroStatsFromHistory() {
    let showNormal = true;
    let showHistorical = true;
    
    const activeFilterDataHistories = stateStore.get("activeFilterDataHistories");
    const hasNormalOnly = activeFilterDataHistories.has("Normal only");
    const hasHistoricalOnly = activeFilterDataHistories.has("Historical only");
    
    if (hasNormalOnly && !hasHistoricalOnly) {
        showNormal = true;
        showHistorical = false;
    } else if (hasHistoricalOnly && !hasNormalOnly) {
        showNormal = false;
        showHistorical = true;
    }

    const characters = stateStore.get("characters");
    characters.forEach((char) => {
        char.playCount = [0, 0, 0, 0];
        char.lastPlayed = ["Never", "Never", "Never", "Never"];
        char.winCount = [0, 0, 0, 0];
    });

    const games = stateStore.get("games");
    if (!games) return;

    games.forEach((game) => {
        const isGameHistorical = !!game.is_historical;
        if (isGameHistorical && !showHistorical) return;
        if (!isGameHistorical && !showNormal) return;

        game.game_players.forEach((gp) => {
            const pIdx = parseInt(gp.player_id?.substring(1) || "0", 10) - 1;
            if (pIdx >= 0 && pIdx < MAX_WEIGHTED_PLAYERS) {
                const char = characters.find((c) => c.id === gp.hero_id);
                if (!char) return;

                char.playCount[pIdx]++;
                if (gp.is_winner) {
                    char.winCount[pIdx]++;
                }
                if (char.lastPlayed[pIdx] === "Never") {
                    let d = game.played_at || "";
                    if (d && !d.includes("T")) d = d.replace(" ", "T");
                    if (d && !d.includes("Z") && !d.includes("+")) d += "Z";
                    const dateObj = new Date(d);
                    char.lastPlayed[pIdx] =
                        dateObj.getFullYear() < 2026
                            ? "Unknown"
                            : dateObj.toLocaleDateString("en-CA");
                }
            }
        });
    });
}

