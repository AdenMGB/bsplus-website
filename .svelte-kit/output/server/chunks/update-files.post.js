import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
import { n as requireAdmin } from "./auth2.js";
import { a as inferCategory, c as slugify, l as validateBetterSeqtaStructure, n as createZipArchive, o as parseBetterSeqtaTheme, s as parseManifest, t as calculateSHA256, u as validateThemeStructure } from "./themes.js";
//#region server/api/admin/themes/[id]/update-files.post.ts
var update_files_post_default = defineEventHandler(async (event) => {
	await requireAdmin(event);
	const db = getDB(event);
	const bucket = getBucket(event);
	const siteUrl = (useRuntimeConfig().public?.siteUrl ?? "https://betterseqta.org").replace(/\/$/, "");
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	const existingTheme = await db.prepare("SELECT * FROM themes WHERE id = ?").bind(id).first();
	if (!existingTheme) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	const formData = await readMultipartFormData(event);
	if (!formData || formData.length === 0) throw createError({
		statusCode: 400,
		statusMessage: "No files uploaded"
	});
	let zipFile = null;
	const themeFiles = /* @__PURE__ */ new Map();
	for (const part of formData) if (part.name === "theme_zip" && part.filename) zipFile = part;
	else if (part.name === "theme_folder" && part.filename?.endsWith(".zip")) zipFile = part;
	if (!zipFile) throw createError({
		statusCode: 400,
		statusMessage: "ZIP file is required"
	});
	try {
		const { ZipReader, BlobReader, BlobWriter } = await import("@zip.js/zip.js");
		const zipReader = new ZipReader(new BlobReader(new Blob([new Uint8Array(zipFile.data)])));
		const entries = await zipReader.getEntries();
		for (const entry of entries) if (!entry.directory) {
			const arrayBuffer = await (await entry.getData(new BlobWriter())).arrayBuffer();
			themeFiles.set(entry.filename, arrayBuffer);
		}
		await zipReader.close();
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: `Failed to extract ZIP: ${error.message}`
		});
	}
	if (existingTheme.theme_type === "betterseqta") {
		const validation = validateBetterSeqtaStructure(themeFiles);
		if (!validation.valid) return {
			success: false,
			data: null,
			error: {
				code: "INVALID_THEME_STRUCTURE",
				message: "BetterSEQTA theme validation failed",
				details: {
					errors: validation.errors,
					warnings: validation.warnings
				}
			},
			meta: {
				timestamp: Date.now(),
				version: "1.0.0"
			}
		};
		const themeJsonPath = Array.from(themeFiles.keys()).find((k) => k.endsWith("/theme.json")) ?? "theme.json";
		const themeJsonContent = new TextDecoder().decode(themeFiles.get(themeJsonPath));
		const bsTheme = await parseBetterSeqtaTheme(themeJsonContent);
		if (bsTheme.id !== id) return {
			success: false,
			data: null,
			error: {
				code: "THEME_ID_MISMATCH",
				message: `Theme ID in theme.json (${bsTheme.id}) does not match this theme (${id}). Upload a ZIP for the correct theme.`
			},
			meta: {
				timestamp: Date.now(),
				version: "1.0.0"
			}
		};
		const themeJsonKey = `themes/${id}/theme.json`;
		await bucket.put(themeJsonKey, new TextEncoder().encode(themeJsonContent), { httpMetadata: { contentType: "application/json" } });
		let coverImageUrl = existingTheme.cover_image_url;
		let marqueeImageUrl = existingTheme.marquee_image_url;
		const bannerEntry = Array.from(themeFiles.entries()).find(([p]) => p.includes("images/banner.webp") || p.includes("banner.webp"));
		if (bannerEntry) {
			const bannerKey = `themes/${id}/images/banner.webp`;
			await bucket.put(bannerKey, bannerEntry[1], { httpMetadata: { contentType: "image/webp" } });
			coverImageUrl = `${siteUrl}/api/images/${bannerKey}`;
		}
		const marqueeEntry = Array.from(themeFiles.entries()).find(([p]) => p.includes("images/marquee.webp") || p.includes("marquee.webp"));
		if (marqueeEntry) {
			const marqueeKey = `themes/${id}/images/marquee.webp`;
			await bucket.put(marqueeKey, marqueeEntry[1], { httpMetadata: { contentType: "image/webp" } });
			marqueeImageUrl = `${siteUrl}/api/images/${marqueeKey}`;
		}
		const newSlug = slugify(bsTheme.name);
		const now = Date.now();
		try {
			await db.prepare(`UPDATE themes SET
          name = ?,
          slug = ?,
          description = ?,
          cover_image_url = ?,
          marquee_image_url = ?,
          updated_at = ?
        WHERE id = ?`).bind(bsTheme.name, newSlug, bsTheme.description, coverImageUrl, marqueeImageUrl, now, id).run();
		} catch (err) {
			if (err?.message?.includes("UNIQUE") || err?.message?.includes("unique")) return {
				success: false,
				data: null,
				error: {
					code: "SLUG_CONFLICT",
					message: `Slug "${newSlug}" is already used by another theme. Try a different theme name.`
				},
				meta: {
					timestamp: Date.now(),
					version: "1.0.0"
				}
			};
			throw err;
		}
		const theme = await db.prepare("SELECT * FROM themes WHERE id = ?").bind(id).first();
		return {
			success: true,
			data: {
				theme: {
					id: theme.id,
					name: theme.name,
					slug: theme.slug,
					theme_type: "betterseqta",
					theme_json_url: theme.theme_json_url,
					cover_image_url: theme.cover_image_url,
					marquee_image_url: theme.marquee_image_url
				},
				validation: {
					valid: true,
					warnings: validation.warnings,
					errors: []
				}
			},
			error: null,
			meta: {
				timestamp: Date.now(),
				version: "1.0.0"
			}
		};
	}
	const validation = validateThemeStructure(themeFiles);
	if (!validation.valid) return {
		success: false,
		data: null,
		error: {
			code: "INVALID_THEME_STRUCTURE",
			message: "Theme validation failed",
			details: {
				errors: validation.errors,
				warnings: validation.warnings
			}
		},
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
	const manifestEntry = Array.from(themeFiles.entries()).find(([path]) => path.endsWith("theme-manifest.json"));
	if (!manifestEntry) throw createError({
		statusCode: 400,
		statusMessage: "theme-manifest.json not found"
	});
	const manifest = await parseManifest(new TextDecoder().decode(manifestEntry[1]));
	let previewImage = null;
	for (const path of [
		"preview.png",
		"preview.jpg",
		"preview.jpeg"
	]) {
		const entry = Array.from(themeFiles.entries()).find(([p]) => p.includes(path) && (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg")));
		if (entry) {
			previewImage = {
				path: entry[0],
				data: entry[1]
			};
			break;
		}
	}
	let previewUrl = existingTheme.preview_thumbnail_url;
	if (previewImage) {
		const previewKey = `themes/${id}/preview.png`;
		await bucket.put(previewKey, previewImage.data, { httpMetadata: { contentType: "image/png" } });
		previewUrl = `/api/images/${previewKey}`;
	}
	const screenshots = [];
	let screenshotIndex = 1;
	while (true) {
		const screenshotPath = `screenshot${screenshotIndex}.png`;
		const entry = Array.from(themeFiles.entries()).find(([p]) => p.includes(screenshotPath) || p.includes(`screenshot${screenshotIndex}.jpg`));
		if (!entry) break;
		screenshots.push({
			path: entry[0],
			data: entry[1]
		});
		screenshotIndex++;
	}
	let screenshotUrls = [];
	if (screenshots.length > 0) {
		if (existingTheme.preview_screenshots) try {
			const oldScreenshots = JSON.parse(existingTheme.preview_screenshots);
			for (const screenshotUrl of oldScreenshots) {
				const screenshotKey = screenshotUrl.replace("/api/images/", "");
				await bucket.delete(screenshotKey).catch(() => {});
			}
		} catch (e) {}
		for (let i = 0; i < screenshots.length; i++) {
			const screenshot = screenshots[i];
			const screenshotKey = `themes/${id}/screenshot${i + 1}.png`;
			await bucket.put(screenshotKey, screenshot.data, { httpMetadata: { contentType: "image/png" } });
			screenshotUrls.push(`/api/images/${screenshotKey}`);
		}
	} else if (existingTheme.preview_screenshots) try {
		screenshotUrls = JSON.parse(existingTheme.preview_screenshots);
	} catch (e) {
		screenshotUrls = [];
	}
	const zipBuffer = await createZipArchive(themeFiles, existingTheme.slug);
	const zipSize = zipBuffer.byteLength;
	const zipChecksum = await calculateSHA256(zipBuffer);
	const zipKey = `themes/${id}/theme.zip`;
	if (existingTheme.zip_download_url) {
		const oldZipKey = existingTheme.zip_download_url.replace("/api/images/", "");
		await bucket.delete(oldZipKey).catch(() => {});
	}
	await bucket.put(zipKey, zipBuffer, { httpMetadata: { contentType: "application/zip" } });
	const zipUrl = `/api/images/${zipKey}`;
	const now = Date.now();
	await db.prepare(`UPDATE themes SET
      version = ?,
      description = ?,
      author = ?,
      license = ?,
      category = ?,
      tags = ?,
      preview_thumbnail_url = ?,
      preview_screenshots = ?,
      zip_download_url = ?,
      file_size = ?,
      checksum = ?,
      compatibility_min = ?,
      compatibility_max = ?,
      updated_at = ?
    WHERE id = ?`).bind(manifest.version, manifest.description, manifest.author, manifest.license || "MIT", manifest.category || inferCategory(manifest), JSON.stringify(manifest.tags || []), previewUrl, JSON.stringify(screenshotUrls), zipUrl, zipSize, `sha256:${zipChecksum}`, manifest.compatibility.minVersion, manifest.compatibility.maxVersion || null, now, id).run();
	const theme = await db.prepare("SELECT * FROM themes WHERE id = ?").bind(id).first();
	return {
		success: true,
		data: {
			theme: {
				id: theme.id,
				name: theme.name,
				slug: theme.slug,
				version: theme.version,
				preview_thumbnail_url: theme.preview_thumbnail_url,
				zip_download_url: theme.zip_download_url,
				file_size: theme.file_size,
				checksum: theme.checksum
			},
			validation: {
				valid: true,
				warnings: validation.warnings,
				errors: []
			}
		},
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { update_files_post_default as default };
