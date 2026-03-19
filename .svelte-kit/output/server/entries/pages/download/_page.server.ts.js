import { t as fetchLatestRelease } from "../../../chunks/github.js";
//#region src/routes/download/+page.server.ts
var assetUrl = (assets, suffix) => assets?.find((asset) => asset.name.toLowerCase().endsWith(suffix))?.browser_download_url ?? "";
var load = async () => {
	const release = await fetchLatestRelease("betterseqta/desqta");
	return {
		release,
		links: {
			apk: assetUrl(release?.assets, ".apk"),
			dmg: assetUrl(release?.assets, ".dmg"),
			exe: assetUrl(release?.assets, ".exe"),
			msi: assetUrl(release?.assets, ".msi")
		},
		seo: {
			title: "Download | BetterSEQTA+",
			description: "Download BetterSEQTA+ and DesQTA for browser, desktop, and Android platforms.",
			canonical: "https://betterseqta.org/download"
		}
	};
};
//#endregion
export { load };
