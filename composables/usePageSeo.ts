/**
 * Composable for consistent page-level SEO meta tags.
 * Sets description, Open Graph, Twitter Card, and canonical URL.
 */
export function usePageSeo(options: {
  title?: string;
  description: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
}) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const baseUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

  const canonical = options.canonical ?? (options.noIndex ? undefined : `${baseUrl}${route.path}`);
  const ogImage = options.image?.startsWith('http') ? options.image : options.image ? `${baseUrl}${options.image}` : undefined;

  useSeoMeta({
    description: options.description,
    ogDescription: options.description,
    ogTitle: options.title,
    ogImage,
    ogUrl: canonical,
    ogSiteName: 'BetterSEQTA Plus',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: ogImage,
    ...(options.noIndex && { robots: 'noindex, nofollow' }),
  });

  useHead({
    ...(options.title && { title: options.title }),
    ...(canonical && {
      link: [{ rel: 'canonical', href: canonical }],
    }),
  });
}
