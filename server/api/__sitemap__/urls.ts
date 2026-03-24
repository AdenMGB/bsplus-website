import type { SitemapUrl } from '#sitemap/types';
import { getDB } from '../../utils/db';

export default defineSitemapEventHandler(async (event) => {
  const urls: SitemapUrl[] = [
    {
      loc: '/themes',
      changefreq: 'daily',
      priority: 0.8,
    },
  ];

  try {
    const db = getDB(event);
    const { results } = await db
      .prepare('SELECT slug, updated_at, created_at FROM news WHERE published = 1')
      .all();

    for (const row of results as { slug: string; updated_at?: number; created_at?: number }[]) {
      const lastmod = row.updated_at ?? row.created_at;
      urls.push({
        loc: `/news/${row.slug}`,
        ...(lastmod && { lastmod: new Date(lastmod * 1000).toISOString() }),
        changefreq: 'monthly',
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error('[Sitemap] Failed to fetch news URLs:', e);
  }

  try {
    const db = getDB(event);
    const { results: themeRows } = await db
      .prepare('SELECT slug, updated_at, created_at FROM themes WHERE status = ?')
      .bind('approved')
      .all();

    for (const row of themeRows as { slug: string; updated_at?: number; created_at?: number }[]) {
      const lastmod = row.updated_at ?? row.created_at;
      urls.push({
        loc: `/themes/${row.slug}`,
        ...(lastmod && { lastmod: new Date(lastmod * 1000).toISOString() }),
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error('[Sitemap] Failed to fetch theme URLs:', e);
  }

  return urls;
});
