import './config.js';
import { db } from './db.js';
import './state.js';
import './utils.js';
import './auth.js';
import './admin.js';
import './filters.js';
import './randomizer.js';

// Setup DOM Element References on window for cross-module global access
window.versionLabel = document.getElementById("version-number");
window.container = document.getElementById("changelog-container");
window.modal = document.getElementById("changelog-modal");
window.whatsNewModal = document.getElementById("whats-new-modal");
window.whatsNewContainer = document.getElementById("whats-new-container");
window.closeBtn = document.querySelector(".close-button");
window.loginModal = document.getElementById("login-modal");
window.authBtn = document.getElementById("auth-btn");
window.actionButtons = document.getElementById("action-buttons");
window.loginForm = document.getElementById("login-form");
window.updatePasswordModal = document.getElementById("update-password-modal");
window.updatePasswordForm = document.getElementById("update-password-form");

// Setup Submit Event Handlers
if (window.loginForm) {
    window.loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (typeof window.handleLogin === "function") window.handleLogin();
    });
}

if (window.updatePasswordForm) {
    window.updatePasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (typeof window.handleUpdatePassword === "function") window.handleUpdatePassword();
    });
}

// Bootstrapping App Data
export async function init() {
    window.draftModeEnabled = localStorage.getItem("draftModeEnabled") === "true";
    window.draftCount = parseInt(localStorage.getItem("draftCount") || "3", 10);
    if (window.draftCount !== 2 && window.draftCount !== 3) {
        window.draftCount = 3;
    }
    const banned = localStorage.getItem("bannedHeroIds");
    window.bannedHeroIds = banned ? new Set(JSON.parse(banned)) : new Set();
    if (typeof window.updateRollSettingsBadge === "function") {
        window.updateRollSettingsBadge();
    }

    const { data: groupsData, error: groupsError } = await db
        .from("groups")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

    if (!groupsError && groupsData) {
        window.groups = groupsData;
        if (typeof window.populateGroupDropdown === "function") window.populateGroupDropdown();
        if (typeof window.renderGroupsList === "function") window.renderGroupsList();

        const currentGroupIds = new Set(window.groups.map((g) => g.id));
        if (window.activeGroups.size === 0) {
            window.groups.forEach((g) => window.activeGroups.add(g.id));
        } else {
            for (let id of window.activeGroups) {
                if (!currentGroupIds.has(id)) {
                    window.activeGroups.delete(id);
                }
            }
        }
        if (typeof window.updateActiveFilterBadge === "function") {
            window.updateActiveFilterBadge();
        }
    }

    const { data: playersData, error: playersError } = await db
        .from("players")
        .select("*")
        .order("id", { ascending: true });

    if (!playersError && playersData) {
        window.players = playersData;
        playersData.forEach((p) => {
            if (p.player_color) {
                if (typeof window.setPlayerColorVariable === "function") {
                    window.setPlayerColorVariable(p.id, window.normalizeColorValue(p.player_color));
                }
            }
        });

        window.NAMES = playersData.map((p) => p.name);
        window.loggedInPlayerIndex = -1;
        playersData.forEach((p, i) => {
            if (i < 6) {
                window.NAMES[i] = p.name;
                if (window.currentUser && p.user_id === window.currentUser.id) {
                    window.loggedInPlayerIndex = i;
                }
            }
        });
        if (typeof window.updateAuthUI === "function") window.updateAuthUI();
        if (typeof window.renderPlayerToggles === "function") window.renderPlayerToggles();
    }

    const { data, error } = await db
        .from("heroes")
        .select(`
            *,
            groups (name),
            player_hero_stats (*),
            user_heroes (*)
        `)
        .order("name", { ascending: true });

    if (error) return console.error("Error fetching heroes:", error);

    window.characters = data.map((hero) => {
        const userHeroRecord = hero.user_heroes?.find(
            (uh) => uh.user_id === window.currentUser?.id,
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
            weights: Array(4).fill(window.DEFAULT_HERO_WEIGHT),
            playCount: [0, 0, 0, 0],
            lastPlayed: ["Never", "Never", "Never", "Never"],
            winCount: [0, 0, 0, 0],
        };

        hero.player_hero_stats?.forEach((stat) => {
            const pIdx = parseInt(stat.player_id.substring(1)) - 1;
            if (pIdx >= 0 && pIdx < 4) {
                char.weights[pIdx] = stat.weight;
            }
        });

        return char;
    });

    const { data: gamesData, error: gamesError } = await db
        .from("games")
        .select(`
            id,
            played_at,
            last_updated_by,
            is_historical,
            game_players (
                hero_id,
                player_id,
                is_winner,
                heroes (
                    name,
                    slug,
                    complexity
                )
            )
        `)
        .order("played_at", { ascending: false })
        .order("player_id", { foreignTable: "game_players", ascending: true });

    if (gamesError) {
        console.error("Error fetching games:", gamesError);
    } else {
        window.games = gamesData.map((game) => ({
            ...game,
            game_players: (game.game_players || []).slice().sort((a, b) => {
                const aIdx = parseInt(a.player_id?.substring(1) || "0", 10);
                const bIdx = parseInt(b.player_id?.substring(1) || "0", 10);
                return aIdx - bIdx;
            }),
        }));
    }

    if (typeof window.renderAdminBuildInfo === "function") window.renderAdminBuildInfo();
    if (typeof window.renderGroupsList === "function") window.renderGroupsList();
    if (typeof window.renderGamesList === "function") window.renderGamesList();
    if (typeof window.renderHeroesList === "function") window.renderHeroesList();
    if (typeof window.renderPlayersList === "function") window.renderPlayersList();
    if (typeof window.renderUsersList === "function") window.renderUsersList();
    if (window.isAdmin() && typeof window.renderCollectionsList === "function") {
        window.renderCollectionsList();
    }
    if (typeof window.renderCollectionView === "function") window.renderCollectionView();
    
    const initialSort = window.currentSort;
    window.currentSort = null;
    if (typeof window.setSort === "function") window.setSort(initialSort);
}
window.init = init;

// Bootstrapping App lifecycle
export async function initializeApp() {
    try {
        const {
            data: { session },
        } = await db.auth.getSession();
        window.currentUser = session?.user || null;
        if (typeof window.updateAuthUI === "function") window.updateAuthUI();

        await init();

        const response = await fetch("changelog.json");
        window.cachedChangelog = await response.json();

        if (window.cachedChangelog.length > 0) {
            const latestEntry = window.cachedChangelog[0];
            if (window.versionLabel) {
                window.versionLabel.innerText = latestEntry.version;
            }

            if (localStorage.getItem("lastSeenVersion") !== latestEntry.version) {
                if (typeof window.showWhatsNew === "function") window.showWhatsNew(latestEntry);
            }
        }

        // Setup Realtime subscriptions
        db.channel("schema-db-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "user_heroes" },
                init,
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "player_hero_stats" },
                init,
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "heroes" },
                init,
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "games" },
                init,
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "game_players" },
                init,
            )
            .subscribe();
    } catch (error) {
        console.error("Could not load version number:", error);
        if (window.versionLabel) {
            window.versionLabel.innerText = "Error";
        }
    } finally {
        hidePreloader();
    }
}
window.initializeApp = initializeApp;

function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    preloader.classList.add("fade-out");
    document.body.classList.add("loaded");
    preloader.addEventListener("animationend", () => preloader.remove(), {
        once: true,
    });
}
window.hidePreloader = hidePreloader;

// Wire up global DOM events
window.addEventListener("DOMContentLoaded", initializeApp);
if (window.versionLabel) window.versionLabel.onclick = window.openChangelog;
if (window.closeBtn) window.closeBtn.onclick = window.closeChangelog;

db.auth.onAuthStateChange((event, session) => {
    window.currentUser = session?.user || null;
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") init();

    if (event === "PASSWORD_RECOVERY") {
        if (typeof window.openUpdatePasswordModal === "function") window.openUpdatePasswordModal();
    }

    if (typeof window.updateAuthUI === "function") window.updateAuthUI();
    if (event === "SIGNED_IN" && typeof window.closeLoginModal === "function") {
        window.closeLoginModal();
    }
});

window.onclick = (event) => {
    if (event.target == window.modal && typeof window.closeChangelog === "function") window.closeChangelog();
    if (event.target == window.loginModal && typeof window.closeLoginModal === "function") window.closeLoginModal();
    if (event.target == window.whatsNewModal && typeof window.closeWhatsNew === "function") window.closeWhatsNew();
    if (event.target == window.updatePasswordModal && typeof window.closeUpdatePasswordModal === "function") window.closeUpdatePasswordModal();
    if (event.target == document.getElementById("hero-select-modal") && typeof window.closeHeroSelectModal === "function")
        window.closeHeroSelectModal();

    const sortDropdown = document.getElementById("sort-dropdown-menu");
    const sortContainer = document.getElementById("sort-dropdown-container");
    if (
        sortDropdown &&
        sortDropdown.classList.contains("show") &&
        sortContainer &&
        !sortContainer.contains(event.target)
    ) {
        if (typeof window.closeSortDropdown === "function") window.closeSortDropdown();
    }
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (typeof window.closeHeroSelectModal === "function") window.closeHeroSelectModal();
    }
});
