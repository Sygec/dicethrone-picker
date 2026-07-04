/**
 * @fileoverview Presentation view module for the Randomizer setup flow: invitee pills
 * and game type option buttons.
 * @module randomizerSetupView
 */
import * as stateStore from '../stateStore.js';
import { getParticipantCount, getGameTypeAvailability } from '../randomizerSetup.js';

const MAX_INVITEES = 2;

// L-shaped pistol silhouette (muzzle pointing +x, grip hanging below the rear/pivot at the origin)
const PISTOL_PARTS = `<rect x="0" y="-1.5" width="9" height="3"></rect><rect x="8" y="-2.3" width="1" height="0.8"></rect><path d="M0 1.5 L-1.2 7 L3.5 7 L2.5 1.5 Z"></path><path d="M2.5 2 q2 2 0 4"></path>`;

const ICONS = {
    // Crossed pistols
    duel: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(12,12) rotate(-45)">${PISTOL_PARTS}</g><g transform="translate(12,12) rotate(45) scale(-1,1)">${PISTOL_PARTS}</g></svg>`,
    // Two people (Feather "users" icon)
    teams: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    // Crossed swords
    ffa: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"></line><path d="M5 5 L8 5 M5 5 L5 8"></path><line x1="19" y1="5" x2="5" y2="19"></line><path d="M19 5 L16 5 M19 5 L19 8"></path></svg>`,
    // Crown
    koth: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4 4 5-7 5 7 4-4-2 10H5z"></path></svg>`,
};

const INFO_ICON = `<svg class="setup-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

const GAME_TYPE_INFO = {
    duel: 'Standard health pools (50 HP), each player has their CP.',
    '2v2': 'Teams share a single health pool (50 HP for 2v2), each player has their CP.',
    '3v3': 'Teams share a single health pool (60 HP for 3v3), each player has their CP.',
    ffa: "Standard health pools (50 HP), each player has their CP, targeting using dice (1/2 left, 3/4 across, 5/6 right). With 3 players, 3/4 is player's choice.",
    koth: 'Free For All variant when you may freely choose any opponent, but if you attack the highest health player, you immediately draw a bonus card.',
};

let elementsCache = null;
const getElements = () => {
    if (!elementsCache) {
        elementsCache = {
            gameTypeStep: document.getElementById('setup-step-gametype'),
            gameTypeGrid: document.getElementById('game-type-grid'),
            gameTypeHint: document.getElementById('game-type-hint'),
            inviteeZone: document.getElementById('invitee-zone'),
        };
    }
    return elementsCache;
};

/**
 * Renders the two invitee slots: a filled toggle pill for each added invitee, or a
 * dashed placeholder with a "+" button for each empty slot.
 */
export function renderInvitees() {
    const el = getElements();
    if (!el.inviteeZone) return;
    const invitees = stateStore.get('invitees');

    let html = '';
    for (let slot = 0; slot < MAX_INVITEES; slot++) {
        const inv = invitees[slot];
        html += inv
            ? `
            <label class="player-card invitee-card" style="--player-color: var(--p${slot + 5})">
                <input type="checkbox" checked data-invitee-id="${inv.id}">
                <span class="player-card-name">${inv.name}</span>
            </label>`
            : `
            <button type="button" class="player-card invitee-add-btn" data-action="add-invitee" data-slot="${slot}">
                <span class="invitee-add-icon" aria-hidden="true">+</span>
            </button>`;
    }

    el.inviteeZone.innerHTML = html;
}

/**
 * Shows or hides the Game Type step based on the current participant count.
 * @param {number} [count] - Optional precomputed participant count.
 */
export function updateStepVisibility(count = getParticipantCount()) {
    const el = getElements();
    if (!el.gameTypeStep) return;
    el.gameTypeStep.style.display = count >= 2 ? 'block' : 'none';
}

/**
 * Renders the four game type option buttons with enabled/disabled and active state.
 */
export function renderGameTypeOptions() {
    const el = getElements();
    if (!el.gameTypeGrid) return;

    const count = getParticipantCount();
    const availability = getGameTypeAvailability(count);
    const selectedGameType = stateStore.get('selectedGameType');

    const options = [
        { type: 'duel', label: '1v1 Duel', enabled: availability.duel, icon: ICONS.duel },
        {
            type: availability.teamsValue,
            label: `Teams ${availability.teamsValue}`,
            enabled: availability.teams,
            icon: ICONS.teams,
        },
        { type: 'ffa', label: 'Free For All', enabled: availability.ffa, icon: ICONS.ffa },
        { type: 'koth', label: 'King of the Hill', enabled: availability.koth, icon: ICONS.koth },
    ];

    el.gameTypeGrid.innerHTML = options
        .map(
            (opt) => `
            <button type="button"
                class="game-type-btn${opt.type === selectedGameType ? ' active' : ''}"
                data-action="select-game-type"
                data-type="${opt.type}"
                ${opt.enabled ? '' : 'disabled'}>
                <span class="game-type-icon">${opt.icon}</span>
                <span class="game-type-label">${opt.label}</span>
            </button>`,
        )
        .join('');

    renderGameTypeHint(selectedGameType);
}

/**
 * Shows an explanatory line for the currently selected game type, or hides it if none is selected.
 * @param {string|null} [selectedGameType] - Optional precomputed selection.
 */
export function renderGameTypeHint(selectedGameType = stateStore.get('selectedGameType')) {
    const el = getElements();
    if (!el.gameTypeHint) return;

    const info = selectedGameType && GAME_TYPE_INFO[selectedGameType];
    if (!info) {
        el.gameTypeHint.style.display = 'none';
        el.gameTypeHint.innerHTML = '';
        return;
    }

    el.gameTypeHint.style.display = 'flex';
    el.gameTypeHint.innerHTML = `${INFO_ICON}<span>${info}</span>`;
}

/**
 * Renders the full Randomizer setup UI (invitees + game type step).
 */
export function renderRandomizerSetup() {
    renderInvitees();
    updateStepVisibility();
    renderGameTypeOptions();
}
