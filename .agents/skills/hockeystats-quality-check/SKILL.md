---
name: hockeystats-quality-check
description: Use at the end of every HockeyStats milestone or before committing a PR to audit type safety, architecture boundaries, REST contract compatibility, source data handling, prediction invariants, security basics, build and tests.
---

# HockeyStats quality gate

## Read first
Read `AGENTS.md`, `docs/10-TESTING.md`, `docs/05-DATA-CONTRACTS.md`, `docs/06-API-CONTRACT.md`, `docs/11-MILESTONES.md` and changed feature documents.

## Procedure
1. Inspect `git diff`, relevant existing tests, generated artifacts and changes to public API.
2. Spot-check that external sources have adapter boundary; raw CSV never goes to browser; NHL failures don't turn into fake values; MoneyPuck attribution is present.
3. Confirm predictions are based only on pre-target game data and first 3 periods, not final SO; probability totals and numeric fields are valid.
4. Execute the real commands available: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` from repo root. If scripts aren't implemented yet, explicitly say NOT_RUN and why.
5. Inspect `git status` for `.env`, huge raw CSV, credentials, generated runtime data and unintended files.
6. Report PASS/FAIL/NOT_RUN, exact commands, files impacted, discovered issues ranked critical/high/low and suggested fix. Fix blockers only if in scope and safe.
7. Don't mark milestone as completed if tests fail or cannot be run; note the blocking reason.

## Done
Clear reproducible evidence, no false test claims, consistent docs and safe source handling.
