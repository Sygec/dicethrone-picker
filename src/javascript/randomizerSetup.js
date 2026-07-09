/**
 * @fileoverview Logic for the Randomizer setup flow: player/invitee selection (Step 1),
 * game type selection (Step 2), and team assignment (Step 3, Teams game types only).
 * @module randomizerSetup
 */
import * as stateStore from './stateStore.js';
import * as randomizerSetupView from './views/randomizerSetupView.js';
import { MAX_WEIGHTED_PLAYERS } from './utils.js';

const MAX_PARTICIPANTS = 6; // no game type supports more than 6 total; also caps invitee additions

export function isTeamsType(type) {
    return type === '2v2' || type === '3v3';
}

/**
 * Counts checked tracked players and checked invitees currently in the DOM.
 * @returns {number} Total selected participants.
 */
export function getParticipantCount() {
    return document.querySelectorAll(
        '#player-toggle-zone-top input:checked, #invitee-zone input:checked',
    ).length;
}

/**
 * Whether another invitee can still be added (total participants below the 6-player ceiling
 * shared by every game type). Computed from checked tracked players (DOM) + the invitees
 * array length (state) rather than the invitee-zone DOM, since this is called while that
 * zone is mid-render and wouldn't yet reflect an invitee just added to state.
 * @returns {boolean}
 */
export function canAddMoreInvitees() {
    const trackedCheckedCount = document.querySelectorAll('#player-toggle-zone-top input:checked').length;
    return trackedCheckedCount + stateStore.get('invitees').length < MAX_PARTICIPANTS;
}

/**
 * Builds the list of currently checked participants (tracked players + invitees),
 * each with an id, display name, and CSS player-color variable name.
 * @returns {{id: string, name: string, colorVar: string}[]}
 */
export function getCheckedParticipants() {
    const players = stateStore.get('players').slice(0, 4);
    const invitees = stateStore.get('invitees');
    const participants = [];

    players.forEach((p, i) => {
        const checkbox = document.getElementById(`use${i}`);
        if (checkbox?.checked) participants.push({ id: p.id, name: p.name, colorVar: p.id });
    });

    invitees.forEach((inv) => {
        const checkbox = document.querySelector(`#invitee-zone input[data-invitee-id="${inv.id}"]`);
        if (checkbox?.checked) participants.push({ id: inv.id, name: inv.name, colorVar: 'p5' });
    });

    return participants;
}

/**
 * Builds the roll-ready participant list: tracked players keep their real index (0 to
 * MAX_WEIGHTED_PLAYERS-1, used for weighted hero selection and stats), while invitees get
 * virtual indices starting at MAX_WEIGHTED_PLAYERS so they naturally fall into the existing
 * "unweighted random pick, no stats" code path.
 * @returns {{pIdx: number, name: string, colorVar: string, isInvitee: boolean}[]}
 */
export function getRollParticipants() {
    const players = stateStore.get('players').slice(0, MAX_WEIGHTED_PLAYERS);
    const invitees = stateStore.get('invitees');
    const participants = [];

    players.forEach((p, i) => {
        const checkbox = document.getElementById(`use${i}`);
        if (checkbox?.checked) {
            participants.push({ pIdx: i, name: p.name, colorVar: p.id, isInvitee: false });
        }
    });

    let inviteeOffset = 0;
    invitees.forEach((inv) => {
        const checkbox = document.querySelector(`#invitee-zone input[data-invitee-id="${inv.id}"]`);
        if (checkbox?.checked) {
            participants.push({
                pIdx: MAX_WEIGHTED_PLAYERS + inviteeOffset,
                name: inv.name,
                colorVar: 'p5',
                isInvitee: true,
            });
            inviteeOffset++;
        }
    });

    return participants;
}

/**
 * Maps each checked participant's setup-time id (tracked players already use their real
 * `players.id`, e.g. `p1`; invitees use an ad-hoc `invitee-<timestamp>` id) to the actual
 * `game_players.player_id` they'll be saved under (`p1`-`p4` for tracked players, `p5`/`p6`
 * for invitees). Used to resolve `teamAssignments` entries when saving a Teams game.
 * @returns {Object<string, string>}
 */
export function getParticipantIdToPlayerIdMap() {
    const checked = getCheckedParticipants();
    const rollParticipants = getRollParticipants();
    const map = {};
    checked.forEach((p, i) => {
        map[p.id] = `p${rollParticipants[i].pIdx + 1}`;
    });
    return map;
}

/**
 * Computes which game types are available for a given participant count.
 * @param {number} count - Total selected participants.
 * @returns {{duel: boolean, teams: boolean, ffa: boolean, koth: boolean, teamsValue: string}}
 */
export function getGameTypeAvailability(count) {
    const teamsValue = count === 6 ? '3v3' : '2v2';
    return {
        duel: count === 2,
        teams: count === 4 || count === 6,
        ffa: count >= 3 && count <= 6,
        koth: count >= 3 && count <= 6,
        teamsValue,
    };
}

/**
 * Appends a new invitee (up to MAX_PARTICIPANTS total participants) and re-renders.
 */
export function addInvitee() {
    if (!canAddMoreInvitees()) return;

    const invitees = stateStore.get('invitees');
    const next = [...invitees, { id: `invitee-${Date.now()}`, name: `Invitee ${invitees.length + 1}` }];
    stateStore.set('invitees', next);
    randomizerSetupView.renderInvitees();
    onSetupChange();
}

/**
 * Removes an invitee and shifts/renumbers the remaining ones so names stay contiguous
 * (e.g. removing "Invitee 2" out of 3 turns "Invitee 3" into "Invitee 2").
 * @param {string} id - The invitee's id.
 */
export function removeInvitee(id) {
    const invitees = stateStore.get('invitees');
    const next = invitees.filter((inv) => inv.id !== id).map((inv, i) => ({ ...inv, name: `Invitee ${i + 1}` }));
    stateStore.set('invitees', next);
    randomizerSetupView.renderInvitees();
    onSetupChange();
}

/**
 * Clears all invitees back to empty "+" placeholders. Invitees are ad-hoc/session-only
 * (no weighting, no history), so unlike tracked players they don't carry over once a roll
 * is cancelled or a session is locked in.
 */
export function resetInvitees() {
    stateStore.set('invitees', []);
    randomizerSetupView.renderInvitees();
    onSetupChange();
}

/**
 * Fully resets the setup flow (invitees, game type, team assignments, roll mode) back to its
 * pristine first-load state and re-renders every step. Used when a roll is cancelled from the
 * confirmation screen, since cancelling means starting over, not resuming where setup left off.
 * Tracked player checkboxes are reset separately by the caller (owned by the auth/header view).
 */
export function resetSetup() {
    stateStore.set('invitees', []);
    stateStore.set('selectedGameType', null);
    stateStore.set('teamAssignments', null);
    stateStore.set('teamSwapSource', null);
    stateStore.set('rollModeChosen', false);
    stateStore.set('draftCountChosen', false);

    randomizerSetupView.renderInvitees();
    onSetupChange();
}

/**
 * Selects a game type if currently available; no-op otherwise.
 * @param {string} type - One of 'duel' | '2v2' | '3v3' | 'ffa' | 'koth'.
 */
export function selectGameType(type) {
    if (!type) return;
    const availability = getGameTypeAvailability(getParticipantCount());
    const isAvailable =
        (type === 'duel' && availability.duel) ||
        (type === availability.teamsValue && availability.teams) ||
        (type === 'ffa' && availability.ffa) ||
        (type === 'koth' && availability.koth);

    if (!isAvailable) return;

    stateStore.set('selectedGameType', type);
    stateStore.set('teamSwapSource', null);
    if (isTeamsType(type)) {
        randomizeTeams();
    } else {
        stateStore.set('teamAssignments', null);
    }

    randomizerSetupView.renderGameTypeOptions();
    randomizerSetupView.renderTeams();
    randomizerSetupView.updateRollModeVisibility();
    randomizerSetupView.renderRollMode();
    randomizerSetupView.renderRollButton();
}

/**
 * Recomputes Step 2 visibility and game type availability whenever players/invitees change.
 */
export function onSetupChange() {
    const count = getParticipantCount();
    const availability = getGameTypeAvailability(count);
    const selectedGameType = stateStore.get('selectedGameType');

    const stillValid =
        (selectedGameType === 'duel' && availability.duel) ||
        (selectedGameType === availability.teamsValue && availability.teams) ||
        (selectedGameType === 'ffa' && availability.ffa) ||
        (selectedGameType === 'koth' && availability.koth);

    if (selectedGameType && !stillValid) {
        stateStore.set('selectedGameType', null);
    }

    const currentType = stateStore.get('selectedGameType');
    stateStore.set('teamSwapSource', null);
    if (isTeamsType(currentType)) {
        randomizeTeams();
    } else {
        stateStore.set('teamAssignments', null);
    }

    randomizerSetupView.updateStepVisibility(count);
    randomizerSetupView.renderGameTypeOptions();
    randomizerSetupView.renderTeams();
    randomizerSetupView.updateRollModeVisibility();
    randomizerSetupView.renderRollMode();
    randomizerSetupView.renderRollButton();
}

/**
 * Selects Quick Roll (1 hero per player) or Draft Roll (pick 1 of N), reflected directly in
 * the real draftModeEnabled flag used by the existing roll buttons, and persists it.
 * @param {'quick'|'draft'} mode
 */
export function selectRollMode(mode) {
    const draftModeEnabled = mode === 'draft';
    stateStore.set('rollModeChosen', true);
    stateStore.set('draftModeEnabled', draftModeEnabled);
    localStorage.setItem('draftModeEnabled', draftModeEnabled);
    randomizerSetupView.renderRollMode();
    randomizerSetupView.renderRollButton();
}

/**
 * Selects how many hero candidates are offered per player in Draft Roll, reflected directly
 * in the real draftCount used by the existing draft logic, and persists it.
 * @param {number} count - One of 2, 3, 4, 5.
 */
export function selectDraftCount(count) {
    stateStore.set('draftCount', count);
    stateStore.set('draftCountChosen', true);
    localStorage.setItem('draftCount', count);
    randomizerSetupView.renderRollMode();
    randomizerSetupView.renderRollButton();
}

/**
 * Randomly splits the currently checked participants into Team A / Team B and re-renders.
 */
export function randomizeTeams() {
    const participants = getCheckedParticipants();
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const half = shuffled.length / 2;

    stateStore.set('teamAssignments', {
        teamA: shuffled.slice(0, half).map((p) => p.id),
        teamB: shuffled.slice(half).map((p) => p.id),
    });
    stateStore.set('teamSwapSource', null);
    randomizerSetupView.renderTeams();
}

/**
 * Begins a team-swap: the given participant is the one whose team the user wants to change.
 * @param {string} participantId - The participant who was clicked.
 * @param {string} team - The team ('A' | 'B') that participant is currently on.
 */
export function startTeamSwap(participantId, team) {
    stateStore.set('teamSwapSource', { id: participantId, team });
    randomizerSetupView.renderTeams();
}

/**
 * Cancels an in-progress team swap without changing any assignments.
 */
export function cancelTeamSwap() {
    stateStore.set('teamSwapSource', null);
    randomizerSetupView.renderTeams();
}

/**
 * Completes a team swap: exchanges the in-progress swap source with the given opposing participant.
 * @param {string} targetParticipantId - The opposing-team participant clicked to swap with.
 */
export function completeTeamSwap(targetParticipantId) {
    const swapSource = stateStore.get('teamSwapSource');
    const teamAssignments = stateStore.get('teamAssignments');
    if (!swapSource || !teamAssignments) return;

    const { teamA, teamB } = teamAssignments;
    const sourceTeam = swapSource.team === 'A' ? teamA : teamB;
    const targetTeam = swapSource.team === 'A' ? teamB : teamA;

    const sourceIdx = sourceTeam.indexOf(swapSource.id);
    const targetIdx = targetTeam.indexOf(targetParticipantId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    sourceTeam[sourceIdx] = targetParticipantId;
    targetTeam[targetIdx] = swapSource.id;

    stateStore.set('teamAssignments', { teamA, teamB });
    stateStore.set('teamSwapSource', null);
    randomizerSetupView.renderTeams();
}
