# 07 — Prediction engine: natančna specifikacija v1

## Namen, neobseg in časovni rez
Izpiši **razložljivo**, približno statistično oceno, **ne** natančne stavniške kvote. Za MVP uporablja le zgodovinske NHL tekme in končne podatke o golih/strelah, ki so bili znani **pred začetkom ciljne tekme**. MoneyPuck advanced xG ostaja samo za prikaz zgodovine.

- V1 za regular season; pred/med/zatem ločen status.
- Ciljna tekma se izključi; izključi tudi vse kasnejše tekme in live igre.
- Osnovni napovedni outcome je rezultat **po 60 minutah**; OT/SO ni v Poisson modelu. Za prikaz overall winner je potreben ločen izrecno omejen tiebreaker približek.
- `expectedRegulationGoals` ne poimenuj MoneyPuck `xG`.

## Dataset
`CompletedRegulationGame`:
```ts
interface CompletedRegulationGame {
  id: number;
  startTimeUtc: string;
  seasonId: string;
  gameType: 2;
  homeAbbr: string;
  awayAbbr: string;
  homeRegGoals: number;
  awayRegGoals: number;
  homeShots: number | null;
  awayShots: number | null;
}
```
Rekonstruiraj `homeRegGoals`/`awayRegGoals` iz NHL per-period rezultata prvih 3 period, zanesljivega dejanskega vira. Ne uporabljaj SO končnega `finalGoals` kot 60-minutni rezultat. Pri nedokazljivi rekonstrukciji game exclude in `warning`.

## Osnovni model (nastavitve v enem modulu)
Za ekipo A doma in ekipo B v gosteh izberi **le regular-season** odigrane tekme pred `inputCutoffUtc`.
- `N_SEASON_MIN=8` zaključnih tekem na ekipo; če manj, `insufficient_data` za v1 (nastavljivo, dokumentirano).
- `RECENT_WINDOW=5` zadnjih 5 (če jih je 5) in utež `RECENT_WEIGHT=0.35` za formo, ostalo 0.65 sezone.
- `LEAGUE_PRIOR=3.0` je prednastavitev samo ob pomanjkanju podatkov; raje jo izračunaj iz razpoložljive zgodovine in zabeleži vir. Pri v1, ko zahtevaš min 8 tekem, ne prikrivaj z namišljenimi sezonskimi podatki.
- `HOME_ADVANTAGE` se ne množi samovoljno. Baseline že uporablja domače/gostujoče split podatke kadar vzorec zadošča; če jih ne, uporabi skupno povprečje s jasno označenim opozorilom (brez dodatnega faktorja).

Za domačo ekipo A:
1. `A_season_GF` in `A_season_GA`: povprečje regular-season 60-minutnih golov, prejetih/danih.
2. `A_recent_GF/GA`: zadnjih `min(5, n)` istih meritev, samo zaključene igre.
3. `A_attack = 0.65*A_season_GF + 0.35*A_recent_GF` (enako `A_defense` za GA).
4. Enako za B; pri zadostnem split vzorcu (vsaj 5 domačih A in 5 gostujočih B) uporabi **home-only** sezonski/recent split A in **away-only** B. Pri premajhnem split sample uporabi vse lokacije za obe ekipi in dodaj `warning` (ne mixaj A home s B total).
5. `lambdaHome = clamp((A_attack + B_defense) / 2, 0.1, 7.5)`.
6. `lambdaAway = clamp((B_attack + A_defense) / 2, 0.1, 7.5)`.
7. Pred vsako napovedjo validiraj, da sta `lambda` končni pozitivni vrednosti.

Izbira uteži, zgornjih meja in minimumov je **projektna heuristika**, ne empirično optimiziran NHL model. Konfiguracijo ohrani verzionirano `modelVersion=poisson-baseline-v1`.

## Poissonova porazdelitev in matrika
Za λ > 0: `P(k|λ) = exp(-λ) * λ^k / k!`. Uporabljaj rekurzijo:
```ts
p[0] = Math.exp(-lambda);
for (let k=1; k<=K; k++) p[k] = p[k-1] * lambda / k;
```
K max naj se dinamično povečuje od 15 do največ 30, dokler `sum(p[0..K]) >= 1-1e-10` za vsako ekipo. Če ne konvergira, napaka, nikoli ne normaliziraj izrezane matrike brez preverbe repa. Po zadostni pokritosti lahko normaliziraš oba marginalna vektorja zaradi numerične natančnosti. Matrika `P(i,j)=homeP[i]*awayP[j]` predpostavlja pogojno neodvisnost.

### Izračuni
- `P(homeRegWin) = Σ_{i>j} P(i,j)`, `P(tieAfter60) = Σ_{i=j} P(i,j)`, `P(awayRegWin) = Σ_{i<j} P(i,j)`; vsota ≈1.
- `P(over5.5)=Σ_{i+j>=6}P(i,j)`, `under5.5=1-over5.5`.
- `P(home over2.5)=Σ_{i>=3}homeP[i]`; `away` analogno.
- `P(both >=1)=(1-homeP[0])*(1-awayP[0])`.
- `P(both >=2)=(1-homeP[0]-homeP[1])*(1-awayP[0]-awayP[1])`.
- `P(home keeps regulation shutout)=awayP[0]`; `P(away keeps regulation shutout)=homeP[0]`. To NI verjetnost uradne NHL individualne shutout statistike (ta vključuje celotno tekmo).
- `mostLikelyRegulationScore=argmax_{i,j}P(i,j)`; ob izenačenju izberi deterministično najmanjši `(i,j)`.
- `OT opportunity` oz. `tieAfter60` je približna verjetnost igre z izenačenjem po 60 minutah, ne zagotovljena dejanska verjetnost vseh NHL OT/specific SO dogodkov.
- Za **overall win** samo opcijsko: `P(homeOverall) = P(homeRegWin) + 0.5*P(tieAfter60)`; `away` enako. `method:'equal_tiebreak'`. Ločeno napovedovanje OT/SO zmagovalca **ni** v1. Če se UI lahko odpove temu dodatku, raje pokaži 1-X-2.

## Shots (ločena, poenostavljena ocena)
- Zahtevaj `MIN_SHOT_GAMES=8` veljavnih SOG preteklih tekem na ekipo.
- `expectedShotsHome=(A_average_SOG_for + B_average_SOG_against)/2`; `expectedShotsAway=(B_average_SOG_for + A_average_SOG_against)/2`, lahko upošteva enako home/away logiko kot goli.
- Kot približek uporabi **ločena Poissonova števec modela** za število SOG. Opozori, da porazdelitev NHL strelov pogosto ni Poisson; ni strokovno kalibrirana. `P(homeMore)`, `P(awayMore)`, `P(equal)` iz matrike za strele po istem postopku, vendar dinamični K glede na višjo λ.
- Pri premajhnem vzorcu vrni `shots: { ... null }` in `warnings`, ne predpostavljaj SOG po defaultu 30.

## Numerične in semantične kontrole
- `P(regHome)+P(tie)+P(regAway)≈1` toleranca `1e-7`.
- `P(over)+P(under)≈1`; `P(overallHome)+P(overallAway)≈1` pri equal_tiebreak.
- Verjetnosti so v `[0,1]` brez `NaN/Infinity`.
- `lambda=0` izogni s pragom `0.1`, a zabeleži warning ob nenavadnem vhodu.
- Slike in odstotki ne smejo pomeniti gotovosti; UI opisuje predpostavke in omejitve.
- Za isti input je napoved deterministična. `computedAt` je metadata, ne del rezultata.

## Vzorčni deterministični testi
1. `poissonPmf(0, 3)≈exp(-3)`.
2. Za `lambdaHome=lambdaAway` mora veljati `P(homeRegWin)≈P(awayRegWin)`.
3. `P(homeRegWin)+P(tie)+P(awayRegWin)≈1`.
4. Simetrični λ in equal_tiebreak → `overallHome≈0.5`.
5. Vzorčni vhod A: 10 preteklih, B: 9; ciljna tekma **mora** biti izločena.
6. Ob `<=7` zgodovinskih tekmah za katerokoli ekipo status `insufficient_data`.
7. Manjkajoči per-period goals ne izkrivijo rezultata v REG/OT/SO.
8. Sprememba datumskega cutoffa odpravi tekme po njem in spremeni sample.
9. Če sum shot distribution ni dovolj velik, zvišaj K, ne normaliziraj odrezanega repa.

## Backtest (should-have)
Za zgodovinske tekme: `predictionTime = scheduledStart - 1 minute`, izključi prihodnje podatke in oceni napoved pri preteklem zaporedju. Brier score za 1-X-2 ter natančnost napovednih intervalov in simple baseline primerjava. Brez backtesta v UI ne trdi "natančnost X %".
