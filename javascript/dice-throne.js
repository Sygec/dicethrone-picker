// ==========================================
// 1. GLOBAL CONSTANTS & STATE
// ==========================================
const NAMES = ["Claudine", "Joel", "Julie", "Martin", "Invitee 1", "Invitee 2"];
const PLAYER_COLORS = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--p4)'];

let characters = [];
let games = [];
let cachedChangelog = null;
let activeLevels = new Set([1, 2, 3, 4, 5, 6]);
let currentSort = 'name';
let sortAsc = true;
let editIndex = -1;
let activePlayerIndices = [0, 1, 2, 3];

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const versionLabel = document.getElementById("version-number");
const container = document.getElementById("changelog-container");
const modal = document.getElementById("changelog-modal");
const closeBtn = document.querySelector(".close-button");

// ==========================================
// 3. SUPABASE CONFIGURATION
// ==========================================
const PROD_SUPABASE_URL = 'https://ojqkkixtvdtccuixishh.supabase.co';
const PROD_SUPABASE_KEY = 'sb_publishable_AT9BZrEkq1IDrZmP1Y_pDQ_Qwnh57ZH';
const DEV_SUPABASE_URL  = 'https://wmxrzjmadvivvpzbslgj.supabase.co';
const DEV_SUPABASE_KEY  = 'sb_publishable_Hohs2ojpVd5nmRJoi0upNg_PJv8M7x6';

const SUPABASE_URL = isProd ? PROD_SUPABASE_URL : DEV_SUPABASE_URL;
const SUPABASE_KEY = isProd ? PROD_SUPABASE_KEY : DEV_SUPABASE_KEY;

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 4. UTILITY HELPERS
// ==========================================
const getImgUrl = (slug) => slug ? `https://dice-throne.rulepop.com/heroes/${slug}.webp` : "";
const getHeroLink = (slug) => `https://dice-throne.rulepop.com/#hero/${slug}`;

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
        const response = await fetch('changelog.json');
        cachedChangelog = await response.json();

        if (cachedChangelog.length > 0) {
            versionLabel.innerText = cachedChangelog[0].version;
        }
    } catch (error) {
        console.error("Could not load version number:", error);
        versionLabel.innerText = "Error";
    }
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
window.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('DOMContentLoaded', updateDiceVisuals); 
versionLabel.onclick = openChangelog;
closeBtn.onclick = closeChangelog;

window.onclick = (event) => {
    if (event.target == modal) closeChangelog();
}

// ****************************************** 
// init()
// input: none
// ****************************************** 
// Fetches initial data from Supabase and sets the initial sort state.
// ****************************************** 
async function init() {
    const { data, error } = await db
        .from('heroes')
        .select(`
            *,
            groups (name),
            player_hero_stats (*)
        `);

    if (error) return console.error("Error fetching heroes:", error);

    // Transform Supabase relational data into the flat array format expected by the app
    characters = data.map(hero => {
        const char = {
            id: hero.id,
            name: hero.name,
            slug: hero.slug,
            complexity: hero.complexity,
            group: hero.groups?.name || "Unknown",
            weights: [100, 100, 100, 100],
            playCount: [0, 0, 0, 0],
            lastPlayed: ["Never", "Never", "Never", "Never"]
        };

        // Map stats from the player_hero_stats table into the arrays by player index
        hero.player_hero_stats?.forEach(stat => {
            // Map player IDs "p1"-"p4" from the database to internal indices 0-3
            const pIdx = parseInt(stat.player_id.substring(1)) - 1;
            if (pIdx >= 0 && pIdx < 4) {
                char.weights[pIdx] = stat.weight;
                char.playCount[pIdx] = stat.play_count;
                char.lastPlayed[pIdx] = stat.last_played || "Never";
            }
        });

        return char;
    });

    // Fetch Games and their participants
    const { data: gamesData, error: gamesError } = await db
        .from('games')
        .select(`
            id,
            played_at,
            game_players (
                player_id,
                is_winner,
                heroes (
                    name,
                    slug,
                    complexity
                )
            )
        `)
        .order('played_at', { ascending: false });

    if (gamesError) console.error("Error fetching games:", gamesError);
    else games = gamesData;

    renderSortControls();
    renderAdminBuildInfo();
    renderGamesList();
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
    const infoDiv = document.getElementById('admin-build-info');
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
        ${!isProd ? '<div style="margin-top:5px; color:var(--danger); font-style:italic;">Note: Dev heroes are prefixed with "DEV-" in this database.</div>' : ''}
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
    container.innerHTML = cachedChangelog.map(entry => `
        <div>
            <h3>v${entry.version}</h3>
            <ul>
                ${entry.changes.map(change => `<li>${change}</li>`).join('')}
            </ul>
        </div>
    `).join('');

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
// toggleDatabase()
// input: none
// ****************************************** 
// Toggles the visibility of the Hero Database section.
// ****************************************** 
function toggleDatabase() {
    const s = document.getElementById('dbSection');
    const b = document.getElementById('dbToggleBtn');
    const isHidden = s.classList.toggle('hidden');
    b.innerText = isHidden ? "📂 Show Hero Database & Stats" : "📁 Hide Hero Database";
}

// ****************************************** 
// toggleGames()
// input: none
// ****************************************** 
// Toggles the visibility of the Games History section.
// ****************************************** 
function toggleGames() {
    const s = document.getElementById('gamesSection');
    const b = document.getElementById('gamesToggleBtn');
    const isHidden = s.classList.toggle('hidden');
    b.innerText = isHidden ? "🎲 Show Games History" : "🎲 Hide Games History";
}

// ****************************************** 
// toggleAdmin()
// input: none
// ****************************************** 
// Toggles the visibility of the Admin section.
// ****************************************** 
function toggleAdmin() {
    const s = document.getElementById('adminSection');
    const b = document.querySelector('.admin-toggle-btn');
    
    // Use classList for consistency with toggleSort logic
    const isHidden = s.classList.toggle('hidden');
    
    b.innerText = isHidden ? '⚠ Show Admin Section' : '⚠ Hide Admin Section';
}    

// ****************************************** 
// saveCharacter()
// input: none
// ****************************************** 
// Adds a new hero or updates an existing one in Supabase.
// ****************************************** 
async function saveCharacter() {
    // Extract and trim values from management form inputs
    const name = document.getElementById('charName').value.trim();
    const group = document.getElementById('charGroup').value.trim();
    const slug = document.getElementById('charSlug').value.trim();
    const complexity = document.getElementById('charComplexity').value.trim();
    
    if (!name) return alert("Name is required");

    // Note: This logic assumes groups are handled by name for simplicity
    // In a full implementation, you'd lookup/create the group_id first.
    const charData = {
        name,
        slug,
        complexity: parseInt(complexity)
    };

    if (editIndex > -1) charData.id = characters[editIndex].id;

    const { data: hero, error } = await db
        .from('heroes')
        .upsert(charData)
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
    const c = characters[idx];

    // Populate all management form fields (including missing complexity)
    document.getElementById('charName').value = c.name;
    document.getElementById('charGroup').value = c.group || "";
    document.getElementById('charSlug').value = c.slug || "";
    document.getElementById('charComplexity').value = c.complexity || "";

    // Update UI state to "Edit" mode
    document.getElementById('formTitle').innerText = "Edit Hero: " + c.name;
    document.getElementById('cancelBtn').style.display = "block";

    // Ensure the admin section is expanded so the user can see the form
    const adminSection = document.getElementById('adminSection');
    if (adminSection.classList.contains('hidden')) toggleAdmin();

    // Smoothly scroll to the form and focus the first field
    adminSection.scrollIntoView({ behavior: 'smooth' });
    // document.getElementById('charName').focus();
}

// ****************************************** 
// resetForm()
// input: none
// ****************************************** 
// Clears the Hero Management form fields and resets the title.
// ****************************************** 
function resetForm() {
    editIndex = -1;
    
    // Clear all input values within the management form grid
    document.querySelectorAll('.manage-form .form-grid input').forEach(input => input.value = "");

    // Reset UI state to "Add" mode
    document.getElementById('formTitle').innerText = "Add New Hero";
    document.getElementById('cancelBtn').style.display = "none";
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
    const penalty = Math.pow((plays * 3) + 1, 2);
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
    const active = NAMES
        .map((_, i) => i)
        .filter(i => document.getElementById(`use${i}`).checked)
        .sort(() => Math.random() - 0.5);

    if (active.length === 0) return alert("Select players!");
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // Work with a copy of characters to safely remove heroes as they are assigned
    let pool = structuredClone(characters);

    active.forEach(pIdx => {
        let selectedName = "";

        if (pIdx >= 4) {
            // Purely random selection for invitee slots
            const r = Math.floor(Math.random() * pool.length);
            selectedName = pool[r]?.name;
            pool.splice(r, 1);
        } else {
            // Weighted selection for main players (0-3) using soft weights
            const activePool = pool.filter(c => c.weights[pIdx] > 0);
            const totalEffectiveWeight = activePool.reduce((sum, c) => sum + getSoftWeight(c, pIdx), 0);
            
            let random = Math.random() * totalEffectiveWeight;

            for (const hero of activePool) {
                const weight = getSoftWeight(hero, pIdx);
                if (random < weight) {
                    selectedName = hero.name;
                    pool.splice(pool.findIndex(p => p.name === selectedName), 1);
                    break;
                }
                random -= weight;
            }
        }
        renderPlayerRow(pIdx, selectedName);
    });

    validateSelection();
    document.getElementById('confirmBtn').style.display = 'block';
}

// ****************************************** 
// updateDropdownSort()
// input: none
// ****************************************** 
// Refreshes all hero selection dropdowns in the results area
// based on the selected sort mode (Name vs Percentage).
// ****************************************** 
function updateDropdownSort() {
    const dropdowns = document.querySelectorAll('.results .char-select');
    dropdowns.forEach(dropdown => {
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
    const sortMode = document.querySelector('input[name="dropdownSort"]:checked')?.value || 'name';
    
    let totalWeight = 0;
    if (sortMode === 'weight' && pIdx < 4) {
        characters.forEach(c => totalWeight += getSoftWeight(c, pIdx));
    }

    const sortedChars = [...characters].sort((a, b) => {
        if (sortMode === 'name') return a.name.localeCompare(b.name);
        
        if (pIdx < 4) {
            const wA = getSoftWeight(a, pIdx);
            const wB = getSoftWeight(b, pIdx);
            if (wA !== wB) return wB - wA; // Descending weight
        }
        return a.name.localeCompare(b.name);
    });

    return sortedChars.map(c => {
        let label = c.name;
        if (sortMode === 'weight' && pIdx < 4 && totalWeight > 0) {
            const weight = getSoftWeight(c, pIdx);
            const pct = ((weight / totalWeight) * 100).toFixed(2);
            label += ` (${pct}%)`;
        }
        return `<option value="${c.name}" ${c.name === selectedName ? 'selected' : ''}>${label}</option>`;
    }).join('');
}

// ****************************************** 
// renderPlayerRow(pIdx, selectedName)
// input: pIdx -> player index, selectedName -> hero name
// ****************************************** 
// Renders the HTML result for a specific player's randomized character.
// ****************************************** 
function renderPlayerRow(pIdx, selectedName) {
    const charData = characters.find(c => c.name === selectedName);
    const resultsDiv = document.getElementById('results');
    
    // Retrieve play statistics for the current player and selected character
    const plays = (charData?.playCount && charData.playCount[pIdx]) || 0;
    const last = (charData?.lastPlayed && charData.lastPlayed[pIdx]) || "Never";

    // Append the HTML for the player's row to the results container
    resultsDiv.innerHTML += `
        <div class="player-row">
            <!-- Link to the hero's external page, wrapping the image and complexity icon -->
            <a href="${getHeroLink(charData?.slug)}" target="_blank" id="link-${pIdx}">
                <div class="char-complexity-roll">
                    <img src="${getImgUrl(charData?.slug)}" class="char-img-roll" id="img-${pIdx}" alt="${selectedName}" title="${selectedName}">
                    <img src="images/d${charData?.complexity}.png" class="complexity-roll" alt="Complexity" id="comp-${pIdx}" title="Complexity: ${charData?.complexity}">
                </div>
            </a>
            <div style="flex:1">
                <!-- Player tag and conditional display of play stats for main players -->
                <div style="margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                    <span class="player-tag" style="background:var(--p${pIdx+1})">${NAMES[pIdx]}</span>
                    ${pIdx < 4 ? `<div class="roll-stats"><span>Plays: <b>${plays}</b></span><span>Last: <b>${last}</b></span></div>` : ''}
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
    const char = characters.find(c => c.name === el.value);
    
    if (!char) return;

    // Update the visual assets: portrait, complexity dice, and wiki link
    document.getElementById(`img-${pIdx}`).src = getImgUrl(char.slug);
    document.getElementById(`comp-${pIdx}`).src = `images/d${char.complexity}.png`;
    document.getElementById(`link-${pIdx}`).href = getHeroLink(char.slug);
    
    // Locate the stats container within the current player's row
    const statsDiv = el.closest('.player-row').querySelector('.roll-stats');

    // Update play history only for the main 4 players
    if (statsDiv && pIdx < 4) {
        const playCount = char.playCount?.[pIdx] || 0;
        const lastPlayed = char.lastPlayed?.[pIdx] || 'Never';

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
    const dropdowns = document.querySelectorAll('.char-select');
    const names = Array.from(dropdowns).map(d => d.value);

    // Count occurrences of each hero to identify duplicates efficiently
    const counts = names.reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    // Determine if any hero is selected more than once
    const hasDupes = Object.values(counts).some(count => count > 1);

    const confirmBtn = document.getElementById('confirmBtn');
    const errorMsg = document.getElementById('error-msg');
    
    // Update the "Lock In" button state: visual styling and functional toggle
    confirmBtn.classList.toggle('disabled', hasDupes);
    confirmBtn.disabled = hasDupes;
    errorMsg.style.display = hasDupes ? 'block' : 'none';
    
    // Individually highlight dropdowns that contain duplicate entries
    dropdowns.forEach(d => {
        d.classList.toggle('error', counts[d.value] > 1);
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
    const dropdowns = document.querySelectorAll('.char-select');
    const today = new Date().toLocaleDateString('en-CA');
    const statsUpdates = [];
    const gameParticipants = [];
    
    // Create a Map of [playerIndex -> heroName] for fast lookups
    const activePicks = new Map(
        Array.from(dropdowns).map(sel => [parseInt(sel.dataset.player), sel.value])
    );

    // 1. Create the game record first to get the unique ID for this session
    const { data: game, error: gameError } = await db.from('games').insert({}).select().single();
    if (gameError) return alert("Error creating game: " + gameError.message);

    characters.forEach(char => {
        // Loop through all 6 potential player slots to record the game history
        [0, 1, 2, 3, 4, 5].forEach(pIdx => {
            const playerChoice = activePicks.get(pIdx);

            // Add to game record if this specific player is using this specific hero
            if (playerChoice === char.name) {
                gameParticipants.push({
                    game_id: game.id,
                    player_id: `p${pIdx + 1}`,
                    hero_id: char.id,
                    is_winner: null // Explicitly undecided
                });
            }
            
            // Long-term stats and weighting are only tracked for the 4 main players (0-3)
            if (pIdx < 4 && playerChoice !== undefined) {
                const wasPicked = (playerChoice === char.name);
                const newWeight = wasPicked ? 20 : (char.weights[pIdx] || 100) + 10;

                statsUpdates.push({
                    hero_id: char.id,
                    player_id: `p${pIdx + 1}`,
                    weight: newWeight,
                    play_count: wasPicked ? (char.playCount[pIdx] || 0) + 1 : (char.playCount[pIdx] || 0),
                    last_played: wasPicked ? today : (char.lastPlayed[pIdx] === "Never" ? null : char.lastPlayed[pIdx])
                });
            }
        });
    });

    // 2. Save the participants to the junction table
    const { error: gpError } = await db.from('game_players').insert(gameParticipants);
    if (gpError) return alert("Error logging game participants: " + gpError.message);

    // 3. Update the weights and play counts for main players
    const { error } = await db
        .from('player_hero_stats')
        .upsert(statsUpdates);

    if (error) return alert("Error saving results: " + error.message);

    // Refresh local state and UI immediately after database updates are successful
    await init();

    document.getElementById('confirmBtn').style.display = 'none';
    document.getElementById('results').innerHTML = `
        <p style="color:#28a745; text-align:center; font-weight:bold;">
            Session Logged! Game record created and stats updated.
        </p>`;
}

// ****************************************** 
// renderSortControls()
// input: none
// ****************************************** 
// Generates the sorting buttons for Name, Weights, and Dates.
// ****************************************** 
function renderSortControls() {
    const container = document.getElementById('player-sort-container');
    // Sort controls are only rendered for the main 4 players (indices 0-3)
    const mainPlayerNames = NAMES.slice(0, 4);
            
    let html = `
        <div class="player-card-mini">
            <span class="mini-name"> </span>
            <div class="mini-actions">
                <button class="btn-mini-sort" id="sort-name" onclick="setSort('name')">Hero</button> <!-- Button to sort by hero name -->
            </div>
        </div>
    `;

    // Generate interactive player cards that act as visibility toggles and sort triggers
    html += mainPlayerNames.map((name, i) => {
        // Identify if the current player index is part of the active stats display
        const isActive = activePlayerIndices.includes(i);
        const filterClass = isActive ? '' : 'inactive-filter';

        return `
        <div class="player-card-mini ${filterClass}" style="border-left-color: var(--p${i + 1});">
            <span class="player-tag-small" style="background:var(--p${i + 1})" onclick="togglePlayerFilter(${i})">${name}</span>
            <div class="mini-actions">
                <button class="btn-mini-sort" id="sort-w${i}" 
                        ${isActive ? `onclick="setSort('w${i}')"` : 'style="pointer-events: none;"'}>%</button>
                <button class="btn-mini-sort" id="sort-d${i}" 
                        ${isActive ? `onclick="setSort('d${i}')"` : 'style="pointer-events: none;"'}>&#128197;</button>
            </div>
        </div>
    `;
    }).join('');

container.innerHTML = html;

}

// ****************************************** 
// toggleLevel(level)
// input: level -> dice number or 'all'
// ****************************************** 
// Manages the complexity filter Set and triggers UI updates.
// ****************************************** 
function toggleLevel(level) {
    if (level === 'all') {
        // Toggle: if all 6 levels are active, clear filters; otherwise, select all levels
        activeLevels = (activeLevels.size === 6) ? new Set() : new Set([1, 2, 3, 4, 5, 6]);
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
        if (die) die.classList.toggle('active-die', activeLevels.has(i));
    }

    // The 'ALL' icon is highlighted only if all 6 levels are active
    const allDie = document.getElementById('dice-all');
    if (allDie) allDie.classList.toggle('active-die', activeLevels.size === 6);
}

// Ensure visuals are correct when the page loads
window.addEventListener('DOMContentLoaded', updateDiceVisuals);

// ****************************************** 
// resetAllWeights()
// input: none
// ****************************************** 
// Resets the randomization weights for all heroes to 100 
// for all players after a user confirmation.
// ****************************************** 
async function resetAllWeights() {
    if (confirm("Reset all probabilities to 100?")) {
        const updates = [];
        characters.forEach(c => {
            [0,1,2,3].forEach(p => updates.push({ hero_id: c.id, player_id: `p${p + 1}`, weight: 100 }));
        });
        await db.from('player_hero_stats').upsert(updates, { onConflict: 'player_id, hero_id' });
        init();
    }
}

// ****************************************** 
// resetAllStats()
// input: none
// ****************************************** 
// Resets play counts and last played dates for all heroes
// across all players after a user confirmation.
// ****************************************** 
async function resetAllStats() {
    if (confirm("Reset all play history?")) {
        const updates = [];
        characters.forEach(c => {
            [0,1,2,3].forEach(p => updates.push({ hero_id: c.id, player_id: `p${p + 1}`, play_count: 0, last_played: null }));
        });
        await db.from('player_hero_stats').upsert(updates, { onConflict: 'player_id, hero_id' });
        init();
    }
}

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
        sortAsc = !key.startsWith('d') && !key.startsWith('w');
    }

    // Reset all sort buttons: remove active class and strip any existing arrows
    document.querySelectorAll('.btn-mini-sort').forEach(btn => {
        btn.classList.remove('active');
        btn.innerText = btn.innerText.replace(/ [▲▼]/, '');
    });

    // Highlight the current button and add the appropriate direction arrow
    const activeBtn = document.getElementById(`sort-${key}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.innerText += sortAsc ? ' ▲' : ' ▼';
    }

    // Trigger the list refresh with new sorting applied
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
    const searchInput = document.getElementById('hero-search');
    const clearBtn = document.getElementById('clear-search');

    // Toggle the 'hidden' class: add it if input is empty, remove it if text exists
    clearBtn.classList.toggle('hidden', searchInput.value.trim().length === 0);

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
    const searchInput = document.getElementById('hero-search');
    searchInput.value = ''; // Reset the input value to empty
    searchInput.focus();    // Return focus to the bar so the user can type again immediately
    
    // Re-use handleSearchInput to hide the 'X' button and refresh the list
    handleSearchInput();
}

// ****************************************** 
// toggleSort()
// input: none
// ****************************************** 
// Toggles the visibility of the sorting and filtering section (sort-section) 
// by adding or removing the 'hidden' CSS class.
// ****************************************** 
function toggleSort() {
    // Toggles the 'hidden' class: removes it if present, adds it if missing.
    document.getElementById('sort-section').classList.toggle('hidden');
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
            currentSort = 'name';
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
    const container = document.getElementById('gamesContainer');
    const countLabel = document.getElementById('game-count-stats');
    if (!container || !games) return;

    if (countLabel) {
        countLabel.innerText = `Showing ${games.length} of ${games.length} games`;
    }

    container.innerHTML = games.map(game => {
        // Ensure the date string is treated as UTC by forcing the ISO format (T separator and Z suffix)
        let rawDate = game.played_at || "";
        if (rawDate && !rawDate.includes('T')) rawDate = rawDate.replace(' ', 'T');
        if (rawDate && !rawDate.includes('Z') && !rawDate.includes('+')) rawDate += 'Z';
        
        const dateStr = new Date(rawDate).toLocaleString('en-CA', { timeZone: 'America/Montreal', dateStyle: 'medium', timeStyle: 'short' });
        
        // Determine status/winner image logic
        const winners = game.game_players.filter(p => p.is_winner === true);
        const explicitLosers = game.game_players.filter(p => p.is_winner === false); // Players explicitly marked as not winning
        let statusImg = "images/in_progress.png"; // Placeholder path
        let statusLabel = "In Progress";

        if (winners.length === 1) {
            const pIdx = parseInt(winners[0].player_id.substring(1)) - 1;
            statusImg = getImgUrl(winners[0].heroes?.slug);
            statusLabel = ``;
            // statusLabel = `Winner: ${NAMES[pIdx]} playing ${winners[0].heroes?.name}`;
        } else if (winners.length === 0 && explicitLosers.length > 0 && explicitLosers.length === game.game_players.length) {
            // A draw is identified when there are no winners and every participant is explicitly marked as a loser.
            statusImg = "images/draw.png"; // Placeholder path
            statusLabel = "Draw";
        }

        const playerCols = game.game_players.map(gp => {
            // Map player ID (p1-p6) to internal index (0-5)
            const pIdx = parseInt(gp.player_id.substring(1)) - 1;
            const heroName = gp.heroes?.name || 'Unknown';
            const heroSlug = gp.heroes?.slug || '';
            // const isWinner = gp.is_winner === true;
            const boxStyle = gp.is_winner 
                ? "border: 2px solid #28a745; background: rgba(40, 167, 69, 0.1); filter: brightness(1.3);"   // win
                : gp.is_winner === false
                    ? "border: 1px solid transparent; filter: brightness(0.70);"  // loss
                    : "border: 1px solid #d32f2f;";  // not finished

            return `
                <div class="stat-column" style="${boxStyle}">
                    <div class="player-tag" style="background-color: var(--p${pIdx + 1}); margin-bottom: 8px; width: 100%; box-sizing: border-box;">${NAMES[pIdx]}</div>
                    <img src="${getImgUrl(heroSlug)}" style="width: 40px; height: 40px; border-radius: 4px; border: 1px solid var(--accent); margin-bottom: 4px;" alt="${heroName}">
                    <div class="stat-main" style="font-size: 0.7rem;">${heroName}</div>
                </div>`;
        }).join('');

        return `
            <div class="hero-header">
                <span class="hero-name">${dateStr}</span>
                <span class="group-label">${statusLabel}</span>
            </div>
            <div class="hero-body" style="margin-bottom: 20px;">
                <div class="hero-main-info">
                    <div class="char-complexity-db">
                        <button class="btn-edit-small" onclick="selectWinner('${game.id}')" title="Select Winner">🏆</button>
                        <button class="btn-edit-small" onclick="declareDraw('${game.id}')" title="Declare Draw">🔍</button>
                        <button class="btn-edit-small" onclick="deleteGame('${game.id}')" title="Delete Game" style="color: var(--danger);">🗑️</button>
                    </div>
                </div>
                <div class="hero-details">
                    <div class="dynamic-stats">${playerCols}</div>
                </div>
            </div>`;
    }).join('');

    if (games.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.6;">No games recorded yet.</p>';
    }
}

// ****************************************** 
// declareDraw(gameId)
// input: gameId -> the ID of the game to update
// ****************************************** 
// Updates all participants of a specific game to be marked as losers (is_winner: false),
// which the system identifies as a draw.
// ****************************************** 
async function declareDraw(gameId) {
    if (!confirm("Are you sure you want to declare this game a draw?")) return;

    const { data, error } = await db
        .from('game_players')
        .update({ is_winner: false })
        .eq('game_id', gameId)
        .select();

    if (error) {
        console.error("Error declaring draw:", error);
        return alert("Failed to update database: " + error.message);
    }

    if (!data || data.length === 0) {
        alert("No records were updated. Please check your Supabase RLS policies for the 'game_players' table.");
    }

    await init();
}

// ****************************************** 
// selectWinner(gameId)
// input: gameId -> the ID of the game to update
// ****************************************** 
// Prompts the user to select which player won the game, 
// updating the database accordingly.
// ****************************************** 
async function selectWinner(gameId) {
    const game = games.find(g => g.id == gameId); // Use loose equality to handle string vs number IDs
    if (!game) return;

    const container = document.getElementById('winner-selection-container');
    const confirmBtn = document.getElementById('confirm-winner-btn');

    // Build a list of radio buttons for each participant
    container.innerHTML = game.game_players.map((gp, i) => {
        const pIdx = parseInt(gp.player_id.substring(1)) - 1;
        const heroName = gp.heroes?.name || 'Unknown';
        return `
            <label style="display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; color: black;">
                <input type="radio" name="winner-choice" value="${gp.player_id}" style="width: 20px; height: 20px; accent-color: var(--accent);">
                <div>
                    <div style="font-weight: bold;">${NAMES[pIdx]}</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">${heroName}</div>
                </div>
            </label>
        `;
    }).join('');

    // Attach the game ID to the button so submitWinner knows which game to update
    confirmBtn.onclick = () => submitWinner(gameId);

    document.getElementById('winner-modal').style.display = 'block';
    document.body.style.overflow = "hidden";
}

// ****************************************** 
// closeWinnerModal()
// ****************************************** 
function closeWinnerModal() {
    document.getElementById('winner-modal').style.display = 'none';
    document.body.style.overflow = "auto";
}

// ****************************************** 
// submitWinner(gameId)
// ****************************************** 
async function submitWinner(gameId) {
    const selectedRadio = document.querySelector('input[name="winner-choice"]:checked');
    if (!selectedRadio) return alert("Please select a winner.");

    const winnerPlayerId = selectedRadio.value;

    // Disable button to prevent double-clicks
    const btn = document.getElementById('confirm-winner-btn');
    btn.disabled = true;
    btn.innerText = "Saving...";

    try {
        // Update winner
        const { error: winErr } = await db.from('game_players').update({ is_winner: true }).eq('game_id', gameId).eq('player_id', winnerPlayerId);
        if (winErr) throw winErr;

        // Update losers
        const { error: loseErr } = await db.from('game_players').update({ is_winner: false }).eq('game_id', gameId).neq('player_id', winnerPlayerId);
        if (loseErr) throw loseErr;

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
    if (!confirm("Are you sure you want to delete this game record? This cannot be undone.")) return;

    const { error } = await db
        .from('games')
        .delete()
        .eq('id', gameId);

    if (error) {
        console.error("Error deleting game:", error);
        return alert("Failed to delete game: " + error.message);
    }

    await init();
}

// init();

// ****************************************** 
// renderList()
// input: none
// ****************************************** 
// Renders the list of heroes in the database section based on the current search term, 
// the active dice filters, and the current sort settings. This function is called whenever 
// any of those parameters change to update the displayed list accordingly.
// ****************************************** 
function renderList() {
    const container = document.getElementById('heroContainer');
    if (!container) return;
    
    const searchTerm = document.getElementById('hero-search')?.value.toLowerCase() || "";
    const countLabel = document.getElementById('count-stats');

    // 1. Efficiently calculate totals for the entire pool in a single pass O(N)
    // Now uses soft weights (with play-count penalty) for the pool total
    const totals = [0, 0, 0, 0];
    characters.forEach(c => {
        for (let i = 0; i < 4; i++) {
            totals[i] += getSoftWeight(c, i);
        }
    });

    // 2. Prepare the list: Attach original indices to avoid expensive lookups during render,
    // then filter based on search term and complexity levels.
    const processedList = characters
        .map((char, index) => ({ ...char, originalIndex: index }))
        .filter(c => {
            const nameMatch = c.name.toLowerCase().includes(searchTerm);
            const groupMatch = (c.group || "").toLowerCase().includes(searchTerm);
            const complexityMatch = activeLevels.has(Number(c.complexity));
            return (nameMatch || groupMatch) && complexityMatch;
        });

    if (countLabel) {
        countLabel.innerText = `Showing ${processedList.length} of ${characters.length} heroes`;
    }

    // 3. Sort the results based on current settings
    processedList.sort((a, b) => {
        let valA, valB;
        
        if (currentSort.startsWith('w')) {
            const idx = parseInt(currentSort[1]);
            valA = getSoftWeight(a, idx); 
            valB = getSoftWeight(b, idx);
        } 
        else if (currentSort.startsWith('d')) {
            const idx = parseInt(currentSort[1]);
            valA = (a.lastPlayed && a.lastPlayed[idx]) || "";
            valB = (b.lastPlayed && b.lastPlayed[idx]) || "";
            if (valA === "Never") valA = "";
            if (valB === "Never") valB = "";
        } 
        else {
            valA = (a[currentSort] || "").toLowerCase();
            valB = (b[currentSort] || "").toLowerCase();
        }

        if (valA === valB) return 0;
        const comparison = valA < valB ? -1 : 1;
        return sortAsc ? comparison : -comparison;
    });

    // 4. Generate the HTML efficiently
    container.innerHTML = processedList.map(c => {
        const statsHtml = activePlayerIndices.map(p => {
            const weight = (c.weights && c.weights[p]) || 0;
            const softWeight = getSoftWeight(c, p);
            const percentage = totals[p] > 0 ? ((softWeight / totals[p]) * 100).toFixed(2) : '0.00';
            const playCount = (c.playCount && c.playCount[p]) || 0;
            const lastPlayed = (c.lastPlayed && c.lastPlayed[p]) || "Never";

            return `
            <div class="stat-column">
                <div class="player-tag" style="background-color: var(--p${p + 1}); margin-bottom: 8px; width: 100%; box-sizing: border-box;">${NAMES[p]}</div>
                <div class="stat-main">${percentage}%</div>
                <div class="stat-sub">(${weight})</div>
                <div class="stat-sub">Plays: ${playCount}</div>
                <div class="stat-date-small">${lastPlayed}</div>
            </div>`;
        }).join('');

        return `
            <div class="hero-header"><span class="hero-name">${c.name}</span> <span class="group-label">(${c.group || 'Season ?'})</span></div>
            <div class="hero-body">
                <div class="hero-main-info">
                    <a href="${getHeroLink(c.slug)}" target="_blank">
                        <div class="char-complexity-db">
                            <img src="${getImgUrl(c.slug)}" class="char-img-roll" alt="${c.name}">
                            <img src="images/d${c.complexity}.png" class="complexity-roll" alt="Complexity">
                        </div>
                    </a>
                    <!-- <span class="group-label">(${c.group || 'Season ?'})</span> -->
                    <button class="btn-edit-small" onclick="editChar(${c.originalIndex})" title="Edit Hero">✎</button>
                </div>
                <div class="hero-details">
                    <div class="dynamic-stats">${statsHtml}</div>
                </div>
            </div>`;
    }).join('');
}

init().then(() => {
    // Setup Realtime subscription once after initial load to keep data in sync across clients
    db
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'player_hero_stats' }, init)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'heroes' }, init)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, init)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players' }, init)
        .subscribe();
});
