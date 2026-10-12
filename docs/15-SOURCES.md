# 15 — Zunanji viri in atribucija

**Preverjeno pri pripravi dokumentacije:** 2026-10-12. Viri in endpointi se lahko spremenijo. Ta dokument je seznam povezav, ne garancija delovanja ali dovoljenje za redistribucijo.

## NHL
- NHL Web API: https://api-web.nhle.com/v1/score/now
- Neuradni seznam NHL endpointov: https://github.com/Zmalski/NHL-API-Reference
- Dodatna skupnostna dokumentacija: https://github.com/pseudo-r/Public-NHL-API/blob/main/docs/web-api/games.md

Pri uvozu: HTTPS GET, JSON; tip igre in ekipa iz NHL, status, datum/čas in osnovne statistike. Posamezni endpoint in dejansko shape mora Codex potrditi in testirati pred vključitvijo.

## MoneyPuck
- Uradni download in pogoji: https://moneypuck.com/data.htm
- Slovar podatkov: dostopen prek povezave "data dictionary" na https://moneypuck.com/data.htm (ciljna povezava se lahko spremeni).
- Game-by-game team-level dataset: prenesi s povezave na uradni strani, ne predpostavljaj, da obstaja stabilen REST endpoint.
- Atribucija na UI: **Advanced statistics: MoneyPuck.com** z linkom in datumom uvoza.

Pogoji kot prikazani 2026-10-12: brezplačna uporaba za nekomercialne namene in jasno navajanje MoneyPuck.com, pri komercialni uporabi je potreben dogovor. Stran opozarja na neodobren scraping. **Ne kopiraj avtomatsko vseh CSV v GitHub.**

## Frameworki / razvoj
- Vite: https://vite.dev/guide/
- React: https://react.dev/
- Tailwind: https://tailwindcss.com/docs/installation/using-vite
- TanStack Query: https://tanstack.com/query/latest/docs/framework/react/overview
- React Router: https://reactrouter.com/
- Express: https://expressjs.com/
- Zod: https://zod.dev/
- Vitest: https://vitest.dev/
- Recharts: https://recharts.org/

## Codex
- Codex agents file: https://developers.openai.com/codex/guides/agents-md/
- Codex skills: https://developers.openai.com/codex/skills

## Dokumentiranje realnih testov
Za vsak zunanji API test v kodi shrani:
- datum preverjanja,
- URL brez skrivnosti,
- kateri primeri so bili preverjeni,
- katere JSON/CSV sheme so bile opažene,
- manjkajoče polje in odločitev mapperja.

Primeri payloadov iz dokumentacije so **ilustrativni**, dokler testna infrastruktura ne potrdi njihove oblike.
