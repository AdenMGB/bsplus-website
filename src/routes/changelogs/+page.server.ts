import type { PageServerLoad } from './$types';
import { renderMarkdown } from '$lib/utils/markdown';

export const load: PageServerLoad = async ({ fetch }) => {
  const [bqplusResponse, desqtaResponse] = await Promise.all([
    fetch('/api/changelogs/bqplus?page=1&per_page=1'),
    fetch('/api/changelogs/desqta?page=1&per_page=1')
  ]);

  const [bqplusReleases, desqtaReleases] = await Promise.all([
    bqplusResponse.ok ? (bqplusResponse.json() as Promise<any[]>) : Promise.resolve([] as any[]),
    desqtaResponse.ok ? (desqtaResponse.json() as Promise<any[]>) : Promise.resolve([] as any[])
  ]);

  return {
    bqplusRelease: bqplusReleases[0] ?? null,
    desqtaRelease: desqtaReleases[0] ?? null,
    renderedBqplus: bqplusReleases[0]?.body ? renderMarkdown(bqplusReleases[0].body) : '',
    renderedDesqta: desqtaReleases[0]?.body ? renderMarkdown(desqtaReleases[0].body) : '',
    seo: {
      title: 'Changelogs | BetterSEQTA+',
      description:
        'Track BetterSEQTA+ and DesQTA release history, release notes, and changelog updates in one place.',
      canonical: 'https://betterseqta.org/changelogs'
    }
  };
};
