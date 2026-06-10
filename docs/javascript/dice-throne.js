// ==========================================
// 1. GLOBAL CONSTANTS & STATE
// ==========================================
let NAMES = [];

let characters = [];
let games = [];
let players = [];
let groups = [];
let authUsers = [];
let cachedChangelog = null;
let activeLevels = new Set([1, 2, 3, 4, 5, 6]);
let activeGroups = new Set();
let selectedGamePlayerIndex = null;
let expandedGameIds = new Set();
let currentSort = "name";
let sortAsc = true;
let currentSortPlayerIndex = 0;
let editIndex = -1;
let activePlayerIndices = [0, 1, 2, 3];
let currentDrawerMode = "sort-filter";
let stagedSort = "";
let stagedSortAsc = true;
let stagedSortPlayerIndex = 0;
let stagedLevels = new Set();
let stagedGroups = new Set();
let stagedPlayerIndices = [];
let stagedUseHistorical = true;
let dbUseHistorical = true;

// Games History Filters State
let gamesWinnerOnly = false;
let gamesUseHistorical = true;
let stagedSelectedGamePlayerIndex = null;
let stagedGamesWinnerOnly = false;
let stagedGamesUseHistorical = true;
let currentUser = null;
let loggedInPlayerIndex = -1;
let isRollActive = false;
let expandedCollectionGroups = new Set();
let scrambleIntervals = {};
let activeSelectPlayerIdx = null;
let modalSortMode = "name";
const isAdmin = () => currentUser?.app_metadata?.role === "admin";
const isUser = () => !!currentUser;

// Weight Constants
const DEFAULT_HERO_WEIGHT = 250;
const PICKED_HERO_WEIGHT = 20;
const WEIGHT_INCREMENT = 10;

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const versionLabel = document.getElementById("version-number");
const container = document.getElementById("changelog-container");
const modal = document.getElementById("changelog-modal");
const whatsNewModal = document.getElementById("whats-new-modal");
const whatsNewContainer = document.getElementById("whats-new-container");
const closeBtn = document.querySelector(".close-button");
const loginModal = document.getElementById("login-modal");
const authBtn = document.getElementById("auth-btn");
const actionButtons = document.getElementById("action-buttons");
let loginModalKeyHandler = null;
const loginForm = document.getElementById("login-form");
const updatePasswordModal = document.getElementById("update-password-modal");
const updatePasswordForm = document.getElementById("update-password-form");

// If a login form exists, intercept submit and call handleLogin
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleLogin();
    });
}

if (updatePasswordForm) {
    updatePasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleUpdatePassword();
    });
}

// ==========================================
// 3. SUPABASE CONFIGURATION
// ==========================================
const isProd = Boolean(
    window.location.hostname === "sygec.github.io" ||
    window.location.hostname === "dicethrone-prod.sygec.workers.dev",
);
const PROD_SUPABASE_URL = "https://ojqkkixtvdtccuixishh.supabase.co";
const PROD_SUPABASE_KEY = "sb_publishable_AT9BZrEkq1IDrZmP1Y_pDQ_Qwnh57ZH";
const DEV_SUPABASE_URL = "https://wmxrzjmadvivvpzbslgj.supabase.co";
const DEV_SUPABASE_KEY = "sb_publishable_Hohs2ojpVd5nmRJoi0upNg_PJv8M7x6";

const SUPABASE_URL = isProd ? PROD_SUPABASE_URL : DEV_SUPABASE_URL;
const SUPABASE_KEY = isProd ? PROD_SUPABASE_KEY : DEV_SUPABASE_KEY;

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 4. UTILITY HELPERS
// ==========================================
const getImgUrl = (slug) =>
    slug ? `https://dice-throne.rulepop.com/heroes/${slug}.webp` : "";
const getHeroLink = (slug) => `https://dice-throne.rulepop.com/#hero/${slug}`;

const isHeroOwned = (hero) => !!hero?.is_owned;

const escapeHtml = (text) => {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const normalizeColorValue = (color) => {
    if (!color) return "#ffffff";
    color = color.trim();
    if (color.startsWith("#")) return color;
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    }
    return color;
};

const getPlayerColor = (player) => {
    if (player?.player_color) return normalizeColorValue(player.player_color);
    const rootColor = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${player?.id}`)
        .trim();
    return normalizeColorValue(rootColor);
};

const setPlayerColorVariable = (playerId, color) => {
    document.documentElement.style.setProperty(`--${playerId}`, color);
};

function getHeroProbabilityText(charData, pIdx) {
    if (!charData) return "0.00%";
    const ownedCount = characters.filter(isHeroOwned).length;
    if (ownedCount === 0) return "0.00%";

    if (pIdx >= 4) {
        return `${(100 / ownedCount).toFixed(2)}%`;
    }

    let totalWeight = 0;
    characters
        .filter(isHeroOwned)
        .forEach((c) => (totalWeight += getSoftWeight(c, pIdx)));

    if (totalWeight === 0) return "0.00%";

    const owned = isHeroOwned(charData);
    const weight = getSoftWeight(charData, pIdx);
    const pct = owned ? ((weight / totalWeight) * 100).toFixed(2) : "0.00";
    return `${pct}%`;
}

async function handlePlayerColorChange(playerId, input) {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const currentColor = getPlayerColor(player);
    const newColor = normalizeColorValue(input.value);
    if (newColor.toLowerCase() === currentColor.toLowerCase()) return;

    const confirmed = confirm(
        `Change ${player.name}'s color from ${currentColor} to ${newColor}?`,
    );
    if (!confirmed) {
        input.value = currentColor;
        return;
    }

    const { error } = await db
        .from("players")
        .update({ player_color: newColor })
        .eq("id", playerId)
        .select()
        .single();

    if (error) {
        alert("Error saving player color: " + error.message);
        input.value = currentColor;
        return;
    }

    const playerIndex = players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
        players[playerIndex].player_color = newColor;
    }

    setPlayerColorVariable(playerId, newColor);
    renderPlayersList();
}

// ==========================================
// 5. APPLICATION INITIALIZATION
// ==========================================

// ******************************************
// initializeApp()
// input: none
// ******************************************
// Fetches the changelog JSON and sets the initial version display.
// ******************************************
async function initializeApp() {
    try {
        // Check for existing session on load
        const {
            data: { session },
        } = await db.auth.getSession();
        currentUser = session?.user || null;
        updateAuthUI();

        // Initialize app data
        await init();

        const response = await fetch("changelog.json");
        cachedChangelog = await response.json();

        if (cachedChangelog.length > 0) {
            const latestEntry = cachedChangelog[0];
            versionLabel.innerText = latestEntry.version;

            // Check if user has seen this version already
            if (
                localStorage.getItem("lastSeenVersion") !== latestEntry.version
            ) {
                showWhatsNew(latestEntry);
            }
        }

        // Setup Realtime subscription once after initial load to keep data in sync across clients
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
        versionLabel.innerText = "Error";
    } finally {
        hidePreloader();
    }
}

function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    preloader.classList.add("fade-out");
    document.body.classList.add("loaded");
    preloader.addEventListener("animationend", () => preloader.remove(), {
        once: true,
    });
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
window.addEventListener("DOMContentLoaded", initializeApp);
versionLabel.onclick = openChangelog;
closeBtn.onclick = closeChangelog;

// Auth Event Listeners
db.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") init();

    if (event === "PASSWORD_RECOVERY") {
        openUpdatePasswordModal();
    }

    updateAuthUI();
    if (event === "SIGNED_IN") closeLoginModal();
});

window.onclick = (event) => {
    if (event.target == modal) closeChangelog();
    if (event.target == loginModal) closeLoginModal();
    if (event.target == whatsNewModal) closeWhatsNew();
    if (event.target == updatePasswordModal) closeUpdatePasswordModal();
    if (event.target == document.getElementById("hero-select-modal"))
        closeHeroSelectModal();
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeHeroSelectModal();
    }
});

// ******************************************
// Auth UI & Logic
// ******************************************
function updateAuthUI() {
    const adminNav = document.querySelector(".bottom-nav .admin-only");

    if (currentUser) {
        if (loggedInPlayerIndex !== -1) {
            authBtn.innerText = `Logout (${NAMES[loggedInPlayerIndex]})`;
        } else {
            authBtn.innerText = `Logout (${currentUser.email.split("@")[0]})`;
        }
        authBtn.onclick = handleLogout;
        if (adminNav) adminNav.style.display = isAdmin() ? "flex" : "none";
    } else {
        authBtn.innerText = "Login";
        authBtn.onclick = openLoginModal;
        if (adminNav) adminNav.style.display = "none";
        if (document.getElementById("adminSection"))
            document.getElementById("adminSection").classList.add("hidden");
        if (actionButtons) actionButtons.style.display = "none";
        const rollBtn = document.getElementById("rollBtn");
        if (rollBtn) rollBtn.style.display = "block";
    }

    // Refresh lists to show/hide edit buttons
    renderList();
    renderGamesList();
    renderHeroesList();
}

// ******************************************
// renderPlayerToggles()
// input: none
// ******************************************
// Dynamically builds the player selection checkboxes at the top of the app.
// ******************************************
function renderPlayerToggles() {
    const container = document.getElementById("player-toggle-zone-top");
    if (!container || players.length === 0) return;

    container.innerHTML = players
        .map((p, i) => {
            const isChecked = i < 4 ? "checked" : "";
            return `
            <label class="player-card" style="--player-color: var(--${p.id})">
                <input type="checkbox" id="use${i}" ${isChecked} onclick="handlePlayerToggleClick(event, ${i})">
                <span class="player-card-name">${p.name}</span>
            </label>`;
        })
        .join("");
}

// ******************************************
// openLoginModal()
// input: none
// ******************************************
// Displays the login modal and prevents background scrolling.
// ******************************************
function openLoginModal() {
    loginModal.style.display = "flex";
    document.getElementById("login-error").style.display = "none";
    document.body.style.overflow = "hidden";
    // Add key handler so Escape cancels (form submit handles Enter)
    loginModalKeyHandler = (e) => {
        if (e.key === "Escape") {
            closeLoginModal();
        }
    };
    document.addEventListener("keydown", loginModalKeyHandler);
}

// ******************************************
// closeLoginModal()
// input: none
// ******************************************
// Hides the login modal and restores background scrolling.
// ******************************************
function closeLoginModal() {
    loginModal.style.display = "none";
    document.body.style.overflow = "auto";
    // Remove key handler when modal is closed
    if (loginModalKeyHandler) {
        document.removeEventListener("keydown", loginModalKeyHandler);
        loginModalKeyHandler = null;
    }
}

async function handleLogin() {
    const email = document.getElementById("login-email").value;
    // ******************************************
    // handleLogin()
    // input: none
    // ******************************************
    // Attempts to sign in a user with provided email and password using Supabase authentication.
    // ******************************************
    const password = document.getElementById("login-password").value;
    const errorDiv = document.getElementById("login-error");

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = "block";
    }
}

async function handlePasswordReset() {
    const email = document.getElementById("login-email").value;
    const errorDiv = document.getElementById("login-error");

    if (!email) {
        errorDiv.innerText =
            "Please enter your email address first to reset password.";
        errorDiv.style.display = "block";
        return;
    }

    const { error } = await db.auth.resetPasswordForEmail(email);

    if (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = "block";
    } else {
        errorDiv.innerText =
            "Password reset email sent. Please check your inbox.";
        errorDiv.style.color = "#4CAF50";
        errorDiv.style.display = "block";
        setTimeout(() => {
            errorDiv.style.color = "var(--danger)";
        }, 5000);
    }
}

function openUpdatePasswordModal() {
    updatePasswordModal.style.display = "block";
    document.getElementById("update-password-error").style.display = "none";
    document.body.style.overflow = "hidden";
}

function closeUpdatePasswordModal() {
    updatePasswordModal.style.display = "none";
    document.body.style.overflow = "auto";
}

async function handleUpdatePassword() {
    const newPassword = document.getElementById("new-password").value;
    const errorDiv = document.getElementById("update-password-error");

    if (!newPassword) {
        errorDiv.innerText = "Please enter a new password.";
        errorDiv.style.display = "block";
        return;
    }

    const { error } = await db.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = "block";
    } else {
        alert("Password updated successfully!");
        closeUpdatePasswordModal();
        document.getElementById("new-password").value = "";
    }
}

// ******************************************
// handleLogout()
// input: none
// ******************************************
// Prompts the user for confirmation and then logs out the current user from Supabase.
// ******************************************
async function handleLogout() {
    if (confirm("Log out now?")) {
        await db.auth.signOut();
    }
}

// ******************************************
// init()
// input: none
// ******************************************
// Fetches initial data from Supabase and sets the initial sort state.
// ******************************************
async function init() {
    // 0. Fetch Groups
    const { data: groupsData, error: groupsError } = await db
        .from("groups")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

    if (!groupsError && groupsData) {
        groups = groupsData;
        populateGroupDropdown();
        renderGroupsList();

        // Initialize or update activeGroups
        const currentGroupIds = new Set(groups.map((g) => g.id));
        if (activeGroups.size === 0) {
            groups.forEach((g) => activeGroups.add(g.id));
        } else {
            // Remove any IDs that are no longer in the fetched groups
            for (let id of activeGroups) {
                if (!currentGroupIds.has(id)) {
                    activeGroups.delete(id);
                }
            }
        }
        updateActiveFilterBadge();
    }

    // 1. Fetch Players and Map logged-in User
    const { data: playersData, error: playersError } = await db
        .from("players")
        .select("*")
        .order("id", { ascending: true });

    if (!playersError && playersData) {
        players = playersData;
        playersData.forEach((p) => {
            if (p.player_color) {
                setPlayerColorVariable(
                    p.id,
                    normalizeColorValue(p.player_color),
                );
            }
        });

        NAMES = playersData.map((p) => p.name);
        loggedInPlayerIndex = -1;
        playersData.forEach((p, i) => {
            if (i < 6) {
                NAMES[i] = p.name;
                if (currentUser && p.user_id === currentUser.id) {
                    loggedInPlayerIndex = i;
                }
            }
        });
        updateAuthUI();
        renderPlayerToggles();
    }

    const { data, error } = await db
        .from("heroes")
        .select(
            `
            *,
            groups (name),
            player_hero_stats (*),
            user_heroes (*)
        `,
        )
        .order("name", { ascending: true });

    if (error) return console.error("Error fetching heroes:", error);

    // Transform Supabase relational data into the flat array format expected by the app
    characters = data.map((hero) => {
        const userHeroRecord = hero.user_heroes?.find(
            (uh) => uh.user_id === currentUser?.id,
        );
        const isOwned = userHeroRecord ? userHeroRecord.is_owned : true; // Default to true if no record exists

        const char = {
            id: hero.id,
            name: hero.name,
            slug: hero.slug,
            complexity: hero.complexity,
            group_id: hero.group_id,
            is_owned: isOwned,
            group: hero.groups?.name || "Unknown",
            weights: Array(4).fill(DEFAULT_HERO_WEIGHT),
            playCount: [0, 0, 0, 0],
            lastPlayed: ["Never", "Never", "Never", "Never"],
            winCount: [0, 0, 0, 0], // Initialize winCount for each player
        };

        // Map stats from the player_hero_stats table into the arrays by player index
        hero.player_hero_stats?.forEach((stat) => {
            // Map player IDs "p1"-"p4" from the database to internal indices 0-3
            const pIdx = parseInt(stat.player_id.substring(1)) - 1;
            if (pIdx >= 0 && pIdx < 4) {
                char.weights[pIdx] = stat.weight;
            }
        });

        return char;
    });

    // Fetch Games and their participants
    const { data: gamesData, error: gamesError } = await db
        .from("games")
        .select(
            `
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
        `,
        )
        .order("played_at", { ascending: false })
        .order("player_id", { foreignTable: "game_players", ascending: true });

    if (gamesError) console.error("Error fetching games:", gamesError);
    else {
        games = gamesData.map((game) => ({
            ...game,
            game_players: (game.game_players || []).slice().sort((a, b) => {
                const aIdx = parseInt(a.player_id?.substring(1) || "0", 10);
                const bIdx = parseInt(b.player_id?.substring(1) || "0", 10);
                return aIdx - bIdx;
            }),
        }));
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
    const initialSort = currentSort;
    currentSort = null;
    setSort(initialSort);
}

// ******************************************
// renderAdminBuildInfo()
// input: none
// ******************************************
// Displays environment and database info at the top of the admin panel.
// ******************************************
function renderAdminBuildInfo() {
    const infoDiv = document.getElementById("admin-build-info");
    if (!infoDiv) return;

    const host = window.location.hostname;
    let platform = "Localhost";
    if (host.includes("github.io")) platform = "GitHub Pages";
    else if (host.includes("workers.dev")) platform = "Cloudflare Workers";

    const env = isProd ? "Production" : "Development";
    const dbName = isProd ? "Supabase PROD" : "Supabase DEV";
    const branchHint = isProd ? "main" : "dev/local";

    infoDiv.innerHTML = `
        <div><b>Platform:</b> ${platform} (${host})</div>
        <div><b>Environment:</b> ${env} (Targeting: ${branchHint})</div>
        <div><b>Database:</b> ${dbName}</div>
        ${!isProd ? '<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>' : ""}
    `;
}

// ******************************************
// openChangelog()
// input: none
// ******************************************
// Populates the changelog modal with version history from the cached
// JSON data and displays it to the user.
// ******************************************
function openChangelog() {
    if (!cachedChangelog) return; // Wait if data isn't loaded yet

    // Generate the HTML for all changelog entries and update the container in one go
    container.innerHTML = cachedChangelog
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

    modal.style.display = "flex"; // Show the modal
    document.body.style.overflow = "hidden"; // Prevent background scrolling when modal is open
}

// ******************************************
// closeChangelog()
// input: none
// ******************************************
// Hides the changelog modal and restores background scrolling.
// ******************************************
function closeChangelog() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Restores background scrolling
}

// ******************************************
// showWhatsNew(entry)
// input: entry -> the most recent changelog entry object
// ******************************************
// Displays a simplified modal showing only the most recent updates.
// ******************************************
function showWhatsNew(entry) {
    whatsNewContainer.innerHTML = `
        <div>
            <h3>v${entry.version}</h3>
            <ul style="text-align: left;">
                ${entry.changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
        </div>
    `;
    whatsNewModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    // Save to localStorage so it doesn't show again for this version
    localStorage.setItem("lastSeenVersion", entry.version);
}

function closeWhatsNew() {
    whatsNewModal.style.display = "none";
    document.body.style.overflow = "auto";
}

// ******************************************
// showRoll()
// input: none
// ******************************************
// Shows the Roll section and hides all other sections.
// ******************************************
function showRoll() {
    const rs = document.getElementById("rollSection");
    const ds = document.getElementById("dbSection");
    const gs = document.getElementById("gamesSection");
    const cs = document.getElementById("collectionSection");
    const as = document.getElementById("adminSection");

    rs.classList.remove("hidden");
    ds.classList.add("hidden");
    gs.classList.add("hidden");
    cs.classList.add("hidden");
    as.classList.add("hidden");
}

// ******************************************
// showDatabase()
// input: none
// ******************************************
// Toggles the visibility of the Hero Database section.
// ******************************************
function showDatabase() {
    const rs = document.getElementById("rollSection");
    const ds = document.getElementById("dbSection");
    const gs = document.getElementById("gamesSection");
    const cs = document.getElementById("collectionSection");
    const as = document.getElementById("adminSection");

    rs.classList.add("hidden");
    ds.classList.remove("hidden");
    gs.classList.add("hidden");
    cs.classList.add("hidden");
    as.classList.add("hidden");

    setTimeout(updateSegmentedHighlights, 50);
}

// ******************************************
// showHistory()
// input: none
// ******************************************
// Toggles the visibility of the Games History section.
// ******************************************
function showHistory() {
    const rs = document.getElementById("rollSection");
    const ds = document.getElementById("dbSection");
    const gs = document.getElementById("gamesSection");
    const cs = document.getElementById("collectionSection");
    const as = document.getElementById("adminSection");

    rs.classList.add("hidden");
    ds.classList.add("hidden");
    gs.classList.remove("hidden");
    cs.classList.add("hidden");
    as.classList.add("hidden");
    renderGamesList();
}

// ******************************************
// showCollection()
// input: none
// ******************************************
function showCollection() {
    const rs = document.getElementById("rollSection");
    const ds = document.getElementById("dbSection");
    const gs = document.getElementById("gamesSection");
    const cs = document.getElementById("collectionSection");
    const as = document.getElementById("adminSection");

    rs.classList.add("hidden");
    ds.classList.add("hidden");
    gs.classList.add("hidden");
    cs.classList.remove("hidden");
    as.classList.add("hidden");
    renderCollectionView();
}

// ******************************************
// showAdmin()
// input: none
// ******************************************
// Toggles the visibility of the Admin section.
// ******************************************
function showAdmin() {
    if (!isAdmin()) return;

    const rs = document.getElementById("rollSection");
    const ds = document.getElementById("dbSection");
    const gs = document.getElementById("gamesSection");
    const cs = document.getElementById("collectionSection");
    const as = document.getElementById("adminSection");

    rs.classList.add("hidden");
    ds.classList.add("hidden");
    gs.classList.add("hidden");
    cs.classList.add("hidden");
    as.classList.remove("hidden");
}

// ******************************************
// toggleSortSection()
// input: none
// ******************************************
// Toggles the visibility of the sorting section and resets sort if hidden.
// ******************************************
function toggleSortSection() {
    const sortSection = document.getElementById("sort-section");
    const button = document.getElementById("sort-panel-toggle");
    if (!sortSection) return;
    const isHidden = sortSection.classList.toggle("hidden");
    if (button) {
        button.classList.toggle("open", !isHidden);
        button.setAttribute("aria-expanded", String(!isHidden));
    }
}

// ******************************************
// toggleFilterSection()
// input: none
// ******************************************
// Toggles the visibility of the filter section visually.
// ******************************************
function toggleFilterSection() {
    const filterSection = document.getElementById("filter-section");
    const button = document.getElementById("filter-panel-toggle");
    if (!filterSection) return;
    const isHidden = filterSection.classList.toggle("hidden");
    if (button) {
        button.classList.toggle("open", !isHidden);
        button.setAttribute("aria-expanded", String(!isHidden));
    }
}

// ******************************************
// toggleAdminPanel(panelId)
// input: panelId -> ID of the admin panel content section
// ******************************************
// Opens or closes a panel within the admin section.
// ******************************************
function toggleAdminPanel(event, panelId) {
    const panel = document.getElementById(panelId);
    const header =
        event.currentTarget.closest(".panel-header") || event.currentTarget;
    const button = header.querySelector(".panel-toggle");
    if (!panel || !button) return;

    const isHidden = panel.classList.toggle("hidden");
    button.classList.toggle("open", !isHidden);
    button.setAttribute("aria-expanded", String(!isHidden));
}

function toggleHeroPanel(header) {
    const item = header.closest(".hero-item");
    const button = header.querySelector(".panel-toggle");
    const isNowCollapsed = item.classList.toggle("collapsed");
    button.classList.toggle("open", !isNowCollapsed);
    button.setAttribute("aria-expanded", String(!isNowCollapsed));
}

// ******************************************
// toggleCollectionGroup(groupId, event)
// input: groupId, event
// ******************************************
function toggleCollectionGroup(groupId, event) {
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "LABEL" ||
        event.target.closest("label")
    ) {
        return;
    }
    if (expandedCollectionGroups.has(groupId)) {
        expandedCollectionGroups.delete(groupId);
    } else {
        expandedCollectionGroups.add(groupId);
    }
    renderCollectionView();
}

// ******************************************
// setOwnershipFilter(filterState)
// input: filterState ('owned', 'unowned', 'all')
// ******************************************
function setOwnershipFilter(filterState) {
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

    // Update segmented pill active class
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

// ******************************************
// renderCollectionView()
// input: none
// ******************************************
function renderCollectionView() {
    const container = document.getElementById("collectionContainer");
    const countLabel = document.getElementById("collection-count-stats");
    if (!container) return;

    const totalHeroes = characters.length;
    const ownedHeroes = characters.filter(isHeroOwned).length;

    if (countLabel) {
        countLabel.innerText = `Owned ${ownedHeroes} of ${totalHeroes} heroes`;
    }

    // Sort groups using the order_index value
    const sortedGroups = [...groups].sort((a, b) => {
        const orderA = a.order_index ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order_index ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return a.name.localeCompare(b.name);
    });

    const isDisabled = currentUser ? "" : "disabled";

    container.innerHTML = sortedGroups
        .map((group) => {
            const groupHeroes = characters
                .filter((c) => c.group_id === group.id)
                .sort((a, b) => a.name.localeCompare(b.name));

            if (groupHeroes.length === 0) return "";

            // A group is "checked" if all heroes in it are owned
            const allOwned = groupHeroes.every(isHeroOwned);

            const heroesHtml = groupHeroes
                .map((h) => {
                    const isSelected = isHeroOwned(h);
                    return `
            <div class="collection-hero-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}" onclick="toggleHeroOwned('${h.id}', ${!isSelected})">
                <img src="${getImgUrl(h.slug)}" class="collection-hero-card-img" alt="${h.name}">
                <div class="collection-hero-card-name">${h.name}</div>
            </div>
        `;
                })
                .join("");

            const isExpanded = expandedCollectionGroups.has(group.id);
            const totalGroup = groupHeroes.length;
            const ownedGroup = groupHeroes.filter(isHeroOwned).length;

            return `
            <div class="collection-group${isExpanded ? "" : " collapsed"}">
                <div class="collection-group-header" onclick="toggleCollectionGroup('${group.id}', event)" style="cursor: pointer;">
                    <input type="checkbox" id="owned-group-${group.id}" ${allOwned ? "checked" : ""} ${isDisabled} onchange="toggleGroupOwned('${group.id}', this.checked)" onclick="event.stopPropagation();">
                    <label for="owned-group-${group.id}" onclick="event.stopPropagation();">
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

async function toggleHeroOwned(heroId, isOwned) {
    if (!currentUser) {
        alert("Please log in to manage your collection.");
        return;
    }

    // Update local state first for immediate UI feedback
    const hero = characters.find((h) => h.id === heroId);
    if (hero) hero.is_owned = isOwned;
    renderCollectionView();
    renderList();
    updateDropdownSort(); // Refresh dropdowns in the Roll section

    // Sync with Admin collections panel if visible
    const adminCheckbox = document.getElementById(
        `admin-owned-${currentUser.id}-${heroId}`,
    );
    if (adminCheckbox) {
        adminCheckbox.checked = isOwned;
    }

    const { error } = await db.from("user_heroes").upsert({
        user_id: currentUser.id,
        hero_id: heroId,
        is_owned: isOwned,
    });

    if (error) {
        alert("Error updating ownership: " + error.message);
        // Revert local state on error
        if (hero) hero.is_owned = !isOwned;
        renderCollectionView();
        updateDropdownSort(); // Revert dropdowns on error
        renderList();

        // Revert admin panel checkbox
        if (adminCheckbox) {
            adminCheckbox.checked = !isOwned;
        }
    }
}

async function toggleGroupOwned(groupId, isOwned) {
    if (!currentUser) {
        alert("Please log in to manage your collection.");
        return;
    }

    // Update local state for all heroes in the group immediately
    characters.forEach((h) => {
        if (h.group_id === groupId) {
            h.is_owned = isOwned;
            const adminCheckbox = document.getElementById(
                `admin-owned-${currentUser.id}-${h.id}`,
            );
            if (adminCheckbox) {
                adminCheckbox.checked = isOwned;
            }
        }
    });
    renderCollectionView();
    renderList();
    updateDropdownSort(); // Refresh dropdowns in the Roll section

    const groupHeroIds = characters
        .filter((h) => h.group_id === groupId)
        .map((h) => ({
            user_id: currentUser.id,
            hero_id: h.id,
            is_owned: isOwned,
        }));

    const { error } = await db.from("user_heroes").upsert(groupHeroIds);

    if (error) {
        alert("Error updating group ownership: " + error.message);
        // Revert local state on error
        characters.forEach((h) => {
            if (h.group_id === groupId) h.is_owned = !isOwned;
        });
        renderCollectionView();
        updateDropdownSort(); // Revert dropdowns on error
        renderList();
    }
}

// ******************************************
// saveCharacter()
// input: none
// ******************************************
// Adds a new hero or updates an existing one in Supabase.
// ******************************************
async function saveCharacter() {
    // Extract and trim values from the add-new-hero form inputs
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
        last_updated_by: currentUser.id,
    };

    const { data: hero, error } = await db
        .from("heroes")
        .insert(charData)
        .select()
        .single();

    if (error) return alert("Error saving: " + error.message);

    init(); // Refresh local state
    resetForm();
}

// ******************************************
// editChar(idx)
// input: idx -> index of the character in the global array
// ******************************************
// Populates the admin form with data from a specific character for editing,
// ensures the admin section is visible, and scrolls the user to the form.
// ******************************************
function editChar(idx) {
    editIndex = idx;
    renderHeroesList();

    const adminSection = document.getElementById("adminSection");
    if (adminSection.classList.contains("hidden")) toggleAdmin();

    const editPanel = document.getElementById(
        `heroEditPanel-${characters[idx]?.id}`,
    );
    if (editPanel && !isElementFullyVisible(editPanel)) {
        editPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function isElementFullyVisible(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight)
    );
}

// ******************************************
// resetForm()
// input: none
// ******************************************
// Clears the Hero Management form fields and resets the title.
// ******************************************
function resetForm() {
    editIndex = -1;

    document.getElementById("charName").value = "";
    document.getElementById("charSlug").value = "";
    document.getElementById("charGroup").value = "";
    document.getElementById("charComplexity").value = "";

    // Reset UI state to "Add" mode
    document.getElementById("formTitle").innerText = "Add New Hero";

    const form = document.getElementById("heroForm");
    const button = document.getElementById("addHeroBtn");
    if (form && button) {
        form.classList.add("hidden");
        button.innerText = "Add Hero";
    }
}

function toggleHeroForm() {
    const form = document.getElementById("heroForm");
    const button = document.getElementById("addHeroBtn");
    if (!form || !button) return;

    const isHidden = form.classList.toggle("hidden");
    button.innerText = isHidden ? "Add Hero" : "Hide Hero Form";

    if (!isHidden) {
        document.getElementById("charName")?.focus();
    }
}

// ******************************************
// populateGroupDropdown()
// input: none
// ******************************************
// Populates the group dropdown in the hero management form with all active groups.
// ******************************************
function populateGroupDropdown() {
    const select = document.getElementById("charGroup");
    const options = groups
        .map((g) => `<option value="${g.id}">${g.name}</option>`)
        .join("");
    select.innerHTML = '<option value="">-- Select Group --</option>' + options;
}

// ******************************************
// renderGroupsList()
// input: none
// ******************************************
// Renders the list of groups with edit and delete buttons in the admin section.
// ******************************************
function renderGroupsList() {
    const container = document.getElementById("groupsListContainer");

    if (groups.length === 0) {
        container.innerHTML =
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
                    <button type="button" class="btn-save btn-inline" onclick="editGroup('${g.id}')">Edit</button>
                    <button type="button" class="btn-cancel btn-inline" onclick="deleteGroup('${g.id}')">Delete</button>
                </div>
            </div>
            <div id="groupEditPanel-${g.id}" class="group-edit-panel hidden">
                <div class="form-grid">
                    <input type="text" id="groupName-${g.id}" placeholder="Group Name" value="${escapeHtml(g.name)}">
                    <input type="number" id="groupOrder-${g.id}" placeholder="Order Index" value="${g.order_index ?? ""}">
                    <input type="number" id="groupYear-${g.id}" placeholder="Release Year" value="${g.year ?? ""}">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn-save" onclick="saveGroupInline('${g.id}')">Save</button>
                    <button type="button" class="btn-cancel" onclick="cancelGroupEdit('${g.id}')">Cancel</button>
                </div>
            </div>
        </div>
    `,
        )
        .join("");

    container.innerHTML = html;
}

function renderHeroesList() {
    const container = document.getElementById("heroesListContainer");
    if (!container) return;

    if (characters.length === 0) {
        container.innerHTML =
            '<p style="opacity: 0.6; font-style: italic;">No heroes yet. Add one above.</p>';
        return;
    }

    const html = characters
        .map((c, idx) => {
            const isEditing = editIndex === idx;
            const editBtn = isAdmin()
                ? `<button class="btn-save btn-inline" onclick="editChar(${idx})">Edit</button>`
                : "";
            const deleteBtn = isAdmin()
                ? `<button class="btn-cancel btn-inline" onclick="deleteHero('${c.id}')">Delete</button>`
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
                        <button class="btn-save" onclick="saveHeroInline('${c.id}', ${idx})">Save</button>
                        <button class="btn-cancel" onclick="cancelHeroEdit()">Cancel</button>
                    </div>
                </div>
            </div>`;
        })
        .join("");

    container.innerHTML = html;
    if (editIndex !== -1) {
        container.classList.add("group-edit-active");
    } else {
        container.classList.remove("group-edit-active");
    }
}

function cancelHeroEdit() {
    editIndex = -1;
    renderHeroesList();
}

async function saveHeroInline(heroId, idx) {
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
        last_updated_by: currentUser.id,
    };

    const { data: hero, error } = await db
        .from("heroes")
        .upsert(charData)
        .select()
        .single();

    if (error) return alert("Error saving: " + error.message);

    editIndex = -1;
    await init();
}

async function deleteHero(heroId) {
    if (!confirm("Delete this hero? This action cannot be undone.")) return;

    const { error } = await db.from("heroes").delete().eq("id", heroId);
    if (error) return alert("Error deleting hero: " + error.message);

    await init();
}

// ******************************************
// saveGroup()
// input: none
// ******************************************
// Adds a new group or updates an existing one in Supabase.
// ******************************************
async function saveGroup() {
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

    const { data, error } = await db
        .from("groups")
        .upsert(groupData)
        .select()
        .single();

    if (error) return alert("Error saving group: " + error.message);

    resetGroupForm();
    init(); // Refresh everything including groups
}

// ******************************************
// editGroup(groupId)
// input: groupId -> UUID of the group to edit
// ******************************************
// Opens an inline editor panel for the selected group.
// ******************************************
function editGroup(groupId) {
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

function cancelGroupEdit(groupId) {
    const panel = document.getElementById(`groupEditPanel-${groupId}`);
    const activeRow = document.getElementById(`groupRow-${groupId}`);
    const listContainer = document.getElementById("groupsListContainer");

    if (panel) panel.classList.add("hidden");
    if (activeRow) activeRow.classList.remove("editing");
    if (listContainer) listContainer.classList.remove("group-edit-active");
}

async function saveGroupInline(groupId) {
    const name = document.getElementById(`groupName-${groupId}`).value.trim();
    const order_index = document
        .getElementById(`groupOrder-${groupId}`)
        .value.trim();
    const year = document.getElementById(`groupYear-${groupId}`).value.trim();

    if (!name) return alert("Group name is required");

    const { error } = await db
        .from("groups")
        .upsert({
            id: groupId,
            name,
            order_index: order_index ? parseInt(order_index) : null,
            year: year ? parseInt(year) : null,
            is_active: true,
        })
        .select()
        .single();

    if (error) return alert("Error saving group: " + error.message);

    init();
}

// ******************************************
// resetGroupForm()
// input: none
// ******************************************
// Clears the group management form fields and resets to "Add" mode.
// ******************************************
function resetGroupForm() {
    document.getElementById("groupName").value = "";
    document.getElementById("groupOrder").value = "";
    document.getElementById("groupYear").value = "";

    const form = document.getElementById("groupForm");
    const button = document.getElementById("addGroupBtn");
    if (form && button) {
        form.classList.add("hidden");
        button.innerText = "Add Group";
    }
}

// ******************************************
// renderPlayersList()
// input: none
// ******************************************
// Renders the list of players in the admin panel with inline editing capabilities.
// ******************************************
function renderPlayersList() {
    const container = document.getElementById("playersListContainer");
    if (!container) return;

    container.innerHTML = "";

    players.forEach((player) => {
        const row = document.createElement("div");
        row.className = "player-admin-row";
        row.id = `playerRow-${player.id}`;

        const displayDiv = document.createElement("div");
        displayDiv.className = "player-display";
        displayDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="player-color-dot" style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--${player.id}); border: 1px solid rgba(255,255,255,0.2);"></span>
                <strong>${escapeHtml(player.name)}</strong>
            </div>
            <div class="player-actions">
                <label class="color-picker-button" title="Choose player color">
                    <span>🎨</span>
                    <input type="color" id="playerColor-${player.id}" value="${escapeHtml(getPlayerColor(player))}" onchange="handlePlayerColorChange('${player.id}', this)">
                </label>
                <button type="button" class="btn-save btn-inline" onclick="editPlayer('${player.id}')">Edit</button>
            </div>
        `;

        const editPanel = document.createElement("div");
        editPanel.className = "player-edit-panel hidden";
        editPanel.id = `playerEditPanel-${player.id}`;
        editPanel.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="playerName-${player.id}" value="${player.name}" style="flex: 1;">
                <button type="button" class="btn-save" onclick="savePlayerInline('${player.id}')">Save</button>
                <button type="button" class="btn-cancel" onclick="cancelPlayerEdit('${player.id}')">Cancel</button>
            </div>
        `;

        row.appendChild(displayDiv);
        row.appendChild(editPanel);
        container.appendChild(row);
    });
}

// ******************************************
// editPlayer(playerId)
// input: playerId -> UUID of the player to edit
// ******************************************
// Opens an inline editor for the selected player.
// ******************************************
function editPlayer(playerId) {
    const player = players.find((p) => p.id === playerId);
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

// ******************************************
// cancelPlayerEdit(playerId)
// input: playerId -> UUID of the player being edited
// ******************************************
// Cancels the inline edit for the player and hides the edit panel.
// ******************************************
function cancelPlayerEdit(playerId) {
    const panel = document.getElementById(`playerEditPanel-${playerId}`);
    const activeRow = document.getElementById(`playerRow-${playerId}`);
    const listContainer = document.getElementById("playersListContainer");

    if (panel) panel.classList.add("hidden");
    if (activeRow) activeRow.classList.remove("editing");
    if (listContainer) listContainer.classList.remove("player-edit-active");
}

// ******************************************
// savePlayerInline(playerId)
// input: playerId -> UUID of the player to save
// ******************************************
// Saves the inline edited player name to the database.
// ******************************************
async function savePlayerInline(playerId) {
    const name = document.getElementById(`playerName-${playerId}`).value.trim();

    if (!name) return alert("Player name is required");

    const { error } = await db
        .from("players")
        .update({ name })
        .eq("id", playerId)
        .select()
        .single();

    if (error) return alert("Error saving player: " + error.message);

    // Update local players array
    const playerIndex = players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
        players[playerIndex].name = name;
        NAMES[playerIndex] = name;
    }

    cancelPlayerEdit(playerId);
    renderPlayersList();
}

// ******************************************
// renderUsersList()
// input: none
// ******************************************
// Renders the list of auth users and shows any linked player record.
// ******************************************
function renderUsersList() {
    const container = document.getElementById("usersListContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!authUsers.length) {
        container.innerHTML =
            '<p style="opacity: 0.7; font-style: italic;">No auth users available or permission denied.</p>';
        return;
    }

    authUsers.forEach((user) => {
        const linkedPlayer = players.find((p) => p.user_id === user.id);
        const row = document.createElement("div");
        row.className = "group-row user-admin-row";
        row.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; gap: 10px;">
                <div style="min-width: 0;">
                    <div><strong>${escapeHtml(user.email || "No email")}</strong></div>
                    <div style="opacity: 0.7; font-size: 0.85rem; word-break: break-all;">ID: ${escapeHtml(user.id)}</div>
                </div>
                <div style="text-align: right; min-width: 130px;">
                    ${linkedPlayer ? `<div style="opacity: 0.7; font-size: 0.85rem;">Linked Player</div><div><strong>${escapeHtml(linkedPlayer.name)}</strong></div>` : '<div style="opacity: 0.7; font-size: 0.85rem;">No linked player</div>'}
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

// ******************************************
// renderCollectionsList()
// input: none
// ******************************************
// Renders the matrix of hero ownership per player for admins.
// ******************************************
async function renderCollectionsList() {
    const container = document.getElementById("collectionsListContainer");
    if (!container) return;

    container.innerHTML =
        '<p style="opacity: 0.7; font-style: italic; padding: 10px;">Loading collections...</p>';

    // Fetch all user_heroes records safely
    let allUserHeroes = [];
    try {
        const { data, error } = await db.from("user_heroes").select("*");

        if (error) {
            container.innerHTML = `<p style="color: var(--danger); padding: 10px;">Error loading collections: ${escapeHtml(error.message)}</p>`;
            return;
        }
        allUserHeroes = data || [];
    } catch (e) {
        container.innerHTML = `<p style="color: var(--danger); padding: 10px;">Error connecting to database: ${escapeHtml(e.message)}</p>`;
        return;
    }

    // Build user profiles list to show in the matrix columns
    const userProfiles = [];

    // 1. Add linked players
    players.forEach((p) => {
        if (p.user_id) {
            userProfiles.push({
                user_id: p.user_id,
                name: p.name,
                isLinked: true,
            });
        }
    });

    // 2. Add other users who have records in user_heroes but aren't linked to players
    allUserHeroes.forEach((row) => {
        if (!userProfiles.some((up) => up.user_id === row.user_id)) {
            userProfiles.push({
                user_id: row.user_id,
                name: `User (${row.user_id.substring(0, 8)})`,
                isLinked: false,
            });
        }
    });

    // 3. Add the current logged-in user if they aren't already in the list
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

    if (userProfiles.length === 0) {
        container.innerHTML =
            '<p style="opacity: 0.7; font-style: italic; padding: 10px;">No user profiles available.</p>';
        return;
    }

    // Build ownership map for easy lookup: key = `${userId}_${heroId}`
    const ownershipMap = {};
    allUserHeroes.forEach((row) => {
        ownershipMap[`${row.user_id}_${row.hero_id}`] = row.is_owned;
    });

    // Create table wrapper for responsive scrolling
    const tableWrapper = document.createElement("div");
    tableWrapper.style.overflowX = "auto";
    tableWrapper.style.marginTop = "10px";

    // Build header columns: Hero + user profiles
    const headersHtml = userProfiles
        .map(
            (up) =>
                `<th style="padding: 10px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem;">${escapeHtml(up.name)}</th>`,
        )
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
                                id="admin-owned-${up.user_id}-${hero.id}"
                                ${isOwned ? "checked" : ""} 
                                onchange="toggleUserHeroOwned('${up.user_id}', '${hero.id}', this.checked)"
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

    container.innerHTML = "";
    container.appendChild(tableWrapper);
}

// ******************************************
// toggleUserHeroOwned(userId, heroId, isOwned)
// input: userId -> UUID of the user, heroId -> UUID of the hero, isOwned -> boolean
// ******************************************
// Allows admins to update other users' collection states.
// ******************************************
async function toggleUserHeroOwned(userId, heroId, isOwned) {
    // Sync locally if it's the current user's record
    if (userId === currentUser?.id) {
        const hero = characters.find((h) => h.id === heroId);
        if (hero) hero.is_owned = isOwned;
        renderCollectionView();
        renderList();
        updateDropdownSort(); // Refresh dropdowns in the Roll section
    }

    const { error } = await db.from("user_heroes").upsert({
        user_id: userId,
        hero_id: heroId,
        is_owned: isOwned,
    });

    if (error) {
        alert("Error updating user collection: " + error.message);
        // Revert local state if it was the current user
        if (userId === currentUser?.id) {
            const hero = characters.find((h) => h.id === heroId);
            if (hero) hero.is_owned = !isOwned;
            renderCollectionView();
            renderList();
            updateDropdownSort();
        }
        // Refresh to revert UI checkbox state
        renderCollectionsList();
    }
}

function toggleGroupForm() {
    const form = document.getElementById("groupForm");
    const button = document.getElementById("addGroupBtn");
    if (!form || !button) return;

    const isHidden = form.classList.toggle("hidden");
    button.innerText = isHidden ? "Add Group" : "Hide Group Form";

    if (!isHidden) {
        document.getElementById("groupName")?.focus();
    }
}

// ******************************************
// deleteGroup(groupId)
// input: groupId -> UUID of the group to delete
// ******************************************
// Deletes a group from Supabase after user confirmation.
// ******************************************
async function deleteGroup(groupId) {
    if (!confirm("Delete this group?")) return;

    const { error } = await db.from("groups").delete().eq("id", groupId);

    if (error) return alert("Error deleting group: " + error.message);

    resetGroupForm();
    init(); // Refresh everything
}

// ******************************************
// getSoftWeight(hero, userIndex)
// input: hero -> hero object, userIndex -> player index
// ******************************************
// Calculates the temporary weight used for picking/displaying
// without modifying the actual database weight.
// ******************************************
function getSoftWeight(hero, userIndex) {
    const baseWeight = hero.weights[userIndex];
    const plays = hero.playCount[userIndex];

    // Applying the (p*3+1)^2 formula
    const penalty = Math.pow(plays * 3 + 1, 2);
    return baseWeight / penalty;
}

// ******************************************
// pickCharacters()
// input: none
// ******************************************
// Randomly assigns a hero to each active player.
// Main players (0-3) use weighted probability based on play history.
// Invitees (4-5) are assigned purely at random.
// ******************************************
function pickCharacters() {
    // Identify active players
    const active = NAMES.map((_, i) => i).filter(
        (i) => document.getElementById(`use${i}`).checked,
    );

    if (active.length === 0) return alert("Select players!");

    // Shuffle active array to decide selection order (fairness)
    const selectionOrder = [...active].sort(() => Math.random() - 0.5);

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    // Pool of owned heroes
    let pool = characters.filter(isHeroOwned).map((c) => structuredClone(c));

    if (pool.length < active.length) {
        return alert(
            `Not enough owned heroes (${pool.length}) in your collection for ${active.length} players!`,
        );
    }

    // Map to hold calculated results for each player
    const rollResults = {};

    // Run selection in randomized order
    selectionOrder.forEach((pIdx) => {
        let selectedHero = null;

        if (pIdx >= 4) {
            const r = Math.floor(Math.random() * pool.length);
            selectedHero = pool[r];
            pool.splice(r, 1);
        } else {
            const activePool = pool.filter((c) => c.weights[pIdx] > 0);
            const totalEffectiveWeight = activePool.reduce(
                (sum, c) => sum + getSoftWeight(c, pIdx),
                0,
            );

            let random = Math.random() * totalEffectiveWeight;
            for (const hero of activePool) {
                const weight = getSoftWeight(hero, pIdx);
                if (random < weight) {
                    selectedHero = hero;
                    pool.splice(
                        pool.findIndex((p) => p.name === hero.name),
                        1,
                    );
                    break;
                }
                random -= weight;
            }
        }
        rollResults[pIdx] = selectedHero;
    });

    // Disable Roll Button
    const rollBtn = document.getElementById("rollBtn");
    if (rollBtn) {
        rollBtn.disabled = true;
        rollBtn.style.opacity = "0.6";
        rollBtn.style.cursor = "not-allowed";
    }

    // Hide Action Buttons container while scrambling
    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) actionButtons.style.display = "none";

    isRollActive = false; // Will set to true once all resolved

    // Render all panels in sequential player index order in "randomizing" state
    const sortedActive = [...active].sort((a, b) => a - b);

    sortedActive.forEach((pIdx) => {
        renderPlayerRowSkeleton(pIdx);
    });

    // Ensure the roll section is visible and scroll to results
    showRoll();
    resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

    // Pool of all owned heroes for the cycling scrambler
    const ownedHeroes = characters.filter(isHeroOwned);

    // Start scrambling for all panels
    sortedActive.forEach((pIdx) => {
        startPanelScramble(pIdx, ownedHeroes);
    });

    // Staggered reveal sequence
    let currentRevealIndex = 0;

    function revealNext() {
        if (currentRevealIndex >= selectionOrder.length) {
            // All revealed!
            validateSelection();
            if (isUser()) {
                if (actionButtons) actionButtons.style.display = "flex";
                if (rollBtn) rollBtn.style.display = "none";
            } else {
                if (rollBtn) {
                    rollBtn.disabled = false;
                    rollBtn.style.opacity = "1";
                    rollBtn.style.cursor = "pointer";
                }
            }
            isRollActive = true;
            return;
        }

        const pIdx = selectionOrder[currentRevealIndex];
        const finalHero = rollResults[pIdx];

        // Randomize duration between 0.5s to 1.0s (e.g. 700ms) for the current panel
        const duration = 500 + Math.random() * 500;

        setTimeout(() => {
            stopPanelScramble(pIdx, finalHero);
            currentRevealIndex++;
            // Pause before revealing the next (e.g. 400ms)
            setTimeout(revealNext, 400);
        }, duration);
    }

    // Start the staggered reveal chain
    revealNext();
}

// ******************************************
// updateDropdownSort()
// input: none
// ******************************************
// Delegate to validateSelection since dropdowns are replaced by modal
// ******************************************
function updateDropdownSort() {
    validateSelection();
}

// ******************************************
// renderPlayerRow(pIdx, selectedName)
// input: pIdx -> player index, selectedName -> hero name
// ******************************************
// Renders the HTML result for a specific player's randomized character.
// ******************************************
function renderPlayerRowSkeleton(pIdx) {
    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML += `
        <div class="player-row randomizing" id="player-row-${pIdx}" style="--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});">
            <!-- Background Image -->
            <img src="" class="char-bg-img scramble-img" id="bg-img-${pIdx}" alt="Randomizing">
            
            <div class="player-row-content">
                <!-- Hero Details -->
                <div class="hero-info-container" id="info-container-${pIdx}">
                    <div class="hero-header-row">
                        <div class="hero-header-left">
                            <span class="player-name-caps" style="color: var(--player-color);">${NAMES[pIdx].toUpperCase()}</span>
                            <span class="hero-name-divider">:</span>
                            <a href="#" target="_blank" class="hero-name hero-name-link scramble-text" id="hero-name-title-${pIdx}">ROLLING...</a>
                        </div>
                    </div>
                    
                    <span class="expanded-group scramble-hidden opacity-0" id="hero-group-${pIdx}">Group</span>
                    
                    <div class="hero-stats-row scramble-hidden opacity-0" id="stats-row-${pIdx}">
                        <span>Plays: --</span>
                        <span class="stats-divider">|</span>
                        <span>Last: --</span>
                        <span class="stats-divider">|</span>
                        <span id="hero-prob-${pIdx}">Prob: --</span>
                    </div>
                </div>
                
                <!-- Edit Hero Selector Button + Hidden Input -->
                <div class="hero-select-container scramble-hidden opacity-0" id="select-container-${pIdx}">
                    <input type="hidden" class="char-select" data-player="${pIdx}" id="select-${pIdx}">
                    <button class="edit-icon-btn" type="button" onclick="openHeroSelectModal(${pIdx})" aria-label="Select hero">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ******************************************
// Modal Character Picker Logic
// ******************************************
function openHeroSelectModal(pIdx) {
    activeSelectPlayerIdx = pIdx;

    const modal = document.getElementById("hero-select-modal");
    if (!modal) return;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Prevent background scroll

    // Set title with player's name
    const titleEl = document.getElementById("hero-select-modal-title");
    if (titleEl && NAMES[pIdx]) {
        titleEl.innerText = `Select Hero for ${NAMES[pIdx]}`;
    }

    // Reset search
    const searchInput = document.getElementById("hero-select-search");
    if (searchInput) {
        searchInput.value = "";
    }

    // Reset sorting and render
    setModalSort("name");
    setTimeout(updateSegmentedHighlights, 50);
}

function closeHeroSelectModal() {
    const modal = document.getElementById("hero-select-modal");
    if (modal) {
        modal.style.display = "none";
    }
    document.body.style.overflow = ""; // Restore background scroll
    activeSelectPlayerIdx = null;
}

function setModalSort(mode) {
    modalSortMode = mode;

    const namePill = document.getElementById("modal-sort-name");
    const weightPill = document.getElementById("modal-sort-weight");

    if (namePill) namePill.classList.toggle("active", mode === "name");
    if (weightPill) weightPill.classList.toggle("active", mode === "weight");

    updateSegmentedHighlights();
    filterHeroSelectOptions();
}

function filterHeroSelectOptions() {
    const searchInput = document.getElementById("hero-select-search");
    const searchTerm = searchInput ? searchInput.value : "";
    renderHeroSelectOptions(searchTerm);
}

function renderHeroSelectOptions(searchTerm = "") {
    const container = document.getElementById("hero-select-options-container");
    if (!container) return;

    const pIdx = activeSelectPlayerIdx;
    if (pIdx === null) return;

    // Filter owned heroes (and match search term)
    let owned = characters.filter((c) => isHeroOwned(c));

    if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        owned = owned.filter((c) => {
            const nameMatch = c.name.toLowerCase().includes(term);
            const groupMatch = (c.group || "").toLowerCase().includes(term);
            return nameMatch || groupMatch;
        });
    }

    let totalWeight = 0;
    if (modalSortMode === "weight" && pIdx < 4) {
        owned.forEach((c) => (totalWeight += getSoftWeight(c, pIdx)));
    }

    // Sort owned heroes depending on modalSortMode
    owned.sort((a, b) => {
        if (modalSortMode === "weight" && pIdx < 4) {
            const wA = getSoftWeight(a, pIdx);
            const wB = getSoftWeight(b, pIdx);
            if (wA !== wB) return wB - wA; // Descending weight
        }
        return a.name.localeCompare(b.name);
    });

    const currentVal = document.getElementById(`select-${pIdx}`)?.value;

    if (owned.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">No matching owned heroes found.</div>`;
        return;
    }

    container.innerHTML = owned
        .map((c) => {
            const isSelected = c.name === currentVal;
            let pctLabel = "";
            if (modalSortMode === "weight" && pIdx < 4 && totalWeight > 0) {
                const weight = getSoftWeight(c, pIdx);
                const pct = ((weight / totalWeight) * 100).toFixed(1);
                pctLabel = `<div class="hero-select-card-pct">${pct}%</div>`;
            }

            return `
            <div class="hero-select-card ${isSelected ? "selected" : ""}" onclick="selectHeroForPlayer('${c.name.replace(/'/g, "\\'")}')">
                <img src="${getImgUrl(c.slug)}" class="hero-select-card-img" alt="${c.name}">
                <div class="hero-select-card-name">${c.name}</div>
                ${pctLabel}
            </div>
        `;
        })
        .join("");
}

function selectHeroForPlayer(heroName) {
    const pIdx = activeSelectPlayerIdx;
    if (pIdx === null) return;

    const char = characters.find((c) => c.name === heroName);
    if (!char) return;

    // Update hidden input value
    const selectEl = document.getElementById(`select-${pIdx}`);
    if (selectEl) {
        selectEl.value = char.name;
    }

    // Update background image
    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    if (bgImgEl) {
        bgImgEl.src = getImgUrl(char.slug);
        bgImgEl.alt = char.name;
    }

    const nameTitle = document.getElementById(`hero-name-title-${pIdx}`);
    if (nameTitle) {
        nameTitle.innerText = char.name;
        nameTitle.classList.remove("scramble-text");
        nameTitle.classList.add("resolved");
        nameTitle.href = getHeroLink(char.slug);
    }

    const groupEl = document.getElementById(`hero-group-${pIdx}`);
    if (groupEl) groupEl.innerText = char.group || "Unknown";

    // Update combined stats row
    const statsDiv = document.getElementById(`stats-row-${pIdx}`);
    if (statsDiv) {
        const probText = `Prob: <b>${getHeroProbabilityText(char, pIdx)}</b>`;
        if (pIdx < 4) {
            const playCount = char.playCount?.[pIdx] || 0;
            const lastPlayed = char.lastPlayed?.[pIdx] || "Never";
            statsDiv.innerHTML = `
                <span>Plays: <b>${playCount}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${lastPlayed}</b></span>
                <span class="stats-divider">|</span>
                <span>${probText}</span>
            `;
        } else {
            statsDiv.innerHTML = `<span>${probText}</span>`;
        }
    }

    // Refresh duplicate detection UI
    validateSelection();

    closeHeroSelectModal();
}

function startPanelScramble(pIdx, ownedHeroes) {
    if (ownedHeroes.length === 0) return;

    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    const nameEl = document.getElementById(`hero-name-title-${pIdx}`);

    scrambleIntervals[pIdx] = setInterval(() => {
        const randomHero =
            ownedHeroes[Math.floor(Math.random() * ownedHeroes.length)];
        if (bgImgEl) bgImgEl.src = getImgUrl(randomHero.slug);
        if (nameEl) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*";
            let scrambleStr = "";
            for (let k = 0; k < 8; k++) {
                scrambleStr += chars[Math.floor(Math.random() * chars.length)];
            }
            nameEl.innerText = scrambleStr;
        }
    }, 70);
}

function stopPanelScramble(pIdx, finalHero) {
    if (scrambleIntervals[pIdx]) {
        clearInterval(scrambleIntervals[pIdx]);
        delete scrambleIntervals[pIdx];
    }

    const rowEl = document.getElementById(`player-row-${pIdx}`);
    if (rowEl) {
        rowEl.classList.remove("randomizing");
        rowEl.classList.add("revealed");
    }

    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    const nameEl = document.getElementById(`hero-name-title-${pIdx}`);

    if (finalHero) {
        if (bgImgEl) {
            bgImgEl.src = getImgUrl(finalHero.slug);
            bgImgEl.alt = finalHero.name;
            bgImgEl.classList.remove("scramble-img");
        }
        if (nameEl) {
            nameEl.innerText = finalHero.name;
            nameEl.classList.remove("scramble-text");
            nameEl.classList.add("resolved");
            nameEl.href = getHeroLink(finalHero.slug);
        }

        // Populate group
        const groupEl = document.getElementById(`hero-group-${pIdx}`);
        if (groupEl) {
            groupEl.innerText = finalHero.group || "Unknown";
        }

        // Populate stats line (Plays, Last, Prob combined)
        const statsRow = document.getElementById(`stats-row-${pIdx}`);
        if (statsRow) {
            const probText = `Prob: <b>${getHeroProbabilityText(finalHero, pIdx)}</b>`;
            if (pIdx < 4) {
                const plays = finalHero.playCount[pIdx] || 0;
                const last = finalHero.lastPlayed[pIdx] || "Never";
                statsRow.innerHTML = `
                    <span>Plays: <b>${plays}</b></span>
                    <span class="stats-divider">|</span>
                    <span>Last: <b>${last}</b></span>
                    <span class="stats-divider">|</span>
                    <span>${probText}</span>
                `;
            } else {
                statsRow.innerHTML = `<span>${probText}</span>`;
            }
        }

        // Populate hidden input
        const selectEl = document.getElementById(`select-${pIdx}`);
        if (selectEl) {
            selectEl.value = finalHero.name;
        }
    }

    // Fade in all hidden sections for this player row
    const hiddenContainers = rowEl?.querySelectorAll(".scramble-hidden");
    hiddenContainers?.forEach((c) => {
        c.classList.remove("opacity-0");
        c.classList.add("fade-in-resolve");
    });
}

// ******************************************
// validateSelection()
// input: none
// ******************************************
// Checks for duplicate heroes in the current results and
// enables/disables the confirmation UI accordingly.
// ******************************************
function validateSelection() {
    // Locate all hero selection dropdowns currently rendered in the results
    const dropdowns = document.querySelectorAll(".char-select");
    const names = Array.from(dropdowns).map((d) => d.value);

    // 1. Check for duplicates
    const counts = names.reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
    const hasDupes = Object.values(counts).some((count) => count > 1);

    // 2. Check for unowned heroes
    const unownedSelectedHeroes = names.filter((name) => {
        const hero = characters.find((c) => c.name === name);
        return hero && !isHeroOwned(hero);
    });
    const hasUnownedHeroes = unownedSelectedHeroes.length > 0;

    const confirmBtn = document.getElementById("confirmBtn");
    const errorMsg = document.getElementById("error-msg");

    // Reset button state and error message first
    confirmBtn.classList.remove("disabled", "warning");
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = "LOCK IN SESSION"; // Restore original text
    errorMsg.style.display = "none";

    if (hasDupes) {
        confirmBtn.classList.add("disabled");
        confirmBtn.disabled = true;
        errorMsg.style.display = "block";
        errorMsg.innerText =
            "⚠ Duplicate hero selected! Each player must have a unique character.";
    } else if (hasUnownedHeroes) {
        confirmBtn.classList.add("warning"); // Add new warning class
        confirmBtn.innerHTML = "⚠️ LOCK IN SESSION"; // Add warning symbol
        errorMsg.style.display = "block";
        errorMsg.innerText = `⚠️ You have selected unowned heroes: ${unownedSelectedHeroes.join(", ")}.`;
    }

    // Individually highlight player rows that contain duplicate entries
    dropdowns.forEach((d) => {
        const row = d.closest(".player-row");
        if (row) {
            row.classList.toggle("error", counts[d.value] > 1);
        }
    });
}

// ******************************************
// applyResults()
// input: none
// ******************************************
// Updates weights and play history in Supabase for
// the currently selected heroes.
// ******************************************
async function applyResults() {
    const confirmBtn = document.getElementById("confirmBtn");
    const originalText = confirmBtn ? confirmBtn.innerText : "Lock In";
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Saving...";
    }

    // Check for unowned heroes before proceeding
    const selectedHeroNames = Array.from(
        document.querySelectorAll(".char-select"),
    ).map((d) => d.value);
    const unownedSelectedHeroes = selectedHeroNames.filter((name) => {
        const hero = characters.find((c) => c.name === name);
        return hero && !isHeroOwned(hero);
    });

    if (unownedSelectedHeroes.length > 0) {
        const unownedHeroNames = unownedSelectedHeroes.join(", ");
        const confirmation = confirm(
            `You have selected unowned heroes: ${unownedHeroNames}. Do you want to proceed?`,
        );
        if (!confirmation) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
            return;
        }
    }

    const dropdowns = document.querySelectorAll(".char-select");
    const today = new Date().toLocaleDateString("en-CA");
    const statsUpdates = [];
    const gameParticipants = [];

    // Create a Map of [playerIndex -> heroName] for fast lookups
    const activePicks = new Map(
        Array.from(dropdowns).map((sel) => [
            parseInt(sel.dataset.player),
            sel.value,
        ]),
    );

    // 1. Create the game record first to get the unique ID for this session
    const { data: game, error: gameError } = await db
        .from("games")
        .insert({ last_updated_by: currentUser.id })
        .select()
        .single();
    if (gameError) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
        }
        return alert("Error creating game: " + gameError.message);
    }

    characters.forEach((char) => {
        // Loop through all 6 potential player slots to record the game history
        [0, 1, 2, 3, 4, 5].forEach((pIdx) => {
            const playerChoice = activePicks.get(pIdx);

            // Add to game record if this specific player is using this specific hero
            if (playerChoice === char.name) {
                gameParticipants.push({
                    game_id: game.id,
                    player_id: `p${pIdx + 1}`,
                    hero_id: char.id,
                    is_winner: null, // Explicitly undecided
                    last_updated_by: currentUser.id,
                });
            }

            // Long-term stats and weighting are only tracked for the 4 main players (0-3)
            if (pIdx < 4 && playerChoice !== undefined) {
                const wasPicked = playerChoice === char.name;
                const newWeight = wasPicked
                    ? PICKED_HERO_WEIGHT
                    : (char.weights[pIdx] || DEFAULT_HERO_WEIGHT) +
                      WEIGHT_INCREMENT;

                statsUpdates.push({
                    hero_id: char.id,
                    player_id: `p${pIdx + 1}`,
                    weight: newWeight,
                    last_updated_by: currentUser.id,
                });
            }
        });
    });

    // 2. Save the participants to the junction table
    const { error: gpError } = await db
        .from("game_players")
        .insert(gameParticipants);
    if (gpError) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
        }
        return alert("Error logging game participants: " + gpError.message);
    }

    // 3. Update the weights and play counts for main players
    const { error } = await db.from("player_hero_stats").upsert(statsUpdates);

    if (error) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
        }
        return alert("Error saving results: " + error.message);
    }

    // Refresh local state and UI immediately after database updates are successful
    await init();

    document.getElementById("action-buttons").style.display = "none";
    const rollBtnEl = document.getElementById("rollBtn");
    if (rollBtnEl) {
        rollBtnEl.style.display = "block";
        rollBtnEl.disabled = false;
        rollBtnEl.style.opacity = "1";
        rollBtnEl.style.cursor = "pointer";
    }
    document.getElementById("results").innerHTML = `
        <p style="color:#28a745; text-align:center; font-weight:bold;">
            Session Logged! Game record created and stats updated.
        </p>`;
    isRollActive = false;
}

// ******************************************
// cancelRoll()
// input: none
// ******************************************
// Resets the roll results and hides the action buttons.
// ******************************************
function cancelRoll() {
    document.getElementById("results").innerHTML =
        '<p style="text-align: center; opacity: 0.6;">Select players and roll.</p>';
    document.getElementById("action-buttons").style.display = "none";
    const rollBtnEl = document.getElementById("rollBtn");
    if (rollBtnEl) {
        rollBtnEl.style.display = "block";
        rollBtnEl.disabled = false;
        rollBtnEl.style.opacity = "1";
        rollBtnEl.style.cursor = "pointer";
    }
    isRollActive = false;
}

// ******************************************
// handlePlayerToggleClick(event, index)
// input: event -> click event, index -> player index
// ******************************************
// Warns the user if they change player selection after a roll is active.
// If confirmed, resets the roll. Otherwise, cancels the checkbox toggle.
// ******************************************
function handlePlayerToggleClick(event, index) {
    if (isRollActive) {
        const confirmed = confirm(
            "Changing player selection will reset the current roll. Do you want to proceed?",
        );
        if (!confirmed) {
            event.preventDefault();
        } else {
            cancelRoll();
        }
    }
}

function openSortFilterDrawer() {
    currentDrawerMode = "sort-filter";
    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");
    if (!drawer) return;

    title.innerText = "Sort & Filter";
    footer.style.display = "flex";

    // Stage current states
    stagedSort = currentSort;
    stagedSortAsc = sortAsc;
    stagedSortPlayerIndex = currentSortPlayerIndex;
    stagedLevels = new Set(activeLevels);
    stagedGroups = new Set(activeGroups);

    renderDrawerBody();
    drawer.classList.add("open");
}

function openColumnsDrawer() {
    currentDrawerMode = "columns";
    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");
    if (!drawer) return;

    title.innerText = "Columns & Historical Data";
    footer.style.display = "flex";

    // Stage current states
    stagedPlayerIndices = [...activePlayerIndices];
    stagedUseHistorical = dbUseHistorical;

    renderDrawerBody();
    drawer.classList.add("open");
}

function openHistoryFilterDrawer() {
    currentDrawerMode = "history-filter";
    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");
    if (!drawer) return;

    title.innerText = "Filter History";
    footer.style.display = "flex";

    // Stage current states
    stagedSelectedGamePlayerIndex = selectedGamePlayerIndex;
    stagedGamesWinnerOnly = gamesWinnerOnly;
    stagedGamesUseHistorical = gamesUseHistorical;

    renderDrawerBody();
    drawer.classList.add("open");
}

function closeDrawer(event = null, force = false) {
    if (event && event.target !== event.currentTarget && !force) return;
    const drawer = document.getElementById("sort-filter-drawer");
    if (drawer) {
        drawer.classList.remove("open");
    }
}

function renderDrawerBody() {
    const body = document.getElementById("drawer-body-content");
    if (!body) return;

    if (currentDrawerMode === "sort-filter") {
        body.innerHTML = `
            <!-- Sorting Controls -->
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

            <!-- Conditional Player Selector Row -->
            <div id="drawer-player-sort-sub-section" class="panel-row-new" style="display: none;">
                <span class="panel-row-title">For Player:</span>
                <div class="pill-group" id="drawer-player-sort-pills" style="margin-top: 10px;"></div>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0;">

            <!-- Complexity Filters -->
            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700;">Complexity Level:</span>
                <div class="filter-bar-track" id="drawer-complexity-filter-bar" style="margin-top: 10px; flex-wrap: wrap;"></div>
            </div>

            <!-- Season Filters -->
            <div class="panel-row-new">
                <span class="panel-row-title" style="font-weight: 700; margin-bottom: 8px; display: block;">Hero Group / Season:</span>
                <div class="group-filter-grid-container" id="drawer-group-filter-bar"></div>
            </div>
        `;

        // Parse sorting
        let sortType = "name";
        if (stagedSort === "group") {
            sortType = "group";
        } else if (stagedSort.startsWith("w")) {
            sortType = "probability";
            stagedSortPlayerIndex = parseInt(stagedSort.substring(1));
        } else if (stagedSort.startsWith("d")) {
            sortType = "lastPlayed";
            stagedSortPlayerIndex = parseInt(stagedSort.substring(1));
        }

        const select = document.getElementById("drawer-sort-type-select");
        if (select) select.value = sortType;

        updateDrawerSortDirectionUI();
        updateDrawerPlayerSortPillsUI();
        renderDrawerComplexityFilters();
        renderDrawerGroupFilters();
    } else if (currentDrawerMode === "columns") {
        // Render Column Toggles and Historical checkbox
        const mainPlayerNames = NAMES.slice(0, 4);
        const visibilityPillsHtml = mainPlayerNames
            .map((name, i) => {
                const isActive = stagedPlayerIndices.includes(i);
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
                <span class="panel-row-title" style="font-weight: 700; margin-bottom: 10px; display: block;">Show Player Stats Columns:</span>
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
                            onchange="stagedUseHistorical = this.checked"
                            style="width: 18px; height: 18px;" />
                        Include Historical Data (before May 8th 2026)
                    </label>
                </div>
            </div>
        `;
    } else if (currentDrawerMode === "history-filter") {
        renderHistoryFilterDrawerBody(body);
    }
}

function renderHistoryFilterDrawerBody(body) {
    const useHistorical = stagedGamesUseHistorical;
    const playerStats = players.map(() => ({ played: 0, won: 0 }));
    let inviteePlayed = 0;
    let inviteeWon = 0;

    if (games) {
        games.forEach((game) => {
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
        const p = players[i];
        if (!p) continue;
        const isActive = stagedSelectedGamePlayerIndex === i;
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

    const isInviteeActive = stagedSelectedGamePlayerIndex === 4;
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

    const showWinnerOnlyCheckbox = stagedSelectedGamePlayerIndex !== null;

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
                    ${stagedGamesWinnerOnly ? "checked" : ""}
                    onchange="stagedGamesWinnerOnly = this.checked"
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

function toggleStagedPlayerGameFilter(idx) {
    if (stagedSelectedGamePlayerIndex === idx) {
        stagedSelectedGamePlayerIndex = null;
    } else {
        stagedSelectedGamePlayerIndex = idx;
    }
    
    if (stagedSelectedGamePlayerIndex === null) {
        stagedGamesWinnerOnly = false;
    }
    
    renderDrawerBody();
}

function toggleStagedGamesHistorical(checked) {
    stagedGamesUseHistorical = checked;
    renderDrawerBody();
}

function handleDrawerSortTypeChange(value) {
    if (value === "name") {
        stagedSort = "name";
    } else if (value === "group") {
        stagedSort = "group";
    } else if (value === "probability") {
        stagedSort = `w${stagedSortPlayerIndex}`;
    } else if (value === "lastPlayed") {
        stagedSort = `d${stagedSortPlayerIndex}`;
    }

    stagedSortAsc = value === "name" || value === "group";
    updateDrawerSortDirectionUI();
    updateDrawerPlayerSortPillsUI();
}

function toggleDrawerSortDirection() {
    stagedSortAsc = !stagedSortAsc;
    updateDrawerSortDirectionUI();
}

function updateDrawerSortDirectionUI() {
    const dirText = document.getElementById("drawer-sort-direction-text");
    const dirArrow = document.getElementById("drawer-sort-direction-arrow");
    if (dirText && dirArrow) {
        dirText.innerText = stagedSortAsc ? "Ascending" : "Descending";
        dirArrow.innerText = stagedSortAsc ? "▲" : "▼";
    }
}

function updateDrawerPlayerSortPillsUI() {
    const subSection = document.getElementById(
        "drawer-player-sort-sub-section",
    );
    const pillsContainer = document.getElementById("drawer-player-sort-pills");
    if (!subSection || !pillsContainer) return;

    const showPlayers =
        stagedSort.startsWith("w") || stagedSort.startsWith("d");
    subSection.style.display = showPlayers ? "block" : "none";

    if (showPlayers) {
        const mainPlayerNames = NAMES.slice(0, 4);
        pillsContainer.innerHTML = mainPlayerNames
            .map((name, i) => {
                const isActive = stagedSortPlayerIndex === i;
                const activeClass = isActive ? `active p${i + 1}-color` : "";
                const isColumnActive = activePlayerIndices.includes(i);
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

function handleDrawerSortPlayerChange(playerIndex) {
    stagedSortPlayerIndex = playerIndex;
    if (stagedSort.startsWith("w")) {
        stagedSort = `w${playerIndex}`;
    } else if (stagedSort.startsWith("d")) {
        stagedSort = `d${playerIndex}`;
    }
    updateDrawerPlayerSortPillsUI();
}

function toggleDrawerPlayerFilter(playerIndex) {
    const idx = stagedPlayerIndices.indexOf(playerIndex);
    if (idx > -1) {
        stagedPlayerIndices.splice(idx, 1);
    } else {
        stagedPlayerIndices.push(playerIndex);
    }
    renderDrawerBody();
}

function renderDrawerComplexityFilters() {
    const container = document.getElementById("drawer-complexity-filter-bar");
    if (!container) return;

    const searchTerm =
        document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned =
        document.getElementById("db-show-not-owned")?.checked ?? false;

    let html = "";
    for (let i = 1; i <= 6; i++) {
        const potentialMatchesCount = characters.filter((c) => {
            if (Number(c.complexity) !== i) return false;
            const nameMatch = c.name.toLowerCase().includes(searchTerm);
            const groupNameMatch = (c.group || "")
                .toLowerCase()
                .includes(searchTerm);
            const groupFilterMatch = stagedGroups.has(c.group_id);
            const ownershipMatch =
                (isHeroOwned(c) && showOwned) ||
                (!isHeroOwned(c) && showNotOwned);
            return (
                (nameMatch || groupNameMatch) &&
                groupFilterMatch &&
                ownershipMatch
            );
        }).length;

        const isDisabled = potentialMatchesCount === 0;
        const isActive = stagedLevels.has(i);
        const activeClass = isActive && !isDisabled ? "active-die" : "";

        html += `
            <div class="group-badge-card group-complexity ${activeClass} ${isDisabled ? "disabled" : ""}" 
                 onclick="${isDisabled ? "" : `toggleDrawerLevel(${i})`}" 
                 title="Level ${i} (${potentialMatchesCount} heroes)">
                <img src="images/dice/d${i}.png" class="complexity-dice-img" alt="Level ${i}">
                <span class="group-badge-count">${potentialMatchesCount}</span>
            </div>`;
    }

    const totalMatchingHeroes = characters.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(searchTerm);
        const groupNameMatch = (c.group || "")
            .toLowerCase()
            .includes(searchTerm);
        const groupFilterMatch = stagedGroups.has(c.group_id);
        const ownershipMatch =
            (isHeroOwned(c) && showOwned) || (!isHeroOwned(c) && showNotOwned);
        return (
            (nameMatch || groupNameMatch) && groupFilterMatch && ownershipMatch
        );
    }).length;

    const isAllDisabled = totalMatchingHeroes === 0;
    const allActive = stagedLevels.size === 6;
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

function toggleDrawerLevel(level) {
    if (level === "all") {
        stagedLevels =
            stagedLevels.size === 6 ? new Set() : new Set([1, 2, 3, 4, 5, 6]);
    } else {
        if (stagedLevels.has(level)) stagedLevels.delete(level);
        else stagedLevels.add(level);
    }
    renderDrawerComplexityFilters();
    renderDrawerGroupFilters();
}

function getGroupThemeClass(groupName) {
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

function getGroupAbbreviation(name) {
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

    // Fallback: first letter of each word up to 3 chars, or first 3 chars if single word
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

function renderDrawerGroupFilters() {
    const container = document.getElementById("drawer-group-filter-bar");
    if (!container) return;

    const searchTerm =
        document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned =
        document.getElementById("db-show-not-owned")?.checked ?? false;

    let html = groups
        .map((g) => {
            const initials = getGroupAbbreviation(g.name);
            const isActive = stagedGroups.has(g.id);
            const themeClass = getGroupThemeClass(g.name);

            const potentialMatchesCount = characters.filter((c) => {
                if (c.group_id !== g.id) return false;
                const nameMatch = c.name.toLowerCase().includes(searchTerm);
                const groupNameMatch = (c.group || "")
                    .toLowerCase()
                    .includes(searchTerm);
                const complexityMatch = stagedLevels.has(Number(c.complexity));
                const ownershipMatch =
                    (isHeroOwned(c) && showOwned) ||
                    (!isHeroOwned(c) && showNotOwned);
                return (
                    (nameMatch || groupNameMatch) &&
                    complexityMatch &&
                    ownershipMatch
                );
            }).length;

            const isDisabled = potentialMatchesCount === 0;
            const activeClass = isActive && !isDisabled ? "active-die" : "";

            return `
                <div class="group-badge-card ${themeClass} ${activeClass} ${isDisabled ? "disabled" : ""}" 
                     onclick="${isDisabled ? "" : `toggleDrawerGroupFilter('${g.id}')`}" 
                     title="${escapeHtml(g.name)} (${potentialMatchesCount} heroes)">
                    <span class="group-badge-initials">${initials}</span>
                    <span class="group-badge-count">${potentialMatchesCount}</span>
                </div>`;
        })
        .join("");

    const totalMatchingHeroes = characters.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(searchTerm);
        const groupNameMatch = (c.group || "")
            .toLowerCase()
            .includes(searchTerm);
        const complexityMatch = stagedLevels.has(Number(c.complexity));
        const ownershipMatch =
            (isHeroOwned(c) && showOwned) || (!isHeroOwned(c) && showNotOwned);
        return (
            (nameMatch || groupNameMatch) && complexityMatch && ownershipMatch
        );
    }).length;

    const isAllDisabled = totalMatchingHeroes === 0;
    const allActive = stagedGroups.size === groups.length;
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

function toggleDrawerGroupFilter(groupId) {
    if (groupId === "all") {
        if (stagedGroups.size === groups.length) {
            stagedGroups.clear();
        } else {
            groups.forEach((g) => stagedGroups.add(g.id));
        }
    } else {
        if (stagedGroups.has(groupId)) {
            stagedGroups.delete(groupId);
        } else {
            stagedGroups.add(groupId);
        }
    }
    renderDrawerComplexityFilters();
    renderDrawerGroupFilters();
}

function resetFilters() {
    if (currentDrawerMode === "sort-filter") {
        stagedSort = "name";
        stagedSortAsc = true;
        stagedSortPlayerIndex = 0;
        stagedLevels = new Set([1, 2, 3, 4, 5, 6]);
        stagedGroups = new Set(groups.map((g) => g.id));
        renderDrawerBody();
    } else if (currentDrawerMode === "columns") {
        stagedPlayerIndices = [0, 1, 2, 3];
        stagedUseHistorical = true;
        renderDrawerBody();
    } else if (currentDrawerMode === "history-filter") {
        stagedSelectedGamePlayerIndex = null;
        stagedGamesWinnerOnly = false;
        stagedGamesUseHistorical = true;
        renderDrawerBody();
    }
}

function applyAndCloseDrawer() {
    if (currentDrawerMode === "sort-filter") {
        currentSort = stagedSort;
        sortAsc = stagedSortAsc;
        currentSortPlayerIndex = stagedSortPlayerIndex;
        activeLevels = new Set(stagedLevels);
        activeGroups = new Set(stagedGroups);
        updateActiveFilterBadge();
        closeDrawer(null, true);
        renderList();
    } else if (currentDrawerMode === "columns") {
        activePlayerIndices = [...stagedPlayerIndices];
        dbUseHistorical = stagedUseHistorical;
        updateActiveFilterBadge();
        closeDrawer(null, true);
        renderList();
    } else if (currentDrawerMode === "history-filter") {
        selectedGamePlayerIndex = stagedSelectedGamePlayerIndex;
        gamesWinnerOnly = stagedGamesWinnerOnly;
        gamesUseHistorical = stagedGamesUseHistorical;
        updateGamesActiveFilterBadge();
        closeDrawer(null, true);
        renderGamesList();
    }
}

function updateActiveFilterBadge() {
    const badge = document.getElementById("filter-active-badge");
    if (!badge) return;

    let activeCount = 0;
    if (currentSort !== "name" || !sortAsc) activeCount++;
    if (activeLevels.size !== 6) activeCount++;
    if (activeGroups.size !== groups.length) activeCount++;

    if (activeCount > 0) {
        badge.innerText = activeCount;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

function updateGamesActiveFilterBadge() {
    const badge = document.getElementById("games-filter-active-badge");
    if (!badge) return;

    let activeCount = 0;
    if (selectedGamePlayerIndex !== null) activeCount++;
    if (gamesWinnerOnly) activeCount++;
    if (!gamesUseHistorical) activeCount++;

    if (activeCount > 0) {
        badge.innerText = activeCount;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

// Ensure visuals are correct when the page loads
window.addEventListener("DOMContentLoaded", () => {
    updateActiveFilterBadge();
    updateGamesActiveFilterBadge();
    setTimeout(updateSegmentedHighlights, 50);
});

function updateSegmentedHighlights() {
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

window.addEventListener("resize", updateSegmentedHighlights);

// ******************************************
// setSort(key)
// input: key -> the column or player property to sort by
// ******************************************
// Updates the sorting criteria and direction, refreshes the
// UI button indicators, and triggers a list re-render.
// ******************************************
function setSort(key) {
    // If the same key is clicked, toggle direction.
    // Otherwise, set default: Ascending for Name, Descending for Weights/Dates.
    if (currentSort === key) {
        sortAsc = !sortAsc;
    } else {
        currentSort = key;
        sortAsc = !key.startsWith("d") && !key.startsWith("w");
    }

    if (key.startsWith("w") || key.startsWith("d")) {
        currentSortPlayerIndex = parseInt(key.substring(1));
    }

    updateActiveFilterBadge();
    renderList();
}

// ******************************************
// handleSearchInput()
// input: none
// ******************************************
// Manages the visibility of the clear button based on search input content
// and triggers the hero list re-render.
// ******************************************
function handleSearchInput() {
    const searchInput = document.getElementById("hero-search");
    const clearBtn = document.getElementById("clear-search");

    // Toggle the 'hidden' class: add it if input is empty, remove it if text exists
    clearBtn.classList.toggle("hidden", searchInput.value.trim().length === 0);

    // Refresh the displayed list based on the new search value
    renderList();
}

// ******************************************
// clearSearch()
// input: none
// ******************************************
// Resets the hero search input, refocuses the search bar,
// and refreshes the displayed list.
// ******************************************
function clearSearch() {
    const searchInput = document.getElementById("hero-search");
    searchInput.value = ""; // Reset the input value to empty
    searchInput.focus(); // Return focus to the bar so the user can type again immediately

    // Re-use handleSearchInput to hide the 'X' button and refresh the list
    handleSearchInput();
}

// ******************************************
// handleGamesSearchInput()
// input: none
// ******************************************
// Manages visibility of the clear button for the games search
// and triggers the games list re-render.
// ******************************************
function handleGamesSearchInput() {
    const searchInput = document.getElementById("games-search");
    const clearBtn = document.getElementById("clear-games-search");

    if (!searchInput || !clearBtn) return;

    clearBtn.classList.toggle("hidden", searchInput.value.trim().length === 0);
    renderGamesList();
}

// ******************************************
// clearGamesSearch()
// input: none
// ******************************************
// Clears the games search input and refreshes the games list.
// ******************************************
function clearGamesSearch() {
    const searchInput = document.getElementById("games-search");
    if (!searchInput) return;
    searchInput.value = "";
    searchInput.focus();
    handleGamesSearchInput();
}

// ******************************************
// togglePlayerFilter(index)
// input: index -> the player index to toggle
// ******************************************
// Adds or removes a player from the active filter list
// and refreshes the database and sorting UI.
// ******************************************
function togglePlayerFilter(index) {
    const position = activePlayerIndices.indexOf(index);

    if (position === -1) {
        // Add the player index to the filter if it's not currently active
        activePlayerIndices.push(index);
        activePlayerIndices.sort((a, b) => a - b);
    } else {
        // Remove the player index from the filter if it's already active
        activePlayerIndices.splice(position, 1);
        if (currentSort === `w${index}` || currentSort === `d${index}`) {
            // If the current sort is based on the player being toggled off, reset to default sort
            currentSort = "name";
            sortAsc = true;
        }
    }

    updateActiveFilterBadge();
    // Re-apply sort highlight and trigger list update without toggling direction
    const activeKey = currentSort;
    currentSort = null;
    setSort(activeKey);
}

// ******************************************
// renderGamesList()
// input: none
// ******************************************
// Renders the list of past games in the games history section.
// ******************************************
function renderGamesList() {
    const container = document.getElementById("gamesContainer");
    const countLabel = document.getElementById("game-count-stats");
    if (!container || !games) return;

    const showWinsOnly = gamesWinnerOnly;
    const searchTerm = (document.getElementById("games-search")?.value || "")
        .toLowerCase()
        .trim();

    const totalVisibleGames = games.filter((g) => !g.is_historical).length;

    // Automatically add all in-progress games to the expanded state
    games.forEach((game) => {
        const winners = game.game_players.filter((p) => p.is_winner === true);
        const explicitLosers = game.game_players.filter((p) => p.is_winner === false);
        const isDraw = winners.length === 0 && explicitLosers.length > 0 && explicitLosers.length === game.game_players.length;
        const isInProgress = winners.length === 0 && !isDraw;
        if (isInProgress) {
            expandedGameIds.add(game.id);
        }
    });

    const filteredGames = games.filter((game) => {
        // Exclude historical games from the History list display
        if (game.is_historical) return false;

        // Player filter (if set)
        let playerMatches = true;
        if (selectedGamePlayerIndex !== null) {
            playerMatches = game.game_players.some((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                let match = false;

                if (
                    selectedGamePlayerIndex >= 0 &&
                    selectedGamePlayerIndex <= 3
                ) {
                    match = pIdx === selectedGamePlayerIndex;
                } else if (selectedGamePlayerIndex === 4) {
                    match = pIdx === 4 || pIdx === 5;
                }

                if (match && showWinsOnly) return gp.is_winner === true;
                return match;
            });
        }
        if (!playerMatches) return false;

        // Search filter (if term provided) - match against date, hero names, and player names
        if (searchTerm) {
            // Only match hero names in the games list as requested
            const heroes = (game.game_players || [])
                .map((gp) => gp.heroes?.name || "")
                .join(" ");
            const hay = heroes.toLowerCase();
            if (!hay.includes(searchTerm)) return false;
        }

        return true;
    });

    if (countLabel) {
        countLabel.innerText = `Showing ${filteredGames.length} of ${totalVisibleGames} games`;
    }

    container.innerHTML = filteredGames
        .map((game) => {
            // Ensure the date string is treated as UTC by forcing the ISO format (T separator and Z suffix)
            let rawDate = game.played_at || "";
            if (rawDate && !rawDate.includes("T"))
                rawDate = rawDate.replace(" ", "T");
            if (rawDate && !rawDate.includes("Z") && !rawDate.includes("+"))
                rawDate += "Z";

            const dateStr = new Date(rawDate).toLocaleString("en-CA", {
                timeZone: "America/Montreal",
                dateStyle: "medium",
                timeStyle: "short",
            });

            // Determine status/winner image logic
            const winners = game.game_players.filter(
                (p) => p.is_winner === true,
            );
            const explicitLosers = game.game_players.filter(
                (p) => p.is_winner === false,
            ); // Players explicitly marked as not winning
            const isDraw =
                winners.length === 0 &&
                explicitLosers.length > 0 &&
                explicitLosers.length === game.game_players.length;

            const isInProgress = winners.length === 0 && !isDraw;
            const isExpanded = expandedGameIds.has(game.id);
            const expandedClass = isExpanded ? "expanded" : "";

            let bgImgHtml = "";
            if (winners.length > 0 && winners[0].heroes?.slug) {
                bgImgHtml = `<img src="${getImgUrl(winners[0].heroes.slug)}" class="game-card-bg-img" alt="">`;
            }

            // Generate unique player initials (e.g. S, C, or Sa, Sh for duplicate first letters in the game)
            const playerNamesMap = {};
            game.game_players.forEach((gp) => {
                const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                let rawName = NAMES[pIdx] || "Unknown";
                if (rawName.toLowerCase().startsWith("player ") && rawName.length > 7) {
                    rawName = "P" + rawName.substring(7);
                }
                playerNamesMap[gp.player_id] = rawName;
            });

            const firstLetters = Object.values(playerNamesMap).map((name) =>
                name.charAt(0).toUpperCase()
            );

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

            // Compact collapsed list of player hero portraits (winners first)
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
                        <a href="${getHeroLink(heroSlug)}" target="_blank" class="mini-portrait-wrapper ${winnerClass}" title="${heroName}" onclick="event.stopPropagation()">
                            ${trophyHtml}
                            <img src="${getImgUrl(heroSlug)}" class="mini-portrait-img" alt="${heroName}">
                            <div class="mini-portrait-pill" style="background-color: var(--p${pIdx + 1});">${playerLabel}</div>
                        </a>
                    `;
                })
                .join("");

            const statusLabel = isInProgress 
                ? '<span class="game-card-status-badge">In Progress</span>' 
                : '';
            const drawStampHtml = isDraw ? '<div class="player-plate-draw-badge">DRAW</div>' : '';
            const headerHtml = `
            <div class="game-card-header" onclick="toggleGameExpansion('${game.id}')">
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

            const canManage =
                isAdmin() || game.last_updated_by === currentUser?.id;
            const gameActions = canManage
                ? `
                <div class="game-card-actions">
                    <button class="btn-game-action" onclick="selectWinner('${game.id}')" title="Select Winner">🏆</button>
                    <!-- <button class="btn-game-action delete" onclick="deleteGame('${game.id}')" title="Delete Game">🗑️</button> -->
                </div>
            `
                : "";

            const platesArray = game.game_players
                .map((gp) => {
                    const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                    const heroName = gp.heroes?.name || "Unknown";
                    const heroSlug = gp.heroes?.slug || "";
                    const isSearchMatch = Boolean(
                        searchTerm &&
                        heroName.toLowerCase().includes(searchTerm),
                    );

                    let isPlayerFilterMatch = false;
                    if (selectedGamePlayerIndex !== null) {
                        if (
                            selectedGamePlayerIndex >= 0 &&
                            selectedGamePlayerIndex <= 3
                        ) {
                            isPlayerFilterMatch =
                                pIdx === selectedGamePlayerIndex;
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
                        borderStyle =
                            "box-shadow: 0 0 8px var(--accent), 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);";
                    }

                    const trophyHtml = gp.is_winner ? '<div class="player-plate-trophy">🏆</div>' : "";
                    const drawBadgeHtml = isDraw ? '<div class="player-plate-draw-badge">DRAW</div>' : "";

                    let statsHtml = "";
                    if (gp.is_winner) {
                        let heroPlayCount = 0;
                        let heroWinCount = 0;
                        const useHistorical = gamesUseHistorical;
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
                            <div class="player-plate-winner-pct">(${pctStr})</div>
                        `;
                    }

                    return `
                    <a href="${getHeroLink(heroSlug)}" target="_blank" class="player-plate ${plateClass}" style="${borderStyle}">
                        <img src="${getImgUrl(heroSlug)}" class="player-plate-bg-art" alt="${heroName}">
                        <div class="player-plate-overlay"></div>
                        ${trophyHtml}
                        ${drawBadgeHtml}
                        <div class="player-plate-tag" style="background-color: var(--p${pIdx + 1});">${NAMES[pIdx]}</div>
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

    if (games.length === 0) {
        container.innerHTML =
            '<p style="text-align:center; opacity:0.6;">No games recorded yet.</p>';
    }
}

function toggleGameExpansion(gameId) {
    if (expandedGameIds.has(gameId)) {
        expandedGameIds.delete(gameId);
    } else {
        expandedGameIds.add(gameId);
    }
    renderGamesList();
}

// ******************************************
// selectWinner(gameId)
// input: gameId -> the ID of the game to update
// ******************************************
// Prompts the user to select which player won the game,
// updating the database accordingly.
// ******************************************
async function selectWinner(gameId) {
    const game = games.find((g) => g.id == gameId); // Use loose equality to handle string vs number IDs
    if (!game) return;

    const container = document.getElementById("winner-selection-container");
    const confirmBtn = document.getElementById("confirm-winner-btn");

    const winners = game.game_players.filter((p) => p.is_winner === true);
    const explicitLosers = game.game_players.filter(
        (p) => p.is_winner === false,
    );
    const isDraw =
        winners.length === 0 &&
        explicitLosers.length > 0 &&
        explicitLosers.length === game.game_players.length;

    // Build the grid wrapper
    const isTwoRows =
        game.game_players.length === 4 || game.game_players.length === 2;
    const gridClass = isTwoRows
        ? "winner-select-grid two-rows"
        : "winner-select-grid";
    let optionsHtml = `<div class="${gridClass}">`;

    // Add cards for each participant
    optionsHtml += game.game_players
        .map((gp, i) => {
            const pIdx = parseInt(gp.player_id.substring(1)) - 1;
            const heroName = gp.heroes?.name || "Unknown";
            const heroSlug = gp.heroes?.slug || "";
            const isSelected = gp.is_winner === true;
            const isChecked = isSelected ? "checked" : "";
            const selectedClass = isSelected ? "selected" : "";
            return `
            <div class="winner-card ${selectedClass}" onclick="handleWinnerSelect('${gp.player_id}')">
                <input type="radio" name="winner-choice" value="${gp.player_id}" ${isChecked} style="display: none;">
                <img src="${getImgUrl(heroSlug)}" class="winner-card-img" alt="${heroName}">
                <div class="winner-card-player-name">${NAMES[pIdx]}</div>
                <div class="winner-card-hero-name">${heroName}</div>
            </div>
        `;
        })
        .join("");

    const isDrawChecked = isDraw ? "checked" : "";
    const drawSelectedClass = isDraw ? "selected" : "";
    // Add Draw Option at the bottom of the grid
    optionsHtml += `
            <div class="winner-draw-card ${drawSelectedClass}" onclick="handleWinnerSelect('draw')">
                <input type="radio" name="winner-choice" value="draw" ${isDrawChecked} style="display: none;">
                <span style="font-size: 1.5rem; line-height: 1;">🤝</span>
                <div style="text-align: left;">
                    <div class="winner-card-player-name" style="font-size: 0.9rem;">Select a Draw</div>
                    <div class="winner-card-hero-name" style="font-size: 0.7rem; opacity: 0.7;">No winner for this match</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = optionsHtml;

    // Attach the game ID to the button so submitWinner knows which game to update
    confirmBtn.onclick = () => submitWinner(gameId);

    document.getElementById("winner-modal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

// ******************************************
// handleWinnerSelect(value)
// ******************************************
// Updates UI classes and checks corresponding hidden radio input for winner selection.
// ******************************************
function handleWinnerSelect(value) {
    const cards = document.querySelectorAll(".winner-card, .winner-draw-card");
    cards.forEach((card) => {
        const radio = card.querySelector('input[name="winner-choice"]');
        if (radio) {
            if (radio.value === value) {
                radio.checked = true;
                card.classList.add("selected");
            } else {
                card.classList.remove("selected");
            }
        }
    });
}

// ******************************************
// closeWinnerModal()
// ******************************************
function closeWinnerModal() {
    document.getElementById("winner-modal").style.display = "none";
    document.body.style.overflow = "auto";
}

// ******************************************
// submitWinner(gameId)
// ******************************************
async function submitWinner(gameId) {
    const selectedRadio = document.querySelector(
        'input[name="winner-choice"]:checked',
    );
    if (!selectedRadio) return alert("Please select a winner.");

    const winnerPlayerId = selectedRadio.value;

    // Disable button to prevent double-clicks
    const btn = document.getElementById("confirm-winner-btn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    try {
        if (winnerPlayerId === "draw") {
            const { error } = await db
                .from("game_players")
                .update({ is_winner: false, last_updated_by: currentUser.id })
                .eq("game_id", gameId);
            if (error) throw error;
        } else {
            // Update winner
            const { error: winErr } = await db
                .from("game_players")
                .update({ is_winner: true, last_updated_by: currentUser.id })
                .eq("game_id", gameId)
                .eq("player_id", winnerPlayerId);
            if (winErr) throw winErr;

            // Update losers
            const { error: loseErr } = await db
                .from("game_players")
                .update({ is_winner: false, last_updated_by: currentUser.id })
                .eq("game_id", gameId)
                .neq("player_id", winnerPlayerId);
            if (loseErr) throw loseErr;
        }

        closeWinnerModal();
        await init();
    } catch (err) {
        alert("Error updating winner: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Result";
    }
}

// ******************************************
// deleteGame(gameId)
// input: gameId -> the ID of the game to delete
// ******************************************
async function deleteGame(gameId) {
    if (
        !confirm(
            "Are you sure you want to delete this game record? This cannot be undone.",
        )
    )
        return;

    const { error } = await db.from("games").delete().eq("id", gameId);

    if (error) {
        console.error("Error deleting game:", error);
        return alert("Failed to delete game: " + error.message);
    }

    await init();
}



function updateHeroStatsFromHistory() {
    const useHistorical = dbUseHistorical;

    characters.forEach((char) => {
        char.playCount = [0, 0, 0, 0];
        char.lastPlayed = ["Never", "Never", "Never", "Never"];
        char.winCount = [0, 0, 0, 0]; // Initialize winCount
    });

    if (!games) return;

    games.forEach((game) => {
        if (!useHistorical && game.is_historical) return;

        game.game_players.forEach((gp) => {
            const pIdx = parseInt(gp.player_id?.substring(1) || "0", 10) - 1;
            if (pIdx >= 0 && pIdx < 4) {
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

// ******************************************
// renderList()
// input: none
// ******************************************
// Renders the list of heroes in the database section based on the current search term,
// the active dice filters, and the current sort settings. This function is called whenever
// any of those parameters change to update the displayed list accordingly.
// ******************************************
function renderList() {
    const container = document.getElementById("heroContainer");
    if (!container) return;

    updateHeroStatsFromHistory();

    const searchTerm =
        document.getElementById("hero-search")?.value.toLowerCase() || "";
    const countLabel = document.getElementById("count-stats");
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned =
        document.getElementById("db-show-not-owned")?.checked ?? false;

    // 1. Efficiently calculate totals for the entire pool in a single pass O(N)
    // Now uses soft weights (with play-count penalty) for the pool total
    const totals = [0, 0, 0, 0];
    characters.filter(isHeroOwned).forEach((c) => {
        for (let i = 0; i < 4; i++) {
            totals[i] += getSoftWeight(c, i);
        }
    });

    // 2. Prepare the list: Attach original indices to avoid expensive lookups during render,
    // then filter based on search term and complexity levels.
    const processedList = characters
        .map((char, index) => ({ ...char, originalIndex: index }))
        .filter((c) => {
            const nameMatch = c.name.toLowerCase().includes(searchTerm);
            const groupMatch = (c.group || "")
                .toLowerCase()
                .includes(searchTerm);
            const complexityMatch = activeLevels.has(Number(c.complexity));
            const groupFilterMatch = activeGroups.has(c.group_id);
            const ownershipMatch =
                (isHeroOwned(c) && showOwned) ||
                (!isHeroOwned(c) && showNotOwned);
            return (
                (nameMatch || groupMatch) &&
                complexityMatch &&
                groupFilterMatch &&
                ownershipMatch
            );
        });

    if (countLabel) {
        countLabel.innerText = `Showing ${processedList.length} of ${characters.length} heroes`;
    }

    // 3. Sort the results based on current settings
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
        } else {
            valA = (a[currentSort] || "").toLowerCase();
            valB = (b[currentSort] || "").toLowerCase();
        }

        if (valA === valB) return 0;
        const comparison = valA < valB ? -1 : 1;
        return sortAsc ? comparison : -comparison;
    });

    // Generate the HTML efficiently
    container.innerHTML = processedList
        .map((c) => {
            // Compute player list statistics sorted by probability
            const playerStatsList = activePlayerIndices.map((p) => {
                const weight = (c.weights && c.weights[p]) || 0;
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

            // Sort descending by probability
            playerStatsList.sort((x, y) => y.percentage - x.percentage);

            // Collapsed View: Highly compressed vertical rows (no date line, has recency dot)
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

            // Expanded View: Vertical rows with date line
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
                        <span class="expanded-player-plays">🎲 ${item.playCount}</span>
                        <span class="expanded-player-wins">🏆 ${item.winCount} <span class="expanded-player-rate">(${item.winRate}%)</span></span>
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
                
                <div class="hero-header" onclick="toggleHeroPanel(this)">
                    <!-- Collapsed Title Layout (Only Hero Name) -->
                    <div class="header-title-collapsed">
                        <a href="${getHeroLink(c.slug)}" target="_blank" class="hero-name-link" onclick="event.stopPropagation()">
                            <span class="hero-name">${c.name}</span>
                        </a>
                    </div>
                    
                    <!-- Expanded Title Layout (Stacked) -->
                    <div class="header-title-expanded">
                        <a href="${getHeroLink(c.slug)}" target="_blank" class="hero-name-link" onclick="event.stopPropagation()">
                            <div class="expanded-name">${c.name}</div>
                        </a>
                        <div class="expanded-group">${c.group || "Season ?"}</div>
                    </div>
                    
                    <!-- Complexity (Full Bar in both states) -->
                    <div class="complexity-dice-bar" onclick="event.stopPropagation()">
                        ${complexityDiceHtml}
                    </div>
                    
                    <button type="button" class="panel-toggle" aria-expanded="false">
                        <svg class="panel-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                
                <!-- Collapsed Content -->
                <div class="hero-collapsed-info">
                    ${collapsedPlayersHtml}
                </div>
                
                <!-- Expanded Content -->
                <div class="hero-body">
                    <div class="expanded-players-list">
                        ${expandedPlayersHtml}
                    </div>
                </div>
            </div>`;
        })
        .join("");
}

// Relative time calculation helper
function parseDateString(dateString) {
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

function getDaysAgoClean(dateString) {
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

function getRecencyDot(lastPlayed) {
    let recencyDot = "⚫"; // Default to dark grey (Never)
    if (lastPlayed && lastPlayed === "Unknown") {
        recencyDot = "🔴"; // Red for Unknown (since it's a historical game played > 60 days ago)
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
                const diffDays = Math.floor(
                    diffTime / (1000 * 60 * 60 * 24),
                );
                if (diffDays <= 15) {
                    recencyDot = "🟢"; // Green (last 15 days)
                } else if (diffDays <= 60) {
                    recencyDot = "🟡"; // Yellow (15-60 days)
                } else {
                    recencyDot = "🔴"; // Red (more than 60 days)
                }
            } catch (e) {
                recencyDot = "⚪";
            }
        } else {
            recencyDot = "⚪"; // White for invalid/unknown dates
        }
    }
    return recencyDot;
}
