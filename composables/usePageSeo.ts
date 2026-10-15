/**
 * Composable for consistent page-level SEO meta tags.
 * Sets description, Open Graph, Twitter Card, canonical URL, and OG image.
 */
export function usePageSeo(options: {
  title?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  canonical?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
}) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const baseUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

  const canonical = options.canonical ?? (options.noIndex ? undefined : `${baseUrl}${route.path}`);
  const ogImage = options.image?.startsWith('http')
    ? options.image
    : options.image
      ? `${baseUrl}${options.image}`
      : `${baseUrl}/web-app-manifest-512x512.png`;
  const imageAlt = options.imageAlt ?? options.description?.slice(0, 100);

  useSeoMeta({
    description: options.description,
    ogDescription: options.description,
    ogTitle: options.title,
    ogImage,
    ogImageAlt: imageAlt,
    ogUrl: canonical,
    ogType: options.ogType ?? 'website',
    ogSiteName: 'BetterSEQTA Plus',
    ogLocale: 'en_AU',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: ogImage,
    twitterImageAlt: imageAlt,
    ...(options.noIndex && { robots: 'noindex, nofollow' }),
  });

  useHead({
    ...(options.title && { title: `${options.title} | BetterSEQTA Plus` }),
    ...(canonical && {
      link: [{ rel: 'canonical', href: canonical }],
    }),
  });
}
