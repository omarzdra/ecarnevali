/**
 * Joins normalized documents by their explicit IDs using Maps.
 * @param {Array<Record<string, any>>} teams
 * @param {Array<Record<string, any>>} games
 * @param {Array<Record<string, any>>} gameStats
 */
export function joinData(teams, games, gameStats) {
  const teamsById = uniqueMap(teams, 'id', 'team');
  const gamesById = uniqueMap(games, 'id', 'game');
  const statsByGameId = uniqueMap(gameStats, 'gameId', 'game statistics');
  uniqueMap(gameStats, 'id', 'game statistic');

  for (const stat of gameStats) {
    if (!gamesById.has(stat.gameId)) {
      throw new Error(`Unknown game ID ${stat.gameId} referenced by ${stat.id}`);
    }
  }

  return games.map((game) => {
    const homeTeam = teamsById.get(game.homeTeamId);
    const awayTeam = teamsById.get(game.awayTeamId);
    const stats = statsByGameId.get(game.id);

    if (!homeTeam) {
      throw new Error(`Unknown team ID ${game.homeTeamId} referenced by ${game.id}`);
    }
    if (!awayTeam) {
      throw new Error(`Unknown team ID ${game.awayTeamId} referenced by ${game.id}`);
    }
    if (!stats) {
      throw new Error(`Missing game statistics for ${game.id}`);
    }

    const totalXG =
      stats.homeXG === null || stats.awayXG === null
        ? null
        : round(stats.homeXG + stats.awayXG, 2);

    return {
      id: game.id,
      date: game.date,
      homeTeam: teamReference(homeTeam),
      awayTeam: teamReference(awayTeam),
      score: { home: game.homeGoals, away: game.awayGoals },
      resultType: game.resultType,
      venue: game.venue,
      stats: {
        homeShots: stats.homeShots,
        awayShots: stats.awayShots,
        homeXG: stats.homeXG,
        awayXG: stats.awayXG,
        homeCorsi: stats.homeCorsi,
        awayCorsi: stats.awayCorsi,
        homeFenwick: stats.homeFenwick,
        awayFenwick: stats.awayFenwick,
        totalXG,
      },
    };
  });
}

/** @param {Array<Record<string, any>>} records @param {string} key @param {string} label */
function uniqueMap(records, key, label) {
  const map = new Map();
  for (const record of records) {
    const value = record[key];
    if (map.has(value)) {
      throw new Error(`Duplicate ${label} ${key} ${value}`);
    }
    map.set(value, record);
  }
  return map;
}

/** @param {Record<string, any>} team */
function teamReference(team) {
  return { id: team.id, name: team.name, abbreviation: team.abbreviation };
}

/** @param {number} value @param {number} digits */
function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
