import { describe, it, expect, vi } from 'vitest';

// utils.js pulls in admin.js / apiService.js at module scope, which transitively
// construct a Supabase client from a `supabase` global normally injected by a CDN
// <script> tag (see db.js). Stub those two imports so loading utils.js in a test
// doesn't require the whole app bootstrap chain.
vi.mock('./services/apiService.js', () => ({}));
vi.mock('./admin.js', () => ({}));

import {
    getSoftWeight,
    normalizeColorValue,
    parseDateString,
    buildGameResultsPayload,
    isGameAwaitingResult,
    countGamesAwaitingResult,
    PICKED_HERO_WEIGHT,
    DEFAULT_HERO_WEIGHT,
    WEIGHT_INCREMENT,
    MAX_WEIGHTED_PLAYERS,
} from './utils.js';

describe('getSoftWeight', () => {
    it('returns the base weight unchanged when the hero has never been played', () => {
        const hero = { weights: [100], playCount: [0] };
        expect(getSoftWeight(hero, 0)).toBe(100);
    });

    it('applies the (plays*3+1)^2 penalty for a played hero', () => {
        const hero = { weights: [100], playCount: [1] };
        // penalty = (1*3+1)^2 = 16
        expect(getSoftWeight(hero, 0)).toBeCloseTo(100 / 16);
    });

    it('reduces weight further as play count increases', () => {
        const hero = { weights: [100], playCount: [3] };
        // penalty = (3*3+1)^2 = 100
        expect(getSoftWeight(hero, 0)).toBeCloseTo(1);
    });

    it('weight strictly decreases as play count grows', () => {
        const weights = [0, 1, 2, 3, 4].map((plays) =>
            getSoftWeight({ weights: [50], playCount: [plays] }, 0),
        );
        for (let i = 1; i < weights.length; i++) {
            expect(weights[i]).toBeLessThan(weights[i - 1]);
        }
    });

    it('returns 0 when the base weight is 0', () => {
        const hero = { weights: [0], playCount: [2] };
        expect(getSoftWeight(hero, 0)).toBe(0);
    });

    it('reads the weight/playCount for the given player index', () => {
        const hero = { weights: [10, 20], playCount: [0, 0] };
        expect(getSoftWeight(hero, 1)).toBe(20);
    });
});

describe('normalizeColorValue', () => {
    it('defaults to white for falsy input', () => {
        expect(normalizeColorValue(null)).toBe('#ffffff');
        expect(normalizeColorValue(undefined)).toBe('#ffffff');
        expect(normalizeColorValue('')).toBe('#ffffff');
    });

    it('passes hex colors through unchanged (after trimming)', () => {
        expect(normalizeColorValue('#abc123')).toBe('#abc123');
        expect(normalizeColorValue('  #abc123  ')).toBe('#abc123');
    });

    it('converts rgb() to hex', () => {
        expect(normalizeColorValue('rgb(255, 0, 0)')).toBe('#ff0000');
        expect(normalizeColorValue('rgb(0, 255, 0)')).toBe('#00ff00');
        expect(normalizeColorValue('rgb(0, 0, 255)')).toBe('#0000ff');
        expect(normalizeColorValue('rgb(0, 0, 0)')).toBe('#000000');
        expect(normalizeColorValue('rgb(255, 255, 255)')).toBe('#ffffff');
    });

    it('converts rgba() to hex, ignoring alpha', () => {
        expect(normalizeColorValue('rgba(255, 0, 0, 0.5)')).toBe('#ff0000');
    });

    it('passes through strings that are neither hex nor rgb/rgba', () => {
        expect(normalizeColorValue('purple')).toBe('purple');
    });
});

describe('parseDateString', () => {
    it('returns null for empty/nullish input', () => {
        expect(parseDateString(null)).toBeNull();
        expect(parseDateString(undefined)).toBeNull();
        expect(parseDateString('')).toBeNull();
    });

    it('parses a space-separated datetime by inserting T and Z', () => {
        const result = parseDateString('2024-01-15 10:30:00');
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('appends Z to a naive ISO datetime with no timezone', () => {
        const result = parseDateString('2024-01-15T10:30:00');
        expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('leaves an already-UTC datetime unchanged', () => {
        const result = parseDateString('2024-01-15T10:30:00Z');
        expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('leaves a datetime with an explicit offset unchanged', () => {
        const result = parseDateString('2024-01-15T10:30:00+02:00');
        expect(result.toISOString()).toBe('2024-01-15T08:30:00.000Z');
    });

    it('parses a date-only string', () => {
        const result = parseDateString('2024-01-15');
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('returns null for an unparseable string', () => {
        expect(parseDateString('not a date')).toBeNull();
    });
});

describe('buildGameResultsPayload', () => {
    it('resets a picked hero to PICKED_HERO_WEIGHT and logs the participant', () => {
        const characters = [{ id: 'hero-a', name: 'A', weights: [100] }];
        const activePicks = new Map([[0, 'A']]);

        const { gameParticipants, statsUpdates } = buildGameResultsPayload(
            characters,
            activePicks,
            {},
            'game-1',
            'user-1',
        );

        expect(gameParticipants).toEqual([
            {
                game_id: 'game-1',
                player_id: 'p1',
                hero_id: 'hero-a',
                is_winner: null,
                team_id: null,
                last_updated_by: 'user-1',
            },
        ]);
        expect(statsUpdates).toEqual([
            { hero_id: 'hero-a', player_id: 'p1', weight: PICKED_HERO_WEIGHT, last_updated_by: 'user-1' },
        ]);
    });

    it('increments the existing weight for a hero that was not picked', () => {
        const characters = [{ id: 'hero-c', name: 'C', weights: [50] }];
        const activePicks = new Map([[0, 'someone-else']]);

        const { statsUpdates } = buildGameResultsPayload(characters, activePicks, {}, 'game-1', 'user-1');

        expect(statsUpdates).toEqual([
            { hero_id: 'hero-c', player_id: 'p1', weight: 50 + WEIGHT_INCREMENT, last_updated_by: 'user-1' },
        ]);
    });

    it('falls back to DEFAULT_HERO_WEIGHT when the hero has no prior weight for this player', () => {
        const characters = [{ id: 'hero-b', name: 'B', weights: [] }];
        const activePicks = new Map([[0, 'someone-else']]);

        const { statsUpdates } = buildGameResultsPayload(characters, activePicks, {}, 'game-1', 'user-1');

        expect(statsUpdates[0].weight).toBe(DEFAULT_HERO_WEIGHT + WEIGHT_INCREMENT);
    });

    it('logs invitees (pIdx >= MAX_WEIGHTED_PLAYERS) as participants but not in statsUpdates', () => {
        const characters = [{ id: 'hero-a', name: 'A', weights: [] }];
        const activePicks = new Map([[MAX_WEIGHTED_PLAYERS, 'A']]);

        const { gameParticipants, statsUpdates } = buildGameResultsPayload(
            characters,
            activePicks,
            {},
            'game-1',
            'user-1',
        );

        expect(gameParticipants).toHaveLength(1);
        expect(gameParticipants[0].player_id).toBe(`p${MAX_WEIGHTED_PLAYERS + 1}`);
        expect(statsUpdates).toHaveLength(0);
    });

    it('assigns team_id from teamIdByPlayerId when present', () => {
        const characters = [{ id: 'hero-a', name: 'A', weights: [100] }];
        const activePicks = new Map([[0, 'A']]);

        const { gameParticipants } = buildGameResultsPayload(
            characters,
            activePicks,
            { p1: 'team-a' },
            'game-1',
            'user-1',
        );

        expect(gameParticipants[0].team_id).toBe('team-a');
    });
});

describe('isGameAwaitingResult', () => {
    it('is true when no player has a winner/loser result yet', () => {
        const game = { game_players: [{ is_winner: null }, { is_winner: null }] };
        expect(isGameAwaitingResult(game)).toBe(true);
    });

    it('is false once a winner has been recorded', () => {
        const game = { game_players: [{ is_winner: true }, { is_winner: false }] };
        expect(isGameAwaitingResult(game)).toBe(false);
    });

    it('is false for a draw (all players explicitly marked non-winners)', () => {
        const game = { game_players: [{ is_winner: false }, { is_winner: false }] };
        expect(isGameAwaitingResult(game)).toBe(false);
    });
});

describe('countGamesAwaitingResult', () => {
    it('counts only non-historical games with no result yet', () => {
        const games = [
            { is_historical: false, game_players: [{ is_winner: null }] },
            { is_historical: false, game_players: [{ is_winner: true }] },
            { is_historical: true, game_players: [{ is_winner: null }] },
        ];
        expect(countGamesAwaitingResult(games)).toBe(1);
    });

    it('returns 0 for an empty or missing games list', () => {
        expect(countGamesAwaitingResult([])).toBe(0);
        expect(countGamesAwaitingResult(undefined)).toBe(0);
    });
});
