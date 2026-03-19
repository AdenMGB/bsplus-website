import { t as getDB } from "./db.js";
//#region server/api/__sitemap__/urls.ts
var urls_default = defineSitemapEventHandler(async (event) => {
	const urls = [];
	try {
		const { results } = await getDB(event).prepare("SELECT slug, updated_at, created_at FROM news WHERE published = 1").all();
		for (const row of results) {
			const lastmod = row.updated_at ?? row.created_at;
			urls.push({
				loc: `/news/${row.slug}`,
				...lastmod && { lastmod: (/* @__PURE__ */ new Date(lastmod * 1e3)).toISOString() },
				changefreq: "monthly",
				priority: .7
			});
		}
	} catch (e) {
		console.error("[Sitemap] Failed to fetch news URLs:", e);
	}
	return urls;
});
//#endregion
export { urls_default as default };
