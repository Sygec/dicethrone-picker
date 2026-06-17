/**
 * @fileoverview Logic for hero picker rolls, randomizer animations, manual hero overrides, drafts, bans, and result logging.
 * @module randomizer
 */

import * as apiService from './services/apiService.js';
import * as stateStore from './stateStore.js';

/**
 * Executes a hero roll for all active players, selecting unique characters.
 * Triggers draft wheels if draft mode is enabled.
 * @function pickCharacters
 */
export function pickCharacters() {
    const active = window.NAMES.map((_, i) => i).filter(
        (i) => document.getElementById(`use${i}`).checked,
    );

    if (active.length === 0) return alert("Select players!");

    const selectionOrder = [...active].sort(() => Math.random() - 0.5);

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    let pool = window.characters
        .filter((c) => window.isHeroOwned(c) && !window.bannedHeroIds.has(c.id))
        .map((c) => structuredClone(c));

    if (pool.length < active.length) {
        return alert(
            `Not enough available (owned & non-banned) heroes (${pool.length}) in your collection for ${active.length} players!`,
        );
    }

    if (window.draftModeEnabled) {
        const rollBtnContainer = document.getElementById("rollBtnContainer");
        if (rollBtnContainer) rollBtnContainer.style.display = "none";

        const actionButtons = document.getElementById("action-buttons");
        if (actionButtons) actionButtons.style.display = "none";

        window.activeDraftOrder = selectionOrder;
        window.activeDraftStep = 0;
        window.selectedDraftHeroes = {};
        window.activeDraftCandidates = {};
        window.draftWheelAngles = {};
        window.draftWheelFrontCardIndices = {};

        const sortedActive = [...active].sort((a, b) => a - b);
        sortedActive.forEach((pIdx) => {
            renderPlayerRowWaiting(pIdx, window.NAMES[window.activeDraftOrder[0]]);
        });

        if (typeof window.showSection === "function") window.showSection("roll");
        resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

        startDraftStep();
        return;
    }

    const rollResults = {};

    selectionOrder.forEach((pIdx) => {
        let selectedHero = null;

        if (pIdx >= 4) {
            const r = Math.floor(Math.random() * pool.length);
            selectedHero = pool[r];
            pool.splice(r, 1);
        } else {
            const activePool = pool.filter((c) => c.weights[pIdx] > 0);
            if (activePool.length === 0) {
                if (pool.length > 0) {
                    const r = Math.floor(Math.random() * pool.length);
                    selectedHero = pool[r];
                    pool.splice(r, 1);
                }
            } else {
                const totalEffectiveWeight = activePool.reduce(
                    (sum, c) => sum + window.getSoftWeight(c, pIdx),
                    0,
                );

                let random = Math.random() * totalEffectiveWeight;
                for (const hero of activePool) {
                    const weight = window.getSoftWeight(hero, pIdx);
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
        }
        rollResults[pIdx] = selectedHero;
    });

    const rollBtnContainer = document.getElementById("rollBtnContainer");
    if (rollBtnContainer) {
        rollBtnContainer.style.display = "none";
    }

    const rollBtn = document.getElementById("rollBtn");
    if (rollBtn) {
        rollBtn.disabled = true;
        rollBtn.style.opacity = "0.6";
        rollBtn.style.cursor = "not-allowed";
    }

    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) actionButtons.style.display = "none";

    window.isRollActive = false;

    const sortedActive = [...active].sort((a, b) => a - b);

    sortedActive.forEach((pIdx) => {
        renderPlayerRowSkeleton(pIdx);
    });

    if (typeof window.showSection === "function") window.showSection("roll");
    resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

    const ownedHeroes = window.characters.filter(
        (c) => window.isHeroOwned(c) && !window.bannedHeroIds.has(c.id),
    );

    sortedActive.forEach((pIdx) => {
        startPanelScramble(pIdx, ownedHeroes);
    });

    let currentRevealIndex = 0;

    function revealNext() {
        if (currentRevealIndex >= selectionOrder.length) {
            validateSelection();
            if (window.isUser()) {
                if (actionButtons) actionButtons.style.display = "flex";
                if (rollBtnContainer) rollBtnContainer.style.display = "none";
            } else {
                if (rollBtnContainer) {
                    rollBtnContainer.style.display = "flex";
                }
                if (rollBtn) {
                    rollBtn.disabled = false;
                    rollBtn.style.opacity = "1";
                    rollBtn.style.cursor = "pointer";
                }
            }
            window.isRollActive = true;
            return;
        }

        const pIdx = selectionOrder[currentRevealIndex];
        const finalHero = rollResults[pIdx];

        const duration = 500 + Math.random() * 500;

        setTimeout(() => {
            stopPanelScramble(pIdx, finalHero);
            currentRevealIndex++;
            setTimeout(revealNext, 400);
        }, duration);
    }

    revealNext();
}
window.pickCharacters = pickCharacters;

/**
 * Refreshes valid selections after a dropdown sorting update.
 * @function updateDropdownSort
 */
export function updateDropdownSort() {
    validateSelection();
}
window.updateDropdownSort = updateDropdownSort;

/**
 * Appends a player row placeholder with animatable text inside the results container.
 * @function renderPlayerRowSkeleton
 * @param {number} pIdx - The index of the player slot.
 */
export function renderPlayerRowSkeleton(pIdx) {
    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML += `
        <div class="player-row randomizing" id="player-row-${pIdx}" style="--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});">
            <img src="" class="char-bg-img scramble-img" id="bg-img-${pIdx}" alt="Randomizing">
            
            <div class="player-row-content">
                <div class="hero-info-container" id="info-container-${pIdx}">
                    <div class="hero-header-row">
                        <div class="hero-header-left">
                            <span class="player-name-caps" style="color: var(--player-color);">${window.NAMES[pIdx].toUpperCase()}</span>
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
window.renderPlayerRowSkeleton = renderPlayerRowSkeleton;

/**
 * Opens the manual hero selection modal for a specific player slot.
 * @function openHeroSelectModal
 * @param {number} pIdx - The target player index.
 */
export function openHeroSelectModal(pIdx) {
    window.activeSelectPlayerIdx = pIdx;

    const modal = document.getElementById("hero-select-modal");
    if (!modal) return;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    const titleEl = document.getElementById("hero-select-modal-title");
    if (titleEl && window.NAMES[pIdx]) {
        titleEl.innerText = `Select Hero for ${window.NAMES[pIdx]}`;
    }

    const searchInput = document.getElementById("hero-select-search");
    if (searchInput) {
        searchInput.value = "";
    }

    setModalSort("name");
    if (typeof window.updateSegmentedHighlights === "function") {
        setTimeout(window.updateSegmentedHighlights, 50);
    }
}
window.openHeroSelectModal = openHeroSelectModal;

/**
 * Closes the manual hero selection modal.
 * @function closeHeroSelectModal
 */
export function closeHeroSelectModal() {
    const modal = document.getElementById("hero-select-modal");
    if (modal) {
        modal.style.display = "none";
    }
    document.body.style.overflow = "";
    window.activeSelectPlayerIdx = null;
}
window.closeHeroSelectModal = closeHeroSelectModal;

/**
 * Sets the active sort criteria inside the manual selection modal.
 * @function setModalSort
 * @param {string} mode - Sorting key ("name" or "weight").
 */
export function setModalSort(mode) {
    window.modalSortMode = mode;

    const namePill = document.getElementById("modal-sort-name");
    const weightPill = document.getElementById("modal-sort-weight");

    if (namePill) namePill.classList.toggle("active", mode === "name");
    if (weightPill) weightPill.classList.toggle("active", mode === "weight");

    if (typeof window.updateSegmentedHighlights === "function") {
        window.updateSegmentedHighlights();
    }
    filterHeroSelectOptions();
}
window.setModalSort = setModalSort;

/**
 * Re-evaluates search queries typed into the hero override search bar.
 * @function filterHeroSelectOptions
 */
export function filterHeroSelectOptions() {
    const searchInput = document.getElementById("hero-select-search");
    const searchTerm = searchInput ? searchInput.value : "";
    renderHeroSelectOptions(searchTerm);
}
window.filterHeroSelectOptions = filterHeroSelectOptions;

/**
 * Generates options inside the manual hero selection modal container.
 * @function renderHeroSelectOptions
 * @param {string} [searchTerm=""] - Search term filters.
 */
export function renderHeroSelectOptions(searchTerm = "") {
    const container = document.getElementById("hero-select-options-container");
    if (!container) return;

    const pIdx = window.activeSelectPlayerIdx;
    if (pIdx === null) return;

    let owned = window.characters.filter((c) => window.isHeroOwned(c));

    if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        owned = owned.filter((c) => {
            const nameMatch = c.name.toLowerCase().includes(term);
            const groupMatch = (c.group || "").toLowerCase().includes(term);
            return nameMatch || groupMatch;
        });
    }

    let totalWeight = 0;
    if (window.modalSortMode === "weight" && pIdx < 4) {
        owned.forEach((c) => (totalWeight += window.getSoftWeight(c, pIdx)));
    }

    owned.sort((a, b) => {
        if (window.modalSortMode === "weight" && pIdx < 4) {
            const wA = window.getSoftWeight(a, pIdx);
            const wB = window.getSoftWeight(b, pIdx);
            if (wA !== wB) return wB - wA;
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
            if (window.modalSortMode === "weight" && pIdx < 4 && totalWeight > 0) {
                const weight = window.getSoftWeight(c, pIdx);
                const pct = ((weight / totalWeight) * 100).toFixed(1);
                pctLabel = `<div class="hero-select-card-pct">${pct}%</div>`;
            }

            return `
            <div class="hero-select-card ${isSelected ? "selected" : ""}" onclick="selectHeroForPlayer('${c.name.replace(/'/g, "\\'")}')">
                <img src="${window.getImgUrl(c.slug)}" class="hero-select-card-img" alt="${c.name}">
                <div class="hero-select-card-name">${c.name}</div>
                ${pctLabel}
            </div>
        `;
        })
        .join("");
}
window.renderHeroSelectOptions = renderHeroSelectOptions;

/**
 * Manually overrides a rolled selection for a player slot, updates UI attributes, and closes the modal.
 * @function selectHeroForPlayer
 * @param {string} heroName - Name of the selected hero.
 */
export function selectHeroForPlayer(heroName) {
    const pIdx = window.activeSelectPlayerIdx;
    if (pIdx === null) return;

    const char = window.characters.find((c) => c.name === heroName);
    if (!char) return;

    if (window.draftModeEnabled) {
        window.selectedDraftHeroes[pIdx] = char;
    }
    const rowEl = document.getElementById(`player-row-${pIdx}`);
    if (rowEl) {
        rowEl.classList.remove("active-draft", "waiting-draft");
    }

    const selectEl = document.getElementById(`select-${pIdx}`);
    if (selectEl) {
        selectEl.value = char.name;
    }

    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    if (bgImgEl) {
        bgImgEl.src = window.getImgUrl(char.slug);
        bgImgEl.alt = char.name;
    }

    const nameTitle = document.getElementById(`hero-name-title-${pIdx}`);
    if (nameTitle) {
        nameTitle.innerText = char.name;
        nameTitle.classList.remove("scramble-text");
        nameTitle.classList.add("resolved");
        nameTitle.href = window.getHeroLink(char.slug);
    }

    const groupEl = document.getElementById(`hero-group-${pIdx}`);
    if (groupEl) groupEl.innerText = char.group || "Unknown";

    const statsDiv = document.getElementById(`stats-row-${pIdx}`);
    if (statsDiv) {
        const probText = `Prob: <b>${window.getHeroProbabilityText(char, pIdx)}</b>`;
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

    validateSelection();
    closeHeroSelectModal();
}
window.selectHeroForPlayer = selectHeroForPlayer;

/**
 * Starts scramble animations inside a player's results card.
 * @function startPanelScramble
 * @param {number} pIdx - Player index.
 * @param {Object[]} ownedHeroes - Array of owned hero objects.
 */
export function startPanelScramble(pIdx, ownedHeroes) {
    if (ownedHeroes.length === 0) return;

    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    const nameEl = document.getElementById(`hero-name-title-${pIdx}`);

    const intervalId = setInterval(() => {
        const randomHero =
            ownedHeroes[Math.floor(Math.random() * ownedHeroes.length)];
        if (bgImgEl) bgImgEl.src = window.getImgUrl(randomHero.slug);
        if (nameEl) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*";
            let scrambleStr = "";
            for (let k = 0; k < 8; k++) {
                scrambleStr += chars[Math.floor(Math.random() * chars.length)];
            }
            nameEl.innerText = scrambleStr;
        }
    }, 70);
    stateStore.updateObject("scrambleIntervals", pIdx, intervalId);
}
window.startPanelScramble = startPanelScramble;

/**
 * Stops scramble animations, locking visual states to the selected hero attributes.
 * @function stopPanelScramble
 * @param {number} pIdx - Player index.
 * @param {Object} finalHero - Rolled hero object.
 */
export function stopPanelScramble(pIdx, finalHero) {
    const intervals = stateStore.get("scrambleIntervals");
    if (intervals[pIdx]) {
        clearInterval(intervals[pIdx]);
        stateStore.updateObject("scrambleIntervals", pIdx, undefined);
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
            bgImgEl.src = window.getImgUrl(finalHero.slug);
            bgImgEl.alt = finalHero.name;
            bgImgEl.classList.remove("scramble-img");
        }
        if (nameEl) {
            nameEl.innerText = finalHero.name;
            nameEl.classList.remove("scramble-text");
            nameEl.classList.add("resolved");
            nameEl.href = window.getHeroLink(finalHero.slug);
        }

        const groupEl = document.getElementById(`hero-group-${pIdx}`);
        if (groupEl) {
            groupEl.innerText = finalHero.group || "Unknown";
        }

        const statsRow = document.getElementById(`stats-row-${pIdx}`);
        if (statsRow) {
            const probText = `Prob: <b>${window.getHeroProbabilityText(finalHero, pIdx)}</b>`;
            if (pIdx < 4) {
                const plays = finalHero.playCount[pIdx] || 0;
                const last = finalHero.lastPlayed[pIdx] || "Never";
                statsRow.innerHTML = `
                    <span>Plays: <b>${plays}</b></b></span>
                    <span class="stats-divider">|</span>
                    <span>Last: <b>${last}</b></b></span>
                    <span class="stats-divider">|</span>
                    <span>${probText}</span>
                `;
            } else {
                statsRow.innerHTML = `<span>${probText}</span>`;
            }
        }

        const selectEl = document.getElementById(`select-${pIdx}`);
        if (selectEl) {
            selectEl.value = finalHero.name;
        }
    }

    const hiddenContainers = rowEl?.querySelectorAll(".scramble-hidden");
    hiddenContainers?.forEach((c) => {
        c.classList.remove("opacity-0");
        c.classList.add("fade-in-resolve");
    });
}
window.stopPanelScramble = stopPanelScramble;

/**
 * Validates selected items across player slots, checking for duplicates or unowned entries.
 * Adjusts lock buttons.
 * @function validateSelection
 */
export function validateSelection() {
    const dropdowns = document.querySelectorAll(".char-select");
    const names = Array.from(dropdowns).map((d) => d.value);

    const counts = names.reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
    const hasDupes = Object.values(counts).some((count) => count > 1);

    const unownedSelectedHeroes = names.filter((name) => {
        const hero = window.characters.find((c) => c.name === name);
        return hero && !window.isHeroOwned(hero);
    });
    const hasUnownedHeroes = unownedSelectedHeroes.length > 0;

    const confirmBtn = document.getElementById("confirmBtn");
    const errorMsg = document.getElementById("error-msg");

    if (!confirmBtn || !errorMsg) return;

    confirmBtn.classList.remove("disabled", "warning");
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = "LOCK IN SESSION";
    errorMsg.style.display = "none";

    if (hasDupes) {
        confirmBtn.classList.add("disabled");
        confirmBtn.disabled = true;
        errorMsg.style.display = "block";
        errorMsg.innerText =
            "⚠ Duplicate hero selected! Each player must have a unique character.";
    } else if (hasUnownedHeroes) {
        confirmBtn.classList.add("warning");
        confirmBtn.innerHTML = "⚠️ LOCK IN SESSION";
        errorMsg.style.display = "block";
        errorMsg.innerText = `⚠️ You have selected unowned heroes: ${unownedSelectedHeroes.join(", ")}.`;
    }

    dropdowns.forEach((d) => {
        const row = d.closest(".player-row");
        if (row) {
            row.classList.toggle("error", counts[d.value] > 1);
        }
    });
}
window.validateSelection = validateSelection;

/**
 * Submits rolled selection results, logging a new entry inside the database, 
 * updating play count weights, and clearing results.
 * @function applyResults
 * @async
 * @returns {Promise<void>}
 */
export async function applyResults() {
    const confirmBtn = document.getElementById("confirmBtn");
    const originalText = confirmBtn ? confirmBtn.innerText : "Lock In";
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Saving...";
    }

    const selectedHeroNames = Array.from(
        document.querySelectorAll(".char-select"),
    ).map((d) => d.value);
    const unownedSelectedHeroes = selectedHeroNames.filter((name) => {
        const hero = window.characters.find((c) => c.name === name);
        return hero && !window.isHeroOwned(hero);
    });

    if (unownedSelectedHeroes.length > 0) {
        const unownedHeroNames = unownedSelectedHeroes.join(", ");
        const confirmation = confirm(
            `You have selected unowned heroes: ${unownedHeroNames}. Do you want to proceed?`,
        );
        if (!confirmation) {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerText = originalText;
            }
            return;
        }
    }

    const dropdowns = document.querySelectorAll(".char-select");
    const statsUpdates = [];
    const gameParticipants = [];

    const activePicks = new Map(
        Array.from(dropdowns).map((sel) => [
            parseInt(sel.dataset.player),
            sel.value,
        ]),
    );

    const { data: game, error: gameError } = await apiService.insertGame(window.currentUser.id);
    if (gameError) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
        }
        return alert("Error creating game: " + gameError.message);
    }

    window.characters.forEach((char) => {
        [0, 1, 2, 3, 4, 5].forEach((pIdx) => {
            const playerChoice = activePicks.get(pIdx);

            if (playerChoice === char.name) {
                gameParticipants.push({
                    game_id: game.id,
                    player_id: `p${pIdx + 1}`,
                    hero_id: char.id,
                    is_winner: null,
                    last_updated_by: window.currentUser.id,
                });
            }

            if (pIdx < 4 && playerChoice !== undefined) {
                const wasPicked = playerChoice === char.name;
                const newWeight = wasPicked
                    ? window.PICKED_HERO_WEIGHT
                    : (char.weights[pIdx] || window.DEFAULT_HERO_WEIGHT) +
                      window.WEIGHT_INCREMENT;

                statsUpdates.push({
                    hero_id: char.id,
                    player_id: `p${pIdx + 1}`,
                    weight: newWeight,
                    last_updated_by: window.currentUser.id,
                });
            }
        });
    });

    const { error: gpError } = await apiService.insertGamePlayers(gameParticipants);
    if (gpError) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
        }
        return alert("Error logging game participants: " + gpError.message);
    }

    const { error } = await apiService.upsertPlayerHeroStats(statsUpdates);

    if (error) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
        }
        return alert("Error saving results: " + error.message);
    }

    if (typeof window.init === "function") await window.init();

    document.getElementById("action-buttons").style.display = "none";
    const rollBtnContainer = document.getElementById("rollBtnContainer");
    if (rollBtnContainer) {
        rollBtnContainer.style.display = "flex";
    }
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
    window.isRollActive = false;
}
window.applyResults = applyResults;

/**
 * Resets visual states, halts scramble animations, and cancels the current active roll.
 * @function cancelRoll
 */
export function cancelRoll() {
    document.getElementById("results").innerHTML =
        '<p style="text-align: center; opacity: 0.6;">Select players and roll.</p>';
    document.getElementById("action-buttons").style.display = "none";

    if (window.activeDraftOrder) {
        window.activeDraftOrder.forEach((pIdx) => {
            const intervals = stateStore.get("scrambleIntervals");
            if (intervals[pIdx]) {
                clearInterval(intervals[pIdx]);
                stateStore.updateObject("scrambleIntervals", pIdx, undefined);
            }
        });
    }

    const rollBtnContainer = document.getElementById("rollBtnContainer");
    if (rollBtnContainer) {
        rollBtnContainer.style.display = "flex";
    }
    const rollBtnEl = document.getElementById("rollBtn");
    if (rollBtnEl) {
        rollBtnEl.style.display = "block";
        rollBtnEl.disabled = false;
        rollBtnEl.style.opacity = "1";
        rollBtnEl.style.cursor = "pointer";
    }
    window.isRollActive = false;
}
window.cancelRoll = cancelRoll;

/**
 * Handles confirmation prompt when players checkbox configuration is modified during an active roll.
 * @function handlePlayerToggleClick
 * @param {Event} event - Toggle event.
 * @param {number} index - Player index context.
 */
export function handlePlayerToggleClick(event, index) {
    if (window.isRollActive) {
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
window.handlePlayerToggleClick = handlePlayerToggleClick;

/**
 * Opens the roll settings drawer and initializes the staged draft and ban configuration.
 * @function openRollSettingsDrawer
 */
export function openRollSettingsDrawer() {
    window.currentDrawerMode = "roll-settings";
    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");
    if (!drawer) return;

    title.innerText = "Roll Settings";
    footer.style.display = "flex";

    window.stagedDraftModeEnabled = window.draftModeEnabled;
    window.stagedDraftCount = window.draftCount;
    window.stagedBannedHeroIds = new Set(window.bannedHeroIds);
    window.stagedBanSearchQuery = "";
    window.stagedRollSettingsTab = "draft";

    if (typeof window.renderDrawerBody === "function") {
        window.renderDrawerBody();
    }
    drawer.classList.add("open");
}
window.openRollSettingsDrawer = openRollSettingsDrawer;

/**
 * Switches the active tab in the roll settings drawer and re-renders the body.
 * @function switchRollSettingsTab
 * @param {string} tabName - The name of the tab to switch to (e.g. 'draft', 'ban').
 */
export function switchRollSettingsTab(tabName) {
    window.stagedRollSettingsTab = tabName;
    if (typeof window.renderDrawerBody === "function") {
        window.renderDrawerBody();
    }
}
window.switchRollSettingsTab = switchRollSettingsTab;

/**
 * Toggles draft mode in the staged settings.
 * @function toggleStagedDraftMode
 * @param {boolean} enabled - True if draft mode is enabled.
 */
export function toggleStagedDraftMode(enabled) {
    window.stagedDraftModeEnabled = enabled;
    const section = document.getElementById("drawer-draft-count-section");
    if (section) {
        section.style.display = enabled ? "block" : "none";
    }
}
window.toggleStagedDraftMode = toggleStagedDraftMode;

/**
 * Sets the draft card count in the staged settings and re-renders the drawer.
 * @function setStagedDraftCount
 * @param {number} count - The number of cards to draft.
 */
export function setStagedDraftCount(count) {
    window.stagedDraftCount = count;
    if (typeof window.renderDrawerBody === "function") {
        window.renderDrawerBody();
    }
}
window.setStagedDraftCount = setStagedDraftCount;

/**
 * Toggles a hero's ban status in the staged settings and updates the ban list UI.
 * @function toggleStagedBan
 * @param {string} heroId - The ID of the hero to toggle ban status for.
 */
export function toggleStagedBan(heroId) {
    stateStore.updateSet("stagedBannedHeroIds", "toggle", heroId);
    renderDrawerBanList();
}
window.toggleStagedBan = toggleStagedBan;

/**
 * Toggles bans for all heroes within a specific group/season.
 * @function toggleBanGroup
 * @param {string} groupId - The ID of the group/season.
 * @param {boolean} banAll - True to ban all, false to unban all.
 */
export function toggleBanGroup(groupId, banAll) {
    window.characters.forEach((c) => {
        if (c.group_id === groupId) {
            if (banAll) {
                stateStore.updateSet("stagedBannedHeroIds", "add", c.id);
            } else {
                stateStore.updateSet("stagedBannedHeroIds", "delete", c.id);
            }
        }
    });
    renderDrawerBanList();
}
window.toggleBanGroup = toggleBanGroup;

/**
 * Handles typing in the ban search box.
 * @function handleBanSearch
 * @param {string} query - The search query string.
 */
export function handleBanSearch(query) {
    window.stagedBanSearchQuery = query;
    renderDrawerBanList();
}
window.handleBanSearch = handleBanSearch;

/**
 * Renders the categorized list of heroes for banning in the drawer.
 * @function renderDrawerBanList
 */
export function renderDrawerBanList() {
    const container = document.getElementById("drawer-ban-list-container");
    if (!container) return;

    const query = (window.stagedBanSearchQuery || "").toLowerCase();
    let html = "";

    window.groups.forEach((g) => {
        const groupChars = window.characters.filter(
            (c) => c.group_id === g.id && c.name.toLowerCase().includes(query),
        );
        if (groupChars.length === 0) return;

        const allGroupBanned = groupChars.every((c) =>
            window.stagedBannedHeroIds.has(c.id),
        );
        const groupBtnText = allGroupBanned ? "Unban All" : "Ban All";

        html += `
            <div class="ban-group-section" data-group-id="${g.id}">
                <div class="ban-group-header">
                    <span class="ban-group-title">${g.name}</span>
                    <button type="button" class="btn-ban-group-select" onclick="toggleBanGroup('${g.id}', ${!allGroupBanned})">
                        ${groupBtnText}
                    </button>
                </div>
                <div class="ban-hero-grid">
        `;

        groupChars.forEach((c) => {
            const isBanned = window.stagedBannedHeroIds.has(c.id);
            const bannedClass = isBanned ? "banned" : "";
            html += `
                <div class="ban-hero-item ${bannedClass}" onclick="toggleStagedBan('${c.id}')">
                    <img src="${window.getImgUrl(c.slug)}" alt="${c.name}" class="ban-hero-img">
                    <span class="ban-hero-name">${c.name}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML =
        html ||
        '<p style="text-align: center; opacity: 0.5; margin: 20px 0;">No heroes found.</p>';
}
window.renderDrawerBanList = renderDrawerBanList;

/**
 * Updates the roll settings badge and button styling depending on whether draft mode or bans are active.
 * @function updateRollSettingsBadge
 */
export function updateRollSettingsBadge() {
    const badge = document.getElementById("roll-settings-badge");
    const btn = document.getElementById("rollSettingsBtn");
    if (!badge || !btn) return;

    let activeCount = 0;
    if (window.draftModeEnabled) activeCount++;
    if (window.bannedHeroIds.size > 0) activeCount += window.bannedHeroIds.size;

    if (activeCount > 0) {
        badge.innerText = activeCount;
        badge.style.display = "flex";
        btn.classList.add("has-settings");
    } else {
        badge.style.display = "none";
        btn.classList.remove("has-settings");
    }
}
window.updateRollSettingsBadge = updateRollSettingsBadge;

/**
 * Starts the draft step for the current active drafting player.
 * Resolves roll once all drafting players are completed.
 * @function startDraftStep
 */
export function startDraftStep() {
    if (window.activeDraftStep >= window.activeDraftOrder.length) {
        validateSelection();
        const actionButtons = document.getElementById("action-buttons");
        if (actionButtons) actionButtons.style.display = "flex";

        const rollBtnContainer = document.getElementById("rollBtnContainer");
        if (rollBtnContainer) rollBtnContainer.style.display = "none";

        window.isRollActive = true;
        return;
    }

    const pIdx = window.activeDraftOrder[window.activeDraftStep];
    const activePlayerName = window.NAMES[pIdx];

    window.activeDraftOrder.forEach((tempIdx) => {
        const stepIdx = window.activeDraftOrder.indexOf(tempIdx);
        if (stepIdx < window.activeDraftStep) {
            // drafted and collapsed
        } else if (stepIdx === window.activeDraftStep) {
            renderPlayerRowDraftingActive(tempIdx);
        } else {
            renderPlayerRowWaiting(tempIdx, activePlayerName);
        }
    });

    const chosenHeroNames = Object.values(window.selectedDraftHeroes).map(
        (h) => h?.name,
    );
    const pool = window.characters.filter(
        (c) =>
            window.isHeroOwned(c) &&
            !window.bannedHeroIds.has(c.id) &&
            !chosenHeroNames.includes(c.name),
    );

    startDraftWheelScramble(pIdx, pool);

    setTimeout(() => {
        const candidates = generateDraftCandidates(pIdx, pool);
        window.activeDraftCandidates[pIdx] = candidates;
        stopDraftWheelScramble(pIdx, candidates);
    }, 1000);
}
window.startDraftStep = startDraftStep;

/**
 * Generates random or weighted draft candidate heroes for a player from the available pool.
 * @function generateDraftCandidates
 * @param {number} pIdx - The index of the player drafting.
 * @param {Array<Object>} pool - The pool of unbanned, owned, and unpicked heroes.
 * @returns {Array<Object>} The array of candidate heroes.
 */
export function generateDraftCandidates(pIdx, pool) {
    let candidates = [];
    let tempPool = [...pool];
    const count = Math.min(window.draftCount, tempPool.length);

    for (let i = 0; i < count; i++) {
        let selectedHero = null;
        if (pIdx >= 4) {
            const r = Math.floor(Math.random() * tempPool.length);
            selectedHero = tempPool[r];
            tempPool.splice(r, 1);
        } else {
            const activePool = tempPool.filter((c) => c.weights[pIdx] > 0);
            if (activePool.length === 0) {
                if (tempPool.length > 0) {
                    const r = Math.floor(Math.random() * tempPool.length);
                    selectedHero = tempPool[r];
                    tempPool.splice(r, 1);
                }
            } else {
                const totalEffectiveWeight = activePool.reduce(
                    (sum, c) => sum + window.getSoftWeight(c, pIdx),
                    0,
                );
                let random = Math.random() * totalEffectiveWeight;
                for (const hero of activePool) {
                    const weight = window.getSoftWeight(hero, pIdx);
                    if (random < weight) {
                        selectedHero = hero;
                        tempPool.splice(
                            tempPool.findIndex((p) => p.name === hero.name),
                            1,
                        );
                        break;
                    }
                    random -= weight;
                }
            }
        }
        if (selectedHero) {
            candidates.push(selectedHero);
        }
    }
    return candidates;
}
window.generateDraftCandidates = generateDraftCandidates;

/**
 * Initializes and starts the scrambling visual animation on the draft wheel.
 * @function startDraftWheelScramble
 * @param {number} pIdx - The index of the player.
 * @param {Array<Object>} pool - The available hero pool to scramble images from.
 */
export function startDraftWheelScramble(pIdx, pool) {
    const wheel = document.getElementById(`draft-wheel-${pIdx}`);
    if (!wheel) return;

    let html = "";
    const count = window.draftCount;
    const angleStep = 360 / count;
    for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        const radius = 150;
        html += `
            <div class="draft-card-wrapper" id="draft-card-wrapper-${pIdx}-${i}" style="transform: rotateY(${angle}deg) translateZ(${radius}px);">
                <div class="draft-card">
                    <img src="" class="char-bg-img scramble-img" id="draft-card-img-${pIdx}-${i}" style="opacity: 0.08;">
                    <div class="draft-card-content">
                        <div class="draft-card-header">
                            <span class="draft-hero-name scramble-text" id="draft-card-name-${pIdx}-${i}">ROLLING...</span>
                        </div>
                        <div class="draft-card-body">
                            <span class="draft-card-group" id="draft-card-group-${pIdx}-${i}">Group</span>
                            <div class="hero-stats-row" id="draft-card-stats-${pIdx}-${i}">
                                <span>Plays: --</span>
                                <span class="stats-divider">|</span>
                                <span>Last: --</span>
                                <span class="stats-divider">|</span>
                                <span>Prob: --</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    wheel.innerHTML = html;

    const intervalId = setInterval(() => {
        for (let i = 0; i < count; i++) {
            const randomHero = pool[Math.floor(Math.random() * pool.length)];
            if (!randomHero) continue;
            const imgEl = document.getElementById(
                `draft-card-img-${pIdx}-${i}`,
            );
            const nameEl = document.getElementById(
                `draft-card-name-${pIdx}-${i}`,
            );
            const groupEl = document.getElementById(
                `draft-card-group-${pIdx}-${i}`,
            );
            if (imgEl) imgEl.src = window.getImgUrl(randomHero.slug);
            if (nameEl) {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let scrambleStr = "";
                for (let k = 0; k < 6; k++) {
                    scrambleStr +=
                        chars[Math.floor(Math.random() * chars.length)];
                }
                nameEl.innerText = scrambleStr;
            }
            if (groupEl) groupEl.innerText = randomHero.group || "";
        }
    }, 70);
    stateStore.updateObject("scrambleIntervals", pIdx, intervalId);
}
window.startDraftWheelScramble = startDraftWheelScramble;

/**
 * Stops scrambling and displays the actual draft options on the 3D draft wheel.
 * @function stopDraftWheelScramble
 * @param {number} pIdx - The index of the player.
 * @param {Array<Object>} candidates - The resolved candidate heroes.
 */
export function stopDraftWheelScramble(pIdx, candidates) {
    const intervals = stateStore.get("scrambleIntervals");
    if (intervals[pIdx]) {
        clearInterval(intervals[pIdx]);
        stateStore.updateObject("scrambleIntervals", pIdx, undefined);
    }

    const wheel = document.getElementById(`draft-wheel-${pIdx}`);
    if (!wheel) return;

    let html = "";
    const count = candidates.length;
    wheel.style.transform = "rotateY(0deg)";
    window.draftWheelFrontCardIndices[pIdx] = 0;
    window.draftWheelAngles[pIdx] = 0;

    const angleStep = 360 / count;
    candidates.forEach((hero, i) => {
        const angle = i * angleStep;
        const radius = 150;

        const statsHtml =
            pIdx < 4
                ? `
            <span>Plays: <b>${hero.playCount[pIdx] || 0}</b></span>
            <span class="stats-divider">|</span>
            <span>Last: <b>${hero.lastPlayed[pIdx] || "Never"}</b></span>
            <span class="stats-divider">|</span>
            <span>Prob: <b>${window.getHeroProbabilityText(hero, pIdx)}</b></span>
        `
                : `
            <span>Prob: <b>${window.getHeroProbabilityText(hero, pIdx)}</b></span>
        `;

        html += `
            <div class="draft-card-wrapper" id="draft-card-wrapper-${pIdx}-${i}" style="transform: rotateY(${angle}deg) translateZ(${radius}px);" onclick="selectDraftHero(${pIdx}, '${hero.name.replace(/'/g, "\\'")}', '${hero.slug}', '${hero.id}', ${angle}, ${i})">
                <div class="draft-card">
                    <img src="${window.getImgUrl(hero.slug)}" alt="${hero.name}" class="char-bg-img" style="opacity: 0.25;">
                    <div class="draft-card-content">
                        <div class="draft-card-header">
                            <span class="draft-hero-name">${hero.name}</span>
                        </div>
                        <div class="draft-card-body">
                            <span class="draft-card-group">${hero.group || "Unknown"}</span>
                            <div class="hero-stats-row">
                                ${statsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    wheel.innerHTML = html;

    const container = document.getElementById(`draft-wheel-container-${pIdx}`);
    if (container) {
        setupDraftWheelSwipe(pIdx, container, count);
    }
}
window.stopDraftWheelScramble = stopDraftWheelScramble;

/**
 * Attaches swipe/drag event listeners to rotate the draft wheel on touch or mouse drag.
 * @function setupDraftWheelSwipe
 * @param {number} pIdx - The index of the player.
 * @param {HTMLElement} container - The container element for the draft wheel.
 * @param {number} count - The number of cards in the wheel.
 */
export function setupDraftWheelSwipe(pIdx, container, count) {
    let startX = 0;
    let isSwiping = false;
    let clickPrevented = false;

    const clickHandler = (e) => {
        if (clickPrevented) {
            e.stopPropagation();
            e.preventDefault();
            clickPrevented = false;
        }
    };
    container.addEventListener("click", clickHandler, true);

    container.addEventListener(
        "touchstart",
        (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        },
        { passive: true },
    );

    container.addEventListener(
        "touchend",
        (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;

            if (Math.abs(diffX) > 10) {
                clickPrevented = true;
            }

            if (diffX > 50) {
                rotateDraftWheelDirection(pIdx, -1, count);
            } else if (diffX < -50) {
                rotateDraftWheelDirection(pIdx, 1, count);
            }
        },
        { passive: true },
    );

    container.addEventListener("mousedown", (e) => {
        startX = e.clientX;
        isSwiping = true;

        const onMouseMove = () => {};

        const onMouseUp = (upEvt) => {
            if (isSwiping) {
                isSwiping = false;
                const diffX = upEvt.clientX - startX;

                if (Math.abs(diffX) > 10) {
                    clickPrevented = true;
                }

                if (diffX > 50) {
                    rotateDraftWheelDirection(pIdx, -1, count);
                } else if (diffX < -50) {
                    rotateDraftWheelDirection(pIdx, 1, count);
                }
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}
window.setupDraftWheelSwipe = setupDraftWheelSwipe;

/**
 * Rotates the draft wheel by a single position left (-1) or right (1).
 * @function rotateDraftWheelDirection
 * @param {number} pIdx - The index of the player.
 * @param {number} dir - Direction of rotation (-1 or 1).
 * @param {number} count - Total card count in the wheel.
 */
export function rotateDraftWheelDirection(pIdx, dir, count) {
    const candidates = window.activeDraftCandidates[pIdx];
    if (!candidates || candidates.length === 0) return;

    if (window.draftWheelFrontCardIndices[pIdx] === undefined) {
        window.draftWheelFrontCardIndices[pIdx] = 0;
    }
    let currentIdx = window.draftWheelFrontCardIndices[pIdx];

    let newIdx = (currentIdx + dir) % count;
    if (newIdx < 0) newIdx += count;
    window.draftWheelFrontCardIndices[pIdx] = newIdx;

    const angleStep = 360 / count;

    if (window.draftWheelAngles[pIdx] === undefined) {
        window.draftWheelAngles[pIdx] = 0;
    }
    const currentAngle = window.draftWheelAngles[pIdx];
    const targetAngle = currentAngle + dir * angleStep;
    window.draftWheelAngles[pIdx] = targetAngle;

    const wheel = document.getElementById(`draft-wheel-${pIdx}`);
    if (wheel) {
        wheel.style.transform = `rotateY(${-targetAngle}deg)`;
    }

    deselectDraftHero(pIdx);
}
window.rotateDraftWheelDirection = rotateDraftWheelDirection;

/**
 * Computes the shortest rotation angle in degrees from current orientation to target angle.
 * @function getShortestRotationAngle
 * @param {number} currentAngle - The current rotation angle of the wheel.
 * @param {number} targetBaseAngle - The target rotation angle base.
 * @returns {number} The absolute target angle containing shortest path.
 */
export function getShortestRotationAngle(currentAngle, targetBaseAngle) {
    let diff = (targetBaseAngle - currentAngle) % 360;
    if (diff < -180) {
        diff += 360;
    } else if (diff > 180) {
        diff -= 360;
    }
    return currentAngle + diff;
}
window.getShortestRotationAngle = getShortestRotationAngle;

/**
 * Resets the selection state for draft pick. Deselects cards and disables confirmation.
 * @function deselectDraftHero
 * @param {number} pIdx - Player index.
 */
export function deselectDraftHero(pIdx) {
    const selectEl = document.getElementById(`select-${pIdx}`);
    const confirmBtn = document.getElementById(`confirm-draft-btn-${pIdx}`);
    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    const wrappers = document.querySelectorAll(
        `[id^="draft-card-wrapper-${pIdx}-"]`,
    );

    if (selectEl) selectEl.value = "";

    wrappers.forEach((w) => {
        w.classList.remove("selected");
    });

    if (bgImgEl) {
        bgImgEl.style.opacity = "0";
    }

    if (confirmBtn) {
        confirmBtn.disabled = true;
    }

    window.selectedDraftHeroes[pIdx] = null;
}
window.deselectDraftHero = deselectDraftHero;

/**
 * Selects a specific hero card in the draft wheel, snapping/rotating the wheel to it.
 * @function selectDraftHero
 * @param {number} pIdx - Player index.
 * @param {string} heroName - Name of the hero.
 * @param {string} heroSlug - URL-friendly name/slug of the hero.
 * @param {string} heroId - Database UUID of the hero.
 * @param {number} cardAngle - Base rotation angle of the card.
 * @param {number} cardIdx - Index of the card on the wheel.
 */
export function selectDraftHero(pIdx, heroName, heroSlug, heroId, cardAngle, cardIdx) {
    const isAlreadySelected =
        window.selectedDraftHeroes[pIdx] && window.selectedDraftHeroes[pIdx].id === heroId;

    if (isAlreadySelected) {
        deselectDraftHero(pIdx);
        return;
    }

    const selectEl = document.getElementById(`select-${pIdx}`);
    const confirmBtn = document.getElementById(`confirm-draft-btn-${pIdx}`);
    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    const wrappers = document.querySelectorAll(
        `[id^="draft-card-wrapper-${pIdx}-"]`,
    );

    if (selectEl) selectEl.value = heroName;

    window.draftWheelFrontCardIndices[pIdx] = cardIdx;

    if (window.draftWheelAngles[pIdx] === undefined) {
        window.draftWheelAngles[pIdx] = 0;
    }
    const currentAngle = window.draftWheelAngles[pIdx];
    const shortestAngle = getShortestRotationAngle(currentAngle, cardAngle);
    window.draftWheelAngles[pIdx] = shortestAngle;

    const wheel = document.getElementById(`draft-wheel-${pIdx}`);
    if (wheel) {
        wheel.style.transform = `rotateY(${-shortestAngle}deg)`;
    }

    wrappers.forEach((w, idx) => {
        if (idx === cardIdx) {
            w.classList.add("selected");
        } else {
            w.classList.remove("selected");
        }
    });

    if (bgImgEl) {
        bgImgEl.src = window.getImgUrl(heroSlug);
        bgImgEl.style.opacity = "0.25";
    }

    if (confirmBtn) {
        confirmBtn.disabled = false;
    }

    window.selectedDraftHeroes[pIdx] = window.characters.find((c) => c.id === heroId);
}
window.selectDraftHero = selectDraftHero;

/**
 * Collapses the draft row view to show the final selected character's stats and edit triggers.
 * @function collapsePlayerRowToResolved
 * @param {number} pIdx - Player index.
 * @param {Object} finalHero - The hero object that was drafted.
 */
export function collapsePlayerRowToResolved(pIdx, finalHero) {
    const rowEl = document.getElementById(`player-row-${pIdx}`);
    if (!rowEl) return;

    rowEl.className = "player-row revealed";
    rowEl.style.cssText = `--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});`;

    rowEl.innerHTML = `
        <img src="${window.getImgUrl(finalHero.slug)}" class="char-bg-img" id="bg-img-${pIdx}" alt="${finalHero.name}" style="opacity: 0.25;">
        <div class="player-row-content">
            <div class="hero-info-container" id="info-container-${pIdx}">
                <div class="hero-header-row">
                    <div class="hero-header-left">
                        <span class="player-name-caps" style="color: var(--player-color);">${window.NAMES[pIdx].toUpperCase()}</span>
                        <span class="hero-name-divider">:</span>
                        <a href="${window.getHeroLink(finalHero.slug)}" target="_blank" class="hero-name hero-name-link resolved" id="hero-name-title-${pIdx}">${finalHero.name}</a>
                    </div>
                </div>
                <span class="expanded-group" id="hero-group-${pIdx}">${finalHero.group || "Unknown"}</span>
                <div class="hero-stats-row" id="stats-row-${pIdx}">
                </div>
            </div>
            <div class="hero-select-container" id="select-container-${pIdx}">
                <input type="hidden" class="char-select" data-player="${pIdx}" id="select-${pIdx}" value="${finalHero.name}">
                <button class="edit-icon-btn" type="button" onclick="openHeroSelectModal(${pIdx})" aria-label="Select hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    const statsRow = document.getElementById(`stats-row-${pIdx}`);
    if (statsRow) {
        const probText = `Prob: <b>${window.getHeroProbabilityText(finalHero, pIdx)}</b>`;
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
}
window.collapsePlayerRowToResolved = collapsePlayerRowToResolved;

/**
 * Confirms the currently selected draft hero for a player and moves on to the next player's draft step.
 * @function confirmDraftPick
 * @param {number} pIdx - Player index.
 */
export function confirmDraftPick(pIdx) {
    const chosenHero = window.selectedDraftHeroes[pIdx];
    if (!chosenHero) return;

    collapsePlayerRowToResolved(pIdx, chosenHero);

    window.activeDraftStep++;
    startDraftStep();
}
window.confirmDraftPick = confirmDraftPick;

/**
 * Renders the placeholder view for a player waiting for their turn to draft.
 * @function renderPlayerRowWaiting
 * @param {number} pIdx - Player index.
 * @param {string} activePlayerName - The name of the player currently drafting.
 */
export function renderPlayerRowWaiting(pIdx, activePlayerName) {
    const resultsDiv = document.getElementById("results");
    let rowEl = document.getElementById(`player-row-${pIdx}`);
    if (!rowEl) {
        rowEl = document.createElement("div");
        rowEl.id = `player-row-${pIdx}`;
        resultsDiv.appendChild(rowEl);
    }

    rowEl.className = "player-row waiting-draft";
    rowEl.style.cssText = `--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});`;
    rowEl.innerHTML = `
        <div class="player-row-content">
            <span class="player-name-caps" style="color: var(--player-color);">${window.NAMES[pIdx].toUpperCase()}</span>
            <span class="draft-waiting-status">Waiting for ${activePlayerName}...</span>
        </div>
    `;
}
window.renderPlayerRowWaiting = renderPlayerRowWaiting;

/**
 * Renders the active drafting interface (complete with 3D carousel and controls) for a player.
 * @function renderPlayerRowDraftingActive
 * @param {number} pIdx - Player index.
 */
export function renderPlayerRowDraftingActive(pIdx) {
    const resultsDiv = document.getElementById("results");
    let rowEl = document.getElementById(`player-row-${pIdx}`);
    if (!rowEl) {
        rowEl = document.createElement("div");
        rowEl.id = `player-row-${pIdx}`;
        resultsDiv.appendChild(rowEl);
    }

    rowEl.className = "player-row active-draft";
    rowEl.style.cssText = `--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});`;

    rowEl.innerHTML = `
        <style>
            .btn-cancel-roll {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: rgba(255, 77, 77, 0.12);
                border: 1px solid rgba(255, 77, 77, 0.25);
                color: #ff4d4d;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 0;
            }
            @media (hover: hover) {
                .btn-cancel-roll:hover {
                    background: rgba(255, 77, 77, 0.25);
                    border-color: #ff4d4d;
                    color: #fff;
                    transform: scale(1.08);
                    box-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
                }
            }
            .btn-cancel-roll:active {
                transform: scale(0.95);
            }
        </style>
        <img src="" class="char-bg-img scramble-img" id="bg-img-${pIdx}" style="opacity: 0; transition: opacity 0.5s ease;">
        <input type="hidden" class="char-select" data-player="${pIdx}" id="select-${pIdx}">
        <div class="player-row-content draft-flow-content">
            <div class="hero-header-row" style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <span class="player-name-caps" style="color: var(--player-color);">${window.NAMES[pIdx].toUpperCase()}</span>
                    <span class="hero-name-divider">:</span>
                    <span class="draft-title" style="font-weight: 700; color: #ffd700;">CHOOSE YOUR HERO</span>
                </div>
                <button class="btn-cancel-roll" type="button" onclick="cancelRoll()" aria-label="Cancel roll">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="draft-wheel-container" id="draft-wheel-container-${pIdx}">
                <button type="button" class="draft-arrow left-arrow" onclick="rotateDraftWheelDirection(${pIdx}, -1, draftCount)" aria-label="Previous hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div class="draft-wheel" id="draft-wheel-${pIdx}">
                </div>

                <button type="button" class="draft-arrow right-arrow" onclick="rotateDraftWheelDirection(${pIdx}, 1, draftCount)" aria-label="Next hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
            <div class="draft-actions">
                <button type="button" class="btn-confirm-draft" id="confirm-draft-btn-${pIdx}" onclick="confirmDraftPick(${pIdx})" disabled>
                    CONFIRM PICK
                </button>
            </div>
        </div>
    `;
}
window.renderPlayerRowDraftingActive = renderPlayerRowDraftingActive;
