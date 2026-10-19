import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exportToJson, exportToXml } from './exporters.js';
import { filterGamesAfterDate, filterGamesByMinimumXG } from './filters.js';
import { joinData } from './joinData.js';
import {
  loadXml,
  normalizeGameStats,
  normalizeGames,
  normalizeTeams,
} from './loadXml.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dataDirectory = path.join(projectRoot, 'data');
const cutoffDate = '2026-10-10';
const minimumXG = 5.5;

async function main() {
  const [teamsDocument, gamesDocument, statsDocument] = await Promise.all([
    loadXml(path.join(dataDirectory, 'teams.xml')),
    loadXml(path.join(dataDirectory, 'games.xml')),
    loadXml(path.join(dataDirectory, 'gameStats.xml')),
  ]);

  const teams = normalizeTeams(teamsDocument);
  const games = normalizeGames(gamesDocument);
  const gameStats = normalizeGameStats(statsDocument);
  const joinedGames = joinData(teams, games, gameStats);
  const filteredGames = filterGamesByMinimumXG(
    filterGamesAfterDate(joinedGames, cutoffDate),
    minimumXG,
  );

  console.log('=== HockeyStats XML Data ===\n');
  console.log('Loaded:');
  console.log(`${teams.length} teams`);
  console.log(`${games.length} games`);
  console.log(`${gameStats.length} game statistics\n`);
  console.log('Filter:');
  console.log(`Games after ${cutoffDate} with total xG >= ${minimumXG}\n`);

  console.table(
    filteredGames.map((game) => ({
      Date: game.date,
      Home: game.homeTeam.abbreviation,
      Away: game.awayTeam.abbreviation,
      Score: `${game.score.home}-${game.score.away}`,
      Type: game.resultType,
      'Home SOG': game.stats.homeShots ?? 'N/A',
      'Away SOG': game.stats.awayShots ?? 'N/A',
      'Home xG': game.stats.homeXG ?? 'N/A',
      'Away xG': game.stats.awayXG ?? 'N/A',
      'Total xG': game.stats.totalXG ?? 'N/A',
    })),
  );

  if (filteredGames.length === 0) {
    throw new Error('The configured filter returned no games');
  }

  await Promise.all([
    exportToJson(filteredGames, path.join(dataDirectory, 'filtrirano.json')),
    exportToXml(filteredGames, path.join(dataDirectory, 'filtrirano.xml')),
  ]);

  console.log('\nExport successful:');
  console.log('- data/filtrirano.json');
  console.log('- data/filtrirano.xml');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
