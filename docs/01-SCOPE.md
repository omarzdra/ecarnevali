# 01 — Cilji, obseg in funkcionalne zahteve

## Problem
NHL osnovni rezultati in napredne statistike so objavljeni v ločenih virih ter različnih formatih. HockeyStats jih za uporabnika predstavi na enem mestu, pri čemer napovedni modul uporablja enostavne in preverljive metode, ne kompleksnega strojnega učenja.

## Ciljna skupina in scenariji
- **Obiskovalec (brez prijave):** pregleda rezultate po datumu, podrobnosti tekme in ekipo.
- **Analitik/navijač:** primerja standardne in napredne metrike zaključene tekme in vidi izvor podatkov.
- **Obiskovalec pred tekmo:** prejme verjetnostno oceno prihodnje tekme z metodologijo in opozorili.
- **Razvijalec:** lahko preveri, iz katerega vira izhajajo posamezna polja in kako so povezana.

## Must-have (MVP)
- [ ] `/` dashboard s tekmami izbranega datuma, zadnjimi rezultati in datumskim filtrom.
- [ ] `/games` seznam tekem in filtri po datumu/ekipi/statusu; brez izmišljene polne zgodovine, kadar podatki niso pridobljeni.
- [ ] `/games/:gameId` rezultat, status, tip zaključka, zadetki in streli (če jih vir vrne).
- [ ] `/teams` seznam ekip, `/teams/:abbr` zgodovina/forma iz razpoložljive sezone.
- [ ] Za zgodovinske tekme prikaz MoneyPuck `xG`, Corsi, Fenwick, kadar obstajajo ustrezna podatkovna polja; razlikovanje `all` in `5on5`.
- [ ] Jasni atributi izvora, svežina podatkov, stanje `available | partial | unavailable`.
- [ ] Za **prihodnje regular-season tekme** `/predictions/:gameId`: regulacijski rezultat 1-X-2, pričakovani goli, over/under, verjetnosti pragov zadetkov, BTTS, najbolj verjeten regulacijski rezultat, verjetnost izenačenja po 60 minutah. Opcijsko skupni zmagovalec s pojasnjeno simetrično predpostavko tiebreakerja.
- [ ] Osnovna napoved strelov in verjetnost več strelov, če je zgodovinskih SOG dovolj; sicer `unavailable`.
- [ ] Unit/integration testi, napake, odziven UI in deploy.

## Should-have (samo če osnovni MVP stabilen)
- Vizualni graf forme v zadnjih 5–10 tekmah.
- Primerjava ekip na enem zaslonu.
- Preprosti backtesting modela na zaključenih tekmah.
- Pregled goalie GSAx, če je izvedena ločena integracija goalie-game CSV in pravilna atribucija.

## Zunaj MVP
Prijava/registracija, shranjevanje priljubljenih ekip, podatkovna baza, WebSocket v živo, betting odds in povezovanje s stavnicami, napoved konkretnega strelca, ML, shot-level ingestion, scraping, mikroservisi, mobilna native aplikacija.

## Funkcionalne omejitve
1. MoneyPuck napredna statistika **opisuje pretekle tekme**; manjka lahko pri nedavnih ali neobičajnih tekmah.
2. Model ne uporablja MoneyPuck xG kot vhod. `expectedGoals` v predictions je lastna ocenjena *povprečna vrednost golov* iz NHL zgodovine, ne MoneyPuck xG.
3. Regulacijska izenačenost ni enako kot končni NHL neodločen izid (NHL ima OT/SO).
4. Pri odsotnem rezultatu, strelih, metriki ali sezoni uporabljaj nedvoumno stanje nerazpoložljivosti.
5. Podpiramo primarno NHL **regular season**; playoffs in preseason je treba ločeno omogočiti/označiti šele po testiranju.

## Merilo uspeha
Dva različna zunanja formata se validirata in povežeta v eno lastno strukturo. Aplikacija je uporabna brez baze; napovedi so deterministične in razumljivo predstavljene; poročilo TIDS vsebuje integracijsko shemo, tipe dokumentov, vloge in repozitorij.
