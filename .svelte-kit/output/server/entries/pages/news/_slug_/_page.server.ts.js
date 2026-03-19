import { error } from "@sveltejs/kit";
//#region src/lib/seo/schema.ts
function articleSchema(input) {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: input.title,
		description: input.description,
		url: input.url,
		image: input.image,
		datePublished: input.publishedAt,
		author: {
			"@type": "Person",
			name: input.authorName
		},
		publisher: {
			"@type": "Organization",
			name: "BetterSEQTA+"
		}
	};
}
//#endregion
//#region src/routes/news/[slug]/+page.server.ts
function stripHtml(html, maxLength = 155) {
	const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
	return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}
var load = async ({ fetch, params, url }) => {
	const response = await fetch(`/api/news/${params.slug}${url.search ? url.search : ""}`);
	if (!response.ok) throw error(response.status, "Post not found");
	const post = await response.json();
	const description = stripHtml(post.content ?? "", 160) || `${post.title} - BetterSEQTA news`;
	const coverImage = post.cover_image?.startsWith("http") ? post.cover_image : post.cover_image ? `https://betterseqta.org${post.cover_image}` : "https://betterseqta.org/favicon-96x96.png";
	return {
		post,
		seo: {
			title: `${post.title} | BetterSEQTA+`,
			description,
			canonical: `https://betterseqta.org/news/${params.slug}`,
			image: coverImage,
			type: "article",
			jsonLd: articleSchema({
				title: post.title,
				description,
				url: `https://betterseqta.org/news/${params.slug}`,
				image: coverImage,
				authorName: post.author_name,
				publishedAt: (/* @__PURE__ */ new Date(post.created_at * 1e3)).toISOString()
			})
		}
	};
};
//#endregion
export { load };
