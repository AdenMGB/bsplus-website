//#region server/utils/themes.ts
function slugify(text) {
	return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function generateUUID() {
	return crypto.randomUUID();
}
async function calculateSHA256(buffer) {
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function parseManifest(manifestContent) {
	try {
		const manifest = JSON.parse(manifestContent);
		if (!manifest.name || !manifest.version || !manifest.description || !manifest.author) throw new Error("Missing required fields in manifest");
		if (!manifest.compatibility || !manifest.compatibility.minVersion) throw new Error("Missing compatibility.minVersion in manifest");
		return manifest;
	} catch (error) {
		throw new Error(`Invalid manifest JSON: ${error.message}`);
	}
}
function detectThemeType(files) {
	const hasManifest = files.has("theme-manifest.json") || Array.from(files.keys()).some((k) => k.endsWith("/theme-manifest.json"));
	const hasStyles = Array.from(files.keys()).some((k) => k.includes("/styles/") || k.startsWith("styles/"));
	if (hasManifest && hasStyles) return "desqta";
	const themeJsonPaths = ["theme.json", ...Array.from(files.keys()).filter((k) => k.endsWith("/theme.json"))];
	for (const path of themeJsonPaths) {
		const data = files.get(path);
		if (!data) continue;
		try {
			const parsed = JSON.parse(new TextDecoder().decode(data));
			if (parsed.CustomCSS && parsed.id && parsed.name) return "betterseqta";
		} catch {}
	}
	return null;
}
function validateBetterSeqtaStructure(files) {
	const errors = [];
	const warnings = [];
	const themeJsonPath = ["theme.json", ...Array.from(files.keys()).filter((k) => k.endsWith("/theme.json"))].find((p) => files.has(p));
	if (!themeJsonPath) {
		errors.push("Missing theme.json");
		return {
			valid: false,
			errors,
			warnings
		};
	}
	try {
		const data = files.get(themeJsonPath);
		const parsed = JSON.parse(new TextDecoder().decode(data));
		if (!parsed.CustomCSS) errors.push("theme.json must have CustomCSS");
		if (!parsed.id) errors.push("theme.json must have id");
		if (!parsed.name) errors.push("theme.json must have name");
		if (!parsed.description) errors.push("theme.json must have description");
	} catch (e) {
		errors.push(`Invalid theme.json: ${e instanceof Error ? e.message : "parse error"}`);
	}
	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}
async function parseBetterSeqtaTheme(themeJsonContent) {
	const parsed = JSON.parse(themeJsonContent);
	if (!parsed.CustomCSS || !parsed.id || !parsed.name || !parsed.description) throw new Error("theme.json must have CustomCSS, id, name, and description");
	return parsed;
}
function validateThemeStructure(files) {
	const errors = [];
	const warnings = [];
	if (!(files.has("theme-manifest.json") || Array.from(files.keys()).some((k) => k.endsWith("/theme-manifest.json")))) errors.push("Missing theme-manifest.json");
	if (!Array.from(files.keys()).some((k) => k.includes("/styles/") || k.startsWith("styles/"))) errors.push("Missing styles/ directory");
	if (!Array.from(files.keys()).some((k) => k.endsWith(".css"))) errors.push("No CSS files found in styles/ directory");
	if (!Array.from(files.keys()).some((k) => k.includes("preview.") && (k.endsWith(".png") || k.endsWith(".jpg") || k.endsWith(".jpeg")))) warnings.push("No preview image found (preview.png or preview.jpg)");
	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}
function inferCategory(manifest) {
	const tags = manifest.tags || [];
	const name = manifest.name.toLowerCase();
	if (tags.some((t) => t.toLowerCase().includes("dark")) || name.includes("dark")) return "dark";
	if (tags.some((t) => t.toLowerCase().includes("light")) || name.includes("light")) return "light";
	if (tags.some((t) => t.toLowerCase().includes("colorful")) || name.includes("color")) return "colorful";
	if (tags.some((t) => t.toLowerCase().includes("minimal")) || name.includes("minimal")) return "minimal";
	return "other";
}
async function createZipArchive(files, themeSlug) {
	const { ZipWriter, BlobWriter, BlobReader } = await import("@zip.js/zip.js");
	const zipWriter = new ZipWriter(new BlobWriter());
	for (const [path, data] of files.entries()) {
		let normalizedPath = path.replace(/^\/+/, "");
		if (!normalizedPath.startsWith(themeSlug + "/")) normalizedPath = `${themeSlug}/${normalizedPath}`;
		normalizedPath = normalizedPath.replace(/\/+/g, "/");
		const blob = new Blob([data]);
		await zipWriter.add(normalizedPath, new BlobReader(blob));
	}
	return await (await zipWriter.close()).arrayBuffer();
}
//#endregion
export { inferCategory as a, slugify as c, generateUUID as i, validateBetterSeqtaStructure as l, createZipArchive as n, parseBetterSeqtaTheme as o, detectThemeType as r, parseManifest as s, calculateSHA256 as t, validateThemeStructure as u };
