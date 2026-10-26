/* global document */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const SOURCE = 'NHL.com';
const SOURCE_URL = 'https://www.nhl.com/news/';
const ARTICLE_LIMIT = 15;
const OUTPUT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'data',
  'parsed',
  'nhl_news.json',
);

/**
 * @typedef {object} RawArticle
 * @property {string | null} [title]
 * @property {string | null} [url]
 * @property {string | null} [publishedAt]
 * @property {string | null} [category]
 * @property {string | null} [summary]
 * @property {string | null} [imageUrl]
 */

/** @param {string | null | undefined} text */
export function cleanText(text) {
  return text?.replace(/\s+/g, ' ').trim() || null;
}

/**
 * @param {string | null | undefined} value
 * @param {string} [baseUrl]
 */
export function makeAbsoluteUrl(value, baseUrl = SOURCE_URL) {
  const cleaned = cleanText(value);

  if (!cleaned) return null;

  try {
    const url = new URL(cleaned, baseUrl);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/** @param {string | null | undefined} value */
function normalizePublishedAt(value) {
  const match = cleanText(value)?.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

/**
 * Validates, normalizes and de-duplicates DOM records before assigning IDs.
 * @param {RawArticle[]} rawArticles
 * @param {number} [limit]
 */
export function prepareArticles(rawArticles, limit = ARTICLE_LIMIT) {
  const uniqueByUrl = new Map();

  for (const rawArticle of rawArticles) {
    const title = cleanText(rawArticle.title);
    const url = makeAbsoluteUrl(rawArticle.url);

    if (!title || !url || !new URL(url).pathname.startsWith('/news/')) continue;
    if (uniqueByUrl.has(url)) continue;

    uniqueByUrl.set(url, {
      title,
      url,
      publishedAt: normalizePublishedAt(rawArticle.publishedAt),
      category: cleanText(rawArticle.category),
      summary: cleanText(rawArticle.summary),
      imageUrl: makeAbsoluteUrl(rawArticle.imageUrl),
    });
  }

  return [...uniqueByUrl.values()].slice(0, limit).map((article, index) => ({
    id: `news-${String(index + 1).padStart(3, '0')}`,
    ...article,
    source: SOURCE,
  }));
}

/** @param {import('puppeteer').Page} page */
async function extractRawArticles(page) {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].some(
        (heading) => heading.textContent?.trim() === 'Feed: Latest News',
      ),
    { timeout: 30_000 },
  );

  return page.evaluate(() => {
    const heading = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].find(
      (element) => element.textContent?.trim() === 'Feed: Latest News',
    );
    const section = heading?.closest('section');

    if (!section) return [];

    return [...section.querySelectorAll('a.nhl-c-card-wrap.-story[href]')].map(
      (card) => {
        const image = card.querySelector('img');

        return {
          title: card.querySelector('.fa-text__title')?.textContent,
          url: card.getAttribute('href'),
          publishedAt: card.querySelector('time[datetime]')?.getAttribute('datetime'),
          category: card.querySelector('.fa-text__category')?.textContent,
          summary: card.querySelector(
            '.fa-text__description, .fa-text__dek',
          )?.textContent,
          imageUrl: image?.currentSrc || image?.getAttribute('src'),
        };
      },
    );
  });
}

/** @param {string} outputPath @param {unknown} data */
export async function saveToJson(outputPath, data) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function scrapeNhlNews() {
  let browser;

  try {
    console.log('[HockeyStats Parser] Starting NHL news scraper...');
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60_000);

    console.log('[HockeyStats Parser] Opening NHL.com...');
    await page.goto(SOURCE_URL, {
      waitUntil: 'domcontentloaded',
    });

    const articles = prepareArticles(await extractRawArticles(page));

    if (articles.length === 0) {
      throw new Error('Could not find valid news articles.');
    }

    const result = {
      source: SOURCE,
      sourceUrl: SOURCE_URL,
      scrapedAt: new Date().toISOString(),
      count: articles.length,
      articles,
    };

    console.log(`[HockeyStats Parser] Found ${articles.length} articles.`);
    await saveToJson(OUTPUT_PATH, result);
    console.log(
      `[HockeyStats Parser] Saved data to ${path.relative(process.cwd(), OUTPUT_PATH)}`,
    );

    return result;
  } finally {
    await browser?.close();
  }
}

const isExecutedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isExecutedDirectly) {
  scrapeNhlNews().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[HockeyStats Parser] Error: ${message}`);
    process.exitCode = 1;
  });
}
