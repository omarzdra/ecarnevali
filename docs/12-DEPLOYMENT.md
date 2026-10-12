# 12 — Lokalni razvoj in deployment

## Predpogoji
- Git in trenutno podprt Node.js LTS, združljiv z nameščeno verzijo Vite; uporabiti npm + zavezan `package-lock.json`.
- Dovoljenje za uporabo MoneyPuck podatkov po pogojih vira (nekomercialni demo in jasna atribucija).
- Deploy: Vercel račun za frontend, Railway za backend ali enakovredna Node gostovanja.

## Lokalni ukazi — cilj M1 (po implementaciji)
```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```
**Pozor:** ti ukazi so zahtevana prihodnja pogodba za Codex. Paket ZIP še ne vsebuje izvršljivega `package.json` ali aplikacije.

## Environment template — v M1 dodaj v root `.env.example`
```env
# Backend (server-only)
PORT=3001
NODE_ENV=development
NHL_BASE_URL=https://api-web.nhle.com/v1
CORS_ORIGIN=http://localhost:5173
MONEYPUCK_ARTIFACT_PATH=./backend/data/generated/moneypuck-games.json
NHL_FETCH_TIMEOUT_MS=8000

# Frontend
VITE_API_BASE_URL=http://localhost:3001/api/v1
```
Vite `VITE_` vrednosti so javne v JS bundle; v njih **ni skrivnosti**.

## Frontend — Vercel
- Root directory: `frontend` (ali konfiguracija v monorepu, kjer je workspace pravilno viden).
- Build command mora namestiti root npm dependencies in zagnati workspace build, npr. prilagojeni npm workspace script.
- Output directory: `frontend/dist` (odvisno od root nastavitve).
- `VITE_API_BASE_URL` = pravi HTTPS backend URL s `/api/v1`.
- SPA rewrites: deep link `/games/123` naj vrne `index.html`, ne 404 (Vercel konfiguracija, ki ne prestreže `/assets/*`).

## Backend — Railway
- Node proces posluša na `0.0.0.0:${PORT}` (Railway običajno posreduje dinamično vrednost `PORT`).
- Start command: zgrajeni `backend/dist/server.js` ali `npm run start --workspace=backend`; pred tem `npm run build`.
- Health check: `/health`.
- `CORS_ORIGIN`: HTTPS domena frontenda brez nepotrebnega wildcard.
- Railway runtime filesystem je lahko efemeren. **Ne računaj**, da se lokalni CSV po deployu ohrani na disku ali se sinhronizira med instancami.

## Strategija MoneyPuck artefakta za deployment
Privzeta strategija MVP: uvozno skripto poženi **pred buildom/releasom**, generiraj omejen artefakt, vključuj ga v deployment output. Alternativa je object storage in load ob startu, toda zahteva dodatno infrastrukturo in ni vključena v MVP.

1. Ročno pridobi dovoljen CSV ali uporabi uraden neposredni download.
2. `npm run import:moneypuck -- --input <path>` (to skripto implementira M3) zgradi indeks in metadata.
3. Preveri izhod, atribut `sourceUpdatedAt`, obseg in velikost.
4. Build serverja vključuje artefakt ali ga v runtime prebere iz konfigurirane poti.
5. Če artefakt manjka, API teče brez advanced stats, z jasnim warningom.
6. Periodične posodobitve dodaj šele po delujočem ročnem procesu; ne izmišljaj časov posodabljanja MoneyPuck.

**Pravice:** brez izrecne preverbe ne objavljaj celotnega redistribuiranega MoneyPuck CSV na GitHub; test fixtures naj bodo sintetični. Javni derived agregati morajo upoštevati atribucijo in aktualne pogoje vira.

## Monitoring in smoke test
- `/health` vrne 200.
- `/api/v1/games?date=...` vrne shemo in status.
- `/api/v1/games/:id/advanced` ob manjkajočem artefaktu ne sesuje API.
- `/api/v1/predictions/:id` deluje pri eligible upcoming game ali pojasni `insufficient_data`.
- Frontend deep links, CORS, timezone, MoneyPuck attribution delujejo na pravem deploymentu.

## Opozorila
Skrivnosti nikoli ne zapisuj v GitHub, `.env` ignoriraj, URL za zunanji API ne prihaja iz uporabnikovega inputa. Podatki niso zasnovani za finančne/stavniške odločitve.
