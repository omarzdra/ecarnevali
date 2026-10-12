# 10 — Testna strategija in kakovost

## Orodja in standard
- `Vitest` za funkcije, mapperje, parsers, prediction.
- `Supertest` za Express route pogodbe z mock services.
- `React Testing Library` za ključne UI states.
- ESLint + TypeScript `tsc --noEmit` + format check.
- Testi so deterministični in praviloma **ne odvisni od interneta**; live smoke testi so ločen ročni/CI korak in niso del unit testa.

## Obvezen testni nabor
| Področje | Pozitivni test | Negativni/robni test |
|---|---|---|
| NHL mapper | scheduled/final/OT in datumi | neznan status, manjkajoč SOG, struktura se je spremenila |
| NHL client | uspešen HTTP in cache | 404, 503, timeout, nepravilni JSON |
| MoneyPuck importer | pravilna vrstica all, float, gameId | BOM, prazno število, invalid, duplicate, mismatch team/situation |
| Join | gameId/team/situation match | 0 ujemanj, 2+ ujemanj, neujemanje sezone |
| Advanced stats | CF% in FF% pravilna | denominator 0, ni ene ekipe, ni obeh |
| Prediction data | zgodovina pred časom cilja | data leakage, SO zmaga, future/live |
| Poisson | vsota skoraj 1, simetrija | λ outside bounds, PMF rep, NaN |
| Prediction API | valid envelope in status | insufficient_data, 409 on live, invalid ID |
| Frontend | prikaz strani in atribucije | loading, empty, partial, stale, error |
| Timezone | lokalno prikazan start | dan se prelomi ob UTC polnoči |

## Primeri natančnih invariant
```text
abs(P(homeRegWin)+P(tie)+P(awayRegWin)-1) < 1e-7
abs(P(over5.5)+P(under5.5)-1) < 1e-7
0 <= everyProbability <= 1
P(home keeps regulation shutout) == P(awayGoals == 0)
no opponent goals without confirmed NHL per-period data
```

## Fixture politika
- Pri resničnih NHL odgovorih obdrži samo **minimum polj** za test; zapiši zajeti endpoint/datum v komentar/metadato.
- MoneyPuck testna CSV datoteka naj bo sintetična in majhna (npr. 3 igre, 6 vrstic, več situacij), da ne redistribuira velikih podatkov.
- Primeri v `docs/06-API-CONTRACT.md` so ilustracije in se jih **ne** uporablja kot referenco pričakovane številčne napovedi.

## Skripte (implementiraj do M1)
```json
{
  "scripts": {
    "dev": "...",
    "lint": "...",
    "typecheck": "...",
    "test": "...",
    "build": "..."
  }
}
```
V resničnem `package.json` dopolni izvajanje preko npm workspaces. Ne napiši uspeha, če nisi zagnal testov.

## Definicija 'done'
- Implementacija sledi sprejetim dokumentom in javnim kontraktom.
- TypeScript typecheck uspe.
- Lint brez errorjev.
- Unit + API testi uspejo; za novo logiko vključujejo robni primer.
- Build uspe.
- UI deluje pri odsotnosti MoneyPuck podatkov.
- Pojasnjena sta upstream vir in modelVersion.
- Zadnji odgovor Codex vsebuje command → PASS/FAIL/NOT_RUN in razlog za vsak NOT_RUN.
