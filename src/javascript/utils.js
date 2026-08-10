/**
 * @fileoverview Utility helper methods for formatting, string escaping, calculations, color resolution, and weighting formulas.
 * @module utils
 */
import * as stateStore from './stateStore.js';
import { showToast, showConfirm } from './views/notificationView.js';
import * as admin from './admin.js';

// Global override for native alert
window.alert = function(message) {
    const isError = message && (
        message.toLowerCase().includes("error") || 
        message.toLowerCase().includes("failed")
    );
    showToast(message, isError ? "error" : "warning");
};

export { showConfirm };

export const DEFAULT_HERO_WEIGHT = 250;
export const PICKED_HERO_WEIGHT = 20;
export const WEIGHT_INCREMENT = 10;
export const MAX_WEIGHTED_PLAYERS = 4;
export function isAdmin() { return stateStore.get("currentUser")?.app_metadata?.role === "admin"; }
export function isUser() { return !!stateStore.get("currentUser"); }

/**
 * Looks up a participant snapshotted for the current roll (tracked player or invitee) by index.
 * @param {number} pIdx - Virtual player index (0..MAX_WEIGHTED_PLAYERS-1 for tracked players, higher for invitees).
 * @returns {{pIdx: number, name: string, colorVar: string, isInvitee: boolean}|undefined}
 */
export function getRollParticipant(pIdx) {
    return stateStore.get("activeRollParticipants").find((p) => p.pIdx === pIdx);
}


import * as apiService from './services/apiService.js';

/**
 * Generates the WebP portrait image URL for a given hero slug.
 * @function getImgUrl
 * @param {string} slug - The slug identifier of the hero.
 * @returns {string} The complete WebP image URL, or an empty string if no slug is provided.
 */
export const getImgUrl = (slug) =>
    slug ? `https://dice-throne.rulepop.com/heroes/${slug}.webp` : "";
/**
 * Generates the external URL link to the official hero details page.
 * @function getHeroLink
 * @param {string} slug - The slug identifier of the hero.
 * @returns {string} The rulepop external URL.
 */
export const getHeroLink = (slug) => `https://dice-throne.rulepop.com/#hero/${slug}`;
/**
 * Checks if a character is marked as owned.
 * @function isHeroOwned
 * @param {Object} hero - The hero configuration object.
 * @returns {boolean} True if the hero is owned, false otherwise.
 */
export const isHeroOwned = (hero) => !!hero?.is_owned;
/**
 * Safely escapes HTML special characters to prevent cross-site scripting (XSS).
 * @function escapeHtml
 * @param {string} text - The input string to escape.
 * @returns {string} The escaped, HTML-safe string.
 */
export const escapeHtml = (text) => {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
/**
 * Normalizes any RGB or RGBa CSS color string into a HEX color format.
 * @function normalizeColorValue
 * @param {string} color - The CSS color string (HEX, RGB, or RGBa).
 * @returns {string} Normalized HEX color string (e.g. "#ffffff").
 */
export const normalizeColorValue = (color) => {
    if (!color) return "#ffffff";
    color = color.trim();
    if (color.startsWith("#")) return color;
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    }
    return color;
};
/**
 * Resolves a player's color preference, falling back to CSS variables if undefined.
 * @function getPlayerColor
 * @param {Object} player - The player object.
 * @returns {string} The HEX color string resolved for the player.
 */
export const getPlayerColor = (player) => {
    if (player?.player_color) return normalizeColorValue(player.player_color);
    const rootColor = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${player?.id}`)
        .trim();
    return normalizeColorValue(rootColor);
};
/**
 * Sets a dynamic CSS variable on the document root to update player theme colors.
 * @function setPlayerColorVariable
 * @param {string} playerId - The unique ID of the player.
 * @param {string} color - The CSS color value to set.
 */
export const setPlayerColorVariable = (playerId, color) => {
    document.documentElement.style.setProperty(`--${playerId}`, color);
};
/**
 * Calculates the soft probability weight of a hero based on the current play count of a player.
 * Applies the (p * 3 + 1)^2 penalty formula to reduce probability for frequently played heroes.
 * @function getSoftWeight
 * @param {Object} hero - The hero object containing baseline weights and play counters.
 * @param {number} userIndex - The index of the player to retrieve the play count and weight context for.
 * @returns {number} The adjusted soft weight value.
 */
export function getSoftWeight(hero, userIndex) {
    const baseWeight = hero.weights[userIndex];
    const plays = hero.playCount[userIndex];

    // Applying the (p*3+1)^2 formula
    const penalty = Math.pow(plays * 3 + 1, 2);
    return baseWeight / penalty;
}
/**
 * Builds the game_players and player_hero_stats payloads for a completed roll:
 * for each character/player pairing, records the game participant row (if picked)
 * and the updated weight (reset to PICKED_HERO_WEIGHT if picked, else incremented).
 * @function buildGameResultsPayload
 * @param {Array<Object>} characters - All hero configs.
 * @param {Map<number, string>} activePicks - Map of player index to picked hero name.
 * @param {Object<string, string>} teamIdByPlayerId - Map of player_id (e.g. "p1") to team id.
 * @param {string} gameId - The id of the created game.
 * @param {string} userId - The id of the user performing the update.
 * @returns {{gameParticipants: Array<Object>, statsUpdates: Array<Object>}}
 */
export function buildGameResultsPayload(characters, activePicks, teamIdByPlayerId, gameId, userId) {
    const gameParticipants = [];
    const statsUpdates = [];

    characters.forEach((char) => {
        activePicks.forEach((playerChoice, pIdx) => {
            if (playerChoice === char.name) {
                gameParticipants.push({
                    game_id: gameId,
                    player_id: `p${pIdx + 1}`,
                    hero_id: char.id,
                    is_winner: null,
                    team_id: teamIdByPlayerId[`p${pIdx + 1}`] || null,
                    last_updated_by: userId,
                });
            }

            // Invitees (pIdx >= MAX_WEIGHTED_PLAYERS) don't get weighted stats tracked.
            if (pIdx >= MAX_WEIGHTED_PLAYERS) return;

            const wasPicked = playerChoice === char.name;
            const newWeight = wasPicked
                ? PICKED_HERO_WEIGHT
                : (char.weights[pIdx] || DEFAULT_HERO_WEIGHT) + WEIGHT_INCREMENT;

            statsUpdates.push({
                hero_id: char.id,
                player_id: `p${pIdx + 1}`,
                weight: newWeight,
                last_updated_by: userId,
            });
        });
    });

    return { gameParticipants, statsUpdates };
}
/**
 * Full display labels for the game types, keyed by the `games.game_type` column.
 * Games logged before the column existed carry `null` and are labelled "Legacy".
 */
export const GAME_TYPE_FULL_LABEL = {
    duel: "1v1 Duel",
    "2v2": "Teams 2v2",
    "3v3": "Teams 3v3",
    ffa: "Free For All",
    koth: "King of the Hill",
};

/** Sentinel used by the game-type filter for rows with a null `game_type`. */
export const LEGACY_GAME_TYPE = "legacy";

/** Trailing windows, in days, backing the History date-range filter. */
const GAME_DATE_RANGE_DAYS = { "30d": 30, "90d": 90, year: 365 };

/**
 * Maps a `game_players.player_id` ('p1'..'p10') to its filter bucket: 0..3 for the four
 * tracked players, and MAX_WEIGHTED_PLAYERS for every invitee slot, which share one bucket.
 * @param {Object} gp - A `game_players` row.
 * @returns {number} Bucket index.
 */
export function getPlayerBucket(gp) {
    const pIdx = parseInt(gp.player_id.substring(1), 10) - 1;
    return pIdx >= MAX_WEIGHTED_PLAYERS ? MAX_WEIGHTED_PLAYERS : pIdx;
}

/**
 * Derives the outcome of a game from its per-player `is_winner` flags, using the same rules
 * the history cards render with: any explicit winner means completed, every row explicitly
 * `false` means a draw, and anything else is still awaiting a result.
 * @param {Object} game - Game record with a `game_players` array.
 * @returns {'completed'|'draw'|'pending'}
 */
export function getGameOutcome(game) {
    const rows = game.game_players || [];
    if (rows.some((gp) => gp.is_winner === true)) return "completed";
    const explicitLosers = rows.filter((gp) => gp.is_winner === false);
    if (explicitLosers.length > 0 && explicitLosers.length === rows.length) return "draw";
    return "pending";
}

/**
 * Tests a game record against the History page's search, filter, and date-range criteria.
 * Every Set is treated as "no constraint" when empty, matching the Heroes page convention.
 *
 * Win/Loss are evaluated relative to the selected players and match nothing when no player
 * is selected — the drawer disables those checkboxes in that state. Historical games carry
 * no reliable outcome data, so they never match an active result filter.
 *
 * @param {Object} game - Game record with `game_players`, `game_type`, `played_at`, `is_historical`.
 * @param {Object} [criteria] - Filter criteria.
 * @param {string} [criteria.searchTerm] - Matched against hero names, player names, and the game-type label.
 * @param {boolean} [criteria.useHistorical] - When false, historical games are excluded outright.
 * @param {Set<number>} [criteria.playerIndices] - Player buckets, see getPlayerBucket.
 * @param {Set<string>} [criteria.results] - Any of 'win' | 'loss' | 'draw' | 'pending'.
 * @param {Set<string>} [criteria.gameTypes] - Game type keys, plus LEGACY_GAME_TYPE for null types.
 * @param {string} [criteria.dateRange] - 'all' | '30d' | '90d' | 'year' (trailing windows).
 * @param {string[]} [criteria.names] - Tracked player display names, indexed by player bucket.
 * @param {Date} [criteria.now] - Reference point for date ranges; defaults to the current time.
 * @returns {boolean} True when the game satisfies every criterion.
 */
export function matchesGameFilters(game, criteria = {}) {
    const {
        searchTerm = "",
        useHistorical = true,
        playerIndices = new Set(),
        results = new Set(),
        gameTypes = new Set(),
        dateRange = "all",
        names = [],
        now = new Date(),
    } = criteria;

    if (!useHistorical && game.is_historical) return false;

    const rows = game.game_players || [];

    const term = searchTerm.trim().toLowerCase();
    if (term) {
        const haystack = [GAME_TYPE_FULL_LABEL[game.game_type] || ""];
        rows.forEach((gp) => {
            haystack.push(gp.heroes?.name || "");
            const pIdx = parseInt(gp.player_id.substring(1), 10) - 1;
            haystack.push(
                pIdx >= MAX_WEIGHTED_PLAYERS
                    ? `Invitee ${pIdx - MAX_WEIGHTED_PLAYERS + 1}`
                    : names[pIdx] || "",
            );
        });
        if (!haystack.some((value) => value.toLowerCase().includes(term))) return false;
    }

    if (playerIndices.size > 0 && !rows.some((gp) => playerIndices.has(getPlayerBucket(gp)))) {
        return false;
    }

    if (gameTypes.size > 0 && !gameTypes.has(game.game_type || LEGACY_GAME_TYPE)) return false;

    if (dateRange !== "all") {
        const days = GAME_DATE_RANGE_DAYS[dateRange];
        const playedAt = parseDateString(game.played_at);
        if (!days || !playedAt) return false;
        if (now.getTime() - playedAt.getTime() > days * 24 * 60 * 60 * 1000) return false;
    }

    if (results.size > 0) {
        if (game.is_historical) return false;

        const outcome = getGameOutcome(game);
        const selectedRows = rows.filter((gp) => playerIndices.has(getPlayerBucket(gp)));
        const matchesResult =
            (results.has("draw") && outcome === "draw") ||
            (results.has("pending") && outcome === "pending") ||
            (results.has("win") && selectedRows.some((gp) => gp.is_winner === true)) ||
            (results.has("loss") && selectedRows.some((gp) => gp.is_winner === false));
        if (!matchesResult) return false;
    }

    return true;
}

/**
 * Returns a sorted copy of the games list. `played_at` descending is always the tiebreaker.
 * @param {Object[]} games - Game records.
 * @param {string} [sortKey] - 'date' | 'type' | 'status' | `w<bucket>` (wins first) | `g<bucket>` (games played first).
 * @param {boolean} [asc] - Sort direction; per key: oldest first, Z-A, completed first, or the rank inverted.
 * @returns {Object[]} A new, sorted array.
 */
export function sortGames(games, sortKey = "date", asc = false) {
    const time = (game) => parseDateString(game.played_at)?.getTime() ?? 0;

    // Every comparator below is written in its ascending orientation, so a descending sort
    // (asc: false) is a plain negation: newest first, Z-A, pending first, wins first.
    const rank = (game) => {
        if (sortKey === "status") return getGameOutcome(game) === "pending" ? 1 : 0;
        const bucket = parseInt(sortKey.substring(1), 10);
        const rows = (game.game_players || []).filter((gp) => getPlayerBucket(gp) === bucket);
        if (sortKey.startsWith("w")) return rows.some((gp) => gp.is_winner === true) ? 1 : 0;
        return rows.length > 0 ? 1 : 0;
    };

    const compareAscending = (a, b) => {
        if (sortKey === "date") return time(a) - time(b);
        if (sortKey === "type") {
            const labelA = GAME_TYPE_FULL_LABEL[a.game_type] || "Legacy";
            const labelB = GAME_TYPE_FULL_LABEL[b.game_type] || "Legacy";
            return labelA.localeCompare(labelB);
        }
        return rank(a) - rank(b);
    };

    return [...games].sort((a, b) => {
        const comparison = compareAscending(a, b);
        if (comparison !== 0) return asc ? comparison : -comparison;
        return time(b) - time(a);
    });
}

/**
 * Determines whether a logged game still has no winner recorded and isn't a draw.
 * @param {Object} game - Game record with a `game_players` array of `{is_winner}`.
 * @returns {boolean} True if the game is in progress and awaiting a result.
 */
export function isGameAwaitingResult(game) {
    const players = game.game_players || [];
    const winners = players.filter((p) => p.is_winner === true);
    if (winners.length > 0) return false;
    const explicitLosers = players.filter((p) => p.is_winner === false);
    const isDraw = explicitLosers.length > 0 && explicitLosers.length === players.length;
    return !isDraw;
}
/**
 * Counts non-historical games that are logged but still awaiting a result.
 * @param {Object[]} games - Game records.
 * @returns {number} Count of games in progress.
 */
export function countGamesAwaitingResult(games) {
    return (games || []).filter((g) => !g.is_historical && isGameAwaitingResult(g)).length;
}
/**
 * Formats the roll probability of a character as a user-friendly percentage string.
 * @function getHeroProbabilityText
 * @param {Object} charData - The hero object.
 * @param {number} pIdx - The player index context.
 * @returns {string} The formatted percentage text (e.g. "12.50%").
 */
export function getHeroProbabilityText(charData, pIdx) {
    if (!charData) return "0.00%";
    const ownedCount = stateStore.get("characters").filter(isHeroOwned).length;
    if (ownedCount === 0) return "0.00%";

    if (pIdx >= MAX_WEIGHTED_PLAYERS) {
        return `${(100 / ownedCount).toFixed(2)}%`;
    }

    let totalWeight = 0;
    stateStore.get("characters")
        .filter(isHeroOwned)
        .forEach((c) => (totalWeight += getSoftWeight(c, pIdx)));

    if (totalWeight === 0) return "0.00%";

    const owned = isHeroOwned(charData);
    const weight = getSoftWeight(charData, pIdx);
    const pct = owned ? ((weight / totalWeight) * 100).toFixed(2) : "0.00";
    return `${pct}%`;
}
/**
 * Handles color picker changes for a player, prompting for confirmation and syncing with Supabase.
 * @function handlePlayerColorChange
 * @async
 * @param {string} playerId - The unique ID of the player.
 * @param {HTMLInputElement} input - The HTML input color element.
 * @returns {Promise<void>}
 */
export async function handlePlayerColorChange(playerId, input) {
    const player = stateStore.get("players").find((p) => p.id === playerId);
    if (!player) return;

    const currentColor = getPlayerColor(player);
    const newColor = normalizeColorValue(input.value);
    if (newColor.toLowerCase() === currentColor.toLowerCase()) return;

    const confirmed = await showConfirm(
        "Change Player Color",
        `Change ${player.name}'s color from ${currentColor} to ${newColor}?`,
    );
    if (!confirmed) {
        input.value = currentColor;
        return;
    }

    const { error } = await apiService.updatePlayerColor(playerId, newColor);

    if (error) {
        alert("Error saving player color: " + error.message);
        input.value = currentColor;
        return;
    }

    const playerIndex = stateStore.get("players").findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
        stateStore.get("players")[playerIndex].player_color = newColor;
    }

    setPlayerColorVariable(playerId, newColor);
    admin.renderPlayersList();
}

/**
 * Parses a date string into a Date object.
 * Supports various formats and adjusts timezone flags if needed.
 * @function parseDateString
 * @param {string} dateString - The raw date string.
 * @returns {Date|null} The parsed Date object, or null if invalid.
 */
export function parseDateString(dateString) {
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
 * Formats a date string into a user-friendly relative elapsed time text.
 * @function getDaysAgoClean
 * @param {string} dateString - The raw date string.
 * @returns {string} The formatted elapsed time (e.g. "today", "yesterday", "3 days ago").
 */
export function getDaysAgoClean(dateString) {
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
 * Evaluates recency of a play and returns a corresponding status indicator emoji.
 * @function getRecencyDot
 * @param {string} lastPlayed - The last played date string.
 * @returns {string} Colored circle emoji indicating recency status.
 */
export function getRecencyDot(lastPlayed) {
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

