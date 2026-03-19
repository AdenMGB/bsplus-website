import type { PageServerLoad } from './$types';
import { renderMarkdown } from '$lib/utils/markdown';

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch('/api/changelogs/desqta?page=1&per_page=50');
  const releases = response.ok ? ((await response.json()) as any[]) : [];

  return {
    releases: releases.map((release: Record<string, unknown>) => ({
      ...release,
      renderedBody: renderMarkdown(String(release.body ?? ''))
    })),
    seo: {
      title: 'DesQTA Changelog',
      description:
        'Read the full DesQTA release history and changelog for desktop app updates and new features.',
      canonical: 'https://betterseqta.org/changelogs/desqta'
    }
  };
};
