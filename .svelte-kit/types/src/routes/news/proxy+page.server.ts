// @ts-nocheck
import type { PageServerLoad } from './$types';

export const load = async ({ fetch }: Parameters<PageServerLoad>[0]) => {
  const response = await fetch('/api/news');
  const posts = response.ok ? ((await response.json()) as any[]) : [];

  return {
    posts,
    seo: {
      title: 'News | BetterSEQTA+',
      description:
        'Latest news and updates from the BetterSEQTA team, including releases, feature updates, and project announcements.',
      canonical: 'https://betterseqta.org/news'
    }
  };
};
