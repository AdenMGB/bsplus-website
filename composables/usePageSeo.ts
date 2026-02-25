/**
 * Composable for consistent page-level SEO meta tags.
 * Sets description, Open Graph, Twitter Card, canonical URL, and optional dynamic OG image.
 */
export function usePageSeo(options: {
  title?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  canonical?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
  /** Use dynamic OG image component instead of static image. Pass component name + props. */
  ogImageComponent?: string;
  ogImageProps?: Record<string, string>;
}) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const baseUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

  const canonical = options.canonical ?? (options.noIndex ? undefined : `${baseUrl}${route.path}`);
  const ogImage = options.image?.startsWith('http') ? options.image : options.image ? `${baseUrl}${options.image}` : undefined;

  // Dynamic OG image - generates at runtime when crawlers request it
  if (options.ogImageComponent) {
    defineOgImage(options.ogImageComponent, {
      ...options.ogImageProps,
      alt: options.imageAlt ?? options.description?.slice(0, 100),
    });
  }

  const imageAlt = options.imageAlt ?? options.description?.slice(0, 100);

  useSeoMeta({
    description: options.description,
    ogDescription: options.description,
    ogTitle: options.title,
    ...(ogImage && { ogImage, ogImageAlt: imageAlt }),
    ogUrl: canonical,
    ogType: options.ogType ?? 'website',
    ogSiteName: 'BetterSEQTA Plus',
    ogLocale: 'en_AU',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    ...(ogImage && { twitterImage: ogImage, twitterImageAlt: imageAlt }),
    ...(options.noIndex && { robots: 'noindex, nofollow' }),
  });

  useHead({
    ...(options.title && { title: `${options.title} | BetterSEQTA Plus` }),
    ...(canonical && {
      link: [{ rel: 'canonical', href: canonical }],
    }),
  });
}
