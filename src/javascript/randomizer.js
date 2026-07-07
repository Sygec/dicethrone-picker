/**
 * @fileoverview Logic for hero picker rolls, randomizer animations, manual hero overrides, drafts, bans, and result logging.
 * @module randomizer
 */
import { isHeroOwned, getSoftWeight, isUser, DEFAULT_HERO_WEIGHT, PICKED_HERO_WEIGHT, WEIGHT_INCREMENT, getHeroProbabilityText, getImgUrl, showConfirm, MAX_WEIGHTED_PLAYERS } from './utils.js';
import { showSection } from './admin.js';
import { init } from './main.js';
import { renderPlayerToggles } from './auth.js';
import { renderDrawerBody } from './filters.js';
import * as randomizerSetup from './randomizerSetup.js';
import * as randomizerSetupView from './views/randomizerSetupView.js';


import * as apiService from './services/apiService.js';
import * as stateStore from './stateStore.js';
import * as rollView from './views/rollView.js';
import * as filterView from './views/filterView.js';

const LOCK_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

/**
 * Executes a hero roll for all active players, selecting unique characters.
 * Triggers draft wheels if draft mode is enabled.
 * @function pickCharacters
 */
export function pickCharacters() {
    const characters = stateStore.get("characters");
    const bannedHeroIds = stateStore.get("bannedHeroIds");

    const participants = randomizerSetup.getRollParticipants();
    console.log("[randomizer] pickCharacters participants:", participants);
    console.log("[randomizer] draftModeEnabled:", stateStore.get("draftModeEnabled"));

    if (participants.length === 0) return alert("Select players!");

    stateStore.set("activeRollParticipants", participants);

    const active = participants.map((p) => p.pIdx);
    const selectionOrder = [...active].sort(() => Math.random() - 0.5);
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) resultsDiv.innerHTML = "";

    let pool = characters
        .filter((c) => isHeroOwned(c) && !bannedHeroIds.has(c.id))
        .map((c) => structuredClone(c));

    console.log("[randomizer] Owned/non-banned heroes pool count:", pool.length);

    if (pool.length < active.length) {
        return alert(
            `Not enough available (owned & non-banned) heroes (${pool.length}) in your collection for ${active.length} players!`,
        );
    }

    randomizerSetupView.hideSetupPanels();

    if (stateStore.get("draftModeEnabled")) {
        const actionButtons = document.getElementById("action-buttons");
        if (actionButtons) actionButtons.style.display = "none";

        stateStore.set("activeDraftOrder", selectionOrder);
        stateStore.set("activeDraftStep", 0);
        stateStore.set("selectedDraftHeroes", {});
        stateStore.set("activeDraftCandidates", {});

        showSection("roll");
        randomizerSetupView.showResultsTitle("draft");
        if (resultsDiv) resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

        startDraftStep();
        return;
    }

    const rollResults = {};

    selectionOrder.forEach((pIdx) => {
        let selectedHero = null;

        if (pIdx >= MAX_WEIGHTED_PLAYERS) {
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
        }
        rollResults[pIdx] = selectedHero;
    });

    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) actionButtons.style.display = "none";

    stateStore.set("isRollActive", false);

    const sortedActive = [...active].sort((a, b) => a - b);
    sortedActive.forEach((pIdx) => {
        rollView.renderPlayerRowSkeleton(pIdx);
    });

    showSection("roll");
    randomizerSetupView.showResultsTitle("confirmation");
    if (resultsDiv) resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

    const ownedHeroes = characters.filter(
        (c) => isHeroOwned(c) && !bannedHeroIds.has(c.id),
    );

    sortedActive.forEach((pIdx) => {
        startPanelScramble(pIdx, ownedHeroes);
    });

    let currentRevealIndex = 0;

    function revealNext() {
        if (currentRevealIndex >= selectionOrder.length) {
            validateSelection();
            if (isUser()) {
                if (actionButtons) actionButtons.style.display = "flex";
            } else {
                randomizerSetupView.showSetupPanels();
                randomizerSetup.resetInvitees();
            }
            stateStore.set("isRollActive", true);
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

export function updateDropdownSort() {
    validateSelection();
}
export function renderPlayerRowSkeleton(pIdx) {
    rollView.renderPlayerRowSkeleton(pIdx);
}
export function openHeroSelectModal(pIdx) {
    stateStore.set("activeSelectPlayerIdx", pIdx);
    rollView.openHeroSelectModal(pIdx);
}
export function closeHeroSelectModal() {
    rollView.closeHeroSelectModal();
    stateStore.set("activeSelectPlayerIdx", null);
}
export function setModalSort(mode) {
    stateStore.set("modalSortMode", mode);
    rollView.setModalSort(mode);
    filterHeroSelectOptions();
}
export function filterHeroSelectOptions() {
    rollView.renderHeroSelectOptions();
}
export function selectHeroForPlayer(heroName) {
    const pIdx = stateStore.get("activeSelectPlayerIdx");
    if (pIdx === null) return;

    const characters = stateStore.get("characters");
    const char = characters.find((c) => c.name === heroName);
    if (!char) return;

    if (stateStore.get("draftModeEnabled")) {
        stateStore.get("selectedDraftHeroes")[pIdx] = char;
    }

    rollView.updatePlayerCardUI(pIdx, char);
    validateSelection();
    closeHeroSelectModal();
}
export function startPanelScramble(pIdx, ownedHeroes) {
    if (ownedHeroes.length === 0) return;

    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    const nameEl = document.getElementById(`hero-name-title-${pIdx}`);

    const intervalId = setInterval(() => {
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
    stateStore.updateObject("scrambleIntervals", pIdx, intervalId);
}
export function stopPanelScramble(pIdx, finalHero) {
    const intervals = stateStore.get("scrambleIntervals");
    if (intervals[pIdx]) {
        clearInterval(intervals[pIdx]);
        stateStore.updateObject("scrambleIntervals", pIdx, undefined);
    }

    if (finalHero) {
        rollView.updatePlayerCardUI(pIdx, finalHero);
    }
}
export function validateSelection() {
    const dropdowns = document.querySelectorAll(".char-select");
    const names = Array.from(dropdowns).map((d) => d.value);

    const counts = names.reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
    const hasDupes = Object.values(counts).some((count) => count > 1);

    const characters = stateStore.get("characters");
    const unownedSelectedHeroes = names.filter((name) => {
        const hero = characters.find((c) => c.name === name);
        return hero && !isHeroOwned(hero);
    });
    const hasUnownedHeroes = unownedSelectedHeroes.length > 0;

    const confirmBtn = document.getElementById("confirmBtn");
    const errorMsg = document.getElementById("error-msg");

    if (!confirmBtn || !errorMsg) return;

    confirmBtn.classList.remove("disabled", "warning");
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `${LOCK_ICON} LOCK IN SESSION`;
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
export async function applyResults() {
    const confirmBtn = document.getElementById("confirmBtn");
    const originalHtml = confirmBtn ? confirmBtn.innerHTML : "Lock In";
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Saving...";
    }

    const selectedHeroNames = Array.from(
        document.querySelectorAll(".char-select"),
    ).map((d) => d.value);
    const characters = stateStore.get("characters");
    const unownedSelectedHeroes = selectedHeroNames.filter((name) => {
        const hero = characters.find((c) => c.name === name);
        return hero && !isHeroOwned(hero);
    });

    if (unownedSelectedHeroes.length > 0) {
        const unownedHeroNames = unownedSelectedHeroes.join(", ");
        const confirmation = await showConfirm(
            "Unowned Heroes Selected",
            `You have selected unowned heroes: ${unownedHeroNames}. Do you want to proceed?`,
        );
        if (!confirmation) {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = originalHtml;
            }
            return;
        }
    }

    const dropdowns = document.querySelectorAll(".char-select");
    const statsUpdates = [];
    const gameParticipants = [];

    // Invitees (pIdx >= MAX_WEIGHTED_PLAYERS) are session-only: no weighting, no history saved,
    // and they have no corresponding row in the `players` table, so they're excluded here entirely.
    const activePicks = new Map(
        Array.from(dropdowns)
            .map((sel) => [parseInt(sel.dataset.player), sel.value])
            .filter(([pIdx]) => pIdx < MAX_WEIGHTED_PLAYERS),
    );

    const gameType = stateStore.get("selectedGameType");
    const { data: game, error: gameError } = await apiService.insertGame(stateStore.get("currentUser").id, gameType);
    if (gameError) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalHtml;
        }
        return alert("Error creating game: " + gameError.message);
    }

    const teamIdByPlayerId = {};
    const teamAssignments = stateStore.get("teamAssignments");
    if (randomizerSetup.isTeamsType(gameType) && teamAssignments) {
        const userId = stateStore.get("currentUser").id;
        const { data: teams, error: teamsError } = await apiService.insertTeams([
            { game_id: game.id, team_label: "A", last_updated_by: userId },
            { game_id: game.id, team_label: "B", last_updated_by: userId },
        ]);
        if (teamsError) {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = originalHtml;
            }
            return alert("Error creating teams: " + teamsError.message);
        }

        const teamIdByLabel = Object.fromEntries(teams.map((t) => [t.team_label, t.id]));
        teamAssignments.teamA.forEach((participantId) => {
            teamIdByPlayerId[participantId] = teamIdByLabel.A;
        });
        teamAssignments.teamB.forEach((participantId) => {
            teamIdByPlayerId[participantId] = teamIdByLabel.B;
        });
    }

    characters.forEach((char) => {
        for (let pIdx = 0; pIdx < MAX_WEIGHTED_PLAYERS; pIdx++) {
            const playerChoice = activePicks.get(pIdx);
            if (playerChoice === undefined) continue;

            if (playerChoice === char.name) {
                gameParticipants.push({
                    game_id: game.id,
                    player_id: `p${pIdx + 1}`,
                    hero_id: char.id,
                    is_winner: null,
                    team_id: teamIdByPlayerId[`p${pIdx + 1}`] || null,
                    last_updated_by: stateStore.get("currentUser").id,
                });
            }

            const wasPicked = playerChoice === char.name;
            const newWeight = wasPicked
                ? PICKED_HERO_WEIGHT
                : (char.weights[pIdx] || DEFAULT_HERO_WEIGHT) + WEIGHT_INCREMENT;

            statsUpdates.push({
                hero_id: char.id,
                player_id: `p${pIdx + 1}`,
                weight: newWeight,
                last_updated_by: stateStore.get("currentUser").id,
            });
        }
    });

    const { error: gpError } = await apiService.insertGamePlayers(gameParticipants);
    if (gpError) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalHtml;
        }
        return alert("Error logging game participants: " + gpError.message);
    }

    const { error } = await apiService.upsertPlayerHeroStats(statsUpdates);

    if (error) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalHtml;
        }
        return alert("Error saving results: " + error.message);
    }

    await init();

    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) actionButtons.style.display = "none";

    randomizerSetupView.showSetupPanels();
    randomizerSetup.resetInvitees();

    const resultsDiv = document.getElementById("results");
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <p style="color:#28a745; text-align:center; font-weight:bold;">
                Session Logged! Game record created and stats updated.
            </p>`;
    }
    stateStore.set("isRollActive", false);
}
export function cancelRoll() {
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) {
        resultsDiv.innerHTML = "";
    }
    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) actionButtons.style.display = "none";

    const intervals = stateStore.get("scrambleIntervals");
    if (intervals) {
        Object.keys(intervals).forEach((pIdx) => {
            if (intervals[pIdx]) {
                clearInterval(intervals[pIdx]);
            }
        });
        stateStore.set("scrambleIntervals", {});
    }

    stateStore.set("activeDraftOrder", []);
    stateStore.set("activeDraftStep", 0);
    stateStore.set("selectedDraftHeroes", {});
    stateStore.set("activeDraftCandidates", {});

    randomizerSetupView.showSetupPanels();
    renderPlayerToggles();
    randomizerSetup.resetSetup();
    stateStore.set("isRollActive", false);
}
export function openRollSettingsDrawer() {
    stateStore.set("currentDrawerMode", "roll-settings");

    // Stage current configuration
    stateStore.set("stagedBannedHeroIds", new Set(stateStore.get("bannedHeroIds")));
    stateStore.set("stagedBanSearchQuery", "");

    const drawer = document.getElementById("sort-filter-drawer");
    const title = document.getElementById("drawer-title-text");
    const footer = document.getElementById("drawer-footer-content");

    if (title) title.innerText = "Roll Configuration";
    if (footer) footer.style.display = "flex";

    renderDrawerBody();
    if (drawer) {
        drawer.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    }
}
export function toggleStagedBan(heroId) {
    stateStore.updateSet("stagedBannedHeroIds", "toggle", heroId);
    rollView.renderDrawerBanList();
}
export function handleBanSearch(query) {
    stateStore.set("stagedBanSearchQuery", query);
    rollView.renderDrawerBanList();
}
export function renderDrawerBanList() {
    rollView.renderDrawerBanList();
}
export function updateRollSettingsBadge() {
    rollView.updateRollSettingsBadge();
}
/**
 * Renders the final "locked in" results screen (one resolved row per drafted participant),
 * matching the Quick Roll layout.
 */
function renderDraftFinalResults() {
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) resultsDiv.innerHTML = "";

    const selectedDraftHeroes = stateStore.get("selectedDraftHeroes");
    const order = stateStore.get("activeDraftOrder");

    [...order]
        .sort((a, b) => a - b)
        .forEach((pIdx) => {
            const hero = selectedDraftHeroes[pIdx];
            if (hero) rollView.collapsePlayerRowToResolved(pIdx, hero);
        });
}

export function startDraftStep() {
    const activeDraftStep = stateStore.get("activeDraftStep");
    const activeDraftOrder = stateStore.get("activeDraftOrder");
    const characters = stateStore.get("characters");
    const bannedHeroIds = stateStore.get("bannedHeroIds");
    const selectedDraftHeroes = stateStore.get("selectedDraftHeroes");

    if (activeDraftStep >= activeDraftOrder.length) {
        renderDraftFinalResults();
        randomizerSetupView.showResultsTitle("confirmation");
        validateSelection();

        const actionButtons = document.getElementById("action-buttons");
        if (isUser()) {
            if (actionButtons) actionButtons.style.display = "flex";
        } else {
            randomizerSetupView.showSetupPanels();
            randomizerSetup.resetInvitees();
        }

        stateStore.set("isRollActive", true);
        return;
    }

    const pIdx = activeDraftOrder[activeDraftStep];

    rollView.renderDraftTurn(activeDraftOrder, activeDraftStep);
    rollView.updateDraftConfirmButton(pIdx, null);

    const chosenHeroNames = Object.values(selectedDraftHeroes).map(
        (h) => h?.name,
    );
    const pool = characters.filter(
        (c) =>
            isHeroOwned(c) &&
            !bannedHeroIds.has(c.id) &&
            !chosenHeroNames.includes(c.name),
    );

    const draftCount = stateStore.get("draftCount");
    const cardCount = Math.min(draftCount, pool.length);
    rollView.renderDraftCardListScramble(pIdx, cardCount);
    startDraftCardScramble(pIdx, pool, cardCount);

    setTimeout(() => {
        const candidates = generateDraftCandidates(pIdx, pool);
        stateStore.get("activeDraftCandidates")[pIdx] = candidates;
        stopDraftCardScramble(pIdx);
        rollView.renderDraftCandidateCards(pIdx, candidates);
    }, 1000);
}
export function generateDraftCandidates(pIdx, pool) {
    let candidates = [];
    let tempPool = [...pool];
    const draftCount = stateStore.get("draftCount");
    const count = Math.min(draftCount, tempPool.length);

    for (let i = 0; i < count; i++) {
        let selectedHero = null;
        if (pIdx >= MAX_WEIGHTED_PLAYERS) {
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
                    (sum, c) => sum + getSoftWeight(c, pIdx),
                    0,
                );
                let random = Math.random() * totalEffectiveWeight;
                for (const hero of activePool) {
                    const weight = getSoftWeight(hero, pIdx);
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
/**
 * Scrambles the N draft candidate card placeholders (image/name/group) while candidates "roll".
 */
export function startDraftCardScramble(pIdx, pool, cardCount) {
    if (pool.length === 0 || cardCount === 0) return;

    const intervalId = setInterval(() => {
        for (let i = 0; i < cardCount; i++) {
            const randomHero = pool[Math.floor(Math.random() * pool.length)];
            if (!randomHero) continue;
            const imgEl = document.getElementById(`draft-card-img-${pIdx}-${i}`);
            const nameEl = document.getElementById(`draft-card-name-${pIdx}-${i}`);
            const groupEl = document.getElementById(`draft-card-group-${pIdx}-${i}`);
            if (imgEl) imgEl.src = getImgUrl(randomHero.slug);
            if (nameEl) {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let scrambleStr = "";
                for (let k = 0; k < 6; k++) {
                    scrambleStr += chars[Math.floor(Math.random() * chars.length)];
                }
                nameEl.innerText = scrambleStr;
            }
            if (groupEl) groupEl.innerText = randomHero.group || "";
        }
    }, 70);
    stateStore.updateObject("scrambleIntervals", pIdx, intervalId);
}
export function stopDraftCardScramble(pIdx) {
    const intervals = stateStore.get("scrambleIntervals");
    if (intervals[pIdx]) {
        clearInterval(intervals[pIdx]);
        stateStore.updateObject("scrambleIntervals", pIdx, undefined);
    }
}
/**
 * Marks (or un-marks, if tapped again) a candidate card as the player's tentative pick.
 * The pick isn't finalized until confirmDraftPick is called via the "PICK X ->" button.
 */
export function selectDraftCandidate(pIdx, heroId) {
    const candidates = stateStore.get("activeDraftCandidates")[pIdx] || [];
    const hero = candidates.find((c) => String(c.id) === String(heroId));
    if (!hero) return;

    const selectedDraftHeroes = stateStore.get("selectedDraftHeroes");
    const isAlreadySelected = selectedDraftHeroes[pIdx]?.id === hero.id;

    if (isAlreadySelected) {
        selectedDraftHeroes[pIdx] = null;
        rollView.markDraftCandidateSelected(pIdx, null);
        rollView.updateDraftConfirmButton(pIdx, null);
        return;
    }

    selectedDraftHeroes[pIdx] = hero;
    rollView.markDraftCandidateSelected(pIdx, hero.id);
    rollView.updateDraftConfirmButton(pIdx, hero);
}
export function confirmDraftPick(pIdx) {
    const selectedDraftHeroes = stateStore.get("selectedDraftHeroes");
    const chosenHero = selectedDraftHeroes[pIdx];
    if (!chosenHero) return;

    stateStore.set("activeDraftStep", stateStore.get("activeDraftStep") + 1);
    startDraftStep();
}
