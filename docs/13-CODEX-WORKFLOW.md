# 13 — Delo s Codex: pravila, skills in pripravljeni prompti

## Dve vrsti navodil
- `AGENTS.md` je **vedno relevantna** projektna specifikacija v korenu repozitorija. Codex jo uporablja za stalno usmerjanje.
- `.agents/skills/<ime>/SKILL.md` je **sprožljiv delovni postopek** za ponavljajoče se naloge. V vsakem je YAML `name` in `description`. Codex lahko uporabi skill samodejno glede na opis, ali z eksplicitnim imenom.

**Ne uporabljaj** skills kot zamenjavo za `/docs`: skill obvladuje *kako* rešiti nalogo, `docs` določajo *kaj* zgraditi in pogodbene invariants.

## Predlagani konkretni skills v ZIP
| Skill | Kdaj |
|---|---|
| `$nhl-api-integration` | Endpointi, HTTP client, JSON normalizacija, fixture testi |
| `$moneypuck-data-import` | CSV parser, shema, mapping, artefakt, atribucija |
| `$hockey-prediction-engine` | Dataset brez leakage, Poisson, shots, unit testi |
| `$hockeystats-quality-check` | Pred PR/koncem mejnika tipizacija, test, build, kritični review |

Če Codex skills ne odkrije, preveri lokacijo `.agents/skills/`, zagonski current working directory ali ponovno zaženi Codex.

## Obvezen iterativni proces
1. Povej Codexu **en** mejnik (M0–M8).
2. Naj prebere AGENTS, relevantne docs in ustrezen SKILL.
3. Naj poroča o obstoječem stanju kode in predlaga kratek plan.
4. Naj implementira najmanjši delujoč vertikalni rez (adapter + endpoint + test + po potrebi UI).
5. Naj požene checks in poda dejanske rezultate, ne generične trditve "vse deluje".
6. Ročno preveri demo, commitaj in šele nato nadaljuj.

## Prompt 1 — setup
```text
Izvedi M0 in M1 iz docs/11-MILESTONES.md. Preberi AGENTS.md, docs/01-SCOPE.md in docs/02-ARCHITECTURE.md. Najprej preglej obstoječ repo; ne podvajaj že obstoječih datotek. Postavi npm workspaces, React+Vite+TS frontend, Express+TS backend, shared tipe, osnovni /health, Tailwind in skripte dev/lint/typecheck/test/build. Zaženi preverjanja in izpiši PASS/FAIL/NOT_RUN. Ne izvajaj M2.
```

## Prompt 2 — NHL
```text
Izvedi samo M2. Uporabi $nhl-api-integration. Najprej živo preveri NHL JSON endpointe in zapiši polja, potrebna za lastne tipe v docs/05-DATA-CONTRACTS.md. Implementiraj adapter, mapperje, lastne games endpoint-e in teste z majhnimi fixtures. Posebej reši scheduled/final/OT/SO, timezone in manjkajoče SOG; kjer ni zanesljivega regulation score, pusti null. Poročaj o preverjenih endpointih in o tem, česar nisi mogel preveriti.
```

## Prompt 3 — MoneyPuck
```text
Izvedi samo M3 in nato, če so testi zeleni, M4. Uporabi $moneypuck-data-import, preberi docs/04-MONEYPUCK-INTEGRATION.md. Uporabi samo dovoljen javni CSV download (brez scrapanja). Preveri dejanske stolpce in situation. Naredi skripto za uvoz, source metadata, join po gameId/team/situation in /advanced API ter UI z atribucijo. Ob manjkajočih podatkih advanced vrni unavailable, NHL igre pa ohrani. Ne dodajaj baze.
```

## Prompt 4 — prediction
```text
Izvedi samo M6 iz docs/11-MILESTONES.md s skillom $hockey-prediction-engine. Obvezno sledi docs/07-PREDICTION-MODEL.md. Za regulacijske gole uporabi prve 3 periode, brez SO/OT rezultatov in data leakage. Implementiraj minimal sample, lambda, Poisson matrici, 1-X-2, over/under, team goal thresholds, BTTS, likely score, regulation shutout in opcijske shots z jasnimi opozorili. Dodaj deterministične teste matematičnih invariant in API odgovor po docs/06-API-CONTRACT.md. Ne uporabljaj MoneyPuck kot inputa modela.
```

## Prompt 5 — frontend
```text
Izvedi M5 oziroma M7 frontend del. Preberi docs/08-FRONTEND.md in docs/17-UX-DESIGN.md. Implementiraj odzivne strani z jasno prikazanim loading/empty/error/partial/stale stanjem. Vse se bere prek /api/v1. Predikcije označi kot lastne modelne ocene, loči MoneyPuck xG od expected regulation goals. Vključi attribution MoneyPuck, naslove grafov in dostopnost tipkovnice. Dodaj komponentne teste.
```

## Prompt 6 — review in zaključek
```text
Uporabi $hockeystats-quality-check. Primerjaj implementacijo z AGENTS.md in docs/01–12, preveri izhodiščne invariants ter izpelji lint, typecheck, tests, build, security sanity checks in smoke test. Popravi odkrite blokirajoče napake, vendar ne spreminjaj arhitekture brez ADR. Na koncu izpiši tabelo command, result, evidence, known limitations in odprte postavke.
```

## Kako deliti velike naloge
Ne pošiljaj "naredi vso aplikacijo". Pri težji integraciji raje najprej prosi za namenjen proof-of-concept nad enim realnim fixture primerom, nato adapter, pogodbo in UI, končno drugi scenarij ter edge cases.

## Code review vprašanja
- Ali je bil zunanji JSON/CSV dejansko preverjen?
- Ali je uporabljen pravilen game ID, ekipa, season, situation?
- Ali je MoneyPuck naveden in brez scrapanja?
- Ali je 60-minutni gol različen od final/SO rezultata?
- Ali so vrednosti `null`, kjer niso na voljo?
- Ali imajo verjetnosti veljavne vsote?
- Ali napoved nima podatkov po kickoffu?
- Ali API ščiti frontend pred spremembami zunanjih shem?
