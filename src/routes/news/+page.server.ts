import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
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
