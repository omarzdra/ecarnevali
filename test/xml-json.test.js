import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { afterEach, describe, expect, it } from 'vitest';

import {
  loadXml,
  normalizeGameStats,
  normalizeGames,
  normalizeTeams,
} from '../src/xml-json/loadXml.js';
import { joinData } from '../src/xml-json/joinData.js';
import {
  filterGamesAfterDate,
  filterGamesByMinimumGoals,
  filterGamesByMinimumXG,
  filterGamesByTeam,
} from '../src/xml-json/filters.js';
import { exportToJson, exportToXml } from '../src/xml-json/exporters.js';

/** @type {string[]} */
const temporaryDirectories = [];
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

/** @param {string} name @param {string} contents */
async function temporaryFile(name, contents) {
  const directory = await mkdtemp(path.join(tmpdir(), 'hockeystats-'));
  temporaryDirectories.push(directory);
  const filePath = path.join(directory, name);
  await writeFile(filePath, contents, 'utf8');
  return filePath;
}

const teams = [
  {
    id: 'TEAM001',
    name: 'Florida Panthers',
    abbreviation: 'FLA',
    city: 'Sunrise',
    conference: 'Eastern',
    division: 'Atlantic',
    founded: 1993,
    arena: 'Amerant Bank Arena',
  },
  {
    id: 'TEAM002',
    name: 'Colorado Avalanche',
    abbreviation: 'COL',
    city: 'Denver',
    conference: 'Western',
    division: 'Central',
    founded: 1972,
    arena: null,
  },
];

const games = [
  {
    id: 'GAME001',
    date: '2026-10-12',
    homeTeamId: 'TEAM001',
    awayTeamId: 'TEAM002',
    homeGoals: 4,
    awayGoals: 3,
    resultType: 'OT',
    venue: null,
  },
];

const gameStats = [
  {
    id: 'STAT001',
    gameId: 'GAME001',
    homeShots: 36,
    awayShots: 31,
    homeXG: 3.5,
    awayXG: 2.92,
    homeCorsi: 55.4,
    awayCorsi: 44.6,
    homeFenwick: null,
    awayFenwick: 46.2,
  },
];

describe('XML loading and normalization', () => {
  it('preserves attributes and converts numbers while retaining empty values as null', async () => {
    const filePath = await temporaryFile(
      'teams.xml',
      '<?xml version="1.0"?><teams><team id="TEAM001"><name>Florida Panthers</name><abbreviation>FLA</abbreviation><city>Sunrise</city><conference>Eastern</conference><division>Atlantic</division><founded>1993</founded><arena></arena></team></teams>',
    );

    const parsed = await loadXml(filePath);
    const normalized = normalizeTeams(parsed);

    expect(normalized).toEqual([
      expect.objectContaining({ id: 'TEAM001', founded: 1993, arena: null }),
    ]);
  });

  it('reports malformed XML with the file path', async () => {
    const filePath = await temporaryFile('broken.xml', '<teams><team></teams>');

    await expect(loadXml(filePath)).rejects.toThrow(
      `Invalid XML in ${filePath}`,
    );
  });

  it('reports a missing XML file clearly', async () => {
    const missingPath = path.join(projectRoot, 'data', 'does-not-exist.xml');

    await expect(loadXml(missingPath)).rejects.toThrow(
      `Unable to read XML file ${missingPath}`,
    );
  });

  it('normalizes game and statistics numeric fields', () => {
    expect(
      normalizeGames({
        games: {
          game: {
            '@_id': 'GAME001',
            date: '2026-10-12',
            homeTeamId: 'TEAM001',
            awayTeamId: 'TEAM002',
            homeGoals: '4',
            awayGoals: '3',
            resultType: 'OT',
            venue: '',
          },
        },
      }),
    ).toEqual(games);

    expect(
      normalizeGameStats({
        gameStats: {
          gameStat: {
            '@_id': 'STAT001',
            gameId: 'GAME001',
            homeShots: '36',
            awayShots: '31',
            homeXG: '3.5',
            awayXG: '2.92',
            homeCorsi: '55.4',
            awayCorsi: '44.6',
            homeFenwick: '',
            awayFenwick: '46.2',
          },
        },
      }),
    ).toEqual(gameStats);
  });
});

describe('ID joins', () => {
  it('joins teams and statistics without relying on array positions', () => {
    const [joined] = joinData([...teams].reverse(), games, gameStats);

    expect(joined).toEqual({
      id: 'GAME001',
      date: '2026-10-12',
      homeTeam: { id: 'TEAM001', name: 'Florida Panthers', abbreviation: 'FLA' },
      awayTeam: { id: 'TEAM002', name: 'Colorado Avalanche', abbreviation: 'COL' },
      score: { home: 4, away: 3 },
      resultType: 'OT',
      venue: null,
      stats: {
        homeShots: 36,
        awayShots: 31,
        homeXG: 3.5,
        awayXG: 2.92,
        homeCorsi: 55.4,
        awayCorsi: 44.6,
        homeFenwick: null,
        awayFenwick: 46.2,
        totalXG: 6.42,
      },
    });
  });

  it('throws a clear error for an unknown team reference', () => {
    const invalidGames = [{ ...games[0], awayTeamId: 'TEAM099' }];

    expect(() => joinData(teams, invalidGames, gameStats)).toThrow(
      'Unknown team ID TEAM099 referenced by GAME001',
    );
  });

  it('throws a clear error for an orphan game statistic', () => {
    const orphanStats = [{ ...gameStats[0], id: 'STAT099', gameId: 'GAME099' }];

    expect(() => joinData(teams, games, orphanStats)).toThrow(
      'Unknown game ID GAME099 referenced by STAT099',
    );
  });
});

describe('filters', () => {
  const joined = joinData(teams, games, gameStats);

  it('filters by date, team name or abbreviation, xG and goals', () => {
    expect(filterGamesAfterDate(joined, '2026-10-10')).toHaveLength(1);
    expect(filterGamesByTeam(joined, 'colorado avalanche')).toHaveLength(1);
    expect(filterGamesByTeam(joined, 'COL')).toHaveLength(1);
    expect(filterGamesByMinimumXG(joined, 6)).toHaveLength(1);
    expect(filterGamesByMinimumGoals(joined, 7)).toHaveLength(1);
  });

  it('does not treat missing xG as zero or include it in a minimum-xG result', () => {
    const withoutXG = [
      { ...joined[0], stats: { ...joined[0].stats, homeXG: null } },
    ];

    expect(filterGamesByMinimumXG(withoutXG, 0)).toEqual([]);
  });
});

describe('exports', () => {
  it('writes equivalent, readable JSON and XML documents', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'hockeystats-export-'));
    temporaryDirectories.push(directory);
    const jsonPath = path.join(directory, 'filtered.json');
    const xmlPath = path.join(directory, 'filtered.xml');
    const joined = joinData(teams, games, gameStats);

    await exportToJson(joined, jsonPath);
    await exportToXml(joined, xmlPath);

    const json = JSON.parse(await readFile(jsonPath, 'utf8'));
    const xmlText = await readFile(xmlPath, 'utf8');
    const xml = new XMLParser({ ignoreAttributes: false }).parse(xmlText);

    expect(json).toHaveLength(1);
    expect(xmlText).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml.filteredGames.game['@_id']).toBe(json[0].gameId);
    expect(xml.filteredGames.game.stats.totalXG).toBe(json[0].stats.totalXG);
  });
});

describe('assignment data set', () => {
  it('contains unique IDs, valid references and at least three main-filter results', async () => {
    const [teamsDocument, gamesDocument, statsDocument] = await Promise.all([
      loadXml(path.join(projectRoot, 'data', 'teams.xml')),
      loadXml(path.join(projectRoot, 'data', 'games.xml')),
      loadXml(path.join(projectRoot, 'data', 'gameStats.xml')),
    ]);
    const actualTeams = normalizeTeams(teamsDocument);
    const actualGames = normalizeGames(gamesDocument);
    const actualStats = normalizeGameStats(statsDocument);
    const joined = joinData(actualTeams, actualGames, actualStats);
    const filtered = filterGamesByMinimumXG(
      filterGamesAfterDate(joined, '2026-10-10'),
      5.5,
    );

    expect(actualTeams).toHaveLength(12);
    expect(actualGames).toHaveLength(15);
    expect(actualStats).toHaveLength(15);
    expect(new Set(actualTeams.map((team) => team.id)).size).toBe(12);
    expect(new Set(actualGames.map((game) => game.id)).size).toBe(15);
    expect(new Set(actualStats.map((stat) => stat.id)).size).toBe(15);
    expect(filtered).toHaveLength(5);
  });
});
