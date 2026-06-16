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
window.DEFAULT_HERO_WEIGHT = 250;
window.PICKED_HERO_WEIGHT = 20;
window.WEIGHT_INCREMENT = 10;
window.isAdmin = () => window.currentUser?.app_metadata?.role === "admin";
window.isUser = () => !!window.currentUser;
