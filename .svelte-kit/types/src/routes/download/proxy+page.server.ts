// @ts-nocheck
import type { PageServerLoad } from './$types';
import { fetchLatestRelease } from '$lib/server/github';

const assetUrl = (assets: { name: string; browser_download_url: string }[] | undefined, suffix: string) =>
  assets?.find((asset) => asset.name.toLowerCase().endsWith(suffix))?.browser_download_url ?? '';

export const load = async () => {
  const release = await fetchLatestRelease('betterseqta/desqta');

  return {
    release,
    links: {
      apk: assetUrl(release?.assets, '.apk'),
      dmg: assetUrl(release?.assets, '.dmg'),
      exe: assetUrl(release?.assets, '.exe'),
      msi: assetUrl(release?.assets, '.msi')
    },
    seo: {
      title: 'Download | BetterSEQTA+',
      description:
        'Download BetterSEQTA+ and DesQTA for browser, desktop, and Android platforms.',
      canonical: 'https://betterseqta.org/download'
    }
  };
};
;null as any as PageServerLoad;