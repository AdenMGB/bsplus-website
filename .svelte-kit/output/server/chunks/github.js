//#region src/lib/server/github.ts
async function fetchLatestRelease(repo) {
	const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=1`, { headers: { "User-Agent": "betterseqta-sveltekit" } });
	if (!response.ok) return null;
	return (await response.json())[0] ?? null;
}
//#endregion
export { fetchLatestRelease as t };
