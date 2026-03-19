// @ts-nocheck
import type { PageServerLoad } from './$types';
import { renderMarkdown } from '$lib/utils/markdown';

export const load = async ({ fetch }: Parameters<PageServerLoad>[0]) => {
  const response = await fetch('/api/changelogs/bqplus?page=1&per_page=50');
  const releases = response.ok ? ((await response.json()) as any[]) : [];

  return {
    releases: releases.map((release: Record<string, unknown>) => ({
      ...release,
      renderedBody: renderMarkdown(String(release.body ?? ''))
    })),
    seo: {
      title: 'BetterSEQTA+ Changelog',
      description:
        'Read the full BetterSEQTA+ release history and changelog for extension updates and new features.',
      canonical: 'https://betterseqta.org/changelogs/bqplus'
    }
  };
};
