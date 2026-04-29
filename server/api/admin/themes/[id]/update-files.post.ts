import { getDB } from '../../../../utils/db';
import { getBucket } from '../../../../utils/r2';
import { requireAdmin } from '../../../../utils/auth';
import {
  parseManifest,
  parseBetterSeqtaTheme,
  validateThemeStructure,
  validateBetterSeqtaStructure,
  calculateSHA256,
  inferCategory,
  createZipArchive,
  slugify,
  extractZipToMap,
  mergeThemeFileMaps
} from '../../../../utils/themes';

function findThemeJsonPath(files: Map<string, ArrayBuffer>): string | null {
  const keys = Array.from(files.keys());
  const direct = keys.find((k) => k === 'theme.json' || k.endsWith('/theme.json'));
  return direct ?? null;
}

function findBannerEntry(files: Map<string, ArrayBuffer>) {
  return Array.from(files.entries()).find(([p]) =>
    p.includes('images/banner.webp') || p.endsWith('banner.webp')
  );
}

function findMarqueeEntry(files: Map<string, ArrayBuffer>) {
  return Array.from(files.entries()).find(([p]) =>
    p.includes('images/marquee.webp') || p.endsWith('marquee.webp')
  );
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const bucket = getBucket(event);
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const existingTheme = await db.prepare(
    'SELECT * FROM themes WHERE id = ?'
  ).bind(id).first() as any;

  if (!existingTheme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded'
    });
  }

  let zipFile: { filename?: string; data: Uint8Array; type?: string } | null = null;
  const looseFiles = new Map<string, ArrayBuffer>();

  for (const part of formData) {
    if (part.name === 'theme_zip' && part.filename) {
      zipFile = part;
    } else if (part.name === 'theme_folder' && part.filename?.endsWith('.zip')) {
      zipFile = part;
    } else if (part.filename) {
      const path = part.name || part.filename;
      looseFiles.set(path, new Uint8Array(part.data).buffer);
    }
  }

  const themeFiles = new Map<string, ArrayBuffer>();

  if (zipFile) {
    try {
      const extracted = await extractZipToMap(new Uint8Array(zipFile.data).buffer);
      for (const [k, v] of extracted) themeFiles.set(k, v);
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to extract ZIP: ${error.message}`
      });
    }
  }
  for (const [k, v] of looseFiles) {
    themeFiles.set(k, v);
  }

  if (themeFiles.size === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ZIP file or at least one file is required'
    });
  }

  // --- BetterSEQTA update flow ---
  if (existingTheme.theme_type === 'betterseqta') {
    const themeJsonPath = findThemeJsonPath(themeFiles);
    const bannerEntry = findBannerEntry(themeFiles);
    const marqueeEntry = findMarqueeEntry(themeFiles);

    if (existingTheme.is_pseudo_theme && themeJsonPath) {
      return {
        success: false,
        data: null,
        error: {
          code: 'PSEUDO_THEME_JSON_EXTERNAL',
          message:
            'Pseudo BetterSEQTA themes host theme.json at an external URL. Update images only here, change metadata via Edit, update the JSON on GitHub, or change the external URL with PUT /api/admin/themes/[id] (theme_json_url).'
        },
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }

    if (!themeJsonPath) {
      if (!bannerEntry && !marqueeEntry) {
        return {
          success: false,
          data: null,
          error: {
            code: 'INVALID_THEME_STRUCTURE',
            message:
              'BetterSEQTA update requires theme.json and/or banner/marquee webp images (e.g. images/banner.webp).'
          },
          meta: { timestamp: Date.now(), version: '1.0.0' }
        };
      }

      let coverImageUrl: string | null = existingTheme.cover_image_url;
      let marqueeImageUrl: string | null = existingTheme.marquee_image_url;

      if (bannerEntry) {
        const bannerKey = `themes/${id}/images/banner.webp`;
        await bucket.put(bannerKey, bannerEntry[1], {
          httpMetadata: { contentType: 'image/webp' }
        });
        coverImageUrl = `${siteUrl}/api/images/${bannerKey}`;
      }
      if (marqueeEntry) {
        const marqueeKey = `themes/${id}/images/marquee.webp`;
        await bucket.put(marqueeKey, marqueeEntry[1], {
          httpMetadata: { contentType: 'image/webp' }
        });
        marqueeImageUrl = `${siteUrl}/api/images/${marqueeKey}`;
      }

      const now = Date.now();
      await db.prepare(
        `UPDATE themes SET
          cover_image_url = ?,
          marquee_image_url = ?,
          updated_at = ?
        WHERE id = ?`
      ).bind(coverImageUrl, marqueeImageUrl, now, id).run();

      const theme = await db.prepare('SELECT * FROM themes WHERE id = ?').bind(id).first() as any;

      return {
        success: true,
        data: {
          theme: {
            id: theme.id,
            name: theme.name,
            slug: theme.slug,
            theme_type: 'betterseqta',
            theme_json_url: theme.theme_json_url,
            cover_image_url: theme.cover_image_url,
            marquee_image_url: theme.marquee_image_url
          },
          validation: { valid: true, warnings: [], errors: [] }
        },
        error: null,
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }

    const validation = validateBetterSeqtaStructure(themeFiles);
    if (!validation.valid) {
      return {
        success: false,
        data: null,
        error: {
          code: 'INVALID_THEME_STRUCTURE',
          message: 'BetterSEQTA theme validation failed',
          details: { errors: validation.errors, warnings: validation.warnings }
        },
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }

    const themeJsonContent = new TextDecoder().decode(themeFiles.get(themeJsonPath)!);
    const bsTheme = await parseBetterSeqtaTheme(themeJsonContent);

    if (bsTheme.id !== id) {
      return {
        success: false,
        data: null,
        error: {
          code: 'THEME_ID_MISMATCH',
          message: `Theme ID in theme.json (${bsTheme.id}) does not match this theme (${id}). Upload files for the correct theme.`
        },
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }

    const themeJsonKey = `themes/${id}/theme.json`;
    await bucket.put(themeJsonKey, new TextEncoder().encode(themeJsonContent), {
      httpMetadata: { contentType: 'application/json' }
    });

    let coverImageUrl: string | null = existingTheme.cover_image_url;
    let marqueeImageUrl: string | null = existingTheme.marquee_image_url;

    if (bannerEntry) {
      const bannerKey = `themes/${id}/images/banner.webp`;
      await bucket.put(bannerKey, bannerEntry[1], {
        httpMetadata: { contentType: 'image/webp' }
      });
      coverImageUrl = `${siteUrl}/api/images/${bannerKey}`;
    }

    if (marqueeEntry) {
      const marqueeKey = `themes/${id}/images/marquee.webp`;
      await bucket.put(marqueeKey, marqueeEntry[1], {
        httpMetadata: { contentType: 'image/webp' }
      });
      marqueeImageUrl = `${siteUrl}/api/images/${marqueeKey}`;
    }

    const newSlug = slugify(bsTheme.name);
    const now = Date.now();

    const accentUpdate =
      typeof bsTheme.defaultColour === 'string' && bsTheme.defaultColour.trim()
        ? bsTheme.defaultColour.trim()
        : null;

    try {
      await db.prepare(
        `UPDATE themes SET
          name = ?,
          slug = ?,
          description = ?,
          cover_image_url = ?,
          marquee_image_url = ?,
          default_colour = ?,
          updated_at = ?
        WHERE id = ?`
      ).bind(
        bsTheme.name,
        newSlug,
        bsTheme.description,
        coverImageUrl,
        marqueeImageUrl,
        accentUpdate,
        now,
        id
      ).run();
    } catch (err: any) {
      if (err?.message?.includes('UNIQUE') || err?.message?.includes('unique')) {
        return {
          success: false,
          data: null,
          error: {
            code: 'SLUG_CONFLICT',
            message: `Slug "${newSlug}" is already used by another theme. Try a different theme name.`
          },
          meta: { timestamp: Date.now(), version: '1.0.0' }
        };
      }
      throw err;
    }

    const theme = await db.prepare('SELECT * FROM themes WHERE id = ?').bind(id).first() as any;

    return {
      success: true,
      data: {
        theme: {
          id: theme.id,
          name: theme.name,
          slug: theme.slug,
          theme_type: 'betterseqta',
          theme_json_url: theme.theme_json_url,
          cover_image_url: theme.cover_image_url,
          marquee_image_url: theme.marquee_image_url
        },
        validation: { valid: true, warnings: validation.warnings, errors: [] }
      },
      error: null,
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  // --- DesQTA update flow ---
  let mergedFiles = themeFiles;
  let validation = validateThemeStructure(mergedFiles);

  if (!validation.valid) {
    const zipKey =
      (existingTheme.zip_download_url && existingTheme.zip_download_url.replace('/api/images/', '')) ||
      `themes/${id}/theme.zip`;
    const existingObj = await bucket.get(zipKey);
    if (!existingObj) {
      return {
        success: false,
        data: null,
        error: {
          code: 'INVALID_THEME_STRUCTURE',
          message: 'Theme validation failed and no existing theme package was found to merge with.',
          details: {
            errors: validation.errors,
            warnings: validation.warnings
          }
        },
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }

    const zipBuf = await existingObj.arrayBuffer();
    const baseMap = await extractZipToMap(zipBuf);
    mergedFiles = mergeThemeFileMaps(baseMap, themeFiles, existingTheme.slug);
    validation = validateThemeStructure(mergedFiles);
  }

  if (!validation.valid) {
    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_THEME_STRUCTURE',
        message: 'Theme validation failed',
        details: {
          errors: validation.errors,
          warnings: validation.warnings
        }
      },
      meta: {
        timestamp: Date.now(),
        version: '1.0.0'
      }
    };
  }

  const manifestEntry = Array.from(mergedFiles.entries()).find(([path]) =>
    path.endsWith('theme-manifest.json')
  );

  if (!manifestEntry) {
    throw createError({
      statusCode: 400,
      statusMessage: 'theme-manifest.json not found'
    });
  }

  const manifestContent = new TextDecoder().decode(manifestEntry[1]);
  const manifest = await parseManifest(manifestContent);

  let previewImage: { path: string; data: ArrayBuffer } | null = null;
  const previewPaths = ['preview.png', 'preview.jpg', 'preview.jpeg'];
  for (const path of previewPaths) {
    const entry = Array.from(mergedFiles.entries()).find(([p]) =>
      p.includes(path) && (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg'))
    );
    if (entry) {
      previewImage = { path: entry[0], data: entry[1] };
      break;
    }
  }

  let previewUrl: string | null = existingTheme.preview_thumbnail_url;
  if (previewImage) {
    const previewKey = `themes/${id}/preview.png`;
    await bucket.put(previewKey, previewImage.data, {
      httpMetadata: {
        contentType: 'image/png'
      }
    });
    previewUrl = `/api/images/${previewKey}`;
  }

  const screenshots: Array<{ path: string; data: ArrayBuffer }> = [];
  let screenshotIndex = 1;
  while (true) {
    const screenshotPath = `screenshot${screenshotIndex}.png`;
    const entry = Array.from(mergedFiles.entries()).find(([p]) =>
      p.includes(screenshotPath) || p.includes(`screenshot${screenshotIndex}.jpg`)
    );
    if (!entry) break;
    screenshots.push({ path: entry[0], data: entry[1] });
    screenshotIndex++;
  }

  let screenshotUrls: string[] = [];
  if (screenshots.length > 0) {
    if (existingTheme.preview_screenshots) {
      try {
        const oldScreenshots = JSON.parse(existingTheme.preview_screenshots) as string[];
        for (const screenshotUrl of oldScreenshots) {
          const screenshotKey = screenshotUrl.replace('/api/images/', '');
          await bucket.delete(screenshotKey).catch(() => {});
        }
      } catch {
        // ignore
      }
    }

    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      const screenshotKey = `themes/${id}/screenshot${i + 1}.png`;
      await bucket.put(screenshotKey, screenshot.data, {
        httpMetadata: {
          contentType: 'image/png'
        }
      });
      screenshotUrls.push(`/api/images/${screenshotKey}`);
    }
  } else {
    if (existingTheme.preview_screenshots) {
      try {
        screenshotUrls = JSON.parse(existingTheme.preview_screenshots) as string[];
      } catch {
        screenshotUrls = [];
      }
    }
  }

  const zipBuffer = await createZipArchive(mergedFiles, existingTheme.slug);
  const zipSize = zipBuffer.byteLength;
  const zipChecksum = await calculateSHA256(zipBuffer);

  const newZipKey = `themes/${id}/theme.zip`;
  if (existingTheme.zip_download_url) {
    const oldZipKey = existingTheme.zip_download_url.replace('/api/images/', '');
    await bucket.delete(oldZipKey).catch(() => {});
  }

  await bucket.put(newZipKey, zipBuffer, {
    httpMetadata: {
      contentType: 'application/zip'
    }
  });
  const zipUrl = `/api/images/${newZipKey}`;

  const now = Date.now();
  await db.prepare(
    `UPDATE themes SET
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
    WHERE id = ?`
  ).bind(
    manifest.version,
    manifest.description,
    manifest.author,
    manifest.license || 'MIT',
    manifest.category || inferCategory(manifest),
    JSON.stringify(manifest.tags || []),
    previewUrl,
    JSON.stringify(screenshotUrls),
    zipUrl,
    zipSize,
    `sha256:${zipChecksum}`,
    manifest.compatibility.minVersion,
    manifest.compatibility.maxVersion || null,
    now,
    id
  ).run();

  const theme = await db.prepare(
    'SELECT * FROM themes WHERE id = ?'
  ).bind(id).first() as any;

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
      version: '1.0.0'
    }
  };
});
