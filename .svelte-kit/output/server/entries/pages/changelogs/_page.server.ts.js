import { t as renderMarkdown } from "../../../chunks/markdown.js";
//#region src/routes/changelogs/+page.server.ts
var load = async ({ fetch }) => {
	const [bqplusResponse, desqtaResponse] = await Promise.all([fetch("/api/changelogs/bqplus?page=1&per_page=1"), fetch("/api/changelogs/desqta?page=1&per_page=1")]);
	const [bqplusReleases, desqtaReleases] = await Promise.all([bqplusResponse.ok ? bqplusResponse.json() : Promise.resolve([]), desqtaResponse.ok ? desqtaResponse.json() : Promise.resolve([])]);
	return {
		bqplusRelease: bqplusReleases[0] ?? null,
		desqtaRelease: desqtaReleases[0] ?? null,
		renderedBqplus: bqplusReleases[0]?.body ? renderMarkdown(bqplusReleases[0].body) : "",
		renderedDesqta: desqtaReleases[0]?.body ? renderMarkdown(desqtaReleases[0].body) : "",
		seo: {
			title: "Changelogs | BetterSEQTA+",
			description: "Track BetterSEQTA+ and DesQTA release history, release notes, and changelog updates in one place.",
			canonical: "https://betterseqta.org/changelogs"
		}
	};
};
//#endregion
export { load };
