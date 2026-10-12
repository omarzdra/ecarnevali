# 05 — Enotni podatkovni modeli in invarianti

**To je osrednji dokument pogodbe.** `shared/src/contracts` je edino mesto za deljene javne TypeScript tipe in Zod schemas. Primeri so kontrakti **HockeyStats API-ja**, ne domnevni payloadi NHL/MoneyPuck.

## Osnovni tipi
```ts
type SeasonId = string;       // npr. '20262027'
type GameId = number;         // veljaven celoštevilski NHL game ID
type TeamAbbr = string;       // validirana NHL okrajšava

type GameStatus = 'scheduled' | 'live' | 'final' | 'unknown';
type FinishType = 'REG' | 'OT' | 'SO' | null;
type DataStatus = 'available' | 'partial' | 'unavailable';
type Situation = 'all' | '5on5';

interface SourceInfo {
  provider: 'NHL' | 'MoneyPuck' | 'HockeyStats';
  retrievedAt: string | null; // ISO UTC
  sourceUpdatedAt: string | null;
  methodology?: string;
}
interface TeamRef {
  id: number | null;
  abbr: TeamAbbr;
  name: string;
  logoUrl: string | null;
}
interface TeamInGame extends TeamRef {
  finalGoals: number | null;
  regulationGoals: number | null;
  shotsOnGoal: number | null;
}
interface Game {
  id: GameId;
  seasonId: SeasonId;
  gameType: number;
  startTimeUtc: string;
  status: GameStatus;
  finishType: FinishType;
  home: TeamInGame;
  away: TeamInGame;
}
interface GameDetail extends Game {
  advanced: GameAdvanced | null;
  sources: SourceInfo[];
}
interface TeamAdvanced {
  xGoalsFor: number | null;
  xGoalsAgainst: number | null;
  corsiFor: number | null;
  corsiAgainst: number | null;
  fenwickFor: number | null;
  fenwickAgainst: number | null;
  corsiPct: number | null;
  fenwickPct: number | null;
}
interface GameAdvanced {
  gameId: GameId;
  situation: Situation;
  home: TeamAdvanced | null;
  away: TeamAdvanced | null;
  dataStatus: DataStatus;
  source: SourceInfo;
}
```

`regulationGoals` so izidi po 60 minutah in niso samoumevno enaki `finalGoals` pri tekmah z OT/SO. Podatki so lahko `null`. `id` in ekipe so obvezni za veljavno tekmo.

## Napovedni objekt
```ts
interface Prediction {
  gameId: GameId;
  modelVersion: string;
  computedAt: string;
  inputCutoffUtc: string;              // pred začetkom ciljne tekme
  status: 'available' | 'insufficient_data';
  reason: string | null;
  sample: {
    homeGames: number;
    awayGames: number;
    seasonId: string;
  };
  expectedRegulationGoals: {
    home: number | null;
    away: number | null;
  };
  regulation: {
    homeWin: number | null;
    tie: number | null;
    awayWin: number | null;
  };
  overallWin: {
    home: number | null;
    away: number | null;
    method: 'equal_tiebreak' | null;
  };
  mostLikelyRegulationScore: {
    home: number;
    away: number;
    probability: number;
  } | null;
  totalGoals: {
    over5_5: number | null;
    under5_5: number | null;
  };
  teamGoalsOver2_5: {
    home: number | null;
    away: number | null;
  };
  bothTeamsScoreAtLeast1: number | null;
  bothTeamsScoreAtLeast2: number | null;
  regulationShutout: {
    homeKeeps: number | null;
    awayKeeps: number | null;
  };
  shots: {
    expectedHome: number | null;
    expectedAway: number | null;
    homeMore: number | null;
    awayMore: number | null;
    tie: number | null;
  };
  warnings: string[];
  methodology: string;
}
```

## Splošna semantika
- Verjetnosti (`probability`, `homeWin`, `over5_5`) v JSON **0–1**, UI jih množi s 100 in zaokroži na največ eno decimalko.
- Goli, SOG in poskusi so **nenegativni**, realna pričakovanja niso zaokrožena na cela števila.
- `dataStatus=partial`: npr. ena ekipa ima validiran advanced zapis, druga ga nima.
- `finalGoals`, `regulationGoals` in `shotsOnGoal` lahko manjkajo; manjkajoče **ni** 0.
- `computedAt`, `inputCutoffUtc`, `retrievedAt`, `sourceUpdatedAt` so UTC ISO stringi.
- Ključi z različnimi situacijami se nikoli ne tiho kombinirajo.
- `TeamAbbr` dobi canonical mapiranje v adapterski plasti; ne pretvarjaj zgolj z `.toUpperCase()` brez preverjanja.
- Pri `status=insufficient_data` v predictions morajo biti vse nedosegljive ocene `null`, `reason` pa ne-prazen opis.

## Primer (sintetičen)
```json
{
  "id": 2023020204,
  "seasonId": "20232024",
  "gameType": 2,
  "startTimeUtc": "2023-11-10T00:00:00Z",
  "status": "final",
  "finishType": "REG",
  "home": {"id": 10, "abbr": "TOR", "name": "Toronto Maple Leafs", "logoUrl": null, "finalGoals": 4, "regulationGoals": 4, "shotsOnGoal": 34},
  "away": {"id": 6, "abbr": "BOS", "name": "Boston Bruins", "logoUrl": null, "finalGoals": 2, "regulationGoals": 2, "shotsOnGoal": 29}
}
```
Ta JSON je **sintetičen zgled sheme**, ne podatek za tekmo ID 2023020204.

## Kakovost
Ob uvajanju novih polj: dodaj schema, mapper, test fixture, API dokumentacijo in ustrezno UI fallback ob odsotnosti. Ne delaj "implicitnih" javnih sprememb response shape.
