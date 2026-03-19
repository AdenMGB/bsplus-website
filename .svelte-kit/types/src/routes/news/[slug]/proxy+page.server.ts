// @ts-nocheck
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { articleSchema } from '$lib/seo/schema';

function stripHtml(html: string, maxLength = 155) {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

export const load = async ({ fetch, params, url }: Parameters<PageServerLoad>[0]) => {
  const response = await fetch(`/api/news/${params.slug}${url.search ? url.search : ''}`);
  if (!response.ok) {
    throw error(response.status, 'Post not found');
  }

  const post = (await response.json()) as any;
  const description = stripHtml(post.content ?? '', 160) || `${post.title} - BetterSEQTA news`;
  const coverImage = post.cover_image?.startsWith('http')
    ? post.cover_image
    : post.cover_image
      ? `https://betterseqta.org${post.cover_image}`
      : 'https://betterseqta.org/favicon-96x96.png';

  return {
    post,
    seo: {
      title: `${post.title} | BetterSEQTA+`,
      description,
      canonical: `https://betterseqta.org/news/${params.slug}`,
      image: coverImage,
      type: 'article',
      jsonLd: articleSchema({
        title: post.title,
        description,
        url: `https://betterseqta.org/news/${params.slug}`,
        image: coverImage,
        authorName: post.author_name,
        publishedAt: new Date(post.created_at * 1000).toISOString()
      })
    }
  };
};
