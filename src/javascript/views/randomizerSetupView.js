/**
 * @fileoverview Presentation view module for the Randomizer setup flow: invitee pills
 * and game type option buttons.
 * @module randomizerSetupView
 */
import * as stateStore from '../stateStore.js';
import {
    getParticipantCount,
    getGameTypeAvailability,
    getCheckedParticipants,
    canAddMoreInvitees,
    isTeamsType,
} from '../randomizerSetup.js';

// L-shaped pistol silhouette (muzzle pointing +x, grip hanging below the rear/pivot at the origin)
const PISTOL_PARTS = `<rect x="0" y="-1.5" width="9" height="3"></rect><rect x="8" y="-2.3" width="1" height="0.8"></rect><path d="M0 1.5 L-1.2 7 L3.5 7 L2.5 1.5 Z"></path><path d="M2.5 2 q2 2 0 4"></path>`;

export const ICONS = {
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

const ARROW_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="13 6 19 12 13 18"></polyline></svg>`;

export const GAME_TYPE_SHORT_LABEL = {
    duel: '1v1',
    '2v2': '2v2',
    '3v3': '3v3',
    ffa: 'FFA',
    koth: 'KotH',
};

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
            teamsStep: document.getElementById('setup-step-teams'),
            teamsGrid: document.getElementById('teams-grid'),
            randomizeTeamsBtn: document.getElementById('randomize-teams-btn'),
            teamSwapQuestion: document.getElementById('team-swap-question'),
            teamSwapScrim: document.getElementById('team-swap-scrim'),
            rollModeStep: document.getElementById('setup-step-rollmode'),
            rollModeGrid: document.getElementById('roll-mode-grid'),
            draftCountSection: document.getElementById('draft-count-section'),
            draftCountGrid: document.getElementById('draft-count-grid'),
            rollStep: document.getElementById('setup-step-roll'),
            rollFinalBtn: document.getElementById('roll-final-btn'),
        };
    }
    return elementsCache;
};

/**
 * Renders a filled toggle pill for each existing invitee, followed by a single dashed
 * "+" placeholder to add the next one — hidden once the 6-participant ceiling is reached.
 */
export function renderInvitees() {
    const el = getElements();
    if (!el.inviteeZone) return;
    const invitees = stateStore.get('invitees');

    const pills = invitees
        .map(
            (inv) => `
            <label class="player-card invitee-card" style="--player-color: var(--p5)">
                <input type="checkbox" checked data-invitee-id="${inv.id}">
                <span class="player-card-name">${inv.name}</span>
            </label>`,
        )
        .join('');

    const addButton = canAddMoreInvitees()
        ? `
            <button type="button" class="player-card invitee-add-btn" data-action="add-invitee">
                <span class="invitee-add-icon" aria-hidden="true">+</span>
            </button>`
        : '';

    el.inviteeZone.innerHTML = pills + addButton;
}

/**
 * Locks or unlocks the Game Type step based on the current participant count. The step
 * stays visible at all times; it's just dimmed and inert until enough participants are picked.
 * @param {number} [count] - Optional precomputed participant count.
 */
export function updateStepVisibility(count = getParticipantCount()) {
    const el = getElements();
    if (!el.gameTypeStep) return;
    el.gameTypeStep.classList.toggle('step-locked', count < 2);
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
 * Renders one team panel: player rows (with a swap arrow), or clickable swap-candidate
 * rows when this panel is the opposite team of an in-progress swap.
 * @param {string} teamLetter - 'A' or 'B'.
 * @param {string[]} ids - Participant ids assigned to this team.
 * @param {Map<string, {id: string, name: string, colorVar: string}>} byId - Lookup for participant details.
 * @param {{id: string, team: string}|null} swapSource - The in-progress swap source, if any.
 * @returns {string} HTML for the team panel.
 */
function renderTeamPanel(teamLetter, ids, byId, swapSource) {
    const isSwapTarget = !!swapSource && swapSource.team !== teamLetter;

    const rows = ids
        .map((id) => {
            const p = byId.get(id);
            if (!p) return '';

            if (isSwapTarget) {
                return `
                <button type="button" class="team-player-row swap-candidate" data-action="complete-team-swap" data-participant-id="${p.id}" style="--player-color: var(--${p.colorVar})">
                    <span class="team-player-dot"></span>
                    <span class="team-player-name">${p.name}</span>
                </button>`;
            }

            const isSource = !!swapSource && swapSource.id === p.id;
            const isReversed = teamLetter === 'B';
            const arrowSpan = `<span class="team-player-arrow" aria-hidden="true">${ARROW_ICON}</span>`;
            const dotAndName = `<span class="team-player-dot"></span><span class="team-player-name">${p.name}</span>`;
            return `
                <button type="button" class="team-player-row${isSource ? ' swap-source' : ''}${isReversed ? ' reversed' : ''}" data-action="initiate-team-swap" data-participant-id="${p.id}" data-team="${teamLetter}" aria-label="Swap ${p.name}" style="--player-color: var(--${p.colorVar})">
                    ${isReversed ? arrowSpan + dotAndName : dotAndName + arrowSpan}
                </button>`;
        })
        .join('');

    return `
        <div class="team-panel${isSwapTarget ? ' swap-target' : ''}" data-team="${teamLetter}">
            <div class="team-panel-title">Team ${teamLetter}</div>
            <div class="team-panel-players">${rows}</div>
        </div>`;
}

/**
 * Renders the Teams sub-section (a continuation of Step 2, not its own numbered step):
 * shown only when a Teams game type ('2v2' | '3v3') is selected. Reflects the current team
 * assignments and any in-progress swap (dimmed scrim + question).
 */
export function renderTeams() {
    const el = getElements();
    if (!el.teamsStep) return;

    const selectedGameType = stateStore.get('selectedGameType');
    if (!isTeamsType(selectedGameType)) {
        el.teamsStep.style.display = 'none';
        el.teamSwapScrim.style.display = 'none';
        return;
    }

    el.teamsStep.style.display = 'block';

    const teamAssignments = stateStore.get('teamAssignments');
    if (!teamAssignments) {
        el.teamsGrid.innerHTML = '';
        return;
    }

    const swapSource = stateStore.get('teamSwapSource');
    const byId = new Map(getCheckedParticipants().map((p) => [p.id, p]));

    el.teamsGrid.innerHTML =
        renderTeamPanel('A', teamAssignments.teamA, byId, swapSource) +
        renderTeamPanel('B', teamAssignments.teamB, byId, swapSource);

    el.randomizeTeamsBtn.style.display = swapSource ? 'none' : 'block';
    el.teamSwapQuestion.style.display = swapSource ? 'block' : 'none';
    el.teamSwapQuestion.classList.toggle('swap-active', !!swapSource);
    el.teamSwapScrim.style.display = swapSource ? 'block' : 'none';
}

const DRAFT_COUNT_OPTIONS = [2, 3, 4, 5];

/**
 * Locks or unlocks Step 3 (Roll Mode): stays visible at all times; dimmed and inert until
 * a game type has been selected.
 */
export function updateRollModeVisibility() {
    const el = getElements();
    if (!el.rollModeStep) return;
    el.rollModeStep.classList.toggle('step-locked', !stateStore.get('selectedGameType'));
}

/**
 * Renders Step 3 (Roll Mode): Quick Roll / Draft Roll pills, plus the "Options per player"
 * candidate-count picker (2-5) shown only while Draft Roll is selected. Reflects and updates
 * the real draftModeEnabled/draftCount used by the existing SINGLE ROLL/DRAFT ROLL buttons.
 */
export function renderRollMode() {
    const el = getElements();
    if (!el.rollModeGrid) return;

    const rollModeChosen = stateStore.get('rollModeChosen');
    const draftModeEnabled = stateStore.get('draftModeEnabled');
    const draftCountChosen = stateStore.get('draftCountChosen');
    const draftCount = stateStore.get('draftCount');
    const locked = !stateStore.get('selectedGameType');

    el.rollModeGrid.innerHTML = `
        <button type="button" class="roll-mode-btn${rollModeChosen && !draftModeEnabled ? ' active' : ''}" data-action="select-roll-mode" data-mode="quick" ${locked ? 'disabled' : ''}>
            <span class="roll-mode-title">Quick Roll</span>
            <span class="roll-mode-subtitle">1 hero per player</span>
        </button>
        <button type="button" class="roll-mode-btn${rollModeChosen && draftModeEnabled ? ' active' : ''}" data-action="select-roll-mode" data-mode="draft" ${locked ? 'disabled' : ''}>
            <span class="roll-mode-title">Draft Roll</span>
            <span class="roll-mode-subtitle">Pick 1 of N options</span>
        </button>`;

    el.draftCountSection.style.display = rollModeChosen && draftModeEnabled ? 'block' : 'none';
    el.draftCountGrid.innerHTML = DRAFT_COUNT_OPTIONS.map(
        (n) => `
        <button type="button" class="draft-count-btn${draftCountChosen && draftCount === n ? ' active' : ''}" data-action="select-draft-count" data-count="${n}">${n}</button>`,
    ).join('');
}

/**
 * Renders Step 4 (Roll): a single button showing the selected game type's icon, short name,
 * and current participant count — the sole trigger for actually starting a roll. Stays visible
 * at all times; dimmed and disabled until both a game type and a roll mode have been chosen.
 */
export function renderRollButton() {
    const el = getElements();
    if (!el.rollStep || !el.rollFinalBtn) return;

    const selectedGameType = stateStore.get('selectedGameType');
    const rollModeChosen = stateStore.get('rollModeChosen');
    const draftModeEnabled = stateStore.get('draftModeEnabled');
    const draftCountChosen = stateStore.get('draftCountChosen');
    const draftReady = !draftModeEnabled || draftCountChosen;
    el.rollStep.classList.toggle('step-locked', !selectedGameType || !rollModeChosen || !draftReady);

    if (!selectedGameType) {
        el.rollFinalBtn.disabled = true;
        el.rollFinalBtn.innerHTML = `<span>ROLL &middot; Complete the steps above</span>`;
        return;
    }

    if (!rollModeChosen || !draftReady) {
        el.rollFinalBtn.disabled = true;
        el.rollFinalBtn.innerHTML = `<span>ROLL &middot; Finish selecting your options above</span>`;
        return;
    }

    el.rollFinalBtn.disabled = false;
    const icon = isTeamsType(selectedGameType) ? ICONS.teams : ICONS[selectedGameType];
    const shortLabel = GAME_TYPE_SHORT_LABEL[selectedGameType];
    const count = getParticipantCount();

    el.rollFinalBtn.innerHTML = `${icon}<span>ROLL &middot; ${shortLabel} &middot; ${count} PLAYER${count === 1 ? '' : 'S'}</span>`;
}

/**
 * Hides the Steps 1-4 setup panels (and the team swap scrim) when entering the roll phase.
 */
export function hideSetupPanels() {
    const setupZone = document.getElementById('randomizer-setup');
    if (setupZone) setupZone.style.display = 'none';
    const scrim = document.getElementById('team-swap-scrim');
    if (scrim) scrim.style.display = 'none';
}

/**
 * Shows the Steps 1-4 setup panels again (on cancel, or after a session is locked in),
 * hiding the results-screen title along with the results it belongs to.
 */
export function showSetupPanels() {
    const setupZone = document.getElementById('randomizer-setup');
    if (setupZone) setupZone.style.display = 'block';
    const resultsTitle = document.getElementById('results-title');
    if (resultsTitle) resultsTitle.style.display = 'none';
}

const RESULTS_TITLES = {
    draft: 'ROLL &middot; DRAFT',
    confirmation: 'ROLL &middot; CONFIRMATION',
};

/**
 * Shows the results-screen title: "ROLL · DRAFT" while a player is picking a draft candidate,
 * "ROLL · CONFIRMATION" once heroes are revealed (Quick Roll) or all draft picks are finalized.
 * @param {'draft'|'confirmation'} mode
 */
export function showResultsTitle(mode) {
    const el = document.getElementById('results-title');
    if (!el) return;
    el.innerHTML = RESULTS_TITLES[mode] || '';
    el.style.display = 'block';
}

/**
 * Renders the full Randomizer setup UI (invitees + game type step + teams step + roll mode + roll button).
 */
export function renderRandomizerSetup() {
    renderInvitees();
    updateStepVisibility();
    renderGameTypeOptions();
    renderTeams();
    updateRollModeVisibility();
    renderRollMode();
    renderRollButton();
}
