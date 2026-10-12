# 08 — Frontend implementacija

## Standard
- Vite + React + TypeScript (`strict:true`), Tailwind CSS, React Router, TanStack Query, Recharts.
- Komponente naj bodo manjše, tipizirane, funkcionalne. `any` ni dovoljen brez utemeljene izjeme.
- Vsak data-fetching hook kliče `frontend/src/api/client.ts` in **lasten `/api/v1`**. Zunanje sheme se ne pojavljajo v `.tsx` datotekah.
- API base URL iz `VITE_API_BASE_URL`; v lokalnem razvoju uporabi Vite proxy proti backendu. Ne graditi absolutnih tujih URL v UI.

## Strani in status
| Pot | UI | Primarni API |
|---|---|---|
| `/` | dashboard, datumski izbirnik, tekme | `/games?date=` |
| `/games` | lista, filter datum in ekipa | `/games?date=` |
| `/games/:gameId` | rezultat, teams, SOG, advanced | `/games/:gameId` |
| `/teams` | vse ekipe | `/teams` |
| `/teams/:abbr` | team summary in zadnje tekme | `/teams/:abbr/summary`, `/games` |
| `/predictions/:gameId` | prematch verjetnosti | `/predictions/:gameId` |
| `/about` | metodologija in atribucija | statična vsebina |

## Zasnova komponent
```text
src/
├── app/{router.tsx,providers.tsx}
├── api/{client.ts,games.ts,teams.ts,predictions.ts}
├── features/games/{GameCard,Scoreboard,GameFilter}.tsx
├── features/analytics/{ComparisonChart,AdvancedStatsTable,SourceAttribution}.tsx
├── features/predictions/{PredictionSummary,RegulationProbabilities,MethodologyNote}.tsx
├── components/{Layout,EmptyState,ErrorState,LoadingSkeleton}.tsx
├── pages/
└── utils/{formatDates,formatNumbers}.ts
```

## Pravila UI
1. **Datumi in čas:** API ISO UTC; UI npr. slovenski lokalni čas. Datumski izbirnik kaže lokalni koledarski datum in jasno lokalno uro tekme. Ne reži UTC datuma kot lokalnega dneva.
2. **Scheduled games:** brez lažnega 0–0 rezultata; prikaži začetek in razpoložljivo napoved.
3. **Final games:** rezultat in oznaka `REG/OT/SO`, statistika standardna + napredna, če je na voljo.
4. **Live games:** status LIVE in predpomnjeni čas posodobitve; brez obljube milisekundne svežine.
5. **MoneyPuck:** ločen segment z atribucijo: `Advanced stats: MoneyPuck.com · situation: all · updated at ...` in linkom; pri odsotnosti sporočilo brez lažne 0.
6. **Predictions:** vedno označi "model HockeyStats / expected regulation goals". Ne uporabljaj market odds izrazov, ki bi napačno nakazovali bookmakerja.
7. **Odstotki:** iz API 0–1; prikaz 0–100 in 1 decimalka; tabelarični prikaz ustrezno. Grafi morajo imeti besedilne vrednosti in aria opise.
8. **Grafika:** športno nevtralen, jasen light/dark, odzivne postavitve mobilno/prenosnik/desktop.
9. **Napake in prazno stanje:** 4 vrste `loading`, `empty`, `unavailable`, `error`, `stale`; `retry` samo pri napaki s smiselnim dejanjem.
10. **A11y:** semantične tabele, navigacija tipkovnica, focus, kontrast, alt imen za logos, razumljivi labeli za graf.

## Predlagani TanStack Query ključi
```ts
['games', date]
['game', gameId]
['advanced', gameId, situation]
['teams']
['team-summary', abbr, seasonId]
['prediction', gameId]
```
Samodejno osveževanje samo tam, kjer je smiselno (live tekme; predtekma občasno), nikoli agresivno polling vseh zgodovinskih strani.

## UI acceptance
- Na 360px ni horizontalnega scrolla celotne strani, tabele so v svoj `overflow-x-auto` vsebnik.
- Datum in ura sta pravilna pri UTC polnoči/zamenjavi časovnih pasov.
- Pravilni `loading/error/unavailable` odzivi za vsak data fetch.
- Test vsaj ene poti s React Testing Library.
