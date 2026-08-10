# History page — Heroes-style sort & filter

## Context

The Heroes page (`#dbSection`, nav label "Heroes") has a mature filter/sort UX: a search block with a live count, a two-up **action bar** holding a `⇅ SORT: …` dropdown and a `Filter` button with a count badge, a removable **filter chip** row, and a **left slide-in drawer** with sectioned checkbox groups, a live "N heroes match" count, and RESET / APPLY FILTERS.

The History page (`#gamesSection`) has almost none of that. It has a hero-name-only search, **no sort control at all** (order is fixed to `played_at DESC` from the query), and a bottom-sheet drawer offering only three controls: a single-select player picker, a "Wins Only" checkbox, and "Include Historical Data". No chips, no game-type filter, no result filter, no date filter.

The goal is to bring History to full parity with the Heroes look and feel, and to give it a genuinely useful set of sort and filter options for game records.

Confirmed with the user:
- Left slide-in drawer (full Heroes parity), retiring the `history-filter` bottom-sheet mode.
- Filters: multi-select Players, Result/outcome, Game type, Date range (plus the existing Historical toggle).
- Sort: Date, Status, Game type, and per-player sections.
- Search broadened to hero + player names + game-type labels.

---

## 1. Shared, testable core — `src/javascript/utils.js`

`utils.js` is dependency-free and already has `MAX_WEIGHTED_PLAYERS` and a vitest suite (`utils.test.js`). Put the two pure functions here so the list renderer, the drawer's live count, and the tests all share one implementation instead of three near-copies (the mistake Heroes made with `matchesSearchTerm`).

**`matchesGameFilters(game, criteria)`** — `criteria` is `{ searchTerm, useHistorical, playerIndices: Set, results: Set, gameTypes: Set, dateRange, names }`. Empty Set = no constraint, matching the Heroes convention (`if (set.size > 0)`).

- **historical**: `!useHistorical && game.is_historical` → out.
- **search**: matches if any of hero names, player names (via `names[pIdx]`, plus `"Invitee N"`), or the game-type label contains the term.
- **players**: any `game_players` row whose derived index is in the set (`parseInt(gp.player_id.substring(1)) - 1`; indices `>= MAX_WEIGHTED_PLAYERS` map to the single "Invitee" bucket value `MAX_WEIGHTED_PLAYERS`).
- **results**: game outcome derived exactly as `renderGamesList` does today — `winners` = rows with `is_winner === true`; `draw` = no winners and every row explicitly `false`; `pending` = neither. `win`/`loss` are evaluated **relative to the selected players** when the player filter is non-empty, and mean "has a winner" / "has a loser" globally when it is empty.
- **gameTypes**: `game.game_type` in the set; the sentinel `"legacy"` matches rows with a null `game_type`.
- **dateRange**: `all` | `30d` | `90d` | `year` against `played_at`.

**`sortGames(games, sortKey, asc, names)`** — returns a new array; `played_at` descending is always the tiebreaker.

| key | meaning |
|---|---|
| `date` | `played_at` |
| `type` | game-type label A–Z |
| `status` | pending games first (`asc:false`) / completed first (`asc:true`) |
| `w<idx>` | games the player **won** first |
| `g<idx>` | games the player **played in** first |

Note `renderList` parses player indices with `currentSort[1]` (single char) while `selectSortOption` uses `substring(1)` — use `substring(1)` consistently here.

**Tests** — new `src/javascript/gameFilters.test.js` (vitest is already wired, `npm test`): fixtures for a duel, a teams 3v3, a pending game, a draw, a historical game, and a game with an invitee; assert each criterion in isolation, the empty-set-means-all rule, win/loss with and without a player selection, and each sort key incl. the tiebreaker.

## 2. State — `src/javascript/stateStore.js`

Add active/staged pairs following the existing convention:

```
activeGamesPlayers: Set()      stagedGamesPlayers: Set()      // 0..3, MAX_WEIGHTED_PLAYERS = Invitee
activeGamesResults: Set()      stagedGamesResults: Set()      // 'win'|'loss'|'draw'|'pending'
activeGamesTypes:   Set()      stagedGamesTypes:   Set()      // 'duel'|'2v2'|'3v3'|'ffa'|'koth'|'legacy'
activeGamesDateRange: "all"    stagedGamesDateRange: "all"
gamesSort: "date"   gamesSortAsc: false   gamesSortPlayerIndex: 0
```

Keep `gamesUseHistorical` / `stagedGamesUseHistorical`. **Remove** `selectedGamePlayerIndex`, `stagedSelectedGamePlayerIndex`, `gamesWinnerOnly`, `stagedGamesWinnerOnly` — every consumer is rewritten below (`filterView.js:275-281`, `adminView.js:956-957,1002-1013,1162-1168`, `filters.js:45-46,335-336`), so no orphans remain.

## 3. Markup

**`src/components/section-games.html`** — restructure to mirror `section-db.html` exactly:
search block (input + clear icon + `.search-btn` magnifier `#games-search-btn`) → `#game-count-stats` inside `.search-container` → `.filter-action-bar` with `#games-sort-dropdown-container` (`#btn-trigger-games-sort` + `#games-sort-dropdown-menu`) and `#btn-trigger-games-filter` carrying the existing `#games-filter-active-badge` → `.active-filters-container#games-active-filters-container` → `#gamesContainer`. Placeholder becomes `Search by hero, player, or game type...`. Search stays live-on-input (History's current behavior); the magnifier is there for visual parity and just re-renders.

**New `src/components/drawer-filter-games.html`** — a copy of `drawer-filter-left.html`'s shell using the same class contract (`.filter-drawer-overlay/-sheet/-header/-body/-footer`, `.filter-section`, `.filter-section-title`, `.filter-checkbox-label`, `.segmented-control`/`.segmented-pill`, `.btn-filter-reset`/`.btn-filter-apply`), ids prefixed `games-`:

1. **Date Range** — segmented control (All time / 30 days / 90 days / This year), reusing `filterView.updateSegmentedHighlights()` which already queries `.segmented-control` globally.
2. **Data History** — the existing "Include Historical Data (before May 8th 2026)" checkbox.
3. **Result** — checkboxes Win / Loss / Draw / In Progress.
4. **By Player** — dynamic container `#games-filter-options-players`, filled at open time.
5. **By Game Type** — static checkboxes for the five `GAME_TYPE_FULL_LABEL` values plus "Legacy (no type)".

Header shows a live `#games-filter-drawer-count`; footer RESET / APPLY. Register it in `index.html` next to `drawer-filter-left.html` (line 44).

## 4. Rendering — `src/javascript/views/filterView.js`

New functions mirroring their Heroes twins one-for-one:

- `openGamesFilterDrawer()` / `closeGamesFilterDrawer()` — mirror `openFilterDrawer` (`:145`) / `closeFilterDrawer` (`:163`).
- `renderGamesFilterDrawerDynamicSections()` — builds the player checkbox list from `players` + the Invitee bucket, mirroring `:199-213`; keeps today's per-player `P: n / W: n` counts (from `renderHistoryFilterDrawerBody`) as muted text in each label, since that's existing value.
- `updateGamesFilterDrawerCountUI()` / `updateGamesFilterDrawerSectionTitlesUI()` — "N games match" + `.filter-count-bubble` on section titles, mirroring `:431` / `:441`.
- `updateGamesSortButtonText()` / `renderGamesSortDropdownOptions()` / `toggleGamesSortDropdown()` / `closeGamesSortDropdown()` — mirror `:317` / `:348` / `:401` / `:418`. Dropdown layout:

  ```
  General
    Date (Newest first)        date/false   ← default
    Date (Oldest first)        date/true
    Game Type (A–Z / Z–A)      type/true|false
    Status (Pending first)     status/false
    Status (Completed first)   status/true
  ───────
  <Player name>   (header tinted with var(--p{i+1}), like :378)
    Their wins first           w<i>/false
    Their games first          g<i>/false
  ```
- `updateGamesActiveFilterBadge()` (`:271`) — rewrite to count players + results + types + non-`all` date range + historical-off.
- `updateGamesActiveFilterChips()` — new, modeled on `updateActiveFilterChips` (`:971`): chips for Search, Date Range, Historical-off, Players, Results, Game Types, in that order, each with the ✖-before-label markup and `data-action="remove-games-filter-chip"`.
- **Delete** `renderHistoryFilterDrawerBody` (`:470-582`) and the `history-filter` branch of `renderDrawerBody` (`:695-696`). The bottom sheet keeps serving `roll-settings` (its `sort-filter`/`columns` modes are already unreachable dead code — leaving those alone).

Unlike Heroes, use `escapeHtml` (already imported at `:12`) on interpolated player/hero/search text in the new chip and drawer builders.

## 5. Logic — `src/javascript/filters.js`

Mirror the Heroes handler set: `openGamesFilterDrawer` (stage active→staged), `handleGamesFilterDrawerCheckboxChange(cb)` (dispatch on `data-type` = `games-player` | `games-result` | `games-type` | `games-historical`), `handleGamesDateRangePillClick(range)`, `resetGamesFilterPanelSelections`, `applyGamesFilterPanelSelections` (staged→active, close, `renderGamesList()`, badge, chips), `getGamesFilterDrawerMatchingCount()` (runs `matchesGameFilters` over `games` with **staged** criteria), `selectGamesSortOption(key, asc)`, `toggleGamesSortDropdown`/`closeGamesSortDropdown`, `removeGamesFilterChip(type, val)`, `clearGamesSearchFilter()`.

**Remove** `openHistoryFilterDrawer` (`:41`), `toggleStagedPlayerGameFilter` (`:199`), `toggleStagedGamesWinnerOnly` (`:8`), and the `history-filter` branches of `resetFilters` (`:306-310`) and `applyAndCloseDrawer` (`:334-340`).

## 6. List renderer — `src/javascript/views/adminView.js`

In `renderGamesList` (`:948`):
- Replace the inline `games.filter(...)` block (`:994-1023`) with a call to `matchesGameFilters`, keeping the existing gorgeous-view rule `if (isGorgeous && game.is_historical) return false;` and the count-label denominator logic (`:966-974`) as they are.
- Insert `sortGames(filteredGames, gamesSort, gamesSortAsc, names)` before the `.map()`.
- In `renderPlate` (`:1161-1168`), replace the single-index `isPlayerFilterMatch` check with `activeGamesPlayers.has(pIdx < MAX_WEIGHTED_PLAYERS ? pIdx : MAX_WEIGHTED_PLAYERS)`; the search-match glow at `:1159/1182` is unchanged.
- The per-plate hero record loop (`:1189-1202`) rescans every game for every plate. Out of scope — flagging it, not touching it.

Wire `renderGamesList` in `admin.js` to also refresh the badge and chips after any state change that affects them, matching how `renderList`'s callers do it.

## 7. Wiring — `src/javascript/eventBindings.js`

- Repoint `bindClick("btn-trigger-games-filter", …)` (`:30`) to `filters.openGamesFilterDrawer`; add `bindClick("btn-trigger-games-sort", filters.toggleGamesSortDropdown)`.
- Add `bindClick` for `games-filter-drawer-close-btn` → apply (matching the Heroes drawer, where Close applies — `:162`), `games-filter-drawer-reset`, `games-filter-drawer-apply`.
- Add a `#filter-drawer-games` click listener (date-range `.segmented-pill[data-range]` + backdrop close) and `change` listener for `input[data-type]`, mirroring `:145-156` and `:249-257`.
- Add a `#games-sort-dropdown-menu` delegated `select-games-sort` handler, mirroring `:236-246`.
- Add a `#games-active-filters-container` delegated handler for `clear-games-search-filter` / `remove-games-filter-chip`, mirroring `:352-371`.
- Extend the existing global outside-click handler (`~:644`) to also close `#games-sort-dropdown-container`.

## 8. CSS — `src/styles/filters.css`

Nearly nothing new: `.filter-action-bar`, `.sort-dropdown-*`, `.filter-chip*`, `.active-filters-container.has-chips`, `.filter-drawer-*`, `.segmented-*` are all global and already carry the Heroes look.

One genuinely missing rule: **`.filter-count-bubble` has no CSS anywhere** — Heroes emits it (`filterView.js:450-462`) and it renders as bare text. The History drawer needs it to look right, so add the rule. It incidentally fixes the same glitch on Heroes; calling that out because it is the one change touching Heroes' appearance.

---

## Verification

1. `npm test` — new `gameFilters.test.js` green, existing suites unaffected.
2. `npm run dev`, open `#history`:
   - Action bar renders two-up, visually identical to `#database`; SORT label reads `Date (Newest)` and the list order is unchanged from today by default.
   - Each sort option reorders correctly; the chosen option shows `.active` in the menu; clicking outside closes it.
   - Filter drawer slides in **from the left**; header count updates live as boxes are ticked *without* applying; section titles grow count bubbles; RESET clears everything; APPLY closes and re-renders; Close applies.
   - Badge count matches the number of active filters; chips appear in order and each ✖ removes exactly that filter and unticks its drawer checkbox.
   - Search matches a hero name, a player name, and `duel` / `free for all`; hero matches still get the plate glow; multi-select player filter glows every selected player's plate.
   - Result filter: Win/Loss flip meaning correctly with and without a player selected; In Progress matches the games counted by the History nav badge; Draw matches all-`false` games.
   - Date range, game type (incl. Legacy), and Historical behave; "Showing X of Y games" tracks.
   - Admin only: "Switch to Admin List View" still works and both views respect the new filters and sort.
3. Commit and push to **`dev`** — the owner has explicitly authorized working on `dev` directly rather than on an assigned `claude/*` branch. No merge from `main`; the only thing `main` carries that `dev` doesn't is `.github/workflows/keep_alive_dev.yml`, which is obsolete now that the dev Supabase stack runs locally, so it deliberately stays off `dev`.

---

## Notes for whoever picks this up

- **Line numbers above were captured against `dev` at `cd0a4f3`.** They were re-verified after `dev` picked up the local-Supabase work: `renderGamesList` is still at `adminView.js:948`, and `filters.js` / `filterView.js` / `eventBindings.js` / `stateStore.js` are untouched by that work, so every anchor in this document holds. Only `index.html` shifted (the inline `window.isProd` script was removed from `<head>`), which is why the drawer registration line is 44 and not 49. Re-check before trusting them if `dev` has moved again.
- **`docs/` is build output**, not documentation — don't put anything hand-written there.
- Nothing from this plan has been implemented. The working tree is clean apart from this file.
