//#region src/lib/stores/theme.ts
var themeState = {
	mode: "dark",
	accent: "emerald"
};
//#endregion
//#region src/routes/+layout.server.ts
var load = async ({ locals, url }) => {
	return {
		user: locals.user,
		theme: themeState,
		seo: {
			title: "BetterSEQTA+",
			description: "BetterSEQTA+ and DesQTA enhance SEQTA Learn with themes, wallpapers, analytics, and a full desktop experience.",
			canonical: `https://betterseqta.org${url.pathname}`
		}
	};
};
//#endregion
export { load };
