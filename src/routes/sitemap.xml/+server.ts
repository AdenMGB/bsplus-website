import type { RequestHandler } from './$types';

const staticRoutes = [
  '',
  '/download',
  '/desqta',
  '/comparison',
  '/privacy',
  '/minecraft',
  '/news',
  '/changelogs',
  '/changelogs/bqplus',
  '/changelogs/desqta'
];

export const GET: RequestHandler = async ({ platform, url }) => {
  const origin = `${url.protocol}//${url.host}`;
  const db = platform?.env.DB;

  let newsItems: Array<{ slug: string; updated_at: number; created_at: number }> = [];
  if (db) {
    const result = await db
      .prepare('SELECT slug, updated_at, created_at FROM news WHERE published = 1 ORDER BY created_at DESC')
      .all<{ slug: string; updated_at: number; created_at: number }>();
    newsItems = result.results ?? [];
  }

  const urls = [
    ...staticRoutes.map((path) => ({
      loc: `${origin}${path || '/'}`,
      lastmod: new Date().toISOString()
    })),
    ...newsItems.map((item) => ({
      loc: `${origin}/news/${item.slug}`,
      lastmod: new Date((item.updated_at || item.created_at) * 1000).toISOString()
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((entry) => `  <url><loc>${entry.loc}</loc><lastmod>${entry.lastmod}</lastmod></url>`)
    .join('\n')}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
};
