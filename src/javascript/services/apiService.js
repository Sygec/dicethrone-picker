/**
 * @fileoverview Service layer encapsulating all Supabase database and authentication operations.
 * @module apiService
 */

import { db } from '../db.js';

// ==========================================
// Authentication APIs
// ==========================================

/**
 * Authenticates user via email and password credentials.
 * @async
 * @param {Object} credentials - The login credentials.
 * @param {string} credentials.email - The user's email address.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<Object>} Supabase auth response object containing data and error keys.
 */
export async function signInWithPassword({ email, password }) {
    return db.auth.signInWithPassword({ email, password });
}

/**
 * Requests a password reset email for a specified email address.
 * @async
 * @param {string} email - Target email address.
 * @returns {Promise<Object>} Supabase auth response containing error.
 */
export async function resetPasswordForEmail(email) {
    return db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
}

/**
 * Updates properties on the currently authenticated user (e.g. password).
 * @async
 * @param {Object} attributes - User attributes to update.
 * @param {string} attributes.password - The new password.
 * @returns {Promise<Object>} Supabase response containing updated user details or error.
 */
export async function updateUser({ password }) {
    return db.auth.updateUser({ password });
}

/**
 * Logs out the active user session.
 * @async
 * @returns {Promise<Object>} Supabase response.
 */
export async function signOut() {
    return db.auth.signOut();
}

/**
 * Retrieves the currently active user session details.
 * @async
 * @returns {Promise<Object>} Supabase response containing data and error.
 */
export async function getSession() {
    return db.auth.getSession();
}

/**
 * Subscribes to changes in authentication state.
 * @param {Function} callback - Callback function triggered on state changes.
 * @returns {Object} subscription reference object.
 */
export function onAuthStateChange(callback) {
    return db.auth.onAuthStateChange(callback);
}

// ==========================================
// Read Queries (Fetch APIs)
// ==========================================

/**
 * Fetches active collection groups sorted by order index.
 * @async
 * @returns {Promise<Object>} Supabase response with groups data or error.
 */
export async function getGroups() {
    return db
        .from("groups")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
}

/**
 * Fetches all players sorted by ID.
 * @async
 * @returns {Promise<Object>} Supabase response with players data or error.
 */
export async function getPlayers() {
    return db
        .from("players")
        .select("*")
        .order("id", { ascending: true });
}

/**
 * Fetches all heroes, pre-loading associated group titles, player stats, and user collections.
 * @async
 * @returns {Promise<Object>} Supabase response with heroes data or error.
 */
export async function getHeroes() {
    return db
        .from("heroes")
        .select(`
            *,
            groups (name),
            player_hero_stats (*),
            user_heroes (*)
        `)
        .order("name", { ascending: true });
}

/**
 * Fetches all historical and active game logs.
 * @async
 * @returns {Promise<Object>} Supabase response containing games log history.
 */
export async function getGames() {
    return db
        .from("games")
        .select(`
            id,
            played_at,
            last_updated_by,
            is_historical,
            game_players (
                hero_id,
                player_id,
                is_winner,
                heroes (
                    name,
                    slug,
                    complexity
                )
            )
        `)
        .order("played_at", { ascending: false })
        .order("player_id", { foreignTable: "game_players", ascending: true });
}

/**
 * Fetches all user hero collections entries (for administrator overview).
 * @async
 * @returns {Promise<Object>} Supabase response with collection rows.
 */
export async function getAllUserHeroes() {
    return db.from("user_heroes").select("*");
}

// ==========================================
// Write Queries (Mutator APIs)
// ==========================================

/**
 * Updates a player's hex theme color preference.
 * @async
 * @param {string} playerId - Player identifier.
 * @param {string} newColor - Normalized Hex color string.
 * @returns {Promise<Object>} Supabase response.
 */
export async function updatePlayerColor(playerId, newColor) {
    return db
        .from("players")
        .update({ player_color: newColor })
        .eq("id", playerId)
        .select()
        .single();
}

/**
 * Updates a player's name in the database.
 * @async
 * @param {string} playerId - Player identifier.
 * @param {string} name - The new name to set.
 * @returns {Promise<Object>} Supabase response.
 */
export async function updatePlayerName(playerId, name) {
    return db
        .from("players")
        .update({ name })
        .eq("id", playerId)
        .select()
        .single();
}

/**
 * Upserts a single hero ownership status for a user.
 * @async
 * @param {string} userId - User UUID.
 * @param {string} heroId - Hero UUID.
 * @param {boolean} isOwned - Ownership status.
 * @returns {Promise<Object>} Supabase response.
 */
export async function upsertUserHero(userId, heroId, isOwned) {
    return db.from("user_heroes").upsert({
        user_id: userId,
        hero_id: heroId,
        is_owned: isOwned,
    });
}

/**
 * Upserts a batch of hero ownership entries.
 * @async
 * @param {Array<Object>} groupHeroPayloads - Array of ownership configurations.
 * @returns {Promise<Object>} Supabase response.
 */
export async function upsertUserHeroesGroup(groupHeroPayloads) {
    return db.from("user_heroes").upsert(groupHeroPayloads);
}

/**
 * Creates a new hero entry in the database.
 * @async
 * @param {Object} heroData - Hero parameters.
 * @returns {Promise<Object>} Supabase response.
 */
export async function insertHero(heroData) {
    return db
        .from("heroes")
        .insert(heroData)
        .select()
        .single();
}

/**
 * Updates or creates a hero entry in the database.
 * @async
 * @param {Object} heroData - Hero parameters (including ID to upsert).
 * @returns {Promise<Object>} Supabase response.
 */
export async function upsertHero(heroData) {
    return db
        .from("heroes")
        .upsert(heroData)
        .select()
        .single();
}

/**
 * Deletes a hero from the database.
 * @async
 * @param {string} heroId - Hero UUID.
 * @returns {Promise<Object>} Supabase response.
 */
export async function deleteHero(heroId) {
    return db.from("heroes").delete().eq("id", heroId);
}

/**
 * Creates or updates a group/season configuration.
 * @async
 * @param {Object} groupData - Group attributes.
 * @returns {Promise<Object>} Supabase response.
 */
export async function upsertGroup(groupData) {
    return db
        .from("groups")
        .upsert(groupData)
        .select()
        .single();
}

/**
 * Deletes a group/season from the database.
 * @async
 * @param {string} groupId - Group UUID.
 * @returns {Promise<Object>} Supabase response.
 */
export async function deleteGroup(groupId) {
    return db.from("groups").delete().eq("id", groupId);
}

/**
 * Creates a new game log entry.
 * @async
 * @param {string} userId - ID of the creating user.
 * @returns {Promise<Object>} Supabase response.
 */
export async function insertGame(userId) {
    return db
        .from("games")
        .insert({ last_updated_by: userId })
        .select()
        .single();
}

/**
 * Inserts participant details linked to a game log.
 * @async
 * @param {Array<Object>} gameParticipants - Player statistics settings.
 * @returns {Promise<Object>} Supabase response.
 */
export async function insertGamePlayers(gameParticipants) {
    return db.from("game_players").insert(gameParticipants);
}

/**
 * Updates weight statistics for players on characters.
 * @async
 * @param {Array<Object>} statsUpdates - Target player/hero adjustments.
 * @returns {Promise<Object>} Supabase response.
 */
export async function upsertPlayerHeroStats(statsUpdates) {
    return db.from("player_hero_stats").upsert(statsUpdates);
}

/**
 * Updates a game's historical tag status.
 * @async
 * @param {string} gameId - Game UUID.
 * @param {boolean} isHistorical - Historical status.
 * @returns {Promise<Object>} Supabase response.
 */
export async function updateGameHistoricalStatus(gameId, isHistorical) {
    return db
        .from("games")
        .update({ is_historical: isHistorical })
        .eq("id", gameId);
}

/**
 * Sets the winner or a draw status for a logged game.
 * @async
 * @param {string} gameId - Match UUID.
 * @param {string} winnerPlayerId - Winning player slot ID, or 'draw'.
 * @param {string} userId - User modifying the results.
 * @returns {Promise<Object>} Supabase response.
 */
export async function updateGameWinner(gameId, winnerPlayerId, userId) {
    if (winnerPlayerId === "draw") {
        return db
            .from("game_players")
            .update({ is_winner: false, last_updated_by: userId })
            .eq("game_id", gameId);
    } else {
        const winRes = await db
            .from("game_players")
            .update({ is_winner: true, last_updated_by: userId })
            .eq("game_id", gameId)
            .eq("player_id", winnerPlayerId);
        if (winRes.error) return winRes;

        return db
            .from("game_players")
            .update({ is_winner: false, last_updated_by: userId })
            .eq("game_id", gameId)
            .neq("player_id", winnerPlayerId);
    }
}

/**
 * Deletes a game record.
 * @async
 * @param {string} gameId - Match UUID.
 * @returns {Promise<Object>} Supabase response.
 */
export async function deleteGame(gameId) {
    return db.from("games").delete().eq("id", gameId);
}

/**
 * Subscribes to real-time changes on database tables and invokes a callback.
 * @param {Function} callback - Callback function triggered on any change event.
 * @returns {Object} Supabase channel reference.
 */
export function subscribeToDatabaseChanges(callback) {
    return db.channel("schema-db-changes")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "user_heroes" },
            callback,
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "player_hero_stats" },
            callback,
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "heroes" },
            callback,
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "games" },
            callback,
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "game_players" },
            callback,
        )
        .subscribe();
}
