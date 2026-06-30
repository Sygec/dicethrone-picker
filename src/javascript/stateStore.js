/**
 * @fileoverview Reactive State Store for the Dice Throne Picker application.
 * @module stateStore
 */

// Central state object
const state = {
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

    // Left Filter Drawer States
    activeFilterDataHistories: new Set(),
    activeFilterPlayers: new Set(),
    activeFilterComplexities: new Set(),
    activeFilterGroups: new Set(),

    stagedFilterDataHistories: new Set(),
    stagedFilterPlayers: new Set(),
    stagedFilterComplexities: new Set(),
    stagedFilterGroups: new Set(),
    activeOwnershipFilter: "owned",
    stagedOwnershipFilter: "owned",

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
    gamesHistoryStyle: "gorgeous",
};

// Queue of registered listeners
const listeners = new Set();

/**
 * Subscribes a listener callback to state updates.
 * @param {Function} listener - Callback function in format (changedKey, value, state).
 * @returns {Function} Function to unsubscribe the listener.
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Notifies all registered listeners of a change in state.
 * @param {string} changedKey - The state property that changed.
 * @param {*} value - The new value of the state property.
 */
function notify(changedKey, value) {
    listeners.forEach(listener => {
        try {
            listener(changedKey, value, state);
        } catch (e) {
            console.error("Error in stateStore listener:", e);
        }
    });
}

/**
 * Retrieves a state property value.
 * @param {string} key - State property key.
 * @returns {*} State property value.
 */
export function get(key) {
    return state[key];
}

/**
 * Sets a state property value and triggers notifications.
 * @param {string} key - State property key.
 * @param {*} value - The new value to assign.
 */
export function set(key, value) {
    state[key] = value;
    notify(key, value);
}

/**
 * Utility helper to mutate a Set state property and notify listeners.
 * Supported actions: 'add', 'delete', 'clear', 'toggle'.
 * @param {string} key - State property key pointing to a Set.
 * @param {string} action - Mutation action ('add', 'delete', 'clear', 'toggle').
 * @param {*} [value] - Item to add, delete, or toggle.
 */
export function updateSet(key, action, value) {
    const setInstance = state[key];
    if (!(setInstance instanceof Set)) {
        console.warn(`stateStore: ${key} is not an instance of Set.`);
        return;
    }

    if (action === "add") {
        setInstance.add(value);
    } else if (action === "delete") {
        setInstance.delete(value);
    } else if (action === "clear") {
        setInstance.clear();
    } else if (action === "toggle") {
        if (setInstance.has(value)) {
            setInstance.delete(value);
        } else {
            setInstance.add(value);
        }
    }

    notify(key, setInstance);
}

/**
 * Utility helper to mutate an Object state property (like scrambleIntervals) and notify listeners.
 * @param {string} key - State property key pointing to an Object.
 * @param {string} propKey - Subproperty key.
 * @param {*} value - Value to set, or undefined to delete the subproperty.
 */
export function updateObject(key, propKey, value) {
    const objInstance = state[key];
    if (typeof objInstance !== "object" || objInstance === null) {
        console.warn(`stateStore: ${key} is not an object.`);
        return;
    }

    if (value === undefined) {
        delete objInstance[propKey];
    } else {
        objInstance[propKey] = value;
    }

    notify(key, objInstance);
}
