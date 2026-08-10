# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 5. Project Setup

Vanilla JS + Vite SPA with a Supabase backend. `DEVELOPER.md` is the source of truth for architecture, data model, and workflows — read it before non-trivial work. The essentials:

**Environments.** One hosted Supabase project (production, ref `ojqkkixtvdtccuixishh`), selected only on the hostnames `sygec.github.io` and `dicethrone-prod.sygec.workers.dev`. Every other hostname — localhost included — uses a local Supabase stack running in Docker on port `54321`. There is no hosted dev project and no hosted dev deployment.

**Local loop:**

```bash
supabase start        # requires Docker Desktop to be running
supabase db reset     # replays migrations, then loads supabase/seed.sql
npm run dev           # http://localhost:5273 (preview: 4273; both strictPort)
```

Seeded admin is `admin@local.test` / `password123`. Seeded hero names carry a `LOC-` prefix, so seeing `LOC-` in the UI confirms the app is on the local database.

**Guardrails:**

- Never run `supabase link`, `db push`, `db pull`, `secrets`, or `functions deploy`. Those reach production and are the user's to run; `.claude/settings.json` denies them.
- Schema changes go in `supabase/migrations/` and must replay cleanly against an **empty** database — verify with `supabase db reset`, not just by reading the SQL. A migration that depends on rows already existing will break local bootstrap.
- `docs/` is generated build output deployed from `main`. Never hand-edit it; it is rebuilt by the Build and Deploy workflow.
