//#region src/routes/robots.txt/+server.ts
var GET = async ({ url }) => {
	const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${`${url.protocol}//${url.host}`}/sitemap.xml\n`;
	return new Response(body, { headers: {
		"content-type": "text/plain; charset=utf-8",
		"cache-control": "public, max-age=3600"
	} });
};
//#endregion
export { GET };
