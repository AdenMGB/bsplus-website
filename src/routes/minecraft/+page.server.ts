import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    seo: {
      title: 'Minecraft Server | BetterSEQTA+',
      description:
        'Join the BetterSEQTA community Minecraft server and connect with the broader project community.',
      canonical: 'https://betterseqta.org/minecraft'
    }
  };
};
