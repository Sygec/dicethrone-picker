# Dice Throne Companion — Developer Documentation

## Architecture Overview

Dice Throne Companion is a **vanilla JavaScript single-page application** (SPA) built with Vite. It uses Supabase as its backend (database + auth + realtime) and deploys as a static site to both GitHub Pages and Cloudflare Workers.

### High-Level Data Flow

```
index.html (HTML components injected by Vite)
    └── main.js          — Bootstrap: session, data fetch, realtime subscribe
         ├── stateStore  — Central reactive state (pub/sub)
         ├── apiService  — Supabase query layer
         ├── randomizer  — Hero picker & draft logic
         ├── filters     — List sort/filter/search
         ├── admin       — CRUD views (heroes, groups, games)
         └── views/      — Pure DOM renderers (no state mutations)
```

### Module Responsibilities

| Module | Role |
|--------|------|
| `config.js` | Environment detection, Supabase URL/key constants |
| `db.js` | Supabase client initialization |
| `stateStore.js` | Reactive in-memory state with `get/set/subscribe` |
| `services/apiService.js` | All Supabase queries (auth, CRUD, realtime) |
| `main.js` | App bootstrap, `init()`, `initializeApp()` |
| `randomizer.js` | Weighted random hero selection, draft mode |
| `filters.js` | Sort, filter, search logic for the hero list |
| `admin.js` | Admin CRUD operations and view rendering |
| `auth.js` | Login, logout, password reset coordination |
| `eventBindings.js` | Wires all DOM event listeners at startup |
| `utils.js` | Pure helpers: color normalization, XSS escaping, weight constants |
| `views/*.js` | Stateless DOM renderers called by logic modules |

### Component Architecture

HTML components in `src/components/` are injected into `index.html` at build time by `vite-plugin-html-inject`. CSS is split per feature area in `src/styles/`.

---

## Database Schema

Supabase (PostgreSQL) is the data store. Key tables:

| Table | Description |
|-------|-------------|
| `groups` | Hero collection sets/seasons (e.g. "Season 1") |
| `heroes` | Hero roster with slug, complexity, group foreign key |
| `players` | Player slots (up to 6), name, color, linked user |
| `player_hero_stats` | Per-player weighted pick stats for each hero |
| `user_heroes` | Per-user hero ownership flags |
| `games` | Game session log with timestamp |
| `game_players` | Join table: which players/heroes were in a game and winner flag |

Schema migrations are in `supabase/migrations/`. There is one hosted Supabase project (production). All development runs against a local Supabase stack in Docker; the two are selected automatically by hostname.

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- Docker Desktop (running) and the [Supabase CLI](https://supabase.com/docs/guides/local-development) — development runs against a local Supabase stack, not a hosted project

### Local Development

```bash
git clone https://github.com/Sygec/dicethrone-picker.git
cd dicethrone-picker
npm install

# Start the local Supabase stack (Postgres, Auth, PostgREST, Realtime, Studio)
supabase start

# Apply all migrations and load supabase/seed.sql into a clean database
supabase db reset

npm run dev
```

Vite starts a dev server at `http://localhost:5173`. The app auto-detects dev vs. prod via `window.location.hostname` in `config.js`: any hostname other than the two production ones connects to the local stack at `http://127.0.0.1:54321`.

Useful local endpoints:

| Service | URL |
| --- | --- |
| API | `http://127.0.0.1:54321` |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| Inbucket (captures all outgoing mail) | `http://127.0.0.1:54324` |

Run `supabase status` to confirm the anon key matches `LOCAL_SUPABASE_KEY` in `config.js`, and `supabase stop` when you're done.

#### Seed data

`supabase/seed.sql` runs automatically at the end of every `supabase db reset`. It loads the hero/group catalogue, placeholder players `p1`-`p10`, and a confirmed admin account:

```
admin@local.test / password123
```

The admin role lives in Supabase Auth `app_metadata` and cannot be set from the client, so seeding it is the only way to reach the Admin tab locally. Signups made through the app work too (local email confirmation is disabled), but land as non-admin users.

Local data is disposable — `supabase db reset` wipes it and reloads the seed. Nothing here is copied from production game history.

#### Promoting changes

Schema changes are developed locally and land in production through a PR:

```bash
# after editing the schema locally
supabase db diff -f describe_your_change   # writes a new file to supabase/migrations/
supabase db reset                          # verify it replays cleanly from scratch
```

Commit the migration, open a PR, and merge to `main`. Apply the merged migrations to production with `supabase db push` against the production project.

### Build

```bash
npm run build
```

Output goes to `/docs` (configured in `vite.config.js`) for GitHub Pages compatibility.

### Automated Build & Deploy (GitHub Actions)

Instead of running `npm run build` locally and committing `/docs` yourself, trigger the
**Build and Deploy** workflow (`.github/workflows/build-and-deploy.yml`) from the repo's
**Actions** tab → *Run workflow*. It's manual-trigger only (no automatic run on push, since
it touches the live production deploy path). It will:

1. Run the test suite (`npm test`) — stops here if anything fails, so a broken build never gets committed.
2. Run `npm run build`.
3. Commit the resulting `/docs` changes (as `github-actions[bot]`) and push back to the branch you triggered it from — skipped if the build produced no changes.

You still `git push` your own source changes as normal; this workflow only replaces the
build-and-commit step. Once the commit lands, GitHub Pages and Cloudflare (which watches the
repo directly) both pick up the new `/docs` automatically, same as if you'd committed it by hand.

### Preview Production Build

```bash
npm run preview
```

### Cloudflare Workers Deployment

The `wrangler.jsonc` config serves the `/docs` directory as a static asset site.

```bash
# Deploy to production
npx wrangler deploy --env production
```

Environments defined in `wrangler.jsonc`:
- `production` → worker name `dicethrone-prod`

There is no hosted development environment: a deployed Worker cannot reach a Supabase stack running on `127.0.0.1`, so non-production work happens on `localhost` only.

---

## State Management

`stateStore.js` is a lightweight reactive store — no framework required.

### API

```js
import * as stateStore from './stateStore.js';

// Read
const characters = stateStore.get("characters");

// Write (triggers listeners)
stateStore.set("currentSort", "name");

// Mutate a Set value
stateStore.updateSet("activeGroups", "add", groupId);
stateStore.updateSet("bannedHeroIds", "toggle", heroId);
stateStore.updateSet("activeLevels", "clear");

// Mutate an Object value
stateStore.updateObject("scrambleIntervals", playerId, intervalRef);
stateStore.updateObject("scrambleIntervals", playerId, undefined); // delete key

// Subscribe to any state change
const unsub = stateStore.subscribe((key, value, fullState) => {
    console.log(`${key} changed to`, value);
});
unsub(); // unsubscribe
```

### Key State Properties

| Key | Type | Description |
|-----|------|-------------|
| `characters` | `Array` | All heroes with weights, play counts |
| `players` | `Array` | Player slot configs |
| `games` | `Array` | Game history log |
| `groups` | `Array` | Hero groups/seasons |
| `currentUser` | `Object\|null` | Supabase auth user |
| `activePlayerIndices` | `Array` | Which player columns show in the hero table |
| `activeLevels` | `Set` | Hero complexity filter |
| `activeGroups` | `Set` | Hero group filter |
| `bannedHeroIds` | `Set` | Heroes excluded from rolls |
| `draftModeEnabled` | `boolean` | Whether draft pick wheel is active |
| `draftCount` | `number` | Candidates per draft wheel (2 or 3) |
| `isRollActive` | `boolean` | Whether a roll animation is running |

Staged variants (`staged*`) are used to buffer changes in drawers/modals before the user confirms.

---

## API Service Reference

All Supabase calls go through `services/apiService.js`. Every function returns a Supabase response `{ data, error }`.

### Authentication

```js
apiService.signInWithPassword({ email, password })
apiService.signOut()
apiService.getSession()
apiService.resetPasswordForEmail(email)
apiService.updateUser({ password })
apiService.onAuthStateChange(callback) // subscribe to auth events
```

### Read Queries

```js
apiService.getGroups()        // active groups ordered by index
apiService.getPlayers()       // all players ordered by id
apiService.getHeroes()        // heroes with groups, player_hero_stats, user_heroes
apiService.getGames()         // full game history with nested game_players + heroes
apiService.getAllUserHeroes()  // all user hero ownership rows (admin only)
```

### Write Queries

```js
// Players
apiService.updatePlayerColor(playerId, hexColor)
apiService.updatePlayerName(playerId, name)

// Heroes
apiService.insertHero(heroData)
apiService.upsertHero(heroData)
apiService.deleteHero(heroId)

// Groups
apiService.upsertGroup(groupData)
apiService.deleteGroup(groupId)

// Hero ownership
apiService.upsertUserHero(userId, heroId, isOwned)
apiService.upsertUserHeroesGroup(payloadArray)

// Games
apiService.insertGame(userId)
apiService.insertGamePlayers(participantsArray)
apiService.updateGameWinner(gameId, winnerPlayerId, userId)
apiService.updateGameHistoricalStatus(gameId, isHistorical)
apiService.deleteGame(gameId)

// Stats
apiService.upsertPlayerHeroStats(statsArray)

// Realtime
apiService.subscribeToDatabaseChanges(callback)
```

### Realtime Subscriptions

`subscribeToDatabaseChanges(callback)` opens a Supabase realtime channel listening to INSERT/UPDATE/DELETE on: `user_heroes`, `player_hero_stats`, `heroes`, `games`, `game_players`. On any event it calls `callback` (typically `init()` to re-fetch all data).

---

## Weighting System

Hero selection uses a weighted random algorithm. Constants in `utils.js`:

| Constant | Value | Meaning |
|----------|-------|---------|
| `DEFAULT_HERO_WEIGHT` | 250 | Starting weight for all heroes |
| `PICKED_HERO_WEIGHT` | 20 | Minimum weight floor after being picked |
| `WEIGHT_INCREMENT` | 10 | Weight restored each session a hero isn't picked |
| `MAX_WEIGHTED_PLAYERS` | 4 | Max players with individual weight tracking |

Each hero stores a `weights` array (one entry per player slot). When a hero is picked, its weight for that player drops toward `PICKED_HERO_WEIGHT`, making it less likely to reappear. Weights gradually recover. Players beyond index 4 use unweighted random selection.

---

## Environment Detection

`config.js` determines the environment:

```js
// Production hostnames
"sygec.github.io"
"dicethrone-prod.sygec.workers.dev"

// All other hostnames → local Supabase stack
```

No `.env` files or build-time environment variables are needed. Both keys in `config.js` are safe to commit: the production key is a publishable/anon key restricted by Row Level Security policies, and the local key is the Supabase CLI's fixed demo key, which only grants access to your own machine.

---

## Roles & Permissions

User roles are stored in Supabase Auth `app_metadata`:

```js
// Check if logged-in user is admin
import { isAdmin } from './utils.js';
isAdmin(); // → true if app_metadata.role === "admin"

// Check if any user is logged in
import { isUser } from './utils.js';
isUser(); // → true if currentUser is not null
```

Admin users can access hero/group CRUD in the admin section, view all user collections, and see the admin build info panel.

---

## Troubleshooting

### Blank Screen on Load

- Open browser devtools → Console tab.
- Supabase client initializes from CDN in `index.html`. If the CDN script fails to load, `supabase` is undefined and `db.js` will throw. Check network tab for blocked requests.
- If running locally, ensure `npm run dev` is active (not opening `index.html` directly — Vite must serve it so ES module imports resolve).

### Heroes Not Loading

- Locally, this usually means the Supabase stack isn't running or the database is empty. Run `supabase status` to confirm it's up, then `supabase db reset` to reapply migrations and the seed.
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `config.js` match what `supabase status` prints.

### Realtime Not Updating

- Supabase Realtime requires the project to be active. Verify the channel subscription succeeded by checking for errors in the Console after `subscribeToDatabaseChanges` is called.
- Check that Row Level Security policies on the relevant tables allow SELECT for anon/authenticated roles.

### Build Output Goes to Wrong Directory

- `vite.config.js` sets `build.outDir: 'docs'`. Do not change this — GitHub Pages serves from `/docs` on `main`.

### Wrangler Deploy Fails

- Ensure you are authenticated: `npx wrangler login`.
- The `compatibility_date` in `wrangler.jsonc` must be ≤ today's date.
- Assets are served from `./docs` — run `npm run build` before deploying.

### Draft Mode Wheel Stuck

- Draft mode stores state across steps in `stateStore`. If the wheel appears stuck, open devtools and check `stateStore` logs for `activeDraftStep` and `activeDraftCandidates`. Refreshing the page resets draft state (it is not persisted).

### localStorage Conflicts

The following keys are persisted to `localStorage`:
- `draftModeEnabled` — whether draft mode is on
- `draftCount` — candidates per draft (2 or 3)
- `bannedHeroIds` — JSON array of banned hero UUIDs
- `lastSeenVersion` — used to show the "What's New" modal once per version

To reset all local preferences: open devtools → Application → Local Storage → clear all entries for the site's origin.
