# 09 — Backend implementacija

## Organizacija in odgovornosti
- Express aplikacija v `src/app.ts`; `server.ts` zgolj `.listen` in infrastruktura.
- `routes` držijo HTTP path definicije; `controllers` validirajo vhod in tvorijo response; `services` implementirajo primer uporabe; `adapters` komunicirajo z zunanjimi sistemi.
- API ne vrača surovih NHL/MoneyPuck objektov. Zunanje podatke validiraj pred preslikavo, javne odgovore testiraj against shared contract.

## Predlog tehnične strukture
```text
backend/src/
  app.ts
  server.ts
  config/env.ts
  middleware/errorHandler.ts
  middleware/requestId.ts
  routes/{games,teams,predictions}.routes.ts
  controllers/{games,teams,predictions}.controller.ts
  services/nhl/{client,mapper,service}.ts
  services/moneypuck/{loader,mapper,service}.ts
  services/prediction/{dataset,statistics,poisson,service}.ts
  cache/memoryCache.ts
  utils/{date,errors}.ts
```

## HTTP in varnost
- Validacija vseh `gameId`, datumov, sezon in okrajšav; parametri `date=YYYY-MM-DD`, `season=YYYYYYYY`, `gameId` pozitivno celo število.
- HTTP request timeout na NHL, omejitev velikosti, `AbortController`, omejene ponovitve.
- Zunanja URL je **konfigurirana** — uporabnikov parameter ne določa hosta, onemogoči SSRF.
- Centralni error handler z `code`, javno varnim sporočilom in `requestId`; ne logiraj celih velikih upstream odgovorov.
- Konfiguriran CORS allowlist iz `CORS_ORIGIN`; v produkciji ne `*` brez razloga.
- Ne vključuj credentials ali neresničnega anti-DDoS zagotovila; osnovno omejevanje prometnih zahtev po potrebi.

## Memory cache
```ts
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  sourceUpdatedAt: string | null;
}
```
- Key vsebuje izvor, sezono, datum, gameId, situation in druge filtre.
- Ko cached rezultat poteče, osveži ali ob upstream izpadu odgovori `stale:true`, kadar je podatke smiselno prikazati (končani rezultati). Ne sme biti lažno live.
- Uporabljaj bounded cache (max keys/TTL). Railway lahko servis ponovno zažene, zato cache ni persistentna baza.

## MoneyPuck loader
- Izključno branje lokalnega predprocesiranega JSON pri zagonu. CSV ni del HTTP request path.
- `schemaVersion` za kompatibilnost artefakta. Ob datoteki, ki manjka, zaženi backend v degradiranem načinu in logiraj warning, ne sesuj osnovnih rezultatov.
- `sourceUpdatedAt` naj odraža vir, ne zgolj čas `fs.stat`.

## Zbiranje NHL zgodovine za predictions
- `getTeamSeasonGames` vrne zaključen del rednega dela; za model je treba dobiti 60-minutni rezultat. Zgradi omejeno število fetch klicev v concurrency poolu (npr. 4), cache, in zabeleži pokritost.
- Ne zaženi 1000 fetchov na vsak `/predictions` request. Priporočeni v1: ob prvem klicu prednapolni bounded cache preteklih tekem ekipe, nato osvežuj po TTL; pri hladnem startu uporabniku daj jasen loading/timeout.
- Če vir ne omogoča dovolj zanesljivega per-period podatka, model vrne `insufficient_data`, ne implicitno spremeni definicije modela.

## API opazovanje
- `/health` vrne stanje API procesa (ne preverja ob vsakem zahtevku vseh zunanjih virov).
- Structured log: `requestId`, route, duration, cacheHit, upstream status, source; brez user PII.
- Priporočen začetni SLO ni formalno zagotovilo; zabeleži realne odzivne čase M7 testov.

## Postopna implementacija
Najprej `health` + mock responses, nato NHL adapter, nato CSV artefakt, nato prediction. Vsak korak naj se da zagnati lokalno brez povezovanja frontend implementacije z nedokončanimi funkcijami.
