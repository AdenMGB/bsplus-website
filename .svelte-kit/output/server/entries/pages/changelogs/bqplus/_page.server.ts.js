import { t as renderMarkdown } from "../../../../chunks/markdown.js";
//#region src/routes/changelogs/bqplus/+page.server.ts
var load = async ({ fetch }) => {
	const response = await fetch("/api/changelogs/bqplus?page=1&per_page=50");
	return {
		releases: (response.ok ? await response.json() : []).map((release) => ({
			...release,
			renderedBody: renderMarkdown(String(release.body ?? ""))
		})),
		seo: {
			title: "BetterSEQTA+ Changelog",
			description: "Read the full BetterSEQTA+ release history and changelog for extension updates and new features.",
			canonical: "https://betterseqta.org/changelogs/bqplus"
		}
	};
};
//#endregion
export { load };
