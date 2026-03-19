import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const origin = `${url.protocol}//${url.host}`;
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${origin}/sitemap.xml\n`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
};
