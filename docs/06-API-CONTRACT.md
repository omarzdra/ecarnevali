# 06 — HockeyStats REST API v1

**Base path:** `/api/v1` · **Content-Type:** `application/json` · Časi UTC ISO 8601 · verjetnosti od 0 do 1. Frontend uporablja samo ta API. Primeri so izmišljeni in ne pomenijo dejanskih NHL rezultatov.

## Enotna oblika odziva
Uspeh:
```json
{"data":{},"meta":{"requestedAt":"2026-10-12T12:00:00Z","dataStatus":"available","sourceUpdatedAt":null}}
```
Napaka:
```json
{"error":{"code":"GAME_NOT_FOUND","message":"Tekme ni mogoče najti.","details":null}}
```
Napake `400 INVALID_QUERY`, `404 GAME_NOT_FOUND`, `422 INVALID_SOURCE_DATA`, `503 UPSTREAM_UNAVAILABLE`, `500 INTERNAL_ERROR`. Podrobnosti ne smejo vsebovati občutljivih vrednosti ali celotnih upstream dumpov.

## Endpointi in query parametri
| Pot | Namen | Vhod | `data` odgovor |
|---|---|---|---|
| `GET /health` | health check (izven `/api/v1`) | — | `{status:'ok', version:'...'}` |
| `GET /api/v1/games?date=YYYY-MM-DD` | igre na datum | `date` obvezen | `{games: Game[]}` |
| `GET /api/v1/games/:gameId` | details | veljaven pozitivni int | `GameDetail` |
| `GET /api/v1/games/:gameId/advanced?situation=all` | MoneyPuck | `situation=all|5on5` | `GameAdvanced` ali `null` + meta |
| `GET /api/v1/teams` | seznam NHL ekip | — | `{teams: TeamRef[]}` |
| `GET /api/v1/teams/:abbr/games?season=20262027` | ekipa v sezoni | abbr, season | `{games: Game[]}` |
| `GET /api/v1/teams/:abbr/summary?season=20262027` | rezultati, forma | abbr, season | `TeamSummary` (glej spodaj) |
| `GET /api/v1/predictions/:gameId` | model pred začetkom | gameId | `Prediction` |

### TeamSummary
```ts
interface TeamSummary {
  team: TeamRef;
  seasonId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  overtimeLosses: number | null;
  goalsFor: number;
  goalsAgainst: number;
  shotsFor: number | null;
  shotsAgainst: number | null;
  recent: Array<{ gameId:number; result:'W'|'L'; date:string }>;
}
```
Pri zgodovini preveri, ali je zmaga/poraz po OT/SO pravilno razvrščena; v primeru nepopolnih podatkov `overtimeLosses=null`. Seznam `/teams` ne sme biti preprosto hardcoded brez preverjanja, ali vključuje nove ekipe in preimenovanja.

## Pravila endpoints
- **`/games`:** privzeto `date` obvezen, tudi če je frontend nastavljen na "danes". Datum je namenoma ekspliciten za cache in teste.
- **`/games/:gameId`:** vrne tudi `advanced` kadar je na voljo; izpad MoneyPuck ne povzroči `503` za celoten GameDetail.
- **`/advanced`:** če ni podatka, `200` z `data:null` in `meta.dataStatus:'unavailable'` (ne lažna ničelna statistika). Sintaksa neveljavnega `situation` → 400.
- **`/predictions`:** samo `scheduled` regular-season pred začetkom; za `live/final` ali playoff vrni `409 PREDICTION_NOT_APPLICABLE` ali eksplicitno definiran 422 z razlago. `insufficient_data` ni napaka strežnika: `200` s `status:'insufficient_data'`.
- Pri napaki NHL adapterja brez predpomnilnika HTTP `503`, z veljavnim stale snapshotom `200` z `meta.stale:true`, `meta.sourceUpdatedAt`.
- Nikoli ne vračaj surovega upstream response ali CSV v javnem API.

## Primer `GET /api/v1/predictions/123` (sintetičen, skrajšan)
```json
{
  "data": {
    "gameId": 123, "modelVersion": "poisson-baseline-v1",
    "computedAt": "2026-10-12T12:00:00Z",
    "inputCutoffUtc": "2026-10-12T12:00:00Z",
    "status": "available", "reason": null,
    "sample": {"homeGames": 20, "awayGames": 19, "seasonId": "20262027"},
    "expectedRegulationGoals":{"home":3.1,"away":2.8},
    "regulation":{"homeWin":0.44,"tie":0.17,"awayWin":0.39},
    "overallWin":{"home":0.525,"away":0.475,"method":"equal_tiebreak"},
    "mostLikelyRegulationScore":{"home":3,"away":2,"probability":0.05},
    "totalGoals":{"over5_5":0.54,"under5_5":0.46},
    "teamGoalsOver2_5":{"home":0.6,"away":0.53},
    "bothTeamsScoreAtLeast1":0.91,
    "bothTeamsScoreAtLeast2":0.71,
    "regulationShutout":{"homeKeeps":0.06,"awayKeeps":0.045},
    "shots":{"expectedHome":30.2,"expectedAway":28.1,"homeMore":0.6,"awayMore":0.35,"tie":0.05},
    "warnings":["Model predpostavlja neodvisno porazdelitev golov."],
    "methodology":"Preprosta zgodovinska Poissonova ocena; ni MoneyPuck xG."
  },
  "meta":{"requestedAt":"2026-10-12T12:00:00Z","dataStatus":"available","sourceUpdatedAt":null}
}
```
Verjetnosti v zgornjem primeru so **izmišljene in niso numerično vezane na lambda**; to je demonstracija javne JSON oblike, ne referenčni testni fixture modela. Implementacija mora vrednosti izračunati iz definiranih funkcij in ohraniti konsistentnost.

## Pogodbeni testi
- Vsi uspešni odgovori validirani s shared Zod shemo (ali `satisfies` + testom).
- 400 za neveljaven datum/id/season/abbr.
- JSON enakih vhodnih zgodovinskih podatkov in modelVersion vrne enako napoved (izjema `computedAt`).
- Napaka MoneyPuck ne izbriše NHL rezultatov.
