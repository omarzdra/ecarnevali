import { describe, expect, it } from 'vitest';

import {
  cleanText,
  makeAbsoluteUrl,
  prepareArticles,
} from '../scripts/nhlNewsParser.js';

describe('NHL news parser helpers', () => {
  it('cleans text and converts relative article and image URLs to absolute URLs', () => {
    expect(cleanText('  Latest\n\tNHL   story  ')).toBe('Latest NHL story');
    expect(makeAbsoluteUrl('/news/latest-story')).toBe(
      'https://www.nhl.com/news/latest-story',
    );
    expect(makeAbsoluteUrl('https://media.d3.nhle.com/story.png')).toBe(
      'https://media.d3.nhle.com/story.png',
    );
  });

  it('normalizes article fields, removes duplicate URLs and generates unique IDs', () => {
    const articles = prepareArticles([
      {
        title: '  First   story ',
        url: '/news/first-story',
        publishedAt: '2026-10-26T06:02:00',
        category: '',
        summary: ' Short\nsummary ',
        imageUrl: '/images/first.png',
      },
      {
        title: 'Duplicate',
        url: 'https://www.nhl.com/news/first-story',
      },
      {
        title: 'Second story',
        url: '/news/second-story',
      },
    ]);

    expect(articles).toEqual([
      {
        id: 'news-001',
        title: 'First story',
        url: 'https://www.nhl.com/news/first-story',
        publishedAt: '2026-10-26',
        category: null,
        summary: 'Short summary',
        imageUrl: 'https://www.nhl.com/images/first.png',
        source: 'NHL.com',
      },
      {
        id: 'news-002',
        title: 'Second story',
        url: 'https://www.nhl.com/news/second-story',
        publishedAt: null,
        category: null,
        summary: null,
        imageUrl: null,
        source: 'NHL.com',
      },
    ]);
  });

  it('rejects malformed URLs and omits records without a title or article URL', () => {
    expect(makeAbsoluteUrl('javascript:alert(1)')).toBeNull();
    expect(
      prepareArticles([
        { title: '', url: '/news/no-title' },
        { title: 'No URL', url: null },
        { title: 'Wrong section', url: '/video/not-news' },
      ]),
    ).toEqual([]);
  });
});
