# 04 — MoneyPuck CSV: uvoz, mapping, licenca

## Namen in pravila uporabe
**MoneyPuck** zagotavlja advanced hockey metrics. Uradna stran za prenose: https://moneypuck.com/data.htm. Podatki so tam navedeni kot **brezplačni za nekomercialne namene** z zahtevo po jasni navedbi **MoneyPuck.com** pri prikazu podatkov; za druge namene pridobi dovoljenje. Ne uporabljaj scrapanja strani niti neodobrenih podatkovnih poti. Pred javno distribucijo velikega izpeljanega podatkovnega artefakta ponovno preveri dovoljenje.

MoneyPuck nudi sezonske team-level in game-by-game podatke za ekipe, posamezne igralce, vratarje in druge entitete ter podatkovni slovar. **Ni enako** kot običajen JSON REST API. Drugi integracijski vir je **dokument CSV**.

## Strategija MVP
1. Z uradne strani izberi **game-by-game team-level CSV**, po možnosti sezonske podatke, če se objavljena oblika omogoča; sicer iz uradnega "all teams all seasons" prenosa izlušči ciljno sezono.
2. Enkraten ročni ali CI uvoz prek ukaza `npm run import:moneypuck` iz lokalnega CSV (pot v konfiguraciji) ali dovoljenega neposrednega download URL-ja.
3. Uvoznik validira glave, tipe, sezono, `team`, `gameId`, `situation`; filtrira **regular season / all situations** za primerjave v MVP, razen če UI izrecno zahteva `5on5`.
4. Izračuna/zajame zahtevane metrike v **majhen, indeksiran JSON artefakt**, ločen od surovih CSV. Backend ga prebere ob startu in v spominskem indeksu.
5. Za aktualnejše tekme prikazuj `sourceUpdatedAt`; starejši/odsoten artefakt je označen. Ni skrivnega live synca ali scrapanja.
6. Če licenčni pogoji ali distribucija indeksa niso jasni, ne objavi polnih surovih CSV ali njihove potencialno ekvivalentne replike. V produkciji generiraj agregat iz vira med buildom ob ustrezni atribuciji oziroma pred objavo pridobi dovoljenje.

## Podatkovni pogoji in struktura
Točne imenovane CSV kolone izpiši ob prvem uvozu; **vnaprej ne predpostavljaj njihovega obstoja**. Primeri pogostih semantičnih polj za preslikavo (dejanska imena potrdi z uradnim slovarjem):
- game id, team abbreviation, season, game type, situation;
- expected goals for/against (`xGF`/`xGA`, lahko tudi `xGoalsFor` / `xGoalsAgainst`);
- shot attempts for/against (CF/CA);
- unblocked shot attempts for/against (FF/FA);
- goalie xGA/GA za ločeno integracijo.

`csv-parse` mora podpirati narekovaje, delimitre, prazna polja, CRLF, UTF-8 BOM. Razlikuj missing/invalid od legitimne številke `0`.

## Situacija in računanje
MoneyPuck metrike so lahko podane po `all`, `5on5`, power play, shorthanded in drugih situacijah. **Ne seštevaj `all` in `5on5`** in ne primerjaj ekipe 5v5 z nasprotnikom `all`.

- `xG`: numerično število pričakovanih golov iz MoneyPuck za izbrano situacijo.
- `CF% = CF / (CF + CA) * 100`; Corsi vključuje poskuse strelov (streli, zgrešeni in blokirani).
- `FF% = FF / (FF + FA) * 100`; Fenwick izključuje blokirane poskuse.
- Če vir že nudi Corsi/Fenwick %, dokumentiraj ali ga prikažeš neposredno ali izračunaš iz parov štetij; ne mešaj različnih definicij.
- Deljenje z 0 → `null` (ni podatka), ne `0 %`.
- Goalie `GSAx = xGA - GA` kot ločen igralčev podatek. Ne pripisuj **vsote GSAx** iz nepravilnega team-level vira posameznemu vratarju.

## Ključ in spajanje (join)
Primarni ključ: `nhlGameId` (če CSV `gameId` ustreza NHL) + `teamAbbreviation` + `situation` + `season`.

Vrstni red:
1. Če je `gameId` v CSV in je potrjen z NHL primerom, uporabi številčni ID.
2. Preveri team abbreviation in morebitne zgodovinske spremembe oznak ekip; dokumentiraj samo potrjene mappinge, ne predpostavljaj npr. `UTAH`/`UTA`.
3. Če gameId ni primerljiv, uporabimo samo **kontroliran composite join** `(datum tekme, domača ekipa, gostujoča ekipa, gameType)` na osnovi preizkušenih primerov in brez nejasnih podvajanj.
4. Po joinu vsaka zaključena tekma vsebuje **največ eno** normalized vrstico za `(team,situation)`; ob duplikatih uvoz **zavrne konflikt ali eksplicitno poroča**, ne `first wins`.
5. Primeri 0, 1 ali >1 ujemanje: 0 → unavailable; 1 → OK; >1 → validation error.

## Shema artefakta (predlog, notranja, ne javni API)
```json
{
  "schemaVersion": 1,
  "source": "MoneyPuck.com",
  "importedAt": "2026-10-12T12:00:00Z",
  "seasonId": "20262027",
  "situation": "all",
  "games": {
    "2025020001": {
      "BOS": {"xGoalsFor": 2.4, "xGoalsAgainst": 3.1, "corsiFor": 60, "corsiAgainst": 52, "fenwickFor": 45, "fenwickAgainst": 39}
    }
  }
}
```
**Primer je sintetičen** in ne predstavlja dejanskih MoneyPuck vrednosti. Datum in ekipna vrstica sta demonstracijska. V produkciji mora biti za eno tekmo s pravilnim ključem vključena pravilna sezona in po potrebi obe ekipi.

## Preverjanja importerja
- Obvezne glave obstajajo ali je mapping eksplicitno nastavljen; ob spremembi sheme pregledna napaka.
- Števila so končna (`Number.isFinite`) in pravilno pretvorjena; brez `NaN` v JSON.
- Delež 0–100 po formuli in nenegativni števci.
- Igra 1 vs 1 in razpon sezone; analiza nenadnih velikih odstopanj.
- Sledi vrstica -> originalna datoteka -> `importedAt` -> uporabljena situacija.
- Uvoz uspe tudi, kadar druge situacije ne obstajajo; takrat ne prikaži manjkajočih statistik.
- GSAx uvoz le iz potrjenega goalie-level vira; če tega ni, `goalieStats: null`.

## Končni prikaz
Vsak advanced segment naj vsebuje oznake npr. `MoneyPuck · all situations · updated YYYY-MM-DD`, povezavo do https://moneypuck.com/ in ob odsotnosti kratko sporočilo. NHL tekme ostanejo dostopne tudi brez artefakta.

## Sprejemna merila M3/M4
- CSV v preizkušenem vzorcu vsaj dveh ekip in dveh iger, točne glave zapisane v kodnem mapiranju ali fixture metapodatkih.
- Unit testi za BOM, prazno število, konflikt duplicate, manjkajoč match, situacijo in niz `"0"`.
- Prikaz xG in Corsi/Fenwick pri eni resnični, potrjeni odigrani tekmi; ne izmišljaj manjkajočih polj.
