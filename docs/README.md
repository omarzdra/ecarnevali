# HockeyStats /docs — kazalo dokumentacije

**Izdaja specifikacije:** 1.0 · **Datum:** 2026-10-12 · **Status:** načrt MVP, ne potrditev že izdelane funkcionalnosti.

HockeyStats je študentski projekt integracije spletnih storitev (TIDS). Namen je pridobivanje **NHL JSON** in **MoneyPuck CSV** podatkov, njihovo povezovanje in prikaz ter lastne preproste NHL napovedi. Dokumentacija je pripravljena za ljudi in razvojnega pomočnika Codex.

## Vrstni red branja
1. [`01-SCOPE.md`](01-SCOPE.md) — kaj je MVP in kaj ni.
2. [`02-ARCHITECTURE.md`](02-ARCHITECTURE.md) — stack, moduli, tok podatkov.
3. [`05-DATA-CONTRACTS.md`](05-DATA-CONTRACTS.md) — tipi in invarianti.
4. [`06-API-CONTRACT.md`](06-API-CONTRACT.md) — REST pogodbe.
5. [`11-MILESTONES.md`](11-MILESTONES.md) — izgradnja po etapah.

## Dokumenti po temi
| Dokument | Vsebina |
|---|---|
| [`03-NHL-INTEGRATION.md`](03-NHL-INTEGRATION.md) | NHL API endpointi, validacija, cache, časovni pas |
| [`04-MONEYPUCK-INTEGRATION.md`](04-MONEYPUCK-INTEGRATION.md) | zakonit CSV uvoz, mapping, coverage, GSAx |
| [`07-PREDICTION-MODEL.md`](07-PREDICTION-MODEL.md) | matematični model, Poisson, win/OT/shots/shutout |
| [`08-FRONTEND.md`](08-FRONTEND.md) | strani, komponente, grafi, loading/error/empty |
| [`09-BACKEND.md`](09-BACKEND.md) | Express plasti, cache, timeouts, obravnava napak |
| [`10-TESTING.md`](10-TESTING.md) | testi, matrika preverjanj, acceptance criteria |
| [`11-MILESTONES.md`](11-MILESTONES.md) | M0–M8 s postopki in merili |
| [`12-DEPLOYMENT.md`](12-DEPLOYMENT.md) | lokalno okolje, Railway, Vercel, CSV artefakt |
| [`13-CODEX-WORKFLOW.md`](13-CODEX-WORKFLOW.md) | pravila delo s Codex, prompti, skills |
| [`14-DECISIONS-AND-RISKS.md`](14-DECISIONS-AND-RISKS.md) | ADR, tveganja, nerešena vprašanja |
| [`15-SOURCES.md`](15-SOURCES.md) | povezave na zunanje vire in atribucije |
| [`16-TIDS-DELIVERABLES.md`](16-TIDS-DELIVERABLES.md) | preslikava na fakultetne zahteve |
| [`17-UX-DESIGN.md`](17-UX-DESIGN.md) | UI smernice, tekstovne skice, dostopnost |
| [`18-ROADMAP-POST-MVP.md`](18-ROADMAP-POST-MVP.md) | predlogi po obveznem MVP |

## Pravila pri dvoumnostih
- Ta dokumentacija je **projektna odločitev**, ne trditev, da zunanji ponudnik zagotavlja določeno shemo ali SLA.
- Dejanske stolpce MoneyPuck in polja NHL endpointov je treba preveriti pred uporabo; primeri v dokumentaciji so **normalizirane oblike**, razen kjer je eksplicitno napisano drugače.
- Če se zahteve in implementacija razlikujejo, Codex predlaga minimalno spremembo, popravi teste in relevantne dokumente ter razliko izpostavi v zaključnem poročilu.

## Prva izvedba
Preberi `../README-CODEX-SETUP.md`. Za Codex je glavni začetni dokument `../AGENTS.md`.
