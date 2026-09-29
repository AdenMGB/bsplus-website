import { getDB } from '../../../utils/db';
import { getBucket } from '../../../utils/r2';
import { requireAdmin } from '../../../utils/auth';
import {
  parseManifest,
  validateThemeStructure,
  validateBetterSeqtaStructure,
  parseBetterSeqtaTheme,
  detectThemeType,
  slugify,
  generateUUID,
  inferCategory,
  parseThemeUploadMultipart,
  themeStorageLayout,
  uploadBetterSeqtaThemeAssets,
  uploadDesqtaThemeAssets,
  normalizeAndValidateExternalThemeJsonUrl
} from '../../../utils/themes';

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdmin(event);
  const db = getDB(event);
  const bucket = getBucket(event);
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

  const { themeFiles, pseudoThemeRequested, externalThemeJsonUrl } =
    await parseThemeUploadMultipart(event, { readAdminFields: true });

  const themeType = detectThemeType(themeFiles);
  if (!themeType) {
    return {
      success: false,
      data: null,
      error: {
        code: 'UNKNOWN_THEME_TYPE',
        message:
          'Could not detect theme type. Expected DesQTA (theme-manifest.json + styles/) or BetterSEQTA (theme.json with CustomCSS, id, name).',
        details: { errors: [], warnings: [] }
      },
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  if (themeType === 'betterseqta') {
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

    const themeJsonPath =
      Array.from(themeFiles.keys()).find((k) => k.endsWith('/theme.json')) ?? 'theme.json';
    const themeJsonContent = new TextDecoder().decode(themeFiles.get(themeJsonPath)!);
    const bsTheme = await parseBetterSeqtaTheme(themeJsonContent);
    const themeId = bsTheme.id;
    const themeSlug = slugify(bsTheme.name);

    const existing = await db
      .prepare('SELECT id FROM themes WHERE id = ? OR slug = ?')
      .bind(themeId, themeSlug)
      .first();
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `Theme with id "${themeId}" or slug "${themeSlug}" already exists`
      });
    }

    let pseudoExternalUrl: string | null = null;
    if (pseudoThemeRequested) {
      const ext = normalizeAndValidateExternalThemeJsonUrl(externalThemeJsonUrl);
      if (!ext.ok) {
        return {
          success: false,
          data: null,
          error: {
            code: 'INVALID_EXTERNAL_THEME_JSON_URL',
            message: ext.error
          },
          meta: { timestamp: Date.now(), version: '1.0.0' }
        };
      }
      pseudoExternalUrl = ext.url;
    }

    const layout = themeStorageLayout('themes', themeId, siteUrl, 'themes', {
      relativeImageUrls: true
    });
    const assets = await uploadBetterSeqtaThemeAssets(bucket, themeId, themeFiles, layout, {
      themeJsonContent,
      pseudoExternalUrl
    });

    const now = Date.now();
    const accent =
      typeof bsTheme.defaultColour === 'string' && bsTheme.defaultColour.trim()
        ? bsTheme.defaultColour.trim()
        : null;

    await db
      .prepare(
        `INSERT INTO themes (
        id, name, slug, version, description, author, license,
        category, tags, status, theme_type, theme_json_url,
        cover_image_url, marquee_image_url, zip_download_url,
        compatibility_min, compatibility_max, is_pseudo_theme, default_colour,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        themeId,
        bsTheme.name,
        themeSlug,
        '1.0.0',
        bsTheme.description,
        'BetterSEQTA',
        'MIT',
        'other',
        '[]',
        'pending',
        'betterseqta',
        assets.themeJsonUrl,
        assets.coverImageUrl,
        assets.marqueeImageUrl,
        null,
        null,
        null,
        assets.isPseudoTheme ? 1 : 0,
        accent,
        now,
        now
      )
      .run();

    await db
      .prepare(
        `INSERT INTO theme_submissions (id, theme_id, submitted_by, status, created_at)
       VALUES (?, ?, ?, ?, ?)`
      )
      .bind(generateUUID(), themeId, adminUser.id, 'pending', now)
      .run();

    const theme = (await db
      .prepare('SELECT * FROM themes WHERE id = ?')
      .bind(themeId)
      .first()) as Record<string, unknown>;

    return {
      success: true,
      data: {
        theme: {
          id: theme.id,
          name: theme.name,
          slug: theme.slug,
          theme_type: 'betterseqta',
          is_pseudo_theme: Boolean(theme.is_pseudo_theme),
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

  const validation = validateThemeStructure(themeFiles);
  if (!validation.valid) {
    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_THEME_STRUCTURE',
        message: 'Theme validation failed',
        details: { errors: validation.errors, warnings: validation.warnings }
      },
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  const manifestEntry = Array.from(themeFiles.entries()).find(([path]) =>
    path.endsWith('theme-manifest.json')
  );
  if (!manifestEntry) {
    throw createError({
      statusCode: 400,
      statusMessage: 'theme-manifest.json not found'
    });
  }

  const manifest = await parseManifest(new TextDecoder().decode(manifestEntry[1]));
  const themeId = generateUUID();
  const themeSlug = slugify(manifest.name);

  const existing = await db
    .prepare('SELECT id FROM themes WHERE slug = ?')
    .bind(themeSlug)
    .first();
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Theme with slug "${themeSlug}" already exists`
    });
  }

  const layout = themeStorageLayout('themes', themeId, siteUrl, 'themes', {
    relativeImageUrls: true
  });
  const assets = await uploadDesqtaThemeAssets(bucket, themeId, themeSlug, themeFiles, layout);

  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO themes (
      id, name, slug, version, description, author, license,
      category, tags, status, preview_thumbnail_url, preview_screenshots,
      zip_download_url, file_size, checksum, compatibility_min, compatibility_max,
      theme_type, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      themeId,
      manifest.name,
      themeSlug,
      manifest.version,
      manifest.description,
      manifest.author,
      manifest.license || 'MIT',
      manifest.category || inferCategory(manifest),
      JSON.stringify(manifest.tags || []),
      'pending',
      assets.previewUrl,
      JSON.stringify(assets.screenshotUrls),
      assets.zipUrl,
      assets.zipSize,
      `sha256:${assets.zipChecksum}`,
      manifest.compatibility.minVersion,
      manifest.compatibility.maxVersion || null,
      'desqta',
      now,
      now
    )
    .run();

  await db
    .prepare(
      `INSERT INTO theme_submissions (id, theme_id, submitted_by, status, created_at)
     VALUES (?, ?, ?, ?, ?)`
    )
    .bind(generateUUID(), themeId, adminUser.id, 'pending', now)
    .run();

  const theme = (await db.prepare('SELECT * FROM themes WHERE id = ?').bind(themeId).first()) as any;

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
      validation: { valid: true, warnings: validation.warnings, errors: [] }
    },
    error: null,
    meta: { timestamp: Date.now(), version: '1.0.0' }
  };
});
