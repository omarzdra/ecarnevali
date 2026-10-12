---
name: nhl-api-integration
description: Use when implementing or debugging HockeyStats NHL Web API JSON fetches, game schedules, boxscores, normalization, caching, and verification of real NHL response fields. Do not use for MoneyPuck CSV or prediction mathematics.
---

# NHL API integration workflow

## Read first
Read `AGENTS.md`, `docs/03-NHL-INTEGRATION.md`, `docs/05-DATA-CONTRACTS.md`, `docs/06-API-CONTRACT.md` and `docs/10-TESTING.md`.

## Procedure
1. Inspect existing source and tests. Before coding, check the exact live NHL endpoint relevant to the feature (or state that network verification was unavailable).
2. Record key raw response fields; don't invent JSON paths from memory. Maintain a small, redacted fixture for each tested game state.
3. Implement/adjust fetch client with server-side timeout, structured errors and bounded retry.
4. Parse/validate the external shape at boundary, convert to shared models, preserve `null` for missing attributes.
5. Treat status, per-period scoring and final/SO goals as separate concepts. Never use SO finalGoals as regulationGoals.
6. Write Vitest adapter tests and Supertest endpoint test including a failure scenario.
7. Run lint, typecheck, tests and build; report exact status and any unverified source assumptions.

## Done
One real verified endpoint, internal model, public API response, and tests; no direct NHL payload shape in React components.
