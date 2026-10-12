# 03 — NHL Web API: integracija JSON

## Vir in status
- Osnovni URL: `https://api-web.nhle.com/v1`.
- Javne endpointe povzema **neuradna** referenca https://github.com/Zmalski/NHL-API-Reference; dostopnost in shema se lahko spremenita.
- Preden Codex implementira endpoint, naj preveri dejanski odziv (`curl`, `fetch`) in shrani minimalen **redaktiran testni fixture**. Brez odziva ne izmišljaj poti/polj.

## Začetni endpointi (zahtevajo živo preverjanje v M2)
| Namen | Primer GET | Status v specifikaciji |
|---|---|---|
| Tekme na dan | `/score/2026-10-12` | dokumentirana pot, preveri payload |
| Razpored po datumu | `/schedule/2026-10-12` | dokumentirana pot, lahko vrne več dni |
| Boxscore | `/gamecenter/{gameId}/boxscore` | dokumentirana pot |
| Podrobnosti / dogodki | `/gamecenter/{gameId}/landing` | opcijsko |
| Sezona ekipe | `/club-schedule-season/{abbr}/{seasonId}` | dokumentirana pot |
| Igralci ekipe | `/club-stats/{abbr}/{seasonId}/{gameType}` | opcijsko; ni enako ekipnemu seštevku |

Primer `seasonId = 20262027`, `gameType=2` za regular season in `3` za playoffs. ID igre je celoštevilski NHL identifikator, kot npr. `2023020204` (primer ID, ne trditev o prihodnji tekmi).

## M2 — izvedbeni koraki
1. Dodaj konfiguriran `NHL_BASE_URL` in `fetchWithTimeout` z omejitvijo odziva.
2. V M2 zajemi primer `score/{date}`, `gamecenter/{id}/boxscore` in en sezonski endpoint.
3. Preglej dejansko pot polj, obravnavaj dodatna neznana polja, vendar zahtevaj ključne identifikatorje.
4. Napiši `nhlApiClient.ts`, `nhl.mapper.ts`, `nhl.service.ts`, Zod parsanje in fixture teste.
5. Čas je ISO 8601 UTC v internih modelih (`startTimeUtc`); datum vmesnika se izračuna v uporabniškem lokalnem času. Datum API poizvedbe mora spoštovati timezone in NHL koledarske posebnosti (vključi meji dneva).
6. Razločuj `scheduled`, `live`, `final`, `unknown` in zaključek `REG`, `OT`, `SO`, kadar ga možno zanesljivo določiti.
7. Če UI želi izključno 1 datum, filtriraj igre na ustrezen ciljni časovni pas; `/schedule` lahko zajema več dni.

## Pravila za rezultate
- `score` za načrtovano tekmo je `null`, ne 0.
- `shotsOnGoal` ne pomeni `shotAttempts`; če vir nima strelov, uporabi `null`.
- `gameType` mora biti prikazan oziroma filtriran; ne mešaj preseason/regular/postseason pri izračunu.
- Po končani tekmi `finalScore` lahko vključuje OT/SO. Za Poissonov **regulation** model potrebujemo 60-minutne zadetke. V tekmi, končani po SO, je končni rezultat lahko dodeljen z SO zmagovalnim golom; ne uporabljaj ga kot dejanske gole v rednem delu. Glej `07-PREDICTION-MODEL.md`.
- Zgodovina za napovedi mora imeti **regulation home/away goals**. Če jih ni mogoče zanesljivo rekonstruirati iz per-period scoring, tekmo izloči iz treninga; ni dovoljeno v tišini uporabiti final score.

## Predlog storitvenih metod
```ts
interface NhlDataSource {
  getDailyGames(date: string): Promise<Game[]>;
  getGame(gameId: number): Promise<GameDetail | null>;
  getTeamSeasonGames(abbr: string, seasonId: string): Promise<Game[]>;
}
```
`Game`, `GameDetail` sta opisana v `05-DATA-CONTRACTS.md`.

## Napake in cache
- Timeout upstream npr. 8 s; 1 retry samo za prehodne omrežne/5xx napake z backoff.
- `404` za neobstoječo igro preslikaj v `404 GAME_NOT_FOUND`.
- Odsoten zunanji vir → `503 UPSTREAM_UNAVAILABLE` razen kadar je na voljo veljaven cached snapshot.
- Predlagani TTL: scheduled 10–30 min; live 30–60 s; final 12–24 h; team season 15–60 min. TTL je politika aplikacije, ni NHL zagotovilo.
- HTTP brskalnik naj ne prikazuje zastarelih podatkov kot živih brez `lastUpdatedAt`.

## M2 acceptance
- Dnevne tekme in en boxscore zanesljivo normalizirana.
- Test `scheduled`, `final`, unknown status, manjkajoč SOG, 404/timeout.
- Preverjeni dejanski primeri in URL/čas preverjanja dokumentirani v test fixture README ali commit opombi.

## Viri
- https://api-web.nhle.com/v1/score/now
- https://github.com/Zmalski/NHL-API-Reference
- https://github.com/pseudo-r/Public-NHL-API/blob/main/docs/web-api/games.md
