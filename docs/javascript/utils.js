import { db } from './db.js';

export const getImgUrl = (slug) =>
    slug ? `https://dice-throne.rulepop.com/heroes/${slug}.webp` : "";
window.getImgUrl = getImgUrl;

export const getHeroLink = (slug) => `https://dice-throne.rulepop.com/#hero/${slug}`;
window.getHeroLink = getHeroLink;

export const isHeroOwned = (hero) => !!hero?.is_owned;
window.isHeroOwned = isHeroOwned;

export const escapeHtml = (text) => {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
window.escapeHtml = escapeHtml;

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

export const getPlayerColor = (player) => {
    if (player?.player_color) return normalizeColorValue(player.player_color);
    const rootColor = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${player?.id}`)
        .trim();
    return normalizeColorValue(rootColor);
};
window.getPlayerColor = getPlayerColor;

export const setPlayerColorVariable = (playerId, color) => {
    document.documentElement.style.setProperty(`--${playerId}`, color);
};
window.setPlayerColorVariable = setPlayerColorVariable;

export function getSoftWeight(hero, userIndex) {
    const baseWeight = hero.weights[userIndex];
    const plays = hero.playCount[userIndex];

    // Applying the (p*3+1)^2 formula
    const penalty = Math.pow(plays * 3 + 1, 2);
    return baseWeight / penalty;
}
window.getSoftWeight = getSoftWeight;

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

    const { error } = await db
        .from("players")
        .update({ player_color: newColor })
        .eq("id", playerId)
        .select()
        .single();

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
