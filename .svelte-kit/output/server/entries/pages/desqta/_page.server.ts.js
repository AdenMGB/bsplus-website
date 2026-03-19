import { n as desqtaFeatures } from "../../../chunks/site.js";
import { t as fetchLatestRelease } from "../../../chunks/github.js";
//#region src/routes/desqta/+page.server.ts
var load = async () => {
	return {
		release: await fetchLatestRelease("betterseqta/desqta"),
		features: desqtaFeatures,
		seo: {
			title: "DesQTA | BetterSEQTA+",
			description: "Explore DesQTA, the full desktop experience for SEQTA Learn with offline support, cloud features, and native integration.",
			canonical: "https://betterseqta.org/desqta"
		}
	};
};
//#endregion
export { load };
