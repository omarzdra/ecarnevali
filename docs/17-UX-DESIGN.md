# 17 — UX, UI in vizualni sistem

## Namen
Obiskovalec mora hitro najti današnjo ali zgodovinsko tekmo, razumeti ključne metrike in razlikovati **dejanske rezultate** od **statističnih napovedi**.

## Navigacija
- **Dashboard** `/` — naslovna z izbirnikom datuma in recent results.
- **Games** `/games` — filter date/team/status, cards v mobilnem prikazu in tabela na desktopu.
- **Teams** `/teams` — iskanje in pregled ekip.
- **Game details** `/games/:id` — rezultat, team stats in MoneyPuck metrics.
- **Prediction** `/predictions/:id` — prematch 1-X-2, over/under, goals, shots, metodologija.
- **About / Methodology** `/about` — viri, omejitve modela, atribucija.

## Besedilni wireframe
```text
┌──────────────────────────────────────────────────────────┐
│ HOCKEYSTATS  [Games] [Teams] [Predictions] [About]       │
├──────────────────────────────────────────────────────────┤
│ NHL Games                        Date: [◀] 12 Oct [▶]    │
│ ┌───────────────────┐  ┌───────────────────┐             │
│ │ HOME vs AWAY      │  │ HOME vs AWAY      │             │
│ │ scheduled / final │  │ final · REG/OT/SO │             │
│ │ score or start    │  │ shots and summary │             │
│ └───────────────────┘  └───────────────────┘             │
│                                                          │
│ Advanced Analytics       (only available for past games) │
│ [xG] [Corsi %] [Fenwick %]                                │
│ Source: MoneyPuck.com · situation: all                    │
└──────────────────────────────────────────────────────────┘
```
**Ilustracija oblikovanja**, ne trditev o dejanskih rezultatih. Barvni toni: nevtralna temna/svetla podlaga, hokejski modri ali ledeni poudarek; rezultati in odstotki izpisani tudi z besedilom (ne samo barvo).

## Komponente
- `GameCard`: ikoni/logo ekip, status, lokalni čas/rezultat, link podrobnosti.
- `StatComparison`: doma/gost po posamezni metriki z nedvoumno enoto.
- `SourceBadge`: ponudnik + `sourceUpdatedAt` + stanje data.
- `RegulationOdds`: 3 deleži Home/Tie/Away po 60 min; števila v %.
- `PredictionDisclaimer`: "preprosta statistična ocena, brez zagotovila".
- `EmptyState`/`ErrorState`/`StaleNotice`: razumljiva stanja.

## Ključne razlike v jeziku
| Ne uporabljaj | Raje uporabi |
|---|---|
| "MoneyPuck napovedani xG" | "MoneyPuck xG za odigrano tekmo" |
| "zmagovalec 57 %" brez oznake | "modelna možnost overall win; equal-tiebreak predpostavka" |
| "verjetnost OT" brez konteksta | "modelna verjetnost izenačenja po 60 min" |
| "shutout" brez obdobja | "regulacijska ničla nasprotnika (model)" |
| "0.0 xG" ko vir manjka | "xG ni na voljo" |

## Dostopnost in oblikovanje
- Touch target približno 44 × 44px, fokusni obroč, jasne napake.
- Grafi imajo tabelarni ali tekstovni prikaz vrednosti.
- Ne uporabljaj zgolj rdeča/zelena za win/loss in razlike.
- Na telefonu je rezultat/čas nad preostalo tabelo, advanced stats so po potrebi horizontalno pomična **samo tabela**, ne cela stran.
