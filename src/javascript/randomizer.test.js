import { describe, it, expect, vi, afterEach } from 'vitest';

// randomizer.js pulls in admin.js/apiService.js (transitively db.js, which needs a
// `supabase` global normally injected by a CDN <script> tag) plus several other
// DOM-heavy modules. None of them are touched by generateDraftCandidates, so stub
// them out to keep the import graph test-safe.
vi.mock('./services/apiService.js', () => ({}));
vi.mock('./admin.js', () => ({}));
vi.mock('./main.js', () => ({}));
vi.mock('./auth.js', () => ({}));
vi.mock('./filters.js', () => ({}));
vi.mock('./views/rollView.js', () => ({}));
vi.mock('./views/filterView.js', () => ({}));
vi.mock('./views/randomizerSetupView.js', () => ({}));
vi.mock('./randomizerSetup.js', () => ({}));

import { generateDraftCandidates } from './randomizer.js';
import { MAX_WEIGHTED_PLAYERS } from './utils.js';
import * as stateStore from './stateStore.js';

function makeHero(name, weight, playCount = 0) {
    return { name, weights: [weight], playCount: [playCount] };
}

afterEach(() => {
    vi.restoreAllMocks();
    stateStore.set('draftCount', 3);
});

describe('generateDraftCandidates - deterministic branches', () => {
    it('picks uniformly at random for invitee players (pIdx >= MAX_WEIGHTED_PLAYERS)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        stateStore.set('draftCount', 1);
        const pool = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];

        const candidates = generateDraftCandidates(MAX_WEIGHTED_PLAYERS, pool);

        expect(candidates).toEqual([pool[0]]);
    });

    it('picks the first candidate whose cumulative weight exceeds the random draw', () => {
        stateStore.set('draftCount', 1);
        const pool = [makeHero('A', 100), makeHero('B', 300)];
        // totalEffectiveWeight = 100 + 300 = 400; random = 0.1 * 400 = 40, which is < A's weight (100)
        vi.spyOn(Math, 'random').mockReturnValue(0.1);

        const candidates = generateDraftCandidates(0, pool);

        expect(candidates.map((c) => c.name)).toEqual(['A']);
    });

    it('subtracts earlier weights before landing on a later candidate', () => {
        stateStore.set('draftCount', 1);
        const pool = [makeHero('A', 100), makeHero('B', 300)];
        // total = 400; random = 0.5 * 400 = 200; 200 >= A's weight (100), so subtract -> 100,
        // then 100 < B's weight (300) -> picks B
        vi.spyOn(Math, 'random').mockReturnValue(0.5);

        const candidates = generateDraftCandidates(0, pool);

        expect(candidates.map((c) => c.name)).toEqual(['B']);
    });

    it('falls back to a uniform pick when every candidate has zero weight for this player', () => {
        stateStore.set('draftCount', 1);
        const pool = [makeHero('A', 0), makeHero('B', 0)];
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const candidates = generateDraftCandidates(0, pool);

        expect(candidates).toEqual([pool[0]]);
    });
});

describe('generateDraftCandidates - invariants (real randomness)', () => {
    const pool = [
        makeHero('A', 100),
        makeHero('B', 50),
        makeHero('C', 200),
        makeHero('D', 10),
        makeHero('E', 75),
        makeHero('F', 150),
    ];

    it('returns draftCount candidates, capped at the pool size', () => {
        stateStore.set('draftCount', 3);
        for (let i = 0; i < 50; i++) {
            expect(generateDraftCandidates(0, pool)).toHaveLength(3);
        }

        stateStore.set('draftCount', 20);
        expect(generateDraftCandidates(0, pool)).toHaveLength(pool.length);
    });

    it('never returns duplicate heroes within a single draft', () => {
        stateStore.set('draftCount', pool.length);
        for (let i = 0; i < 50; i++) {
            const names = generateDraftCandidates(0, pool).map((c) => c.name);
            expect(new Set(names).size).toBe(names.length);
        }
    });

    it('only returns heroes that were in the input pool', () => {
        stateStore.set('draftCount', 3);
        const poolNames = new Set(pool.map((c) => c.name));
        for (let i = 0; i < 50; i++) {
            const names = generateDraftCandidates(0, pool).map((c) => c.name);
            names.forEach((name) => expect(poolNames.has(name)).toBe(true));
        }
    });
});
