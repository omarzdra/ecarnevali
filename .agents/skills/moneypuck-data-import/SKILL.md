---
name: moneypuck-data-import
description: Use for HockeyStats MoneyPuck noncommercial CSV ingestion, actual header discovery, type validation, gameId/team/situation joining, xG-Corsi-Fenwick calculation, source attribution, and generated JSON artifacts. Do not scrape the site.
---

# MoneyPuck CSV import workflow

## Read first
Read `AGENTS.md`, `docs/04-MONEYPUCK-INTEGRATION.md`, `docs/05-DATA-CONTRACTS.md`, `docs/10-TESTING.md`, `docs/12-DEPLOYMENT.md`, `docs/15-SOURCES.md`.

## Procedure
1. Inspect exact CSV source link found on official `https://moneypuck.com/data.htm` and relevant dictionary; don't assume an API endpoint or column.
2. Document detected headers, game ID semantics, period/situation, sample rows (synthetic for tests), last updated metadata.
3. Parse CSV robustly: quotes, BOM, whitespace, zeros, empty values. Validate each imported row.
4. Enforce situation match and `(season,gameId,team,situation)` uniqueness. If ambiguous, fail fast with actionable error; preserve diagnostics.
5. Compute CF% and FF% only when validated counters exist, denominator > 0; return `null` otherwise. Goalie GSAx only from properly mapped goalie CSV.
6. Build bounded normalized JSON artifact; include sourceName, `importedAt`, and `sourceUpdatedAt` where known. Never commit large raw CSV without review of applicable rights.
7. Test no-match, duplicate, wrong situation, invalid row, zeros and valid 2-team join.
8. Confirm UI contains clickable MoneyPuck.com attribution and fallback on absent artifact.

## Done
Deterministic importer, transparent source and freshness, graceful degradation, no scraper, no missing-stat = 0 bugs.
