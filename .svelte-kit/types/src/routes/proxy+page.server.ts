// @ts-nocheck
import type { PageServerLoad } from './$types';
import { fetchLatestRelease } from '$lib/server/github';

export const load = async () => {
  const [bsPlusRelease, desqtaRelease] = await Promise.all([
    fetchLatestRelease('betterseqta/betterseqta-plus'),
    fetchLatestRelease('betterseqta/desqta')
  ]);

  return {
    bsPlusRelease,
    desqtaRelease,
    seo: {
      title: 'BetterSEQTA+ | SEQTA Learn Enhanced',
      description:
        'BetterSEQTA+ and DesQTA modernize SEQTA Learn with themes, wallpapers, downloads, admin tooling, and a full desktop experience.',
      canonical: 'https://betterseqta.org/'
    }
  };
};
;null as any as PageServerLoad;