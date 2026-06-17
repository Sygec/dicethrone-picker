/**
 * @fileoverview Legacy state wrapper mapping global window property accesses to stateStore.js.
 * @module state
 */

import * as stateStore from './stateStore.js';

// List of all keys defined in stateStore
const stateKeys = [
    "NAMES",
    "characters",
    "games",
    "players",
    "groups",
    "authUsers",
    "cachedChangelog",
    "activeLevels",
    "activeGroups",
    "selectedGamePlayerIndex",
    "expandedGameIds",
    "currentSort",
    "sortAsc",
    "currentSortPlayerIndex",
    "editIndex",
    "activePlayerIndices",
    "currentDrawerMode",
    "stagedSort",
    "stagedSortAsc",
    "stagedSortPlayerIndex",
    "stagedLevels",
    "stagedGroups",
    "stagedPlayerIndices",
    "stagedUseHistorical",
    "dbUseHistorical",
    "activeFilterDataHistories",
    "activeFilterPlayers",
    "activeFilterComplexities",
    "activeFilterGroups",
    "stagedFilterDataHistories",
    "stagedFilterPlayers",
    "stagedFilterComplexities",
    "stagedFilterGroups",
    "gamesWinnerOnly",
    "gamesUseHistorical",
    "stagedSelectedGamePlayerIndex",
    "stagedGamesWinnerOnly",
    "stagedGamesUseHistorical",
    "currentUser",
    "loggedInPlayerIndex",
    "isRollActive",
    "expandedCollectionGroups",
    "scrambleIntervals",
    "activeSelectPlayerIdx",
    "modalSortMode",
    "draftModeEnabled",
    "draftCount",
    "bannedHeroIds",
    "stagedDraftModeEnabled",
    "stagedDraftCount",
    "stagedBannedHeroIds",
    "stagedBanSearchQuery",
    "stagedRollSettingsTab",
    "activeDraftOrder",
    "activeDraftStep",
    "selectedDraftHeroes",
    "activeDraftCandidates",
    "draftWheelAngles",
    "draftWheelFrontCardIndices"
];

// Bind states to window for backward compatibility with existing codebase variable references
stateKeys.forEach(key => {
    Object.defineProperty(window, key, {
        get() { return stateStore.get(key); },
        set(val) { stateStore.set(key, val); },
        configurable: true
    });
});

// Global Constants & helper functions
/** @type {number} Default weight given to unpicked heroes */
window.DEFAULT_HERO_WEIGHT = 250;

/** @type {number} Penalty weight baseline multiplier */
window.PICKED_HERO_WEIGHT = 20;

/** @type {number} Step increment for manual weight configuration */
window.WEIGHT_INCREMENT = 10;

/**
 * Checks if the currently logged-in user is an administrator.
 * @function isAdmin
 * @returns {boolean} True if the current user is an admin, false otherwise.
 */
window.isAdmin = () => window.currentUser?.app_metadata?.role === "admin";

/**
 * Checks if there is currently an authenticated user logged in.
 * @function isUser
 * @returns {boolean} True if a session is present, false otherwise.
 */
window.isUser = () => !!window.currentUser;
