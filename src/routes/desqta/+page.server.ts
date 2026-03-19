import type { PageServerLoad } from './$types';
import { fetchLatestRelease } from '$lib/server/github';
import { desqtaFeatures } from '$lib/content/site';

export const load: PageServerLoad = async () => {
  return {
    release: await fetchLatestRelease('betterseqta/desqta'),
    features: desqtaFeatures,
    seo: {
      title: 'DesQTA | BetterSEQTA+',
      description:
        'Explore DesQTA, the full desktop experience for SEQTA Learn with offline support, cloud features, and native integration.',
      canonical: 'https://betterseqta.org/desqta'
    }
  };
};
