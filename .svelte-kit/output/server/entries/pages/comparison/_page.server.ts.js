//#region src/routes/comparison/+page.server.ts
var load = async () => {
	return { seo: {
		title: "Comparison | BetterSEQTA+",
		description: "Compare BetterSEQTA+, DesQTA, and vanilla SEQTA Learn to find the experience that fits your workflow.",
		canonical: "https://betterseqta.org/comparison"
	} };
};
//#endregion
export { load };
