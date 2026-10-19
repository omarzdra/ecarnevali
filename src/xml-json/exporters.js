import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { XMLBuilder } from 'fast-xml-parser';

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
});

/** @param {Array<Record<string, any>>} data @param {string} outputPath */
export async function exportToJson(data, outputPath) {
  await ensureParentDirectory(outputPath);
  await writeFile(
    outputPath,
    `${JSON.stringify(data.map(toExportGame), null, 2)}\n`,
    'utf8',
  );
}

/** @param {Array<Record<string, any>>} data @param {string} outputPath */
export async function exportToXml(data, outputPath) {
  const document = {
    filteredGames: {
      game: data.map((game) => {
        const exported = toExportGame(game);
        return {
          '@_id': exported.gameId,
          date: exported.date,
          homeTeam: { '@_id': exported.homeTeam.id, ...exported.homeTeam, id: undefined },
          awayTeam: { '@_id': exported.awayTeam.id, ...exported.awayTeam, id: undefined },
          score: exported.score,
          resultType: exported.resultType,
          venue: exported.venue,
          stats: exported.stats,
        };
      }),
    },
  };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(document)}`;
  await ensureParentDirectory(outputPath);
  await writeFile(outputPath, xml, 'utf8');
}

/** @param {Record<string, any>} game */
function toExportGame(game) {
  return {
    gameId: game.id,
    date: game.date,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    score: game.score,
    resultType: game.resultType,
    venue: game.venue,
    stats: game.stats,
  };
}

/** @param {string} outputPath */
async function ensureParentDirectory(outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });
}
