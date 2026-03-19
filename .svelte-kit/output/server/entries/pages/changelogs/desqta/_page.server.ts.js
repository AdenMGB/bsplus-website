import { t as renderMarkdown } from "../../../../chunks/markdown.js";
//#region src/routes/changelogs/desqta/+page.server.ts
var load = async ({ fetch }) => {
	const response = await fetch("/api/changelogs/desqta?page=1&per_page=50");
	return {
		releases: (response.ok ? await response.json() : []).map((release) => ({
			...release,
			renderedBody: renderMarkdown(String(release.body ?? ""))
		})),
		seo: {
			title: "DesQTA Changelog",
			description: "Read the full DesQTA release history and changelog for desktop app updates and new features.",
			canonical: "https://betterseqta.org/changelogs/desqta"
		}
	};
};
//#endregion
export { load };
