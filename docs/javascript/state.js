/**
 * @fileoverview Application state module holding global state properties and binding them to the window object for legacy support.
 * @module state
 */

/**
 * The global application state store containing current game data, filter settings, user sessions, and randomized selections.
 * @type {Object}
 * @property {string[]} NAMES - Array of player names.
 * @property {Object[]} characters - All heroes loaded from the database.
 * @property {Object[]} games - Game history log database entries.
 * @property {Object[]} players - Player configurations and profiles.
 * @property {Object[]} groups - Group/collection filters configurations.
 * @property {Object[]} authUsers - List of authorized users (admin view).
 * @property {Object|null} cachedChangelog - Cached changelog JSON object.
 * @property {Set<number>} activeLevels - Currently active hero complexity levels.
 * @property {Set<string>} activeGroups - Currently active collection groups.
 * @property {number|null} selectedGamePlayerIndex - Currently selected player index filtering game history.
 * @property {Set<string>} expandedGameIds - IDs of game records expanded in history view.
 * @property {string} currentSort - Current sorting key for character grid.
 * @property {boolean} sortAsc - Direction of sort (true = ascending).
 * @property {number} currentSortPlayerIndex - Player index weight context used when sorting by probability.
 * @property {number} editIndex - Index of the character currently being edited (-1 if none).
 * @property {number[]} activePlayerIndices - Active playing user index settings.
 * @property {string} currentDrawerMode - Active drawer view configuration.
 * @property {string} stagedSort - Staged character sorting key in drawer.
 * @property {boolean} stagedSortAsc - Staged sorting direction.
 * @property {number} stagedSortPlayerIndex - Staged player index context for sorting.
 * @property {Set<number>} stagedLevels - Staged active levels.
 * @property {Set<string>} stagedGroups - Staged active groups.
 * @property {number[]} stagedPlayerIndices - Staged active player indices.
 * @property {boolean} stagedUseHistorical - Staged toggle for historical weight formulas.
 * @property {boolean} dbUseHistorical - Active toggle for historical weight formulas.
 * @property {Set<string>} activeFilterDataHistories - Active left filter drawer categories.
 * @property {Set<string>} activeFilterPlayers - Active left filter players.
 * @property {Set<string>} activeFilterComplexities - Active left filter complexities.
 * @property {Set<string>} activeFilterGroups - Active left filter groups.
 * @property {Set<string>} stagedFilterDataHistories - Staged left drawer data histories filter.
 * @property {Set<string>} stagedFilterPlayers - Staged left drawer players filter.
 * @property {Set<string>} stagedFilterComplexities - Staged left drawer complexities filter.
 * @property {Set<string>} stagedFilterGroups - Staged left drawer groups filter.
 * @property {boolean} gamesWinnerOnly - Toggle to only display winning game history.
 * @property {boolean} gamesUseHistorical - Toggle to filter history by historical games.
 * @property {number|null} stagedSelectedGamePlayerIndex - Staged history player filter index.
 * @property {boolean} stagedGamesWinnerOnly - Staged history winner-only toggle.
 * @property {boolean} stagedGamesUseHistorical - Staged history historical-only toggle.
 * @property {Object|null} currentUser - Session data of currently authenticated user.
 * @property {number} loggedInPlayerIndex - Player index corresponding to logged-in player profile.
 * @property {boolean} isRollActive - Flag indicating if roll animation is running.
 * @property {Set<string>} expandedCollectionGroups - Collection group panels currently expanded in UI.
 * @property {Object} scrambleIntervals - Intervals for active player hero slot scramble animations.
 * @property {number|null} activeSelectPlayerIdx - Player index currently undergoing manual selection.
 * @property {string} modalSortMode - Sort criteria applied to the manual selection dialog.
 * @property {boolean} draftModeEnabled - Status of active draft pick rules.
 * @property {number} draftCount - Amount of candidate choices for drafts.
 * @property {Set<string>} bannedHeroIds - Banned heroes excluded from draft pools.
 * @property {boolean} stagedDraftModeEnabled - Staged draft mode state.
 * @property {number} stagedDraftCount - Staged candidate choices count.
 * @property {Set<string>} stagedBannedHeroIds - Staged banned hero IDs.
 * @property {string} stagedBanSearchQuery - Query string for staging bans.
 * @property {string} stagedRollSettingsTab - Active settings tab.
 * @property {Object[]} activeDraftOrder - Sequential player drafting order.
 * @property {number} activeDraftStep - Current step index in the draft phase.
 * @property {Object} selectedDraftHeroes - Maps player index to their draft choice.
 * @property {Object} activeDraftCandidates - Maps player index to candidate hero options.
 * @property {Object} draftWheelAngles - Maps player index to wheel rotation angle.
 * @property {Object} draftWheelFrontCardIndices - Maps player index to selected front card index.
 */
export const state = {
    NAMES: [],
    characters: [],
    games: [],
    players: [],
    groups: [],
    authUsers: [],
    cachedChangelog: null,
    activeLevels: new Set([1, 2, 3, 4, 5, 6]),
    activeGroups: new Set(),
    selectedGamePlayerIndex: null,
    expandedGameIds: new Set(),
    currentSort: "name",
    sortAsc: true,
    currentSortPlayerIndex: 0,
    editIndex: -1,
    activePlayerIndices: [0, 1, 2, 3],
    currentDrawerMode: "sort-filter",
    stagedSort: "",
    stagedSortAsc: true,
    stagedSortPlayerIndex: 0,
    stagedLevels: new Set(),
    stagedGroups: new Set(),
    stagedPlayerIndices: [],
    stagedUseHistorical: true,
    dbUseHistorical: true,

    // New Left Filter Drawer States
    activeFilterDataHistories: new Set(),
    activeFilterPlayers: new Set(),
    activeFilterComplexities: new Set(),
    activeFilterGroups: new Set(),

    stagedFilterDataHistories: new Set(),
    stagedFilterPlayers: new Set(),
    stagedFilterComplexities: new Set(),
    stagedFilterGroups: new Set(),

    // Games History Filters State
    gamesWinnerOnly: false,
    gamesUseHistorical: true,
    stagedSelectedGamePlayerIndex: null,
    stagedGamesWinnerOnly: false,
    stagedGamesUseHistorical: true,
    currentUser: null,
    loggedInPlayerIndex: -1,
    isRollActive: false,
    expandedCollectionGroups: new Set(),
    scrambleIntervals: {},
    activeSelectPlayerIdx: null,
    modalSortMode: "name",

    // Draft & Ban Mode State
    draftModeEnabled: false,
    draftCount: 3,
    bannedHeroIds: new Set(),

    stagedDraftModeEnabled: false,
    stagedDraftCount: 3,
    stagedBannedHeroIds: new Set(),
    stagedBanSearchQuery: "",
    stagedRollSettingsTab: "draft",

    activeDraftOrder: [],
    activeDraftStep: 0,
    selectedDraftHeroes: {}, // pIdx -> hero object
    activeDraftCandidates: {}, // pIdx -> array of candidate heroes
    draftWheelAngles: {}, // pIdx -> cumulative rotation angle
    draftWheelFrontCardIndices: {}, // pIdx -> index of the card physically in front
};

// Bind states to window for backward compatibility with existing codebase variable references
Object.keys(state).forEach(key => {
    Object.defineProperty(window, key, {
        get() { return state[key]; },
        set(val) { state[key] = val; },
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

