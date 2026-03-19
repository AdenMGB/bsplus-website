//#region src/routes/news/+page.server.ts
var load = async ({ fetch }) => {
	const response = await fetch("/api/news");
	return {
		posts: response.ok ? await response.json() : [],
		seo: {
			title: "News | BetterSEQTA+",
			description: "Latest news and updates from the BetterSEQTA team, including releases, feature updates, and project announcements.",
			canonical: "https://betterseqta.org/news"
		}
	};
};
//#endregion
export { load };
