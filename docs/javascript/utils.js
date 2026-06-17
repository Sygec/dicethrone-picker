/**
 * @fileoverview Utility helper methods for formatting, string escaping, calculations, color resolution, and weighting formulas.
 * @module utils
 */

import * as apiService from './services/apiService.js';

/**
 * Generates the WebP portrait image URL for a given hero slug.
 * @function getImgUrl
 * @param {string} slug - The slug identifier of the hero.
 * @returns {string} The complete WebP image URL, or an empty string if no slug is provided.
 */
export const getImgUrl = (slug) =>
    slug ? `https://dice-throne.rulepop.com/heroes/${slug}.webp` : "";
window.getImgUrl = getImgUrl;

/**
 * Generates the external URL link to the official hero details page.
 * @function getHeroLink
 * @param {string} slug - The slug identifier of the hero.
 * @returns {string} The rulepop external URL.
 */
export const getHeroLink = (slug) => `https://dice-throne.rulepop.com/#hero/${slug}`;
window.getHeroLink = getHeroLink;

/**
 * Checks if a character is marked as owned.
 * @function isHeroOwned
 * @param {Object} hero - The hero configuration object.
 * @returns {boolean} True if the hero is owned, false otherwise.
 */
export const isHeroOwned = (hero) => !!hero?.is_owned;
window.isHeroOwned = isHeroOwned;

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
window.escapeHtml = escapeHtml;

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
window.normalizeColorValue = normalizeColorValue;

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
window.getPlayerColor = getPlayerColor;

/**
 * Sets a dynamic CSS variable on the document root to update player theme colors.
 * @function setPlayerColorVariable
 * @param {string} playerId - The unique ID of the player.
 * @param {string} color - The CSS color value to set.
 */
export const setPlayerColorVariable = (playerId, color) => {
    document.documentElement.style.setProperty(`--${playerId}`, color);
};
window.setPlayerColorVariable = setPlayerColorVariable;

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
window.getSoftWeight = getSoftWeight;

/**
 * Formats the roll probability of a character as a user-friendly percentage string.
 * @function getHeroProbabilityText
 * @param {Object} charData - The hero object.
 * @param {number} pIdx - The player index context.
 * @returns {string} The formatted percentage text (e.g. "12.50%").
 */
export function getHeroProbabilityText(charData, pIdx) {
    if (!charData) return "0.00%";
    const ownedCount = window.characters.filter(isHeroOwned).length;
    if (ownedCount === 0) return "0.00%";

    if (pIdx >= 4) {
        return `${(100 / ownedCount).toFixed(2)}%`;
    }

    let totalWeight = 0;
    window.characters
        .filter(isHeroOwned)
        .forEach((c) => (totalWeight += getSoftWeight(c, pIdx)));

    if (totalWeight === 0) return "0.00%";

    const owned = isHeroOwned(charData);
    const weight = getSoftWeight(charData, pIdx);
    const pct = owned ? ((weight / totalWeight) * 100).toFixed(2) : "0.00";
    return `${pct}%`;
}
window.getHeroProbabilityText = getHeroProbabilityText;

/**
 * Handles color picker changes for a player, prompting for confirmation and syncing with Supabase.
 * @function handlePlayerColorChange
 * @async
 * @param {string} playerId - The unique ID of the player.
 * @param {HTMLInputElement} input - The HTML input color element.
 * @returns {Promise<void>}
 */
export async function handlePlayerColorChange(playerId, input) {
    const player = window.players.find((p) => p.id === playerId);
    if (!player) return;

    const currentColor = getPlayerColor(player);
    const newColor = normalizeColorValue(input.value);
    if (newColor.toLowerCase() === currentColor.toLowerCase()) return;

    const confirmed = confirm(
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

    const playerIndex = window.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
        window.players[playerIndex].player_color = newColor;
    }

    setPlayerColorVariable(playerId, newColor);
    if (typeof window.renderPlayersList === "function") {
        window.renderPlayersList();
    }
}
window.handlePlayerColorChange = handlePlayerColorChange;

