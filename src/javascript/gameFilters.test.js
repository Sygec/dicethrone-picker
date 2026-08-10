import { describe, it, expect, vi } from 'vitest';

// Same stubs as utils.test.js: utils.js pulls in admin.js / apiService.js at module scope,
// which transitively build a Supabase client from a global injected by a CDN <script> tag.
vi.mock('./services/apiService.js', () => ({}));
vi.mock('./admin.js', () => ({}));

import {
    matchesGameFilters,
    sortGames,
    getGameOutcome,
    getPlayerBucket,
    LEGACY_GAME_TYPE,
    MAX_WEIGHTED_PLAYERS,
} from './utils.js';

const NAMES = ['Martin', 'Sophie', 'Alex', 'Robin'];

// Fixed reference point so date-range assertions don't drift.
const NOW = new Date('2026-08-10T12:00:00Z');
const daysAgo = (n) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const gp = (playerId, heroName, isWinner = null) => ({
    player_id: playerId,
    hero_id: `hero-${heroName}`,
    is_winner: isWinner,
    heroes: { name: heroName, slug: heroName.toLowerCase() },
});

/** duel 2 days ago, p1 beats p2 */
const duel = {
    id: 'duel',
    played_at: daysAgo(2),
    game_type: 'duel',
    is_historical: false,
    game_players: [gp('p1', 'Barbarian', true), gp('p2', 'Moon Elf', false)],
};

/** 3v3 40 days ago, team B (p4 + two invitees) wins */
const teams = {
    id: 'teams',
    played_at: daysAgo(40),
    game_type: '3v3',
    is_historical: false,
    game_players: [
        gp('p1', 'Pyromancer', false),
        gp('p2', 'Shadow Thief', false),
        gp('p3', 'Treant', false),
        gp('p4', 'Cursed Pirate', true),
        gp('p5', 'Gunslinger', true),
        gp('p6', 'Samurai', true),
    ],
};

/** free-for-all 200 days ago, still awaiting a result */
const pending = {
    id: 'pending',
    played_at: daysAgo(200),
    game_type: 'ffa',
    is_historical: false,
    game_players: [gp('p1', 'Ninja'), gp('p2', 'Paladin'), gp('p3', 'Monk')],
};

/** duel 70 days ago, everyone explicitly not a winner */
const draw = {
    id: 'draw',
    played_at: daysAgo(70),
    game_type: 'duel',
    is_historical: false,
    game_players: [gp('p3', 'Seraph', false), gp('p4', 'Vampire Lord', false)],
};

/** historical import 500 days ago, no game type, no reliable outcome */
const historical = {
    id: 'historical',
    played_at: daysAgo(500),
    game_type: null,
    is_historical: true,
    game_players: [gp('p1', 'Artificer'), gp('p2', 'Huntress')],
};

/** king of the hill 10 days ago including an invitee, p2 wins */
const invitee = {
    id: 'invitee',
    played_at: daysAgo(10),
    game_type: 'koth',
    is_historical: false,
    game_players: [gp('p2', 'Tactician', true), gp('p7', 'Gunslinger', false)],
};

const ALL = [duel, teams, pending, draw, historical, invitee];

const match = (game, criteria = {}) =>
    matchesGameFilters(game, { names: NAMES, now: NOW, ...criteria });

const matchIds = (criteria = {}) => ALL.filter((g) => match(g, criteria)).map((g) => g.id);

describe('getPlayerBucket', () => {
    it('maps p1..p4 to their zero-based index', () => {
        expect(getPlayerBucket(gp('p1', 'x'))).toBe(0);
        expect(getPlayerBucket(gp('p4', 'x'))).toBe(3);
    });

    it('collapses every invitee slot into a single bucket', () => {
        expect(getPlayerBucket(gp('p5', 'x'))).toBe(MAX_WEIGHTED_PLAYERS);
        expect(getPlayerBucket(gp('p10', 'x'))).toBe(MAX_WEIGHTED_PLAYERS);
    });
});

describe('getGameOutcome', () => {
    it('reports completed when any row is an explicit winner', () => {
        expect(getGameOutcome(duel)).toBe('completed');
    });

    it('reports a draw only when every row is explicitly not a winner', () => {
        expect(getGameOutcome(draw)).toBe('draw');
    });

    it('reports pending when nobody has won and the loss flags are unset', () => {
        expect(getGameOutcome(pending)).toBe('pending');
        expect(getGameOutcome(historical)).toBe('pending');
    });
});

describe('matchesGameFilters — no constraints', () => {
    it('matches everything when no criteria are supplied', () => {
        expect(matchIds()).toEqual(ALL.map((g) => g.id));
    });

    it('treats every empty Set as "no constraint"', () => {
        const ids = matchIds({
            playerIndices: new Set(),
            results: new Set(),
            gameTypes: new Set(),
        });
        expect(ids).toEqual(ALL.map((g) => g.id));
    });
});

describe('matchesGameFilters — historical', () => {
    it('drops historical games when useHistorical is false', () => {
        expect(matchIds({ useHistorical: false })).not.toContain('historical');
    });

    it('keeps historical games when useHistorical is true', () => {
        expect(matchIds({ useHistorical: true })).toContain('historical');
    });
});

describe('matchesGameFilters — search', () => {
    it('matches a hero name, case-insensitively', () => {
        expect(matchIds({ searchTerm: 'moon elf' })).toEqual(['duel']);
    });

    it('matches a tracked player name', () => {
        expect(matchIds({ searchTerm: 'robin' })).toEqual(['teams', 'draw']);
    });

    it('matches invitees by their slot label', () => {
        expect(matchIds({ searchTerm: 'invitee 3' })).toEqual(['invitee']);
    });

    it('matches the game-type label', () => {
        expect(matchIds({ searchTerm: 'free for all' })).toEqual(['pending']);
        expect(matchIds({ searchTerm: 'duel' })).toEqual(['duel', 'draw']);
    });

    it('rejects a term that appears nowhere', () => {
        expect(matchIds({ searchTerm: 'nonexistent' })).toEqual([]);
    });

    it('ignores surrounding whitespace', () => {
        expect(matchIds({ searchTerm: '  ninja  ' })).toEqual(['pending']);
    });
});

describe('matchesGameFilters — players', () => {
    it('matches games a selected player took part in', () => {
        expect(matchIds({ playerIndices: new Set([3]) })).toEqual(['teams', 'draw']);
    });

    it('ORs multiple selected players', () => {
        expect(matchIds({ playerIndices: new Set([2, 3]) })).toEqual(['teams', 'pending', 'draw']);
    });

    it('matches any invitee through the shared bucket', () => {
        const ids = matchIds({ playerIndices: new Set([MAX_WEIGHTED_PLAYERS]) });
        expect(ids).toEqual(['teams', 'invitee']);
    });
});

describe('matchesGameFilters — results', () => {
    it('matches wins for the selected player only', () => {
        expect(matchIds({ playerIndices: new Set([0]), results: new Set(['win']) })).toEqual(['duel']);
        expect(matchIds({ playerIndices: new Set([1]), results: new Set(['win']) })).toEqual(['invitee']);
    });

    it('matches losses for the selected player only', () => {
        expect(matchIds({ playerIndices: new Set([0]), results: new Set(['loss']) })).toEqual(['teams']);
    });

    it('matches nothing for win/loss when no player is selected', () => {
        expect(matchIds({ results: new Set(['win']) })).toEqual([]);
        expect(matchIds({ results: new Set(['loss']) })).toEqual([]);
    });

    it('matches draws and pending games regardless of the player selection', () => {
        expect(matchIds({ results: new Set(['draw']) })).toEqual(['draw']);
        expect(matchIds({ results: new Set(['pending']) })).toEqual(['pending']);
    });

    it('ORs the selected results', () => {
        const ids = matchIds({ playerIndices: new Set([0]), results: new Set(['win', 'pending']) });
        expect(ids).toEqual(['duel', 'pending']);
    });

    it('never matches historical games, whose outcome data is unreliable', () => {
        const ids = matchIds({ playerIndices: new Set([0]), results: new Set(['pending']) });
        expect(ids).not.toContain('historical');
    });
});

describe('matchesGameFilters — game types', () => {
    it('matches a single type', () => {
        expect(matchIds({ gameTypes: new Set(['duel']) })).toEqual(['duel', 'draw']);
    });

    it('ORs multiple types', () => {
        expect(matchIds({ gameTypes: new Set(['ffa', 'koth']) })).toEqual(['pending', 'invitee']);
    });

    it('matches null game types through the legacy sentinel', () => {
        expect(matchIds({ gameTypes: new Set([LEGACY_GAME_TYPE]) })).toEqual(['historical']);
    });
});

describe('matchesGameFilters — date range', () => {
    it('matches everything on "all"', () => {
        expect(matchIds({ dateRange: 'all' })).toEqual(ALL.map((g) => g.id));
    });

    it('applies the trailing 30 day window', () => {
        expect(matchIds({ dateRange: '30d' })).toEqual(['duel', 'invitee']);
    });

    it('applies the trailing 90 day window', () => {
        expect(matchIds({ dateRange: '90d' })).toEqual(['duel', 'teams', 'draw', 'invitee']);
    });

    it('applies the trailing 365 day window', () => {
        expect(matchIds({ dateRange: 'year' })).toEqual(['duel', 'teams', 'pending', 'draw', 'invitee']);
    });
});

describe('matchesGameFilters — combined criteria', () => {
    it('ANDs across the different filter sections', () => {
        const ids = matchIds({
            playerIndices: new Set([0]),
            results: new Set(['win']),
            gameTypes: new Set(['duel']),
            dateRange: '30d',
        });
        expect(ids).toEqual(['duel']);
    });

    it('returns nothing when the sections disagree', () => {
        const ids = matchIds({ gameTypes: new Set(['duel']), dateRange: '30d', searchTerm: 'ninja' });
        expect(ids).toEqual([]);
    });
});

describe('sortGames', () => {
    const ids = (sortKey, asc) => sortGames(ALL, sortKey, asc).map((g) => g.id);

    it('does not mutate the input array', () => {
        const original = [...ALL];
        sortGames(ALL, 'type', true);
        expect(ALL).toEqual(original);
    });

    it('sorts by date, newest first by default', () => {
        expect(ids('date', false)).toEqual(['duel', 'invitee', 'teams', 'draw', 'pending', 'historical']);
    });

    it('sorts by date, oldest first when ascending', () => {
        expect(ids('date', true)).toEqual(['historical', 'pending', 'draw', 'teams', 'invitee', 'duel']);
    });

    // Labels order as: "1v1 Duel" < "Free For All" < "King of the Hill" < "Legacy" < "Teams 3v3".
    it('sorts by game type label A-Z, newest first within a label', () => {
        expect(ids('type', true)).toEqual(['duel', 'draw', 'pending', 'invitee', 'historical', 'teams']);
    });

    it('sorts by game type label Z-A', () => {
        expect(ids('type', false)).toEqual(['teams', 'historical', 'invitee', 'pending', 'duel', 'draw']);
    });

    it('puts pending games first by default', () => {
        const sorted = ids('status', false);
        expect(sorted.slice(0, 2)).toEqual(['pending', 'historical']);
    });

    it('puts completed games first when ascending', () => {
        const sorted = ids('status', true);
        expect(sorted.slice(-2)).toEqual(['pending', 'historical']);
    });

    it('puts a player\'s wins first for the w<bucket> key', () => {
        expect(ids('w0', false).slice(0, 1)).toEqual(['duel']);
        expect(ids('w3', false).slice(0, 1)).toEqual(['teams']);
    });

    it('puts a player\'s games first for the g<bucket> key', () => {
        expect(ids('g3', false).slice(0, 2)).toEqual(['teams', 'draw']);
    });

    it('buckets every invitee slot together when sorting', () => {
        expect(ids(`g${MAX_WEIGHTED_PLAYERS}`, false).slice(0, 2)).toEqual(['invitee', 'teams']);
    });

    it('falls back to played_at descending as the tiebreaker', () => {
        // Neither game involves p3, so both rank equal and only the date decides.
        const sorted = sortGames([draw, duel, invitee], 'w2', false).map((g) => g.id);
        expect(sorted).toEqual(['duel', 'invitee', 'draw']);
    });
});
