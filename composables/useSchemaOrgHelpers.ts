/**
 * Helpers for Schema.org structured data via nuxt-schema-org.
 * Use with useSchemaOrg([...]) from #imports.
 */
export function useSchemaOrgHelpers() {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

  return {
    siteUrl,
    /** Base Organization for the site */
    organization: () =>
      // @ts-expect-error - from @nuxtjs/seo
      defineOrganization({
        name: 'BetterSEQTA',
        url: siteUrl,
        logo: `${siteUrl}/favicon-96x96.png`,
      }),
    /** WebSite schema for homepage */
    webSite: (name: string, description?: string) =>
      // @ts-expect-error - from @nuxtjs/seo
      defineWebSite({
        name,
        description: description ?? 'BetterSEQTA Plus - SEQTA Learn Enhanced. Browser extension and desktop app for SEQTA.',
        url: siteUrl,
      }),
    /** WebPage schema for generic pages */
    webPage: (name: string, description?: string) =>
      // @ts-expect-error - from @nuxtjs/seo
      defineWebPage({
        name,
        description,
        url: `${siteUrl}${useRoute().path}`,
      }),
    /** SoftwareApplication schema for DesQTA / BetterSEQTA+ */
    softwareApplication: (options: {
      name: string;
      description: string;
      operatingSystem?: string;
      applicationCategory?: string;
      url?: string;
    }) =>
      // @ts-expect-error - from @unhead/schema-org
      defineSoftwareApp({
        name: options.name,
        description: options.description,
        operatingSystem: options.operatingSystem ?? 'Windows, macOS, Linux, Android',
        applicationCategory: 'UtilitiesApplication',
        url: options.url ?? `${siteUrl}${useRoute().path}`,
      }),
    /** Article schema for news posts */
    article: (options: {
      headline: string;
      description?: string;
      image?: string;
      datePublished: Date | string | number;
      dateModified?: Date | string | number;
      author?: { name: string; url?: string }[];
      url?: string;
    }) => {
      const route = useRoute();
      const url = options.url ?? `${siteUrl}${route.path}`;
      const image = options.image?.startsWith('http') ? options.image : options.image ? `${siteUrl}${options.image}` : undefined;
      return (
        // @ts-expect-error - from @nuxtjs/seo
        defineArticle({
          '@type': 'BlogPosting',
          headline: options.headline,
          description: options.description,
          image,
          datePublished: typeof options.datePublished === 'number' ? new Date(options.datePublished * 1000) : options.datePublished,
          dateModified: options.dateModified
            ? typeof options.dateModified === 'number'
              ? new Date(options.dateModified * 1000)
              : options.dateModified
            : undefined,
          author: options.author ?? [{ name: 'BetterSEQTA' }],
          url,
        })
      );
    },
  };
}
