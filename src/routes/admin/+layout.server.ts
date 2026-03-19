import type { LayoutServerLoad } from './$types';
import { requireAdminPage } from '$lib/server/auth';

export const load: LayoutServerLoad = async (event) => {
  await requireAdminPage(event);

  return {
    user: event.locals.user,
    seo: {
      title: 'Admin | BetterSEQTA+',
      description: 'BetterSEQTA administration panel.',
      canonical: 'https://betterseqta.org/admin',
      noindex: true
    }
  };
};
