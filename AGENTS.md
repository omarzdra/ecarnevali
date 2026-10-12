# HockeyStats — navodila za Codex

Ta datoteka je **glavni vhod za Codex** v korenu repozitorija. Podrobnosti preberi po potrebi v `docs/README.md`. Ne razumej dokumentov kot že implementirane kode.

## Cilj
Zgradi HockeyStats: spletno aplikacijo za NHL razpored, rezultate, zgodovinske statistike, napredne MoneyPuck metrike za odigrane tekme ter razložljive statistične napovedi prihodnjih tekem. Fakultetni cilj je integracija **vsaj dveh različnih zunanjih virov** (NHL JSON in MoneyPuck CSV).

## Obvezna pravila
1. Pred začetkom naloge preberi `docs/README.md`, `docs/01-SCOPE.md`, `docs/02-ARCHITECTURE.md` in dokument, ki velja za nalogo. Če je naloga del mejnika, preberi `docs/11-MILESTONES.md`.
2. Razvijaj **samo zahtevani mejnik**, brez nepotrebnega širjenja obsega. Če datoteka že obstaja, ohrani delujoče dele. Pred spremembo preglej dejansko kodo, ne predpostavljaj praznega repozitorija.
3. Privzeti stack: **React + Vite + TypeScript + Tailwind** (web), **Node.js + Express + TypeScript** (API), **npm workspaces**. Brez podatkovne baze in prijave v MVP. Spremembe stacka morajo biti pojasnjene in zabeležene v `docs/14-DECISIONS-AND-RISKS.md`.
4. Frontend uporablja izključno lasten `/api` backend; nikoli ne veže UI na surovo shemo NHL ali MoneyPuck.
5. Adapterji in normalizacija so ločeni. Na meji zunanjih virov validiraj vhod (Zod in/ali lastni strogi parser). Pri manjkajočih vrednostih uporabi `null`/unavailable, ne izmišljenih števil.
6. MoneyPuck podatkov **ne pridobivaj s scrapingom**. Uporabi javno objavljene uradne prenose CSV in jasno navedi `MoneyPuck.com` ter vir, stanje in obseg podatkov. Ne pošiljaj velikih surovih CSV v Git.
7. MoneyPuck metrike za zgodovino **niso vhod** v MVP prediction engine. Model uporablja izključno zgodovinske NHL končne rezultate/strele, ki so bili na voljo pred napovedovano tekmo.
8. Za zgodovinske podatke v napovedi prepreči *data leakage*: samo zaključene tekme z datumom in časom pred ciljno tekmo. Model ne sme uporabiti rezultata ciljne tekme.
9. Napoved je neodvisen statistični model, ne verjetnost stavnice. Brez govorjenja o zagotovljenih rezultatih ali dobičku. Razlaga in predpostavke so obvezne.
10. **Najprej test:** spremembe parserjev, mapperjev, formul ali pogodbe API vključujejo Vitest teste in vsaj en negativen primer. Pri nemogočem dostopu do zunanjega vira zabeleži omejitev; ne označi integracije za preverjeno.
11. Po vsakem mejniki izpiši: narejeno, spremenjene datoteke, ukazi in rezultat testov, znane omejitve ter naslednji mejnik. Posodobi checklist v `docs/11-MILESTONES.md` samo za dejansko opravljeno delo.
12. Ne objavljaj API ključev, osebnih podatkov ali skrivnosti. Predloge spremenljivk dokumentiraj v `docs/12-DEPLOYMENT.md`.

## Kje so specifikacije
- `docs/01-SCOPE.md` — zahteve in izključitve.
- `docs/02-ARCHITECTURE.md` — arhitektura in struktura repozitorija.
- `docs/03-NHL-INTEGRATION.md` — zunanji NHL adapter.
- `docs/04-MONEYPUCK-INTEGRATION.md` — MoneyPuck CSV adapter in atribucija.
- `docs/05-DATA-CONTRACTS.md` — enotni tipi in semantika.
- `docs/06-API-CONTRACT.md` — pogodba lastnega REST API.
- `docs/07-PREDICTION-MODEL.md` — matematika, omejitve, testi.
- `docs/08-FRONTEND.md`, `docs/09-BACKEND.md` — implementacijska pravila.
- `docs/10-TESTING.md` — kakovost in kriteriji sprejema.
- `docs/11-MILESTONES.md` — zaporedje razvoja.
- `docs/13-CODEX-WORKFLOW.md` — workflow in prompti.

## Večkrat uporabne projektne skills
V `.agents/skills/` so po potrebi na voljo: `$nhl-api-integration`, `$moneypuck-data-import`, `$hockey-prediction-engine`, `$hockeystats-quality-check`. Po potrebi najprej preberi njihov `SKILL.md`.

## Zaključek naloge
Naloga ni končana, dokler ne preveriš tipov, lintanja, testov in builda oziroma jasno napišeš, česa nisi mogel zagnati in zakaj.
