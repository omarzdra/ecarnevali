---
name: hockey-prediction-engine
description: Use to implement, review, or test HockeyStats pregame NHL statistical prediction calculations (regulation goal averages, Poisson distributions, 1-X-2, over/under, team thresholds, BTTS, shot estimates) with strict time cutoff and no future data leakage.
---

# Prediction engine workflow

## Read first
Read `AGENTS.md`, `docs/07-PREDICTION-MODEL.md`, `docs/05-DATA-CONTRACTS.md`, `docs/06-API-CONTRACT.md`, `docs/10-TESTING.md`.

## Procedure
1. Check upstream history provides actual first-3-period goals. Exclude matches with unknown regulation goals; never silently use SO final score.
2. Enforce training cutoff **strictly before target game**, `gameType=2`, completed games only. Count samples and minimum eligibility.
3. Implement season+recent averages and split conditions as pure functions; model constants and version in one module.
4. Calculate λs, then Poisson PMFs with covered tails, then independent score matrix. No hard-coded probabilities.
5. Aggregate all advertised probabilities; distinguish tie after 60 from overall winner. For overall only explicit 50/50 tiebreak approximation if chosen.
6. Separately compute SOG estimates if verified and enough data; otherwise return null, not 0.
7. Write robust deterministic tests: symmetry, sums ≈ 1, under+over ≈1, missing history, game excluded after cutoff, final SO.
8. Ensure API includes modelVersion, cutoff and warnings and frontend doesn't relabel model outputs as MoneyPuck xG.

## Done
Clean pure statistical functions, type-safe service, passed invariant tests and disclosure of assumptions.
