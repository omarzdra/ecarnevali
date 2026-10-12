# 14 — Arhitekturne odločitve (ADR) in tveganja

## ADR-001: SPA namesto SSR
**Sprejeto:** React + Vite + TypeScript, ker glavna funkcija ni SEO, temveč dinamična analiza in grafi. **Trade-off:** manj SSR; če zahteva po SEO nastane pozneje, ponovno odloči.

## ADR-002: Express posredni API
**Sprejeto:** Express backend kot meja proti NHL in MoneyPuck. **Trade-off:** dodaten deploy in latenca, vendar jasna integracija za TIDS in stabilna interna pogodba.

## ADR-003: Brez podatkovne baze za MVP
**Sprejeto:** NHL ob zahtevi/cache, MoneyPuck predprocesiran JSON. **Trade-off:** počasnejša ponovna rekonstrukcija in omejitve osveževanja; kasneje opcijska DB.

## ADR-004: MoneyPuck offline importer
**Sprejeto:** uraden CSV download + lokalni/CI importer. **Trade-off:** ni minute-by-minute advanced data; manjši infrastrukturni strošek in brez kršenja pravil scrapanja.

## ADR-005: Ločen napovedni model
**Sprejeto:** 60-minutni Poisson golov iz NHL zgodovine. **Trade-off:** omejena kalibracija, poenostavitev neodvisnosti, ni modeliranja tiebreakerja. MoneyPuck ni input v1, čeprav je prikazan v analytics.

## ADR-006: Model regulacijskih golov
**Sprejeto:** če ni podatka o 3 periodah, zgodovinsko tekmo izloči; ne uporabljaj SO final score. **Trade-off:** vzorec je lahko premajhen; v tem primeru ni napovedi.

## ADR-007: npm workspaces in shared contracts
**Sprejeto:** en repo in deljeni TS/Zod pogodbeni tipi; eden vir resnice za API in front. **Trade-off:** monorepo build konfiguracija zahteva disciplino.

## Register tveganj
| Tveganje | Vpliv | Ukrep |
|---|---|---|
| Sprememba NHL Web API sheme | visok | adapter, Zod, fixtures, error handling |
| 429 / omrežni izpad NHL | srednji | rate control, memory cache, timeout, stale flag |
| Razlika NHL/MoneyPuck game IDs | visok | validiran mapping, composite join le kot kontrolirana izjema |
| Manjkajoča MoneyPuck igra | srednji | `unavailable` in ločeno delovanje NHL |
| Različni `situation` | visok | `all` vs `5on5` eksplicitno, nikoli tiho mešanje |
| MoneyPuck pogoji distribucije | visok | nekomercialni namen, atribucija, brez raw scraping, preveri pred javno objavo |
| Shramba artefakta na Railway | srednji | artefakt v build/deploy output, ne runtime ephemeral disk |
| Model je slabo kalibriran | visok | omejitve metode, backtesting, brez samozavestnih trditev |
| SO/OT povzroči napako pri goals | visok | prve 3 periode, test za SO in OT |
| Premalo tekem v začetku sezone | srednji | `insufficient_data`; nič izmišljenih rezultatov |
| UI časovni pas zamenja dan | srednji | UTC internals in lokalno formatiranje, test DST |

## Odprta vprašanja za preverbo pri izvedbi (ne blokirajo pisanja dokumentacije)
1. Kateri MoneyPuck downloadable dataset je najbolj primeren za izbrano sezono in katere točne stolpce ima? (M3)
2. Katera dejanska NHL endpoint struktura vrne zanesljiv rezultat po periodah? (M2/M6)
3. Kako bo distribucija izpeljanega MoneyPuck artefakta urejena pri javnem deployu? (M7)
4. Če se zgodovinska oznaka ekip spremeni, kako jo ročno preverjen alias mapira? (M3)

## Kako spreminjamo odločitev
Nove arhitekturne odločitve dodaj v ta dokument z datumom, kontekstom, izbrano možnostjo, alternativami in posledicami. Ne uvajaj novih knjižnic ali baze zgolj zaradi popularnosti.
