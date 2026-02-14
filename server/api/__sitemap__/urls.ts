import type { SitemapUrl } from '#sitemap/types';
import { getDB } from '../../utils/db';

export default defineSitemapEventHandler(async (event) => {
  const urls: SitemapUrl[] = [];

  try {
    const db = getDB(event);
    const { results } = await db
      .prepare('SELECT slug, updated_at, created_at FROM news WHERE published = 1')
      .all();

    for (const row of results as { slug: string; updated_at?: number; created_at?: number }[]) {
      const lastmod = row.updated_at ?? row.created_at;
      urls.push({
        loc: `/news/${row.slug}`,
        lastmod: lastmod ? new Date(lastmod * 1000).toISOString() : undefined,
        changefreq: 'monthly',
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error('[Sitemap] Failed to fetch news URLs:', e);
  }

  return urls;
});
