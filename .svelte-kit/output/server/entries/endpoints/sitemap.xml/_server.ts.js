//#region src/routes/sitemap.xml/+server.ts
var staticRoutes = [
	"",
	"/download",
	"/desqta",
	"/comparison",
	"/privacy",
	"/minecraft",
	"/news",
	"/changelogs",
	"/changelogs/bqplus",
	"/changelogs/desqta"
];
var GET = async ({ platform, url }) => {
	const origin = `${url.protocol}//${url.host}`;
	const db = platform?.env.DB;
	let newsItems = [];
	if (db) newsItems = (await db.prepare("SELECT slug, updated_at, created_at FROM news WHERE published = 1 ORDER BY created_at DESC").all()).results ?? [];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticRoutes.map((path) => ({
		loc: `${origin}${path || "/"}`,
		lastmod: (/* @__PURE__ */ new Date()).toISOString()
	})), ...newsItems.map((item) => ({
		loc: `${origin}/news/${item.slug}`,
		lastmod: (/* @__PURE__ */ new Date((item.updated_at || item.created_at) * 1e3)).toISOString()
	}))].map((entry) => `  <url><loc>${entry.loc}</loc><lastmod>${entry.lastmod}</lastmod></url>`).join("\n")}\n</urlset>`;
	return new Response(xml, { headers: {
		"content-type": "application/xml; charset=utf-8",
		"cache-control": "public, max-age=3600"
	} });
};
//#endregion
export { GET };
