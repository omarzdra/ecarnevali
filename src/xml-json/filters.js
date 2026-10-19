/** @param {Array<Record<string, any>>} games @param {string} date */
export function filterGamesAfterDate(games, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid filter date ${date}; expected YYYY-MM-DD`);
  }
  return games.filter((game) => game.date > date);
}

/** @param {Array<Record<string, any>>} games @param {string} team */
export function filterGamesByTeam(games, team) {
  const query = team.trim().toLocaleLowerCase('en-US');
  if (!query) return [];

  return games.filter((game) =>
    [game.homeTeam, game.awayTeam].some(
      (candidate) =>
        candidate.name.toLocaleLowerCase('en-US') === query ||
        candidate.abbreviation.toLocaleLowerCase('en-US') === query,
    ),
  );
}

/** @param {Array<Record<string, any>>} games @param {number} minXG */
export function filterGamesByMinimumXG(games, minXG) {
  requireFiniteMinimum(minXG, 'xG');
  return games.filter((game) => {
    const { homeXG, awayXG } = game.stats;
    return (
      Number.isFinite(homeXG) &&
      Number.isFinite(awayXG) &&
      homeXG + awayXG >= minXG
    );
  });
}

/** @param {Array<Record<string, any>>} games @param {number} minGoals */
export function filterGamesByMinimumGoals(games, minGoals) {
  requireFiniteMinimum(minGoals, 'goals');
  return games.filter(
    (game) => game.score.home + game.score.away >= minGoals,
  );
}

/** @param {number} value @param {string} label */
function requireFiniteMinimum(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Minimum ${label} must be a non-negative finite number`);
  }
}
