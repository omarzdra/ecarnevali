import { readFile } from 'node:fs/promises';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
});

/**
 * Reads and parses one XML document while retaining attributes such as `id`.
 * @param {string} filePath
 * @returns {Promise<Record<string, unknown>>}
 */
export async function loadXml(filePath) {
  let xml;

  try {
    xml = await readFile(filePath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read XML file ${filePath}: ${message}`, {
      cause: error,
    });
  }

  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    throw new Error(
      `Invalid XML in ${filePath}: ${validation.err.msg} (line ${validation.err.line})`,
    );
  }

  const result = parser.parse(xml);
  if (!isRecord(result)) {
    throw new Error(`Invalid XML in ${filePath}: document has no root element`);
  }

  return result;
}

/** @param {Record<string, unknown>} document */
export function normalizeTeams(document) {
  return getEntities(document, 'teams', 'team').map((entry) => ({
    id: requiredString(entry['@_id'], 'team.id'),
    name: requiredString(entry.name, 'team.name'),
    abbreviation: requiredString(entry.abbreviation, 'team.abbreviation'),
    city: requiredString(entry.city, 'team.city'),
    conference: requiredString(entry.conference, 'team.conference'),
    division: requiredString(entry.division, 'team.division'),
    founded: requiredNumber(entry.founded, 'team.founded'),
    arena: optionalString(entry.arena),
  }));
}

/** @param {Record<string, unknown>} document */
export function normalizeGames(document) {
  return getEntities(document, 'games', 'game').map((entry) => {
    const id = requiredString(entry['@_id'], 'game.id');
    const date = requiredString(entry.date, `${id}.date`);
    const resultType = requiredString(entry.resultType, `${id}.resultType`);

    if (!isIsoDate(date)) {
      throw new Error(`Invalid date ${date} in ${id}; expected YYYY-MM-DD`);
    }
    if (!['REG', 'OT', 'SO'].includes(resultType)) {
      throw new Error(`Invalid result type ${resultType} in ${id}`);
    }

    return {
      id,
      date,
      homeTeamId: requiredString(entry.homeTeamId, `${id}.homeTeamId`),
      awayTeamId: requiredString(entry.awayTeamId, `${id}.awayTeamId`),
      homeGoals: requiredNumber(entry.homeGoals, `${id}.homeGoals`),
      awayGoals: requiredNumber(entry.awayGoals, `${id}.awayGoals`),
      resultType,
      venue: optionalString(entry.venue),
    };
  });
}

/** @param {Record<string, unknown>} document */
export function normalizeGameStats(document) {
  const numericFields = [
    'homeShots',
    'awayShots',
    'homeXG',
    'awayXG',
    'homeCorsi',
    'awayCorsi',
    'homeFenwick',
    'awayFenwick',
  ];

  return getEntities(document, 'gameStats', 'gameStat').map((entry) => {
    const id = requiredString(entry['@_id'], 'gameStat.id');
    /** @type {Record<string, string | number | null>} */
    const normalized = {
      id,
      gameId: requiredString(entry.gameId, `${id}.gameId`),
    };

    for (const field of numericFields) {
      normalized[field] = optionalNumber(entry[field], `${id}.${field}`);
    }

    return normalized;
  });
}

/**
 * @param {Record<string, unknown>} document
 * @param {string} rootName
 * @param {string} entityName
 */
function getEntities(document, rootName, entityName) {
  const root = document[rootName];
  if (!isRecord(root)) {
    throw new Error(`Expected <${rootName}> root element`);
  }

  const value = root[entityName];
  const entries = Array.isArray(value) ? value : value === undefined ? [] : [value];

  return entries.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`Invalid <${entityName}> at index ${index}`);
    }
    return entry;
  });
}

/** @param {unknown} value @param {string} field */
function requiredString(value, field) {
  const normalized = optionalString(value);
  if (normalized === null) {
    throw new Error(`Missing required value ${field}`);
  }
  return normalized;
}

/** @param {unknown} value */
function optionalString(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

/** @param {unknown} value @param {string} field */
function requiredNumber(value, field) {
  const normalized = optionalNumber(value, field);
  if (normalized === null) {
    throw new Error(`Missing required value ${field}`);
  }
  return normalized;
}

/** @param {unknown} value @param {string} field */
function optionalNumber(value, field) {
  const normalized = optionalString(value);
  if (normalized === null) return null;
  const number = Number(normalized);
  if (!Number.isFinite(number)) {
    throw new Error(`Invalid numeric value for ${field}: ${normalized}`);
  }
  return number;
}

/** @param {string} value */
function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
