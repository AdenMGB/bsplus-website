// @ts-nocheck
import type { PageServerLoad } from './$types';

export const load = async () => {
  return {
    seo: {
      title: 'Comparison | BetterSEQTA+',
      description:
        'Compare BetterSEQTA+, DesQTA, and vanilla SEQTA Learn to find the experience that fits your workflow.',
      canonical: 'https://betterseqta.org/comparison'
    }
  };
};
;null as any as PageServerLoad;