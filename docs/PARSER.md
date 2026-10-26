# NHL News Parser

## Namen

HockeyStats uporablja parser za avtomatizirano pridobivanje najnovejših NHL novic neposredno iz HTML/DOM spletne strani NHL.com. Parser za novice ne uporablja NHL API-ja ali skritih JSON endpointov.

## Vir podatkov

Parser odpre uradno stran [NHL.com News](https://www.nhl.com/news/):

```text
https://www.nhl.com/news/
```

## Tehnologija

- Node.js
- JavaScript
- Puppeteer in headless Chromium
- JSON

## Postopek

```text
NHL.com
   ↓
Puppeteer
   ↓
HTML / DOM
   ↓
Parser
   ↓
JavaScript objects
   ↓
nhl_news.json
   ↓
HockeyStats
```

Parser poišče razdelek `Feed: Latest News`, prebere kartice novic, očisti besedilo, pretvori relativne URL-je v absolutne, odstrani podvojene povezave in shrani največ 15 veljavnih zapisov. Pred zapisom zavrne elemente brez naslova ali URL-ja.

## Pridobljeni podatki

Za vsako novico se shranijo:

- unikaten ID;
- naslov;
- absolutni URL;
- datum objave;
- kategorija, kadar je v kartici na voljo;
- povzetek, kadar je v kartici na voljo;
- absolutni URL slike;
- vir `NHL.com`.

Manjkajoča neobvezna polja so `null`. Trenutne kartice v razdelku najnovejših novic ne vsebujejo povzetka ali specifične kategorije, zato parser teh vrednosti ne ugiba.

## Zagon

```bash
npm install
npm run parse:nhl-news
```

Puppeteer ob namestitvi prenese združljiv Chromium. Za zagon je potrebna omrežna povezava do NHL.com.

## Rezultat

Rezultat se zapiše v:

```text
data/parsed/nhl_news.json
```

Korenska struktura vsebuje vir, URL vira, samodejno ustvarjen `scrapedAt`, dejansko število zapisov in tabelo `articles`.

## Vzdrževanje

Selektorji temeljijo na DOM-u NHL.com, preverjenem 26. oktobra 2026. Ker lahko NHL spremeni HTML ali ime razdelka, je ob napaki `Could not find valid news articles` treba ponovno preveriti kartice na strani in posodobiti selektorje. Unit testi preverjajo normalizacijo in validacijo, dejanski dostop do strani pa se preveri z ročnim zagonom ukaza parserja.
