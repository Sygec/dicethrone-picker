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
    escapeHtml 
} from '../utils.js';
import { updateSegmentedHighlights } from './filterView.js';

// DOM Element references cache helper
const getElements = () => ({
    resultsDiv: document.getElementById("results"),
    rollBtnContainer: document.getElementById("rollBtnContainer"),
    rollBtn: document.getElementById("rollBtn"),
    actionButtons: document.getElementById("action-buttons"),
    heroSelectModal: document.getElementById("hero-select-modal"),
    heroSelectModalTitle: document.getElementById("hero-select-modal-title"),
    heroSelectSearch: document.getElementById("hero-select-search"),
    modalSortName: document.getElementById("modal-sort-name"),
    modalSortWeight: document.getElementById("modal-sort-weight"),
    heroSelectOptionsContainer: document.getElementById("hero-select-options-container"),
    confirmBtn: document.getElementById("confirmBtn"),
    errorMsg: document.getElementById("error-msg"),
    rollSettingsBadge: document.getElementById("roll-settings-badge"),
    rollSettingsBtn: document.getElementById("rollSettingsBtn"),
    drawerBanListContainer: document.getElementById("drawer-ban-list-container")
});

/**
 * Appends a player row placeholder with animatable text inside the results container.
 */
export function renderPlayerRowSkeleton(pIdx) {
    const el = getElements();
    if (!el.resultsDiv) return;

    const names = stateStore.get("NAMES");
    const playerName = names[pIdx] || `Player ${pIdx + 1}`;

    el.resultsDiv.innerHTML += `
        <div class="player-row randomizing" id="player-row-${pIdx}" style="--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});">
            <img src="" class="char-bg-img scramble-img" id="bg-img-${pIdx}" alt="Randomizing">
            
            <div class="player-row-content">
                <div class="hero-info-container" id="info-container-${pIdx}">
                    <div class="hero-header-row">
                        <div class="hero-header-left">
                            <span class="player-name-caps" style="color: var(--player-color);">${playerName.toUpperCase()}</span>
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
                    <button class="edit-icon-btn" type="button" data-action="open-hero-select" data-player-idx="${pIdx}" aria-label="Select hero">
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

/**
 * Displays the manual selection modal and sets title context.
 */
export function openHeroSelectModal(pIdx) {
    const el = getElements();
    if (!el.heroSelectModal) return;

    el.heroSelectModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    const names = stateStore.get("NAMES");
    if (el.heroSelectModalTitle && names[pIdx]) {
        el.heroSelectModalTitle.innerText = `Select Hero for ${names[pIdx]}`;
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
    const names = stateStore.get("NAMES");

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
    }
    if (groupEl) {
        groupEl.innerText = finalHero.group || "Unknown";
    }

    if (statsDiv) {
        const probText = `Prob: <b>${getHeroProbabilityText(finalHero, pIdx)}</b>`;
        if (pIdx < 4) {
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
            statsDiv.innerHTML = `<span>${probText}</span>`;
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
        const selectContainer = document.getElementById(`select-container-${pIdx}`);
        if (selectContainer) {
            selectContainer.classList.remove("scramble-hidden", "opacity-0");
            selectContainer.classList.add("fade-in-resolve");
        }
    }
}

/**
 * Helper to get date parsing (similar to filters.js)
 */
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

/**
 * Decoupled relative elapsed days generator.
 */
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

/**
 * Decoupled recency emoji decorator.
 */
function getRecencyDot(lastPlayed) {
    let recencyDot = "⚫";
    if (lastPlayed && lastPlayed === "Unknown") {
        recencyDot = "🔴";
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
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 15) {
                    recencyDot = "🟢";
                } else if (diffDays <= 60) {
                    recencyDot = "🟡";
                } else {
                    recencyDot = "🔴";
                }
            } catch (e) {
                recencyDot = "⚪";
            }
        } else {
            recencyDot = "⚪";
        }
    }
    return recencyDot;
}

/**
 * Collapses the draft row view to show the final selected character's stats and edit triggers.
 */
export function collapsePlayerRowToResolved(pIdx, finalHero) {
    const rowEl = document.getElementById(`player-row-${pIdx}`);
    if (!rowEl) return;

    const names = stateStore.get("NAMES");
    const playerName = names[pIdx] || `Player ${pIdx + 1}`;

    rowEl.className = "player-row revealed";
    rowEl.style.cssText = `--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});`;

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
                </div>
                <span class="expanded-group" id="hero-group-${pIdx}">${finalHero.group || "Unknown"}</span>
                <div class="hero-stats-row" id="stats-row-${pIdx}">
                </div>
            </div>
            <div class="hero-select-container" id="select-container-${pIdx}">
                <input type="hidden" class="char-select" data-player="${pIdx}" id="select-${pIdx}" value="${finalHero.name}">
                <button class="edit-icon-btn" type="button" data-action="open-hero-select" data-player-idx="${pIdx}" aria-label="Select hero">
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
}

/**
 * Renders the placeholder view for a player waiting for their turn to draft.
 */
export function renderPlayerRowWaiting(pIdx, activePlayerName) {
    const el = getElements();
    if (!el.resultsDiv) return;

    let rowEl = document.getElementById(`player-row-${pIdx}`);
    if (!rowEl) {
        rowEl = document.createElement("div");
        rowEl.id = `player-row-${pIdx}`;
        el.resultsDiv.appendChild(rowEl);
    }

    const names = stateStore.get("NAMES");
    const playerName = names[pIdx] || `Player ${pIdx + 1}`;

    rowEl.className = "player-row waiting-draft";
    rowEl.style.cssText = `--player-color: var(--p${pIdx + 1}); border-color: var(--p${pIdx + 1});`;
    rowEl.innerHTML = `
        <div class="player-row-content">
            <span class="player-name-caps" style="color: var(--player-color);">${playerName.toUpperCase()}</span>
            <span class="draft-waiting-status">Waiting for ${activePlayerName}...</span>
        </div>
    `;
}

/**
 * Renders the active drafting interface (complete with 3D carousel and controls) for a player.
 */
export function renderPlayerRowDraftingActive(pIdx) {
    const el = getElements();
    if (!el.resultsDiv) return;

    let rowEl = document.getElementById(`player-row-${pIdx}`);
    if (!rowEl) {
        rowEl = document.createElement("div");
        rowEl.id = `player-row-${pIdx}`;
        el.resultsDiv.appendChild(rowEl);
    }

    const names = stateStore.get("NAMES");
    const playerName = names[pIdx] || `Player ${pIdx + 1}`;
    const draftCount = stateStore.get("draftCount");

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
                    <span class="player-name-caps" style="color: var(--player-color);">${playerName.toUpperCase()}</span>
                    <span class="hero-name-divider">:</span>
                    <span class="draft-title" style="font-weight: 700; color: #ffd700;">CHOOSE YOUR HERO</span>
                </div>
                <button class="btn-cancel-roll" type="button" data-action="cancel-roll" aria-label="Cancel roll">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="draft-wheel-container" id="draft-wheel-container-${pIdx}">
                <button type="button" class="draft-arrow left-arrow" data-action="rotate-draft" data-player-idx="${pIdx}" data-direction="-1" data-draft-count="${draftCount}" aria-label="Previous hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div class="draft-wheel" id="draft-wheel-${pIdx}">
                </div>

                <button type="button" class="draft-arrow right-arrow" data-action="rotate-draft" data-player-idx="${pIdx}" data-direction="1" data-draft-count="${draftCount}" aria-label="Next hero">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
            <div class="draft-actions">
                <button type="button" class="btn-confirm-draft" id="confirm-draft-btn-${pIdx}" data-action="confirm-draft" data-player-idx="${pIdx}" disabled>
                    CONFIRM PICK
                </button>
            </div>
        </div>
    `;
}

/**
 * Updates the roll settings badge and button styling.
 */
export function updateRollSettingsBadge() {
    const el = getElements();
    if (!el.rollSettingsBadge || !el.rollSettingsBtn) return;

    const draftModeEnabled = stateStore.get("draftModeEnabled");
    const bannedHeroIds = stateStore.get("bannedHeroIds");

    let activeCount = 0;
    if (draftModeEnabled) activeCount++;
    if (bannedHeroIds && bannedHeroIds.size > 0) activeCount += bannedHeroIds.size;

    if (activeCount > 0) {
        el.rollSettingsBadge.innerText = activeCount;
        el.rollSettingsBadge.style.display = "inline-block";
        el.rollSettingsBtn.classList.add("has-settings");
    } else {
        el.rollSettingsBadge.style.display = "none";
        el.rollSettingsBtn.classList.remove("has-settings");
    }
}

/**
 * Draws the interactive admin ban list checkbox configurations in the settings drawer.
 */
export function renderDrawerBanList() {
    const el = getElements();
    if (!el.drawerBanListContainer) return;

    const characters = stateStore.get("characters");
    const stagedBannedHeroIds = stateStore.get("stagedBannedHeroIds");
    const stagedBanSearchQuery = stateStore.get("stagedBanSearchQuery") || "";

    const query = stagedBanSearchQuery.toLowerCase().trim();
    let pool = characters;
    if (query) {
        pool = characters.filter((c) =>
            c.name.toLowerCase().includes(query) ||
            (c.group && c.group.toLowerCase().includes(query))
        );
    }

    const sortedPool = [...pool].sort((a, b) => a.name.localeCompare(b.name));

    if (sortedPool.length === 0) {
        el.drawerBanListContainer.innerHTML = `<p style="opacity: 0.6; font-style: italic; text-align: center; padding: 20px;">No heroes found matching "${stagedBanSearchQuery}"</p>`;
        return;
    }

    el.drawerBanListContainer.innerHTML = sortedPool
        .map((hero) => {
            const isBanned = stagedBannedHeroIds.has(hero.id);
            return `
            <label class="ban-list-item ${isBanned ? "banned" : ""}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" ${isBanned ? "checked" : ""} data-action="toggle-staged-ban" data-hero-id="${hero.id}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--danger);">
                    <span>${hero.name}</span>
                </div>
                <span class="ban-item-group">${hero.group || "Unknown"}</span>
            </label>
        `;
        })
        .join("");
}
