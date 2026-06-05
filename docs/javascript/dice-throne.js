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
let currentSort = "name";
let sortAsc = true;
let currentSortPlayerIndex = 0;
let editIndex = -1;
let activePlayerIndices = [0, 1, 2, 3];
let currentUser = null;
let loggedInPlayerIndex = -1;
let isRollActive = false;
let expandedCollectionGroups = new Set();
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
    preloader.addEventListener("animationend", () => preloader.remove(), {
        once: true,
    });
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
window.addEventListener("DOMContentLoaded", initializeApp);
window.addEventListener("DOMContentLoaded", updateDiceVisuals);
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
};

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
        if (actionButtons) actionButtons.style.display = "none";
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
            <label class="p-chk">
                <span class="player-tag" style="background:var(--${p.id})">${p.name}</span>
                <input type="checkbox" id="use${i}" ${isChecked} onclick="handlePlayerToggleClick(event, ${i})">
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
    loginModal.style.display = "block";
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
        const currentGroupIds = new Set(groups.map(g => g.id));
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
        renderGroupFilters();
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
        renderPlayerGameFilters();
    }

    const { data, error } = await db
        .from("heroes")
        .select(
            `
            *,
            groups (name),
            player_hero_stats (*)
        `,
        )
        .order("name", { ascending: true });

    if (error) return console.error("Error fetching heroes:", error);

    // Transform Supabase relational data into the flat array format expected by the app
    characters = data.map((hero) => {
        const char = {
            id: hero.id,
            name: hero.name,
            slug: hero.slug,
            complexity: hero.complexity,
            group_id: hero.group_id,
            is_owned: hero.is_owned,
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

    renderSortControls();
    renderAdminBuildInfo();
    renderGroupsList();
    renderGamesList();
    renderHeroesList();
    renderPlayersList();
    renderUsersList();
    renderPlayerGameFilters();
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

    modal.style.display = "block"; // Show the modal
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
        <div style="color: black;">
            <h3>v${entry.version}</h3>
            <ul style="text-align: left;">
                ${entry.changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
        </div>
    `;
    whatsNewModal.style.display = "block";
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
    const isHidden = sortSection.classList.toggle("hidden");
    if (isHidden) {
        activePlayerIndices = [0, 1, 2, 3];
        renderSortControls();
        currentSort = null;
        setSort("name");
    }
}

// ******************************************
// toggleFilterSection()
// input: none
// ******************************************
// Toggles the visibility of the filter section and resets filters if hidden.
// ******************************************
function toggleFilterSection() {
    const filterSection = document.getElementById("filter-section");
    const isHidden = filterSection.classList.toggle("hidden");
    if (isHidden) {
        activeLevels = new Set([1, 2, 3, 4, 5, 6]); // Reset to all active filters
        updateDiceVisuals();
        activeGroups = new Set(groups.map((g) => g.id));
        updateGroupVisuals();
        renderList();
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

    // Sort groups alphabetically by name
    const sortedGroups = [...groups].sort((a, b) =>
        a.name.localeCompare(b.name),
    );

    container.innerHTML = sortedGroups
        .map((group) => {
            const groupHeroes = characters
                .filter((c) => c.group_id === group.id)
                .sort((a, b) => a.name.localeCompare(b.name));

            if (groupHeroes.length === 0) return "";

            // A group is "checked" if all heroes in it are owned
            const allOwned = groupHeroes.every(isHeroOwned);

            const heroesHtml = groupHeroes
                .map(
                    (h) => `
            <div class="collection-item">
                <input type="checkbox" id="owned-${h.id}" ${isHeroOwned(h) ? "checked" : ""} onchange="toggleHeroOwned('${h.id}', this.checked)">
                <label for="owned-${h.id}">${h.name}</label>
            </div>
        `,
                )
                .join("");

            const isExpanded = expandedCollectionGroups.has(group.id);

            return `
            <div class="collection-group${isExpanded ? "" : " collapsed"}">
                <div class="collection-group-header" onclick="toggleCollectionGroup('${group.id}', event)" style="cursor: pointer;">
                    <button type="button" class="panel-toggle${isExpanded ? " open" : ""}" aria-expanded="${isExpanded}">V</button>
                    <input type="checkbox" id="owned-group-${group.id}" ${allOwned ? "checked" : ""} onchange="toggleGroupOwned('${group.id}', this.checked)" onclick="event.stopPropagation();">
                    <label for="owned-group-${group.id}" onclick="event.stopPropagation();"><strong>${group.name}</strong></label>
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
    // Update local state first for immediate UI feedback
    const hero = characters.find((h) => h.id === heroId);
    if (hero) hero.is_owned = isOwned;
    renderCollectionView();
    renderList();
    updateDropdownSort(); // Refresh dropdowns in the Roll section

    const { error } = await db
        .from("heroes")
        .update({ is_owned: isOwned })
        .eq("id", heroId);

    if (error) {
        alert("Error updating ownership: " + error.message);
        // Revert local state on error
        if (hero) hero.is_owned = !isOwned;
        renderCollectionView();
        updateDropdownSort(); // Revert dropdowns on error
        renderList();
    }
}

async function toggleGroupOwned(groupId, isOwned) {
    // Update local state for all heroes in the group immediately
    characters.forEach((h) => {
        if (h.group_id === groupId) h.is_owned = isOwned;
    });
    renderCollectionView();
    renderList();
    updateDropdownSort(); // Refresh dropdowns in the Roll section

    const { error } = await db
        .from("heroes")
        .update({ is_owned: isOwned })
        .eq("group_id", groupId);

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
        is_owned: false, // New heroes are not owned by default
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
                    ${g.type ? ` <span style="opacity: 0.6;">(${escapeHtml(g.type)})</span>` : ""}
                </div>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-save btn-inline" onclick="editGroup('${g.id}')">Edit</button>
                    <button type="button" class="btn-cancel btn-inline" onclick="deleteGroup('${g.id}')">Delete</button>
                </div>
            </div>
            <div id="groupEditPanel-${g.id}" class="group-edit-panel hidden">
                <div class="form-grid">
                    <input type="text" id="groupName-${g.id}" placeholder="Group Name" value="${escapeHtml(g.name)}">
                    <input type="text" id="groupType-${g.id}" placeholder="Type (optional)" value="${escapeHtml(g.type || "")}">
                    <input type="number" id="groupOrder-${g.id}" placeholder="Order Index" value="${g.order_index ?? ""}">
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
    const type = document.getElementById("groupType").value.trim();
    const order_index = document.getElementById("groupOrder").value.trim();

    if (!name) return alert("Group name is required");

    const groupData = {
        name,
        type: type || null,
        order_index: order_index ? parseInt(order_index) : null,
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
    document.getElementById(`groupType-${groupId}`).value = group.type || "";
    document.getElementById(`groupOrder-${groupId}`).value =
        group.order_index || "";
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
    const type = document.getElementById(`groupType-${groupId}`).value.trim();
    const order_index = document
        .getElementById(`groupOrder-${groupId}`)
        .value.trim();

    if (!name) return alert("Group name is required");

    const { error } = await db
        .from("groups")
        .upsert({
            id: groupId,
            name,
            type: type || null,
            order_index: order_index ? parseInt(order_index) : null,
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
    document.getElementById("groupType").value = "";
    document.getElementById("groupOrder").value = "";

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
    // Identify active players and randomize the order of selection
    const active = NAMES.map((_, i) => i)
        .filter((i) => document.getElementById(`use${i}`).checked)
        .sort(() => Math.random() - 0.5);

    if (active.length === 0) return alert("Select players!");

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    // Filter for owned heroes and create a pool for selection
    let pool = characters.filter(isHeroOwned).map((c) => structuredClone(c));

    if (pool.length < active.length) {
        return alert(
            `Not enough owned heroes (${pool.length}) in your collection for ${active.length} players!`,
        );
    }

    active.forEach((pIdx) => {
        let selectedName = "";

        if (pIdx >= 4) {
            // Purely random selection for invitee slots
            const r = Math.floor(Math.random() * pool.length);
            selectedName = pool[r]?.name;
            pool.splice(r, 1);
        } else {
            // Weighted selection for main players (0-3) using soft weights
            const activePool = pool.filter((c) => c.weights[pIdx] > 0);
            const totalEffectiveWeight = activePool.reduce(
                (sum, c) => sum + getSoftWeight(c, pIdx),
                0,
            );

            let random = Math.random() * totalEffectiveWeight;

            for (const hero of activePool) {
                const weight = getSoftWeight(hero, pIdx);
                if (random < weight) {
                    selectedName = hero.name;
                    pool.splice(
                        pool.findIndex((p) => p.name === selectedName),
                        1,
                    );
                    break;
                }
                random -= weight;
            }
        }
        renderPlayerRow(pIdx, selectedName);
    });

    validateSelection();
    if (isUser())
        document.getElementById("action-buttons").style.display = "flex";

    // Ensure the roll section is visible and scroll to results
    showRoll();
    resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    isRollActive = true;
}

// ******************************************
// updateDropdownSort()
// input: none
// ******************************************
// Refreshes all hero selection dropdowns in the results area
// based on the selected sort mode (Name vs Percentage).
// ******************************************
function updateDropdownSort() {
    const dropdowns = document.querySelectorAll(".results .char-select");
    dropdowns.forEach((dropdown) => {
        const pIdx = parseInt(dropdown.dataset.player);
        const currentVal = dropdown.value;
        dropdown.innerHTML = getSortedHeroOptions(pIdx, currentVal);
    });
}

// ******************************************
// getSortedHeroOptions(pIdx, selectedName)
// input: pIdx -> player index, selectedName -> current hero
// ******************************************
// Returns HTML option tags for all heroes, sorted by the active
// mode. Percentage logic is only applied to main players (0-3).
// ******************************************
function getSortedHeroOptions(pIdx, selectedName) {
    const sortMode =
        document.querySelector('input[name="dropdownSort"]:checked')?.value ||
        "name";

    let totalWeight = 0;
    if (sortMode === "weight" && pIdx < 4) {
        // Only calculate total probability for heroes currently in the collection
        characters
            .filter(isHeroOwned)
            .forEach((c) => (totalWeight += getSoftWeight(c, pIdx)));
    }

    const sortedChars = [...characters].sort((a, b) => {
        if (sortMode === "name") return a.name.localeCompare(b.name);

        if (pIdx < 4) {
            // When sorting by probability, unowned heroes are treated as having 0 weight and pushed to the bottom
            const ownedA = isHeroOwned(a);
            const ownedB = isHeroOwned(b);
            if (ownedA !== ownedB) return ownedB - ownedA;
            const wA = getSoftWeight(a, pIdx);
            const wB = getSoftWeight(b, pIdx);
            if (wA !== wB) return wB - wA; // Descending weight
        }
        return a.name.localeCompare(b.name);
    });

    return sortedChars
        .map((c) => {
            let label = c.name;
            if (sortMode === "weight" && pIdx < 4 && totalWeight > 0) {
                const owned = isHeroOwned(c);
                const weight = getSoftWeight(c, pIdx);
                const pct = owned
                    ? ((weight / totalWeight) * 100).toFixed(2)
                    : "0.00";
                label += ` (${pct}%)`;
            }
            return `<option value="${c.name}" ${c.name === selectedName ? "selected" : ""}>${label}</option>`;
        })
        .join("");
}

// ******************************************
// renderPlayerRow(pIdx, selectedName)
// input: pIdx -> player index, selectedName -> hero name
// ******************************************
// Renders the HTML result for a specific player's randomized character.
// ******************************************
function renderPlayerRow(pIdx, selectedName) {
    const charData = characters.find((c) => c.name === selectedName);
    const resultsDiv = document.getElementById("results");

    // Retrieve play statistics for the current player and selected character
    const plays = (charData?.playCount && charData.playCount[pIdx]) || 0;
    const last = (charData?.lastPlayed && charData.lastPlayed[pIdx]) || "Never";

    // Append the HTML for the player's row to the results container
    resultsDiv.innerHTML += `
        <div class="player-row">
            <!-- Link to the hero's external page, wrapping the image and complexity icon -->
            <a href="${getHeroLink(charData?.slug)}" target="_blank" id="link-${pIdx}">
                <div class="char-complexity-db">
                    <img src="${getImgUrl(charData?.slug)}" class="char-img-roll" id="img-${pIdx}" alt="${selectedName}" title="${selectedName}">
                    <img src="images/dice/d${charData?.complexity}.png" class="complexity-roll" alt="Complexity" id="comp-${pIdx}" title="Complexity: ${charData?.complexity}">
                </div>
            </a>
            <div style="flex:1">
                <!-- Player tag and conditional display of play stats for main players -->
                <div style="margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                    <span class="player-tag" style="background:var(--p${pIdx + 1})">${NAMES[pIdx]}</span>
                    ${pIdx < 4 ? `<div class="roll-stats"><span>Plays: <b>${plays}</b></span><span>Last: <b>${last}</b></span></div>` : ""}
                </div>
                <!-- Dropdown for manual hero selection -->
                <select class="char-select" data-player="${pIdx}" onchange="handleDropdownChange(this)">
                    ${getSortedHeroOptions(pIdx, selectedName)}
                </select>
            </div>
        </div>`;
}

// ******************************************
// handleDropdownChange(el)
// input: el -> the select element that changed
// ******************************************
// Updates the visual results and stats for a player when their
// hero is manually changed via dropdown.
// ******************************************
function handleDropdownChange(el) {
    const pIdx = parseInt(el.dataset.player);
    const char = characters.find((c) => c.name === el.value);

    if (!char) return;

    // Update the visual assets: portrait, complexity dice, and wiki link
    document.getElementById(`img-${pIdx}`).src = getImgUrl(char.slug);
    document.getElementById(`comp-${pIdx}`).src =
        `images/dice/d${char.complexity}.png`;
    document.getElementById(`link-${pIdx}`).href = getHeroLink(char.slug);

    // Locate the stats container within the current player's row
    const statsDiv = el.closest(".player-row").querySelector(".roll-stats");

    // Update play history only for the main 4 players
    if (statsDiv && pIdx < 4) {
        const playCount = char.playCount?.[pIdx] || 0;
        const lastPlayed = char.lastPlayed?.[pIdx] || "Never";

        statsDiv.innerHTML = `
            <span>Plays: <b>${playCount}</b></span>
            <span>Last: <b>${lastPlayed}</b></span>
        `;
    }

    // Refresh duplicate detection UI
    validateSelection();
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

    // Individually highlight dropdowns that contain duplicate entries
    dropdowns.forEach((d) => {
        d.classList.toggle("error", counts[d.value] > 1);
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

// ******************************************
// renderSortControls()
// input: none
// ******************************************
// Generates the new modern sorting panel including:
// 1. Column visibility pills
// 2. Sort field dropdown & Sort direction button
// 3. Conditional player pill selector
// ******************************************
function renderSortControls() {
    const container = document.getElementById("sort-section");
    if (!container) return;

    // Preserve historical data checkbox state before replacing HTML
    const useHistorical = document.getElementById("db-use-historical-data")?.checked ?? true;

    const mainPlayerNames = NAMES.slice(0, 4);

    // Parse current sort type and player index if applicable
    let sortType = "name";
    if (currentSort === "group") {
        sortType = "group";
    } else if (currentSort.startsWith("w")) {
        sortType = "probability";
        currentSortPlayerIndex = parseInt(currentSort.substring(1));
    } else if (currentSort.startsWith("d")) {
        sortType = "lastPlayed";
        currentSortPlayerIndex = parseInt(currentSort.substring(1));
    }

    // 1. Generate column visibility pills
    const visibilityPillsHtml = mainPlayerNames.map((name, i) => {
        const isActive = activePlayerIndices.includes(i);
        const activeClass = isActive ? `active p${i + 1}-color` : "inactive";
        return `
            <button type="button" class="pill-toggle ${activeClass}" onclick="togglePlayerFilter(${i})">
                ${name}
            </button>
        `;
    }).join("");

    // 2. Generate player-specific sorting pills if probability or lastPlayed is active
    const showPlayerSubSection = (sortType === "probability" || sortType === "lastPlayed");
    const playerPillsHtml = mainPlayerNames.map((name, i) => {
        const isActive = (currentSortPlayerIndex === i);
        const activeClass = isActive ? `active p${i + 1}-color` : "";
        const isColumnActive = activePlayerIndices.includes(i);
        const columnStyle = isColumnActive ? "" : "opacity: 0.5;";
        return `
            <button type="button" class="pill-toggle ${activeClass}" style="${columnStyle}" onclick="handleSortPlayerChange(${i})">
                ${name}
            </button>
        `;
    }).join("");

    const directionText = sortAsc ? "Ascending" : "Descending";
    const directionArrow = sortAsc ? "▲" : "▼";

    container.innerHTML = `
        <!-- Historical Data Row -->
        <div class="panel-row-new">
            <div class="dropdown-sort-options" style="margin: 0; justify-content: flex-start;">
                <label style="cursor: pointer; user-select: none;">
                    <input
                        type="checkbox"
                        id="db-use-historical-data"
                        ${useHistorical ? "checked" : ""}
                        onchange="renderList()" />
                    Include Historical Data (before May 8th 2026)
                </label>
            </div>
        </div>

        <!-- Column Visibility Row -->
        <div class="panel-row-new">
            <span class="panel-row-title">Show Player Stats Columns:</span>
            <div class="pill-group">
                ${visibilityPillsHtml}
            </div>
        </div>

        <!-- Sort Controls Row -->
        <div class="panel-row-new">
            <span class="panel-row-title">Sort Visible Heroes:</span>
            <div class="sort-controls-new">
                <select id="sort-type-select" class="sort-select-new" onchange="handleSortTypeChange(this.value)">
                    <option value="name" ${sortType === "name" ? "selected" : ""}>Hero Name</option>
                    <option value="group" ${sortType === "group" ? "selected" : ""}>Group (Season)</option>
                    <option value="probability" ${sortType === "probability" ? "selected" : ""}>Roll Probability (%)</option>
                    <option value="lastPlayed" ${sortType === "lastPlayed" ? "selected" : ""}>Last Played Date</option>
                </select>
                
                <button id="sort-direction-btn" class="btn-direction-new" onclick="toggleSortDirection()">
                    <span id="sort-direction-text">${directionText}</span>
                    <span id="sort-direction-arrow">${directionArrow}</span>
                </button>
            </div>
        </div>

        <!-- Conditional Player Selector Row -->
        <div id="player-sort-sub-section" class="panel-row-new" style="${showPlayerSubSection ? "" : "display: none;"}">
            <span class="panel-row-title">For Player:</span>
            <div class="pill-group">
                ${playerPillsHtml}
            </div>
        </div>
    `;
}

function handleSortTypeChange(value) {
    if (value === "name") {
        currentSort = "name";
    } else if (value === "group") {
        currentSort = "group";
    } else if (value === "probability") {
        currentSort = `w${currentSortPlayerIndex}`;
    } else if (value === "lastPlayed") {
        currentSort = `d${currentSortPlayerIndex}`;
    }
    
    // Default sort order (Asc for Name/Group, Desc for Probability/LastPlayed)
    sortAsc = (value === "name" || value === "group");

    renderSortControls();
    renderList();
}

function handleSortPlayerChange(playerIndex) {
    currentSortPlayerIndex = playerIndex;
    if (currentSort.startsWith("w")) {
        currentSort = `w${playerIndex}`;
    } else if (currentSort.startsWith("d")) {
        currentSort = `d${playerIndex}`;
    }
    
    renderSortControls();
    renderList();
}

function toggleSortDirection() {
    sortAsc = !sortAsc;
    renderSortControls();
    renderList();
}

// ******************************************
// toggleLevel(level)
// input: level -> dice number or 'all'
// ******************************************
// Manages the complexity filter Set and triggers UI updates.
// ******************************************
function toggleLevel(level) {
    if (level === "all") {
        // Toggle: if all 6 levels are active, clear filters; otherwise, select all levels
        activeLevels =
            activeLevels.size === 6 ? new Set() : new Set([1, 2, 3, 4, 5, 6]);
    } else {
        // Standard Sets lack a native .toggle() method; manually toggle existence
        if (activeLevels.has(level)) activeLevels.delete(level);
        else activeLevels.add(level);
    }

    // Update icon visuals and refresh the hero list display
    updateDiceVisuals();
    renderList();
}

// ******************************************
// updateDiceVisuals()
// input: none
// ******************************************
// Synchronizes the dice icon styling with the current
// active filter state (activeLevels set).
// ******************************************
function updateDiceVisuals() {
    // Update the active state for numeric dice 1 through 6
    for (let i = 1; i <= 6; i++) {
        const die = document.getElementById(`dice-${i}`);
        if (die) die.classList.toggle("active-die", activeLevels.has(i));
    }

    // The 'ALL' icon is highlighted only if all 6 levels are active
    const allDie = document.getElementById("dice-all");
    if (allDie) allDie.classList.toggle("active-die", activeLevels.size === 6);
}

function renderGroupFilters() {
    const container = document.getElementById("group-filter-bar");
    if (!container) return;

    const searchTerm = document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned = document.getElementById("db-show-not-owned")?.checked ?? false;

    let html = groups
        .map((g) => {
            const initials = g.name
                ? g.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                : "?";
            const isActive = activeGroups.has(g.id);
            
            // Calculate potential matches in this group
            const potentialMatchesCount = characters.filter((c) => {
                if (c.group_id !== g.id) return false;
                const nameMatch = c.name.toLowerCase().includes(searchTerm);
                const groupNameMatch = (c.group || "").toLowerCase().includes(searchTerm);
                const complexityMatch = activeLevels.has(Number(c.complexity));
                const ownershipMatch =
                    (isHeroOwned(c) && showOwned) ||
                    (!isHeroOwned(c) && showNotOwned);
                return (nameMatch || groupNameMatch) && complexityMatch && ownershipMatch;
            }).length;

            const isDisabled = potentialMatchesCount === 0;
            const activeClass = isActive && !isDisabled ? "active-die" : "";
            const disabledStyle = isDisabled ? "opacity: 0.15; pointer-events: none;" : "";
            
            return `
                <span class="dice-icon group-icon ${activeClass}" 
                     id="group-filter-${g.id}" 
                     onclick="${isDisabled ? "" : `toggleGroupFilter('${g.id}')`}" 
                     title="${escapeHtml(g.name)} (${potentialMatchesCount} heroes)"
                     style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 4px; overflow: hidden; ${disabledStyle}">
                    <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                        <rect x="2" y="2" width="32" height="32" rx="4" ry="4" fill="var(--secondary)" stroke="var(--accent)" stroke-width="2"/>
                        <text x="18" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="var(--text)" text-anchor="middle">${initials}</text>
                    </svg>
                </span>`;
        })
        .join("");

    // Calculate total active non-disabled groups
    const activeNonDisabledCount = groups.filter(g => {
        const potentialMatchesCount = characters.filter((c) => {
            if (c.group_id !== g.id) return false;
            const nameMatch = c.name.toLowerCase().includes(searchTerm);
            const groupNameMatch = (c.group || "").toLowerCase().includes(searchTerm);
            const complexityMatch = activeLevels.has(Number(c.complexity));
            const ownershipMatch =
                (isHeroOwned(c) && showOwned) ||
                (!isHeroOwned(c) && showNotOwned);
            return (nameMatch || groupNameMatch) && complexityMatch && ownershipMatch;
        }).length;
        return potentialMatchesCount > 0 && activeGroups.has(g.id);
    }).length;

    const totalAvailableGroups = groups.filter(g => {
        const potentialMatchesCount = characters.filter((c) => {
            if (c.group_id !== g.id) return false;
            const nameMatch = c.name.toLowerCase().includes(searchTerm);
            const groupNameMatch = (c.group || "").toLowerCase().includes(searchTerm);
            const complexityMatch = activeLevels.has(Number(c.complexity));
            const ownershipMatch =
                (isHeroOwned(c) && showOwned) ||
                (!isHeroOwned(c) && showNotOwned);
            return (nameMatch || groupNameMatch) && complexityMatch && ownershipMatch;
        }).length;
        return potentialMatchesCount > 0;
    });

    const allActive = totalAvailableGroups.length > 0 && activeNonDisabledCount === totalAvailableGroups.length;
    const allActiveClass = allActive ? "active-die" : "";
    const isAllDisabled = totalAvailableGroups.length === 0;
    const allDisabledStyle = isAllDisabled ? "opacity: 0.15; pointer-events: none;" : "";

    html += `
        <span class="dice-icon group-icon ${allActiveClass}" 
             id="group-filter-all" 
             onclick="${isAllDisabled ? "" : "toggleGroupFilter('all')"}" 
             title="All Groups"
             style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 4px; overflow: hidden; ${allDisabledStyle}">
            <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <rect x="2" y="2" width="32" height="32" rx="4" ry="4" fill="var(--secondary)" stroke="var(--accent)" stroke-width="2"/>
                <text x="18" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="var(--text)" text-anchor="middle">ALL</text>
            </svg>
        </span>`;

    container.innerHTML = html;
}

function toggleGroupFilter(groupId) {
    const searchTerm = document.getElementById("hero-search")?.value.toLowerCase() || "";
    const showOwned = document.getElementById("db-show-owned")?.checked ?? true;
    const showNotOwned = document.getElementById("db-show-not-owned")?.checked ?? false;

    const totalAvailableGroups = groups.filter(g => {
        const potentialMatchesCount = characters.filter((c) => {
            if (c.group_id !== g.id) return false;
            const nameMatch = c.name.toLowerCase().includes(searchTerm);
            const groupNameMatch = (c.group || "").toLowerCase().includes(searchTerm);
            const complexityMatch = activeLevels.has(Number(c.complexity));
            const ownershipMatch =
                (isHeroOwned(c) && showOwned) ||
                (!isHeroOwned(c) && showNotOwned);
            return (nameMatch || groupNameMatch) && complexityMatch && ownershipMatch;
        }).length;
        return potentialMatchesCount > 0;
    });

    if (groupId === "all") {
        const activeAvailableCount = totalAvailableGroups.filter(g => activeGroups.has(g.id)).length;
        if (activeAvailableCount === totalAvailableGroups.length) {
            // Unselect all available
            totalAvailableGroups.forEach(g => activeGroups.delete(g.id));
        } else {
            // Select all available
            totalAvailableGroups.forEach(g => activeGroups.add(g.id));
        }
    } else {
        if (activeGroups.has(groupId)) {
            activeGroups.delete(groupId);
        } else {
            activeGroups.add(groupId);
        }
    }
    
    updateGroupVisuals();
    renderList();
}

function updateGroupVisuals() {
    groups.forEach((g) => {
        const el = document.getElementById(`group-filter-${g.id}`);
        if (el) {
            el.classList.toggle("active-die", activeGroups.has(g.id));
        }
    });

    const allEl = document.getElementById("group-filter-all");
    if (allEl) {
        allEl.classList.toggle("active-die", activeGroups.size === groups.length);
    }
}

// Ensure visuals are correct when the page loads
window.addEventListener("DOMContentLoaded", () => {
    updateDiceVisuals();
    updateGroupVisuals();
});

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

    renderSortControls();
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

    renderSortControls();
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

    const showWinsOnly =
        document.getElementById("games-winner-only")?.checked || false;
    const searchTerm = (document.getElementById("games-search")?.value || "")
        .toLowerCase()
        .trim();

    const totalVisibleGames = games.filter((g) => !g.is_historical).length;

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

            const statusLabel =
                winners.length > 0 || isDraw ? "" : "In Progress";

            const canManage =
                isAdmin() || game.last_updated_by === currentUser?.id;
            const gameActions = canManage
                ? `
            <button class="btn-edit-small" onclick="selectWinner('${game.id}')" title="Select Winner">🏆</button>
            <button class="btn-edit-small" onclick="deleteGame('${game.id}')" title="Delete Game" style="color: var(--danger);">🗑️</button>
        `
                : "";

            const playerCols = game.game_players
                .map((gp) => {
                    // Map player ID (p1-p6) to internal index (0-5)
                    const pIdx = parseInt(gp.player_id.substring(1)) - 1;
                    const heroName = gp.heroes?.name || "Unknown";
                    const heroSlug = gp.heroes?.slug || "";
                    // Determine if this player's hero matches the current games search term
                    const isSearchMatch = Boolean(
                        searchTerm &&
                        heroName.toLowerCase().includes(searchTerm),
                    );

                    // Determine if this player matches the current player filter
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

                    let boxStyle = gp.is_winner
                        ? "position: relative; border: 2px solid #28a745; background-color: color-mix(in srgb, #28a745, transparent 65%); filter: brightness(1.3);" // win
                        : gp.is_winner === false
                          ? "border: 1px solid transparent; filter: brightness(0.70);" // loss
                          : "border: 1px solid #d32f2f;"; // not finished

                    // If this hero matches the search or the player filter, add an accent border and a tint background
                    if (isSearchMatch || isPlayerFilterMatch) {
                        boxStyle +=
                            " border: 2px solid var(--accent); background-color: color-mix(in srgb, var(--accent), transparent 65%);";
                    }

                    let overlayHtml = "";
                    if (gp.is_winner) {
                        overlayHtml =
                            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-12deg) scaleX(1.3); color: #28a745; font-weight: 900; font-size: 1.45rem; opacity: 1; pointer-events: none; z-index: 10; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); width: 100%; text-align: center; text-transform: uppercase; font-family: Impact, sans-serif; letter-spacing: 1px; white-space: nowrap;">WINNER</div>';
                    } else if (isDraw) {
                        overlayHtml =
                            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-12deg) scaleX(1.3); color: #999; font-weight: 900; font-size: 1.45rem; opacity: 1; pointer-events: none; z-index: 10; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); width: 100%; text-align: center; text-transform: uppercase; font-family: Impact, sans-serif; letter-spacing: 1px; white-space: nowrap;">DRAW</div>';
                    }

                    return `
                <div class="stat-column" style="${boxStyle}">
                    ${overlayHtml}
                    <div class="player-tag" style="background-color: var(--p${pIdx + 1}); margin-bottom: 8px; width: 100%; box-sizing: border-box;">${NAMES[pIdx]}</div>
                    <a href="${getHeroLink(heroSlug)}" target="_blank" style="display: block;">
                        <img src="${getImgUrl(heroSlug)}" style="width: 40px; height: 40px; border-radius: 4px; border: 1px solid var(--accent); margin-bottom: 4px;" alt="${heroName}">
                    </a>
                    <div class="stat-main" style="font-size: 0.7rem;">${heroName}</div>
                </div>`;
                })
                .join("");

            return `
            <div class="hero-header">
                <span class="hero-name">${dateStr}</span>
                <span class="group-label">${statusLabel}</span>
            </div>
            <div class="hero-body" style="margin-bottom: 20px;">
                <div class="hero-main-info">
                    <div class="char-complexity-db">
                        ${gameActions}
                    </div>
                </div>
                <div class="hero-details">
                    <div class="dynamic-stats">${playerCols}</div>
                </div>
            </div>`;
        })
        .join("");

    if (games.length === 0) {
        container.innerHTML =
            '<p style="text-align:center; opacity:0.6;">No games recorded yet.</p>';
    }
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

    // Build a list of radio buttons for each participant
    let optionsHtml = game.game_players
        .map((gp, i) => {
            const pIdx = parseInt(gp.player_id.substring(1)) - 1;
            const heroName = gp.heroes?.name || "Unknown";
            return `
            <label style="display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; color: black;">
                <input type="radio" name="winner-choice" value="${gp.player_id}" style="width: 20px; height: 20px; accent-color: var(--accent);">
                <div>
                    <div style="font-weight: bold;">${NAMES[pIdx]}</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">${heroName}</div>
                </div>
            </label>
        `;
        })
        .join("");

    // Add Draw Option
    optionsHtml += `
        <label style="display: flex; align-items: center; gap: 15px; padding: 12px; cursor: pointer; color: black; background: rgba(0,0,0,0.05); border-radius: 0 0 8px 8px;">
            <input type="radio" name="winner-choice" value="draw" style="width: 20px; height: 20px; accent-color: var(--accent);">
            <div>
                <div style="font-weight: bold;">🤝 Draw</div>
                <div style="font-size: 0.8rem; opacity: 0.7;">No winner for this match</div>
            </div>
        </label>
    `;

    container.innerHTML = optionsHtml;

    // Attach the game ID to the button so submitWinner knows which game to update
    confirmBtn.onclick = () => submitWinner(gameId);

    document.getElementById("winner-modal").style.display = "block";
    document.body.style.overflow = "hidden";
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
        btn.innerText = "Confirm Winner";
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

function toggleGamesFilterUI() {
    const isHidden = document
        .getElementById("games-filter-section")
        .classList.toggle("hidden");
    if (isHidden) {
        selectedGamePlayerIndex = null;
        const wrapper = document.getElementById("winner-filter-wrapper");
        const winnerCheckbox = document.getElementById("games-winner-only");
        if (wrapper) wrapper.classList.add("hidden");
        if (winnerCheckbox) winnerCheckbox.checked = false;

        renderPlayerGameFilters();
        renderGamesList();
    }
}

function renderPlayerGameFilters() {
    const container = document.getElementById("player-game-filter-container");
    if (!container || players.length === 0) return;
    const useHistorical =
        document.getElementById("use-historical-data")?.checked ?? true;

    // Calculate stats for each player and invitees based on the full game history
    const playerStats = players.map(() => ({ played: 0, won: 0 }));
    let inviteePlayed = 0;
    let inviteeWon = 0;

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

    let html = "";
    // Main 4 players
    for (let i = 0; i < 4; i++) {
        const p = players[i];
        if (!p) continue;
        const isActive = selectedGamePlayerIndex === i;
        html += `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <button class="player-filter-btn ${isActive ? "active" : ""}" 
                        style="background-color: var(--p${i + 1});" 
                        onclick="togglePlayerGameFilter(${i})">
                    ${p.name}
                </button>
                <div style="font-size: 0.8rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                    Played: ${playerStats[i].played}<br>
                    Won: ${playerStats[i].won}
                </div>
            </div>
        `;
    }

    // Invitee button (covers indices 4 and 5)
    const isInviteeActive = selectedGamePlayerIndex === 4;
    html += `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <button class="player-filter-btn ${isInviteeActive ? "active" : ""}" 
                    style="background-color: var(--p5);" 
                    onclick="togglePlayerGameFilter(4)">
                Invitee
            </button>
            <div style="font-size: 0.8rem; opacity: 0.8; text-align: center; line-height: 1.2;">
                Played: ${inviteePlayed}<br>
                Won: ${inviteeWon}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function togglePlayerGameFilter(idx) {
    if (selectedGamePlayerIndex === idx) {
        selectedGamePlayerIndex = null;
    } else {
        selectedGamePlayerIndex = idx;
    }

    const wrapper = document.getElementById("winner-filter-wrapper");
    const winnerCheckbox = document.getElementById("games-winner-only");
    if (wrapper) {
        if (
            selectedGamePlayerIndex !== null &&
            selectedGamePlayerIndex !== undefined
        ) {
            wrapper.classList.remove("hidden");
        } else {
            wrapper.classList.add("hidden");
            if (winnerCheckbox) winnerCheckbox.checked = false;
        }
    }

    renderPlayerGameFilters();
    renderGamesList();
}

function updateHeroStatsFromHistory() {
    const useHistorical =
        document.getElementById("db-use-historical-data")?.checked ?? true;

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

    renderGroupFilters();

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
                return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            }
        } else {
            valA = (a[currentSort] || "").toLowerCase();
            valB = (b[currentSort] || "").toLowerCase();
        }

        if (valA === valB) return 0;
        const comparison = valA < valB ? -1 : 1;
        return sortAsc ? comparison : -comparison;
    });

    // 4. Generate the HTML efficiently
    container.innerHTML = processedList
        .map((c) => {
            const statsHtml = activePlayerIndices
                .map((p) => {
                    const weight = (c.weights && c.weights[p]) || 0;
                    const softWeight = getSoftWeight(c, p);
                    const owned = isHeroOwned(c);
                    const percentage =
                        owned && totals[p] > 0
                            ? ((softWeight / totals[p]) * 100).toFixed(2)
                            : "0.00";
                    const playCount = (c.playCount && c.playCount[p]) || 0;
                    const lastPlayed =
                        (c.lastPlayed && c.lastPlayed[p]) || "Never";
                    const winCount = (c.winCount && c.winCount[p]) || 0;
                    const winRate =
                        playCount > 0
                            ? ((winCount / playCount) * 100).toFixed(1)
                            : "0.0";

                    return `
            <div class="stat-column">
                <div class="player-tag" style="background-color: var(--p${p + 1}); margin-bottom: 8px; width: 100%; box-sizing: border-box;">${NAMES[p]}</div>
                <div class="stat-main">${percentage}%</div>
                <div class="stat-sub stat-weight">(${weight})</div>
                <div class="stat-sub stat-plays">Plays: <b>${playCount}</b></div>
                <div class="stat-sub stat-win-rate">Wins: <b>${winCount}</b></div>
                <div class="stat-sub stat-win-rate">(${winRate}%)</div>
                <div class="stat-date-small">${lastPlayed}</div>
            </div>`;
                })
                .join("");

            return `
            <div class="hero-item collapsed">
                <div class="hero-header" onclick="toggleHeroPanel(this)">
                    <button type="button" class="panel-toggle" aria-expanded="false">V</button>
                    <span class="hero-name">${c.name}</span>
                    <span class="group-label">(${c.group || "Season ?"})</span>
                </div>
                <div class="hero-body">
                    <div class="hero-main-info">
                        <a href="${getHeroLink(c.slug)}" target="_blank">
                            <div class="char-complexity-db">
                                <img src="${getImgUrl(c.slug)}" class="char-img-roll" alt="${c.name}">
                                <img src="images/dice/d${c.complexity}.png" class="complexity-roll" alt="Complexity">
                            </div>
                        </a>
                    </div>
                    <div class="hero-details">
                        <div class="dynamic-stats">${statsHtml}</div>
                    </div>
                </div>
            </div>`;
        })
        .join("");
}
