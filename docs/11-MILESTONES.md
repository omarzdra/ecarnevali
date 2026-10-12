# 11 — Razvojni mejniki za Codex

**Pravilo:** izvajaj en mejnik naenkrat. Checkbox potrdi samo po dejanskem testu/implementaciji. Navedeni statusi so začetni in niso trditev, da je koda že napisana.

## M0 — Repo review in plan
- [ ] Preveri, ali v repozitoriju že obstajajo packages, lock, CI, `AGENTS.md`.
- [ ] Usaglasi obstoječe stanje z `02-ARCHITECTURE.md`; brez podvajanja in brez brisanja prejšnje kode.
- [ ] Zapiši trenutno stanje v Codex odgovor in načrt M1.
**DoD:** jasno poročilo o repozitoriju; brez nepotrebnih sprememb.

## M1 — Workspace + osnovni aplikaciji
- [ ] npm workspaces (`frontend`, `backend`, `shared`).
- [ ] React/Vite/TS app, React Router, Tailwind; osnovni layout.
- [ ] Express/TS app, `/health`, centralni error handler, CORS.
- [ ] `shared` TS + Zod začetni tipi; .env.example brez skrivnosti.
- [ ] Typecheck, lint, test, build, enostavni avtomatski smoke test.
**DoD:** lahko zaženeš oba serverja lokalno; FE pokaže naslov in BE `/health`.

## M2 — NHL JSON integracija
- [ ] Preveri živ NHL API path + sheme.
- [ ] NHL adapter: dnevne tekme, game detail, team games.
- [ ] API `/games`, `/games/:id`, `/teams`, `/teams/:abbr/games` (minimalna verzija).
- [ ] Test validacije query, final/OT/SO, SOG, missing fields.
**DoD:** resnični NHL podatki, lasten REST JSON in test fixtures.

## M3 — MoneyPuck CSV importer
- [ ] Izberi uradni dovoljeni CSV download; dokumentiraj URL, stolpce in situacije.
- [ ] Skripta za uvoz + test sintetičnega CSV + generator artefakta.
- [ ] Index `gameId + team + situation`; nejasni pari zavrnjeni.
- [ ] Data status, vir in datum osvežitve.
**DoD:** preverjen JSON artefakt s pravilnim xG in attempt counters.

## M4 — Združen prikaz zgodovinske tekme
- [ ] `/games/:id/advanced` in `advanced` v GameDetail.
- [ ] Corsi/Fenwick %, `all` vs `5on5`, `unavailable/partial`.
- [ ] `/games/:id` frontend detail stran s standardnimi + advanced metrikami.
- [ ] `MoneyPuck.com` atribucija.
**DoD:** resnična odigrana tekma ima oba vira povezana; brez MP deluje NHL prikaz.

## M5 — Ekipe in dashboard
- [ ] `/`, `/games`, `/teams`, `/teams/:abbr` in njihove UI states.
- [ ] Local time, date picker, responsive in error handling.
- [ ] Ekipa forma in povzetek sezone iz verificiranih podatkov.
**DoD:** navigacija in različni datumi delujejo, pokritost komponentnih testov.

## M6 — Prediction engine in API
- [ ] Zgodovina regulacijskih golov brez data leakage.
- [ ] Izračun sezone/forme/home-away in λ.
- [ ] Poisson matrika, win 1-X-2, over/under, team goals, BTTS, reg shutout, likely score.
- [ ] Shot estimate + verjetnosti, če je dovolj SOG zgodovine.
- [ ] `/predictions/:gameId`, insufficient data in matematični unit testi.
**DoD:** konsistentna in reproducibilna napoved iz realnih preteklih tekem.

## M7 — Prediction UI, QA in deploy
- [ ] Prematch UI in opozorila, razlaga metode in cutoff.
- [ ] Dev/prod env konfiguracija, Vercel FE, Railway BE.
- [ ] Build/deploy brez trajne lokalne baze, pravilno generiranje CSV artefakta.
- [ ] Test hladnega zagona, data unavailable in full flow; README uporaba.
**DoD:** public demo z jasno navedenimi omejitvami, vsi quality gates preverjeni.

## M8 — TIDS dokumentacija in predaja
- [ ] V diagramu in dokumentih opisana 2 zunanja sistema, protokoli in formati.
- [ ] Opisi prenesenih dokumentov/atributov/tipov in vloge.
- [ ] GitHub repo, mentorja po navodilu naloge, link in oddaja v preglednico.
- [ ] Posnetki UI, povzetek arhitekture, demonstracija odpovedi MP in NHL.
**DoD:** oddajna dokumentacija ustreza `16-TIDS-DELIVERABLES.md`.

## Delovno navodilo Codex (vsak mejnik)
1. Preberi `AGENTS.md` in le potrebne dokumente/skills.
2. Povzemi trenutno stanje in minimalen plan (max 5 korakov).
3. Implementiraj samo izbor; ne posegaj v druge mejnike, razen blokirajoče odvisnosti.
4. Testiraj, zapiši command/result in nerazrešene težave.
5. Predlagaj naslednji, ne začni ga samodejno.
