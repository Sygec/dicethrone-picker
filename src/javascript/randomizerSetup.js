/**
 * @fileoverview Logic for the Randomizer setup flow: player/invitee selection (Step 1)
 * and game type selection (Step 2).
 * @module randomizerSetup
 */
import * as stateStore from './stateStore.js';
import * as randomizerSetupView from './views/randomizerSetupView.js';

const MAX_INVITEES = 2;

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
 * Fills the given invitee slot (0-based, up to MAX_INVITEES) and re-renders.
 * @param {number} slot - Index of the empty invitee slot that was clicked.
 */
export function addInvitee(slot) {
    const invitees = stateStore.get('invitees');
    if (slot < 0 || slot >= MAX_INVITEES || invitees[slot]) return;

    const next = [...invitees];
    next[slot] = { id: `invitee-${Date.now()}`, name: `Invitee ${slot + 1}` };
    stateStore.set('invitees', next);
    randomizerSetupView.renderInvitees();
    onSetupChange();
}

/**
 * Removes an invitee (reverting its slot back to an empty "+" placeholder) and re-renders.
 * @param {string} id - The invitee's id.
 */
export function removeInvitee(id) {
    const invitees = stateStore.get('invitees');
    const next = invitees.map((inv) => (inv && inv.id === id ? undefined : inv));
    stateStore.set('invitees', next);
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
    randomizerSetupView.renderGameTypeOptions();
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

    randomizerSetupView.updateStepVisibility(count);
    randomizerSetupView.renderGameTypeOptions();
}
