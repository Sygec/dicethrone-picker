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

export const ICONS = {
    duel: `<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M769-88 645-212l-88 88-43-43q-17-17-17-42t17-42l199-199q17-17 42-17t42 17l43 43-88 88 123 124q9 9 9 21t-9 21l-64 65q-9 9-21 9t-21-9Zm111-636L427-271l19 20q17 17 17 42t-17 42l-43 43-88-88L191-88q-9 9-21 9t-21-9l-65-65q-9-9-9-21t9-21l124-124-88-88 43-43q17-17 42-17t42 17l20 19 453-453h160v160ZM278-526 80-724v-160h160l198 198-160 160Z"/></svg>`,
    teams: `<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM250-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42Zm426 0q-42 42-108 42-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108q0 66-42 108Z"/></svg>`,
    ffa: `<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M420-340h120l-60-120-60 120Zm-79.91-120q28.91 0 49.41-20.59 20.5-20.59 20.5-49.5t-20.59-49.41q-20.59-20.5-49.5-20.5t-49.41 20.59q-20.5 20.59-20.5 49.5t20.59 49.41q20.59 20.5 49.5 20.5Zm280 0q28.91 0 49.41-20.59 20.5-20.59 20.5-49.5t-20.59-49.41q-20.59-20.5-49.5-20.5t-49.41 20.59q-20.5 20.59-20.5 49.5t20.59 49.41q20.59 20.5 49.5 20.5ZM240-80v-170q-36-16-65.5-43T124-355.5Q103-391 91.5-433T80-520q0-158 112-259t288-101q176 0 288 101t112 259q0 45-11.5 87T836-355.5Q815-320 785.5-293T720-250v170H600v-120h-60v120H420v-120h-60v120H240Z"/></svg>`,
    koth: `<svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor"><path d="M203-160v-60h554v60H203Zm-1-144-53-334q-5 2-9.5 2.5t-9.5.5q-21 0-35.5-14.5T80-685q0-21 14.5-36t35.5-15q21 0 36 15t15 36q0 8-2.5 16t-7.5 14l148 66 141-194q-14-6-22.5-18.5T429-830q0-21 15-35.5t36-14.5q21 0 36 14.5t15 35.5q0 16-8.5 28.5T500-783l141 194 148-66q-5-6-7.5-14t-2.5-16q0-21 15-36t35-15q21 0 36 15t15 36q0 21-15 35.5T829-635q-5 0-9-1t-9-3l-53 335H202Z"/></svg>`,
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
