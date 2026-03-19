// @ts-nocheck
import type { PageServerLoad } from './$types';

export const load = async ({ fetch }: Parameters<PageServerLoad>[0]) => {
  const response = await fetch('/api/policy/privacy');
  const policy = response.ok ? await response.json() : null;

  return {
    policy,
    seo: {
      title: 'Privacy | BetterSEQTA+',
      description:
        'Read the BetterSEQTA privacy statement and learn what data is and is not collected.',
      canonical: 'https://betterseqta.org/privacy'
    }
  };
};
