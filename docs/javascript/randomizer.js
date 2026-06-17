/**
 * @fileoverview Logic for hero picker rolls, randomizer animations, manual hero overrides, drafts, bans, and result logging.
 * @module randomizer
 */
import { isHeroOwned, getSoftWeight, isUser, DEFAULT_HERO_WEIGHT, PICKED_HERO_WEIGHT, WEIGHT_INCREMENT, getHeroProbabilityText, getImgUrl } from './utils.js';
import { showSection } from './admin.js';
import { init } from './main.js';
import { renderDrawerBody } from './filters.js';


import * as apiService from './services/apiService.js';
import * as stateStore from './stateStore.js';
import * as rollView from './views/rollView.js';
import * as filterView from './views/filterView.js';

/**
 * Executes a hero roll for all active players, selecting unique characters.
 * Triggers draft wheels if draft mode is enabled.
 * @function pickCharacters
 */
export function pickCharacters() {
    const NAMES = stateStore.get("NAMES");
    const characters = stateStore.get("characters");
    const bannedHeroIds = stateStore.get("bannedHeroIds");

    const active = NAMES.map((_, i) => i).filter(
        (i) => document.getElementById(`use${i}`)?.checked,
    );

    if (active.length === 0) return alert("Select players!");

    const selectionOrder = [...active].sort(() => Math.random() - 0.5);
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) resultsDiv.innerHTML = "";

    let pool = characters
        .filter((c) => isHeroOwned(c) && !bannedHeroIds.has(c.id))
        .map((c) => structuredClone(c));

    if (pool.length < active.length) {
        return alert(
            `Not enough available (owned & non-banned) heroes (${pool.length}) in your collection for ${active.length} players!`,
        );
    }

    if (stateStore.get("draftModeEnabled")) {
        const rollBtnContainer = document.getElementById("rollBtnContainer");
        if (rollBtnContainer) rollBtnContainer.style.display = "none";

        const actionButtons = document.getElementById("action-buttons");
        if (actionButtons) actionButtons.style.display = "none";

        stateStore.set("activeDraftOrder", selectionOrder);
        stateStore.set("activeDraftStep", 0);
        stateStore.set("selectedDraftHeroes", {});
        stateStore.set("activeDraftCandidates", {});
        stateStore.set("draftWheelAngles", {});
        stateStore.set("draftWheelFrontCardIndices", {});

        const sortedActive = [...active].sort((a, b) => a - b);
        sortedActive.forEach((pIdx) => {
            rollView.renderPlayerRowWaiting(pIdx, NAMES[selectionOrder[0]]);
        });

        if (true) showSection("roll");
        if (resultsDiv) resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

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

    stateStore.set("isRollActive", false);

    const sortedActive = [...active].sort((a, b) => a - b);
    sortedActive.forEach((pIdx) => {
        rollView.renderPlayerRowSkeleton(pIdx);
    });

    if (true) showSection("roll");
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
    const characters = stateStore.get("characters");
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

    const { data: game, error: gameError } = await apiService.insertGame(stateStore.get("currentUser").id);
    if (gameError) {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = originalText;
        }
        return alert("Error creating game: " + gameError.message);
    }

    characters.forEach((char) => {
        [0, 1, 2, 3, 4, 5].forEach((pIdx) => {
            const playerChoice = activePicks.get(pIdx);

            if (playerChoice === char.name) {
                gameParticipants.push({
                    game_id: game.id,
                    player_id: `p${pIdx + 1}`,
                    hero_id: char.id,
                    is_winner: null,
                    last_updated_by: stateStore.get("currentUser").id,
                });
            }

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
                    last_updated_by: stateStore.get("currentUser").id,
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

    if (true) await init();

    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) actionButtons.style.display = "none";
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
        resultsDiv.innerHTML = '<p style="text-align: center; opacity: 0.6;">Select players and roll.</p>';
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
    stateStore.set("isRollActive", false);
}
export function openRollSettingsDrawer() {
    stateStore.set("currentDrawerMode", "roll-settings");

    // Stage current configuration
    stateStore.set("stagedDraftModeEnabled", stateStore.get("draftModeEnabled"));
    stateStore.set("stagedDraftCount", stateStore.get("draftCount"));
    stateStore.set("stagedBannedHeroIds", new Set(stateStore.get("bannedHeroIds")));
    stateStore.set("stagedBanSearchQuery", "");
    stateStore.set("stagedRollSettingsTab", "draft");

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
export function switchRollSettingsTab(tabName) {
    stateStore.set("stagedRollSettingsTab", tabName);
    renderDrawerBody();
}
export function toggleStagedDraftMode(enabled) {
    stateStore.set("stagedDraftModeEnabled", enabled);
    const section = document.getElementById("drawer-draft-count-section");
    if (section) {
        section.style.display = enabled ? "block" : "none";
    }
}
export function setStagedDraftCount(count) {
    stateStore.set("stagedDraftCount", count);
    renderDrawerBody();
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
export function startDraftStep() {
    const activeDraftStep = stateStore.get("activeDraftStep");
    const activeDraftOrder = stateStore.get("activeDraftOrder");
    const NAMES = stateStore.get("NAMES");
    const characters = stateStore.get("characters");
    const bannedHeroIds = stateStore.get("bannedHeroIds");
    const selectedDraftHeroes = stateStore.get("selectedDraftHeroes");

    if (activeDraftStep >= activeDraftOrder.length) {
        validateSelection();
        const actionButtons = document.getElementById("action-buttons");
        if (actionButtons) actionButtons.style.display = "flex";

        const rollBtnContainer = document.getElementById("rollBtnContainer");
        if (rollBtnContainer) rollBtnContainer.style.display = "none";

        stateStore.set("isRollActive", true);
        return;
    }

    const pIdx = activeDraftOrder[activeDraftStep];
    const activePlayerName = NAMES[pIdx];

    activeDraftOrder.forEach((tempIdx) => {
        const stepIdx = activeDraftOrder.indexOf(tempIdx);
        if (stepIdx < activeDraftStep) {
            // drafted and collapsed
        } else if (stepIdx === activeDraftStep) {
            rollView.renderPlayerRowDraftingActive(tempIdx);
        } else {
            rollView.renderPlayerRowWaiting(tempIdx, activePlayerName);
        }
    });

    const chosenHeroNames = Object.values(selectedDraftHeroes).map(
        (h) => h?.name,
    );
    const pool = characters.filter(
        (c) =>
            isHeroOwned(c) &&
            !bannedHeroIds.has(c.id) &&
            !chosenHeroNames.includes(c.name),
    );

    startDraftWheelScramble(pIdx, pool);

    setTimeout(() => {
        const candidates = generateDraftCandidates(pIdx, pool);
        stateStore.get("activeDraftCandidates")[pIdx] = candidates;
        stopDraftWheelScramble(pIdx, candidates);
    }, 1000);
}
export function generateDraftCandidates(pIdx, pool) {
    let candidates = [];
    let tempPool = [...pool];
    const draftCount = stateStore.get("draftCount");
    const count = Math.min(draftCount, tempPool.length);

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
export function startDraftWheelScramble(pIdx, pool) {
    const wheel = document.getElementById(`draft-wheel-${pIdx}`);
    if (!wheel) return;

    let html = "";
    const draftCount = stateStore.get("draftCount");
    const angleStep = 360 / draftCount;
    for (let i = 0; i < draftCount; i++) {
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
        for (let i = 0; i < draftCount; i++) {
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
            if (imgEl) imgEl.src = getImgUrl(randomHero.slug);
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
    stateStore.get("draftWheelFrontCardIndices")[pIdx] = 0;
    stateStore.get("draftWheelAngles")[pIdx] = 0;

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
            <span>Prob: <b>${getHeroProbabilityText(hero, pIdx)}</b></span>
        `
                : `
            <span>Prob: <b>${getHeroProbabilityText(hero, pIdx)}</b></span>
        `;

        html += `
            <div class="draft-card-wrapper" id="draft-card-wrapper-${pIdx}-${i}" style="transform: rotateY(${angle}deg) translateZ(${radius}px);" data-action="select-draft-hero" data-player-idx="${pIdx}" data-hero-name="${hero.name.replace(/"/g, "&quot;")}" data-hero-slug="${hero.slug}" data-hero-id="${hero.id}" data-angle="${angle}" data-card-idx="${i}">
                <div class="draft-card">
                    <img src="${getImgUrl(hero.slug)}" alt="${hero.name}" class="char-bg-img" style="opacity: 0.25;">
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
export function rotateDraftWheelDirection(pIdx, dir, count) {
    const candidates = stateStore.get("activeDraftCandidates")[pIdx];
    if (!candidates || candidates.length === 0) return;

    const draftWheelFrontCardIndices = stateStore.get("draftWheelFrontCardIndices");
    if (draftWheelFrontCardIndices[pIdx] === undefined) {
        draftWheelFrontCardIndices[pIdx] = 0;
    }
    let currentIdx = draftWheelFrontCardIndices[pIdx];

    let newIdx = (currentIdx + dir) % count;
    if (newIdx < 0) newIdx += count;
    draftWheelFrontCardIndices[pIdx] = newIdx;

    const angleStep = 360 / count;

    const draftWheelAngles = stateStore.get("draftWheelAngles");
    if (draftWheelAngles[pIdx] === undefined) {
        draftWheelAngles[pIdx] = 0;
    }
    const currentAngle = draftWheelAngles[pIdx];
    const targetAngle = currentAngle + dir * angleStep;
    draftWheelAngles[pIdx] = targetAngle;

    const wheel = document.getElementById(`draft-wheel-${pIdx}`);
    if (wheel) {
        wheel.style.transform = `rotateY(${-targetAngle}deg)`;
    }

    deselectDraftHero(pIdx);
}
export function getShortestRotationAngle(currentAngle, targetBaseAngle) {
    let diff = (targetBaseAngle - currentAngle) % 360;
    if (diff < -180) {
        diff += 360;
    } else if (diff > 180) {
        diff -= 360;
    }
    return currentAngle + diff;
}
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

    stateStore.get("selectedDraftHeroes")[pIdx] = null;
}
export function selectDraftHero(pIdx, heroName, heroSlug, heroId, cardAngle, cardIdx) {
    const selectedDraftHeroes = stateStore.get("selectedDraftHeroes");
    const isAlreadySelected =
        selectedDraftHeroes[pIdx] && selectedDraftHeroes[pIdx].id === heroId;

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

    stateStore.get("draftWheelFrontCardIndices")[pIdx] = cardIdx;

    const draftWheelAngles = stateStore.get("draftWheelAngles");
    if (draftWheelAngles[pIdx] === undefined) {
        draftWheelAngles[pIdx] = 0;
    }
    const currentAngle = draftWheelAngles[pIdx];
    const shortestAngle = getShortestRotationAngle(currentAngle, cardAngle);
    draftWheelAngles[pIdx] = shortestAngle;

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
        bgImgEl.src = getImgUrl(heroSlug);
        bgImgEl.style.opacity = "0.25";
    }

    if (confirmBtn) {
        confirmBtn.disabled = false;
    }

    const characters = stateStore.get("characters");
    selectedDraftHeroes[pIdx] = characters.find((c) => c.id === heroId);
}
export function collapsePlayerRowToResolved(pIdx, finalHero) {
    rollView.collapsePlayerRowToResolved(pIdx, finalHero);
}
export function confirmDraftPick(pIdx) {
    const selectedDraftHeroes = stateStore.get("selectedDraftHeroes");
    const chosenHero = selectedDraftHeroes[pIdx];
    if (!chosenHero) return;

    collapsePlayerRowToResolved(pIdx, chosenHero);

    stateStore.set("activeDraftStep", stateStore.get("activeDraftStep") + 1);
    startDraftStep();
}
export function renderPlayerRowWaiting(pIdx, activePlayerName) {
    rollView.renderPlayerRowWaiting(pIdx, activePlayerName);
}
export function renderPlayerRowDraftingActive(pIdx) {
    rollView.renderPlayerRowDraftingActive(pIdx);
}
