/**
 * @fileoverview Presentation view module for roll results, randomizer animations, manual hero selection modals, and draft carousels.
 * @module rollView
 */

import * as stateStore from '../stateStore.js';
import {
    getImgUrl,
    getHeroLink,
    getHeroProbabilityText,
    isHeroOwned,
    getSoftWeight,
    escapeHtml,
    parseDateString,
    getDaysAgoClean,
    MAX_WEIGHTED_PLAYERS,
    getRecencyDot,
    getRollParticipant
} from '../utils.js';
import { updateSegmentedHighlights } from './filterView.js';

// DOM Element references cache helper
const getElements = () => ({
    resultsDiv: document.getElementById("results"),
    actionButtons: document.getElementById("action-buttons"),
    heroSelectModal: document.getElementById("hero-select-modal"),
    heroSelectModalTitle: document.getElementById("hero-select-modal-title"),
    heroSelectSearch: document.getElementById("hero-select-search"),
    modalSortName: document.getElementById("modal-sort-name"),
    modalSortWeight: document.getElementById("modal-sort-weight"),
    heroSelectOptionsContainer: document.getElementById("hero-select-options-container"),
    confirmBtn: document.getElementById("confirmBtn"),
    errorMsg: document.getElementById("error-msg")
});

/**
 * Builds a single complexity die icon (same "d1.png"-"d6.png" assets as the Heroes Database
 * bar, but showing only the die matching the hero's level) to save horizontal space next to
 * the player/hero name.
 * @param {number} complexity
 * @returns {string}
 */
function renderComplexityDiceHtml(complexity) {
    const complexityVal = Number(complexity) || 1;
    return `<img src="images/dice/d${complexityVal}.png" class="complexity-die-solo" alt="Complexity ${complexityVal}">`;
}

/**
 * Appends a player row placeholder with animatable text inside the results container.
 */
export function renderPlayerRowSkeleton(pIdx) {
    const el = getElements();
    if (!el.resultsDiv) return;

    const participant = getRollParticipant(pIdx);
    const playerName = participant?.name || `Player ${pIdx + 1}`;
    const colorVar = participant?.colorVar || `p${pIdx + 1}`;
    const statsRowHtml =
        pIdx < MAX_WEIGHTED_PLAYERS
            ? `
                    <div class="hero-stats-row scramble-hidden opacity-0" id="stats-row-${pIdx}">
                        <span>Plays: --</span>
                        <span class="stats-divider">|</span>
                        <span>Last: --</span>
                        <span class="stats-divider">|</span>
                        <span id="hero-prob-${pIdx}">Prob: --</span>
                    </div>`
            : `<div class="hero-stats-row" id="stats-row-${pIdx}"></div>`;

    el.resultsDiv.innerHTML += `
        <div class="hero-card player-row randomizing" id="player-row-${pIdx}" style="--player-color: var(--${colorVar}); border-color: var(--${colorVar});">
            <img src="" class="char-bg-img scramble-img" id="bg-img-${pIdx}" alt="Randomizing">

            <div class="player-row-content">
                <div class="hero-info-container" id="info-container-${pIdx}">
                    <div class="hero-header-row">
                        <div class="hero-header-left">
                            <span class="player-name-caps" style="color: var(--player-color);">${playerName.toUpperCase()}</span>
                            <span class="hero-name-divider">:</span>
                            <a href="#" target="_blank" class="hero-name hero-name-link scramble-text" id="hero-name-title-${pIdx}">ROLLING...</a>
                        </div>
                        <div class="complexity-dice-bar player-row-dice-bar scramble-hidden opacity-0" id="complexity-dice-${pIdx}"></div>
                    </div>

                    <span class="expanded-group scramble-hidden opacity-0" id="hero-group-${pIdx}">Group</span>

                    <div class="hero-footer-row">
                        ${statsRowHtml}
                        <button class="edit-icon-btn scramble-hidden opacity-0" id="edit-btn-${pIdx}" type="button" data-action="open-hero-select" data-player-idx="${pIdx}" aria-label="Select hero">CHANGE</button>
                    </div>
                </div>

                <div class="hero-select-container" id="select-container-${pIdx}">
                    <input type="hidden" class="char-select" data-player="${pIdx}" id="select-${pIdx}">
                </div>
            </div>
        </div>
    `;
}

/**
 * Displays the manual selection modal and sets title context.
 */
export function openHeroSelectModal(pIdx) {
    const el = getElements();
    if (!el.heroSelectModal) return;

    el.heroSelectModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    const participant = getRollParticipant(pIdx);
    if (el.heroSelectModalTitle && participant?.name) {
        el.heroSelectModalTitle.innerText = `Select Hero for ${participant.name}`;
    }

    if (el.heroSelectSearch) {
        el.heroSelectSearch.value = "";
    }

    stateStore.set("modalSortMode", "name");
    setModalSort("name");
    renderHeroSelectOptions();
    setTimeout(updateSegmentedHighlights, 50);
}

/**
 * Closes the manual selection modal.
 */
export function closeHeroSelectModal() {
    const el = getElements();
    if (el.heroSelectModal) {
        el.heroSelectModal.style.display = "none";
    }
    document.body.style.overflow = "";
}

/**
 * Visual feedback for segmented controls inside manual selection modal.
 */
export function setModalSort(mode) {
    const el = getElements();
    if (el.modalSortName) el.modalSortName.classList.toggle("active", mode === "name");
    if (el.modalSortWeight) el.modalSortWeight.classList.toggle("active", mode === "weight");

    updateSegmentedHighlights();
}

/**
 * Renders characters grid inside manual selection modal.
 */
export function renderHeroSelectOptions() {
    const el = getElements();
    if (!el.heroSelectOptionsContainer) return;

    const pIdx = stateStore.get("activeSelectPlayerIdx");
    const modalSortMode = stateStore.get("modalSortMode");
    const searchInput = el.heroSelectSearch;
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const characters = stateStore.get("characters");
    const bannedHeroIds = stateStore.get("bannedHeroIds");

    if (pIdx === null) return;

    let pool = characters.filter((c) => isHeroOwned(c) && !bannedHeroIds.has(c.id));

    if (query) {
        pool = pool.filter((c) =>
            c.name.toLowerCase().includes(query) ||
            (c.group && c.group.toLowerCase().includes(query))
        );
    }

    if (modalSortMode === "name") {
        pool.sort((a, b) => a.name.localeCompare(b.name));
    } else if (modalSortMode === "weight") {
        pool.sort((a, b) => {
            const wA = getSoftWeight(a, pIdx);
            const wB = getSoftWeight(b, pIdx);
            if (wA === wB) return a.name.localeCompare(b.name);
            return wB - wA;
        });
    }

    const currentVal = document.getElementById(`select-${pIdx}`)?.value;

    if (pool.length === 0) {
        el.heroSelectOptionsContainer.innerHTML = `<p style="opacity: 0.6; font-style: italic; grid-column: 1 / -1; text-align: center; padding: 20px;">No available heroes found.</p>`;
        return;
    }

    el.heroSelectOptionsContainer.innerHTML = pool
        .map((hero) => {
            const isSelected = currentVal === hero.name;
            const probText = getHeroProbabilityText(hero, pIdx);

            return `
            <div class="hero-select-card ${isSelected ? "selected" : ""}" data-action="select-hero-option" data-hero-name="${hero.name.replace(/"/g, "&quot;")}" data-hero-slug="${hero.slug}" data-hero-id="${hero.id}">
                <img src="${getImgUrl(hero.slug)}" class="hero-select-card-img" alt="${hero.name}">
                <div class="hero-select-card-info">
                    <div class="hero-select-card-name">${hero.name}</div>
                    <div class="hero-select-card-prob">${probText}</div>
                </div>
            </div>`;
        })
        .join("");
}

/**
 * Updates result row display card when a character is manually selected or roll stops.
 */
export function updatePlayerCardUI(pIdx, finalHero) {
    const rowEl = document.getElementById(`player-row-${pIdx}`);
    const selectEl = document.getElementById(`select-${pIdx}`);
    const bgImgEl = document.getElementById(`bg-img-${pIdx}`);
    const nameTitle = document.getElementById(`hero-name-title-${pIdx}`);
    const groupEl = document.getElementById(`hero-group-${pIdx}`);
    const statsDiv = document.getElementById(`stats-row-${pIdx}`);
    const diceEl = document.getElementById(`complexity-dice-${pIdx}`);

    if (selectEl) selectEl.value = finalHero.name;
    if (bgImgEl) {
        bgImgEl.src = getImgUrl(finalHero.slug);
        bgImgEl.style.opacity = "0.25";
        bgImgEl.classList.remove("scramble-img");
    }
    if (nameTitle) {
        nameTitle.innerText = finalHero.name;
        nameTitle.href = getHeroLink(finalHero.slug);
        nameTitle.classList.remove("scramble-text");
        nameTitle.classList.add("resolved");
    }
    if (groupEl) {
        groupEl.innerText = finalHero.group || "Unknown";
    }
    if (diceEl) {
        diceEl.innerHTML = renderComplexityDiceHtml(finalHero.complexity);
    }

    if (statsDiv) {
        if (pIdx < MAX_WEIGHTED_PLAYERS) {
            const probText = `Prob: <b>${getHeroProbabilityText(finalHero, pIdx)}</b>`;
            const plays = finalHero.playCount[pIdx] || 0;
            const last = finalHero.lastPlayed[pIdx] || "Never";
            statsDiv.innerHTML = `
                <span>Plays: <b>${plays}</b></span>
                <span class="stats-divider">|</span>
                <span>Last: <b>${last}</b></span>
                <span class="stats-divider">|</span>
                <span>${probText}</span>
            `;
        } else {
            statsDiv.innerHTML = "";
        }
    }

    if (rowEl) {
        rowEl.classList.remove("randomizing");
        rowEl.classList.add("revealed");
        if (groupEl) {
            groupEl.classList.remove("scramble-hidden", "opacity-0");
            groupEl.classList.add("fade-in-resolve");
        }
        if (statsDiv) {
            statsDiv.classList.remove("scramble-hidden", "opacity-0");
            statsDiv.classList.add("fade-in-resolve");
        }
        if (diceEl) {
            diceEl.classList.remove("scramble-hidden", "opacity-0");
            diceEl.classList.add("fade-in-resolve");
        }
        const editBtn = document.getElementById(`edit-btn-${pIdx}`);
        if (editBtn) {
            editBtn.classList.remove("scramble-hidden", "opacity-0");
            editBtn.classList.add("fade-in-resolve");
        }
    }
}



/**
 * Collapses the draft row view to show the final selected character's stats and edit triggers.
 */
export function collapsePlayerRowToResolved(pIdx, finalHero) {
    const el = getElements();
    let rowEl = document.getElementById(`player-row-${pIdx}`);
    if (!rowEl) {
        if (!el.resultsDiv) return;
        rowEl = document.createElement("div");
        rowEl.id = `player-row-${pIdx}`;
        el.resultsDiv.appendChild(rowEl);
    }

    const participant = getRollParticipant(pIdx);
    const playerName = participant?.name || `Player ${pIdx + 1}`;
    const colorVar = participant?.colorVar || `p${pIdx + 1}`;

    rowEl.className = "hero-card player-row revealed";
    rowEl.style.cssText = `--player-color: var(--${colorVar}); border-color: var(--${colorVar});`;

    rowEl.innerHTML = `
        <img src="${getImgUrl(finalHero.slug)}" class="char-bg-img" id="bg-img-${pIdx}" alt="${finalHero.name}" style="opacity: 0.25;">
        <div class="player-row-content">
            <div class="hero-info-container" id="info-container-${pIdx}">
                <div class="hero-header-row">
                    <div class="hero-header-left">
                        <span class="player-name-caps" style="color: var(--player-color);">${playerName.toUpperCase()}</span>
                        <span class="hero-name-divider">:</span>
                        <a href="${getHeroLink(finalHero.slug)}" target="_blank" class="hero-name hero-name-link resolved" id="hero-name-title-${pIdx}">${finalHero.name}</a>
                    </div>
                    <div class="complexity-dice-bar player-row-dice-bar" id="complexity-dice-${pIdx}">${renderComplexityDiceHtml(finalHero.complexity)}</div>
                </div>
                <span class="expanded-group" id="hero-group-${pIdx}">${finalHero.group || "Unknown"}</span>
                <div class="hero-footer-row">
                    <div class="hero-stats-row" id="stats-row-${pIdx}"></div>
                    <button class="edit-icon-btn" id="edit-btn-${pIdx}" type="button" data-action="open-hero-select" data-player-idx="${pIdx}" aria-label="Select hero">CHANGE</button>
                </div>
            </div>
            <div class="hero-select-container" id="select-container-${pIdx}">
                <input type="hidden" class="char-select" data-player="${pIdx}" id="select-${pIdx}" value="${finalHero.name}">
            </div>
        </div>
    `;

    const statsRow = document.getElementById(`stats-row-${pIdx}`);
    if (statsRow) {
        if (pIdx < MAX_WEIGHTED_PLAYERS) {
            const probText = `Prob: <b>${getHeroProbabilityText(finalHero, pIdx)}</b>`;
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
            statsRow.innerHTML = "";
        }
    }
}

/**
 * Renders the single-player drafting turn view: a pip row across the top showing draft order
 * (current player highlighted, others dimmed), an instruction line, and an empty card-list
 * container ready to be filled by renderDraftCardListScramble/revealDraftCandidates.
 */
export function renderDraftTurn(order, activeStep) {
    const el = getElements();
    if (!el.resultsDiv) return;

    const activePIdx = order[activeStep];
    const activeName = getRollParticipant(activePIdx)?.name || `Player ${activePIdx + 1}`;

    const pipsHtml = order
        .map((pIdx, stepIdx) => {
            const participant = getRollParticipant(pIdx);
            const name = participant?.name || `Player ${pIdx + 1}`;
            const colorVar = participant?.colorVar || `p${pIdx + 1}`;
            const isActive = stepIdx === activeStep;
            const isDone = stepIdx < activeStep;
            return `
                <span class="draft-pip${isActive ? " active" : ""}${isDone ? " done" : ""}" style="--player-color: var(--${colorVar})">
                    ${name}${isActive ? ' <em class="draft-pip-status">picking...</em>' : ""}
                </span>`;
        })
        .join("");

    el.resultsDiv.innerHTML = `
        <div class="draft-pip-row">${pipsHtml}</div>
        <div class="draft-instruction-row">
            <p class="draft-instruction"><strong>${activeName}</strong>, pick your hero</p>
            <button class="btn-cancel-roll" type="button" data-action="cancel-roll" aria-label="Cancel roll">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <p class="draft-instruction-sub">Tap a card to select</p>
        <div class="draft-card-list" id="draft-card-list"></div>
        <button type="button" class="btn-confirm-draft" id="draft-confirm-btn" data-action="confirm-draft" data-player-idx="${activePIdx}" disabled>
            SELECT A HERO
        </button>
    `;
}

/**
 * Fills the draft card list with N scrambling placeholder cards while candidates are "rolling".
 */
export function renderDraftCardListScramble(pIdx, draftCount) {
    const list = document.getElementById("draft-card-list");
    if (!list) return;

    let html = "";
    for (let i = 0; i < draftCount; i++) {
        html += `
            <div class="hero-card draft-card" id="draft-card-${pIdx}-${i}">
                <img src="" class="char-bg-img scramble-img" id="draft-card-img-${pIdx}-${i}" style="opacity: 0.15;">
                <div class="draft-card-content">
                    <div class="draft-card-header">
                        <span class="draft-hero-name scramble-text" id="draft-card-name-${pIdx}-${i}">ROLLING...</span>
                    </div>
                    <span class="draft-card-group" id="draft-card-group-${pIdx}-${i}">Group</span>
                </div>
            </div>`;
    }
    list.innerHTML = html;
}

/**
 * Replaces the scrambling placeholders with the real, tap-to-select candidate cards.
 */
export function renderDraftCandidateCards(pIdx, candidates) {
    const list = document.getElementById("draft-card-list");
    if (!list) return;

    list.innerHTML = candidates
        .map((hero, i) => {
            const statsHtml =
                pIdx < MAX_WEIGHTED_PLAYERS
                    ? `
                <div class="hero-stats-row">
                    <span>Plays: <b>${hero.playCount[pIdx] || 0}</b></span>
                    <span class="stats-divider">|</span>
                    <span>Last: <b>${hero.lastPlayed[pIdx] || "Never"}</b></span>
                    <span class="stats-divider">|</span>
                    <span>Prob: <b>${getHeroProbabilityText(hero, pIdx)}</b></span>
                </div>`
                    : "<span></span>";

            return `
            <div class="hero-card draft-card" id="draft-card-${pIdx}-${i}" data-action="select-draft-candidate" data-player-idx="${pIdx}" data-hero-id="${hero.id}">
                <img src="${getImgUrl(hero.slug)}" alt="${hero.name}" class="char-bg-img" style="opacity: 0.2;">
                <div class="draft-card-content">
                    <div class="draft-card-header">
                        <span class="hero-name draft-hero-name">${hero.name}</span>
                        <div class="complexity-dice-bar player-row-dice-bar">${renderComplexityDiceHtml(hero.complexity)}</div>
                    </div>
                    <span class="draft-card-group">${hero.group || "Unknown"}</span>
                    <div class="hero-footer-row">
                        ${statsHtml}
                        <span class="draft-selected-badge">SELECTED</span>
                    </div>
                </div>
            </div>`;
        })
        .join("");
}

/**
 * Marks the tapped candidate card as selected (and un-marks any other) without confirming the pick.
 */
export function markDraftCandidateSelected(pIdx, heroId) {
    document.querySelectorAll(`.draft-card[data-player-idx="${pIdx}"]`).forEach((card) => {
        card.classList.toggle("selected", card.dataset.heroId === String(heroId));
    });
}

/**
 * Updates the per-turn confirm button: disabled "SELECT A HERO" with no pick yet,
 * or enabled "PICK <hero> →" once a candidate card has been tapped.
 */
export function updateDraftConfirmButton(pIdx, hero) {
    const btn = document.getElementById("draft-confirm-btn");
    if (!btn) return;

    if (!hero) {
        btn.disabled = true;
        btn.innerText = "SELECT A HERO";
    } else {
        const playerName = getRollParticipant(pIdx)?.name || `Player ${pIdx + 1}`;
        btn.disabled = false;
        btn.innerHTML = `${escapeHtml(playerName.toUpperCase())} picks ${escapeHtml(hero.name.toUpperCase())} &rarr;`;
    }
}
