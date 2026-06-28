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

