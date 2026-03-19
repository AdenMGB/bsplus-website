//#region src/routes/privacy/+page.server.ts
var load = async ({ fetch }) => {
	const response = await fetch("/api/policy/privacy");
	return {
		policy: response.ok ? await response.json() : null,
		seo: {
			title: "Privacy | BetterSEQTA+",
			description: "Read the BetterSEQTA privacy statement and learn what data is and is not collected.",
			canonical: "https://betterseqta.org/privacy"
		}
	};
};
//#endregion
export { load };
