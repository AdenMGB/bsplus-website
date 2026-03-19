import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
import { n as requireAdmin } from "./auth2.js";
import { a as inferCategory, c as slugify, i as generateUUID, l as validateBetterSeqtaStructure, n as createZipArchive, o as parseBetterSeqtaTheme, r as detectThemeType, s as parseManifest, t as calculateSHA256, u as validateThemeStructure } from "./themes.js";
//#region server/api/admin/themes/index.post.ts
var index_post_default = defineEventHandler(async (event) => {
	const adminUser = await requireAdmin(event);
	const db = getDB(event);
	const bucket = getBucket(event);
	const siteUrl = (useRuntimeConfig().public?.siteUrl ?? "https://betterseqta.org").replace(/\/$/, "");
	const formData = await readMultipartFormData(event);
	if (!formData || formData.length === 0) throw createError({
		statusCode: 400,
		statusMessage: "No files uploaded"
	});
	let zipFile = null;
	const themeFiles = /* @__PURE__ */ new Map();
	for (const part of formData) if ((part.name === "theme_zip" || part.name === "theme_folder") && part.filename?.endsWith(".zip")) zipFile = part;
	else if (part.filename) {
		const path = part.name || part.filename;
		themeFiles.set(path, new Uint8Array(part.data).buffer);
	}
	if (zipFile) try {
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
			statusMessage: `Failed to extract ZIP: ${error instanceof Error ? error.message : "Unknown error"}`
		});
	}
	const themeType = detectThemeType(themeFiles);
	if (!themeType) return {
		success: false,
		data: null,
		error: {
			code: "UNKNOWN_THEME_TYPE",
			message: "Could not detect theme type. Expected DesQTA (theme-manifest.json + styles/) or BetterSEQTA (theme.json with CustomCSS, id, name).",
			details: {
				errors: [],
				warnings: []
			}
		},
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
	if (themeType === "betterseqta") {
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
		const themeId = bsTheme.id;
		const themeSlug = slugify(bsTheme.name);
		if (await db.prepare("SELECT id FROM themes WHERE id = ? OR slug = ?").bind(themeId, themeSlug).first()) throw createError({
			statusCode: 409,
			statusMessage: `Theme with id "${themeId}" or slug "${themeSlug}" already exists`
		});
		const themeJsonKey = `themes/${themeId}/theme.json`;
		await bucket.put(themeJsonKey, new TextEncoder().encode(themeJsonContent), { httpMetadata: { contentType: "application/json" } });
		let coverImageUrl = null;
		let marqueeImageUrl = null;
		const bannerEntry = Array.from(themeFiles.entries()).find(([p]) => p.includes("images/banner.webp") || p.includes("banner.webp"));
		if (bannerEntry) {
			const bannerKey = `themes/${themeId}/images/banner.webp`;
			await bucket.put(bannerKey, bannerEntry[1], { httpMetadata: { contentType: "image/webp" } });
			coverImageUrl = `${siteUrl}/api/images/${bannerKey}`;
		}
		const marqueeEntry = Array.from(themeFiles.entries()).find(([p]) => p.includes("images/marquee.webp") || p.includes("marquee.webp"));
		if (marqueeEntry) {
			const marqueeKey = `themes/${themeId}/images/marquee.webp`;
			await bucket.put(marqueeKey, marqueeEntry[1], { httpMetadata: { contentType: "image/webp" } });
			marqueeImageUrl = `${siteUrl}/api/images/${marqueeKey}`;
		}
		const themeJsonUrl = `${siteUrl}/api/themes/${themeId}/theme.json`;
		const now = Date.now();
		await db.prepare(`INSERT INTO themes (
        id, name, slug, version, description, author, license,
        category, tags, status, theme_type, theme_json_url,
        cover_image_url, marquee_image_url, zip_download_url,
        compatibility_min, compatibility_max, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(themeId, bsTheme.name, themeSlug, "1.0.0", bsTheme.description, "BetterSEQTA", "MIT", "other", "[]", "pending", "betterseqta", themeJsonUrl, coverImageUrl, marqueeImageUrl, null, null, null, now, now).run();
		const submissionId = generateUUID();
		await db.prepare(`INSERT INTO theme_submissions (id, theme_id, submitted_by, status, created_at)
       VALUES (?, ?, ?, ?, ?)`).bind(submissionId, themeId, adminUser.id, "pending", now).run();
		const theme = await db.prepare("SELECT * FROM themes WHERE id = ?").bind(themeId).first();
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
	let manifestContent;
	const manifestEntry = Array.from(themeFiles.entries()).find(([path]) => path.endsWith("theme-manifest.json"));
	if (!manifestEntry) throw createError({
		statusCode: 400,
		statusMessage: "theme-manifest.json not found"
	});
	manifestContent = new TextDecoder().decode(manifestEntry[1]);
	const manifest = await parseManifest(manifestContent);
	const themeId = generateUUID();
	const themeSlug = slugify(manifest.name);
	if (await db.prepare("SELECT id FROM themes WHERE slug = ?").bind(themeSlug).first()) throw createError({
		statusCode: 409,
		statusMessage: `Theme with slug "${themeSlug}" already exists`
	});
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
	let previewUrl = null;
	if (previewImage) {
		const previewKey = `themes/${themeId}/preview.png`;
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
	const screenshotUrls = [];
	for (let i = 0; i < screenshots.length; i++) {
		const screenshot = screenshots[i];
		const screenshotKey = `themes/${themeId}/screenshot${i + 1}.png`;
		await bucket.put(screenshotKey, screenshot.data, { httpMetadata: { contentType: "image/png" } });
		screenshotUrls.push(`/api/images/${screenshotKey}`);
	}
	const zipBuffer = await createZipArchive(themeFiles, themeSlug);
	const zipSize = zipBuffer.byteLength;
	const zipChecksum = await calculateSHA256(zipBuffer);
	const zipKey = `themes/${themeId}/theme.zip`;
	await bucket.put(zipKey, zipBuffer, { httpMetadata: { contentType: "application/zip" } });
	const zipUrl = `/api/images/${zipKey}`;
	const now = Date.now();
	await db.prepare(`INSERT INTO themes (
      id, name, slug, version, description, author, license,
      category, tags, status, preview_thumbnail_url, preview_screenshots,
      zip_download_url, file_size, checksum, compatibility_min, compatibility_max,
      theme_type, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(themeId, manifest.name, themeSlug, manifest.version, manifest.description, manifest.author, manifest.license || "MIT", manifest.category || inferCategory(manifest), JSON.stringify(manifest.tags || []), "pending", previewUrl, JSON.stringify(screenshotUrls), zipUrl, zipSize, `sha256:${zipChecksum}`, manifest.compatibility.minVersion, manifest.compatibility.maxVersion || null, "desqta", now, now).run();
	const submissionId = generateUUID();
	await db.prepare(`INSERT INTO theme_submissions (id, theme_id, submitted_by, status, created_at)
     VALUES (?, ?, ?, ?, ?)`).bind(submissionId, themeId, adminUser.id, "pending", now).run();
	const theme = await db.prepare("SELECT * FROM themes WHERE id = ?").bind(themeId).first();
	return {
		success: true,
		data: {
			theme: {
				id: theme.id,
				name: theme.name,
				slug: theme.slug,
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
export { index_post_default as default };
