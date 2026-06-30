/**
 * @fileoverview Main entry point of the application. Bootstraps state, setups global elements, registers database subscriptions, and hooks lifecycle listeners.
 * @module main
 */

import './config.js';
import * as apiService from './services/apiService.js';
import * as stateStore from './stateStore.js';
import { DEFAULT_HERO_WEIGHT, normalizeColorValue, setPlayerColorVariable, isAdmin, MAX_WEIGHTED_PLAYERS } from './utils.js';
import { updateAuthUI, renderPlayerToggles, openUpdatePasswordModal, closeLoginModal } from './auth.js';
import { 
    populateGroupDropdown, 
    renderGroupsList, 
    renderAdminBuildInfo, 
    renderGamesList, 
    renderHeroesList, 
    renderPlayersList, 
    renderUsersList, 
    renderCollectionsList, 
    renderCollectionView, 
    showWhatsNew,
    openChangelog,
    closeChangelog
} from './admin.js';
import { updateActiveFilterBadge, updateActiveFilterChips, setSort } from './filters.js';
import { updateRollSettingsBadge } from './randomizer.js';
import { setupAllEventBindings } from './eventBindings.js';



/**
 * Initializes and bootstraps player, hero, and game logs by calling Supabase endpoints.
 * Populates global lists and binds configuration variables.
 * @function init
 * @async
 * @returns {Promise<void>}
 */
export async function init() {
    stateStore.set("draftModeEnabled", localStorage.getItem("draftModeEnabled") === "true");
    let dCount = parseInt(localStorage.getItem("draftCount") || "3", 10);
    if (dCount !== 2 && dCount !== 3) {
        dCount = 3;
    }
    stateStore.set("draftCount", dCount);
    const banned = localStorage.getItem("bannedHeroIds");
    stateStore.set("bannedHeroIds", banned ? new Set(JSON.parse(banned)) : new Set());
    updateRollSettingsBadge();

    const { data: groupsData, error: groupsError } = await apiService.getGroups();

    if (!groupsError && groupsData) {
        stateStore.set("groups", groupsData);
        populateGroupDropdown();
        renderGroupsList();

        const currentGroupIds = new Set(groupsData.map((g) => g.id));
        if (stateStore.get("activeGroups").size === 0) {
            groupsData.forEach((g) => stateStore.updateSet("activeGroups", "add", g.id));
        } else {
            for (let id of stateStore.get("activeGroups")) {
                if (!currentGroupIds.has(id)) {
                    stateStore.updateSet("activeGroups", "delete", id);
                }
            }
        }
        updateActiveFilterBadge();
        updateActiveFilterChips();
    }

    const { data: playersData, error: playersError } = await apiService.getPlayers();

    if (!playersError && playersData) {
        stateStore.set("players", playersData);
        playersData.forEach((p) => {
            if (p.player_color) {
                setPlayerColorVariable(p.id, normalizeColorValue(p.player_color));
            }
        });

        const names = playersData.map((p) => p.name);
        let loggedInIdx = -1;
        const currentUser = stateStore.get("currentUser");
        playersData.forEach((p, i) => {
            if (i < 6) {
                names[i] = p.name;
                if (currentUser && p.user_id === currentUser.id) {
                    loggedInIdx = i;
                }
            }
        });
        stateStore.set("NAMES", names);
        stateStore.set("loggedInPlayerIndex", loggedInIdx);
        updateAuthUI();
        renderPlayerToggles();
    }

    const { data, error } = await apiService.getHeroes();

    if (error) return console.error("Error fetching heroes:", error);

    const characters = data.map((hero) => {
        const userHeroRecord = hero.user_heroes?.find(
            (uh) => uh.user_id === stateStore.get("currentUser")?.id,
        );
        const isOwned = userHeroRecord ? userHeroRecord.is_owned : true;

        const char = {
            id: hero.id,
            name: hero.name,
            slug: hero.slug,
            complexity: hero.complexity,
            group_id: hero.group_id,
            is_owned: isOwned,
            group: hero.groups?.name || "Unknown",
            weights: Array(MAX_WEIGHTED_PLAYERS).fill(DEFAULT_HERO_WEIGHT),
            playCount: Array(MAX_WEIGHTED_PLAYERS).fill(0),
            lastPlayed: Array(MAX_WEIGHTED_PLAYERS).fill("Never"),
            winCount: Array(MAX_WEIGHTED_PLAYERS).fill(0),
        };

        hero.player_hero_stats?.forEach((stat) => {
            const pIdx = parseInt(stat.player_id.substring(1)) - 1;
            if (pIdx >= 0 && pIdx < MAX_WEIGHTED_PLAYERS) {
                char.weights[pIdx] = stat.weight;
            }
        });

        return char;
    });
    stateStore.set("characters", characters);

    const { data: gamesData, error: gamesError } = await apiService.getGames();

    if (gamesError) {
        console.error("Error fetching games:", gamesError);
    } else {
        const games = gamesData.map((game) => ({
            ...game,
            game_players: (game.game_players || []).slice().sort((a, b) => {
                const aIdx = parseInt(a.player_id?.substring(1) || "0", 10);
                const bIdx = parseInt(b.player_id?.substring(1) || "0", 10);
                return aIdx - bIdx;
            }),
        }));
        stateStore.set("games", games);
    }

    renderAdminBuildInfo();
    renderGroupsList();
    renderGamesList();
    renderHeroesList();
    renderPlayersList();
    renderUsersList();
    if (isAdmin()) {
        renderCollectionsList();
    }
    renderCollectionView();
    
    const initialSort = stateStore.get("currentSort");
    stateStore.set("currentSort", null);
    setSort(initialSort);
}

/**
 * Validates active session metadata, loads dynamic data structures, reads the changelog, 
 * subscribes to postgres database mutations, and removes the web preloader.
 * @function initializeApp
 * @async
 * @returns {Promise<void>}
 */
export async function initializeApp() {
    try {
        const {
            data: { session },
        } = await apiService.getSession();
        stateStore.set("currentUser", session?.user || null);
        updateAuthUI();

        await init();

        const response = await fetch("changelog.json");
        stateStore.set("cachedChangelog", await response.json());

        const changelog = stateStore.get("cachedChangelog");
        if (changelog && changelog.length > 0) {
            const latestEntry = changelog[0];
            const versionLabel = document.getElementById("version-number");
            if (versionLabel) {
                versionLabel.innerText = latestEntry.version;
            }

            if (localStorage.getItem("lastSeenVersion") !== latestEntry.version) {
                showWhatsNew(latestEntry);
            }
        }

        // Setup Realtime subscriptions
        apiService.subscribeToDatabaseChanges(init);

        // Setup State change logging for development verification
        stateStore.subscribe((key, val) => {
            console.log(`[stateStore] Update: ${key} =`, val);
        });
    } catch (error) {
        console.error("Could not load version number:", error);
        const versionLabel = document.getElementById("version-number");
        if (versionLabel) {
            versionLabel.innerText = "Error";
        }
    } finally {
        hidePreloader();
    }
}

/**
 * Triggers the fade-out CSS animation on the spinner preloader, then removes it from the DOM.
 * @function hidePreloader
 */
function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    preloader.classList.add("fade-out");
    document.body.classList.add("loaded");
    preloader.addEventListener("animationend", () => preloader.remove(), {
        once: true,
    });
}

// Wire up global DOM events
window.addEventListener("DOMContentLoaded", () => {
    setupAllEventBindings();
    initializeApp();
});

apiService.onAuthStateChange((event, session) => {
    stateStore.set("currentUser", session?.user || null);
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") init();

    if (event === "PASSWORD_RECOVERY") {
        openUpdatePasswordModal();
    }

    updateAuthUI();
    if (event === "SIGNED_IN") {
        closeLoginModal();
    }
});

