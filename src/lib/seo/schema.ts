export function webPageSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
  authorName: string;
  publishedAt: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    image: input.image,
    datePublished: input.publishedAt,
    author: {
      '@type': 'Person',
      name: input.authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'BetterSEQTA+'
    }
  };
}
