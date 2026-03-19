import type { LayoutServerLoad } from './$types';
import { themeState } from '$lib/stores/theme';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const siteUrl = 'https://betterseqta.org';

  return {
    user: locals.user,
    theme: themeState,
    seo: {
      title: 'BetterSEQTA+',
      description:
        'BetterSEQTA+ and DesQTA enhance SEQTA Learn with themes, wallpapers, analytics, and a full desktop experience.',
      canonical: `${siteUrl}${url.pathname}`
    }
  };
};
