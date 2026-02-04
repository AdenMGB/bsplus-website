import { getDB } from '../../../utils/db';
import { getBucket } from '../../../utils/r2';
import { requireAdmin } from '../../../utils/auth';
import { 
  parseManifest, 
  validateThemeStructure, 
  slugify, 
  generateUUID, 
  calculateSHA256,
  inferCategory,
  uploadToR2,
  createZipArchive
} from '../../../utils/themes';

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdmin(event);
  const db = getDB(event);
  const bucket = getBucket(event);

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded'
    });
  }

  // Find the ZIP file or theme folder
  let zipFile: { filename?: string; data: Uint8Array; type?: string } | null = null;
  let manifestFile: { filename?: string; data: Uint8Array } | null = null;
  const themeFiles = new Map<string, ArrayBuffer>();

  for (const part of formData) {
    if (part.name === 'theme_zip' && part.filename) {
      zipFile = part;
    } else if (part.name === 'theme_folder' && part.filename?.endsWith('.zip')) {
      zipFile = part;
    } else if (part.filename === 'theme-manifest.json' || part.name === 'manifest') {
      manifestFile = part;
    } else if (part.filename) {
      // Individual files from folder upload
      const path = part.name || part.filename;
      themeFiles.set(path, new Uint8Array(part.data).buffer);
    }
  }

  // If ZIP file provided, extract it
  if (zipFile) {
    try {
      // Dynamic import for zip.js
      const zipJs = await import('@zip.js/zip.js');
      const { ZipReader, BlobReader, BlobWriter } = zipJs;
      const zipReader = new ZipReader(new BlobReader(new Blob([new Uint8Array(zipFile.data)])));
      const entries = await zipReader.getEntries();

      for (const entry of entries) {
        if (!entry.directory) {
          const data = await entry.getData(new BlobWriter());
          const arrayBuffer = await data.arrayBuffer();
          themeFiles.set(entry.filename, arrayBuffer);
        }
      }

      await zipReader.close();
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to extract ZIP: ${error.message}`
      });
    }
  }

  // Validate structure
  const validation = validateThemeStructure(themeFiles);
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

  // Find and parse manifest
  let manifestContent: string;
  const manifestEntry = Array.from(themeFiles.entries()).find(([path]) => 
    path.endsWith('theme-manifest.json')
  );

  if (!manifestEntry) {
    throw createError({
      statusCode: 400,
      statusMessage: 'theme-manifest.json not found'
    });
  }

  manifestContent = new TextDecoder().decode(manifestEntry[1]);
  const manifest = await parseManifest(manifestContent);

  // Generate theme ID and slug
  const themeId = generateUUID();
  const themeSlug = slugify(manifest.name);

  // Check for duplicate slug
  const existing = await db.prepare(
    'SELECT id FROM themes WHERE slug = ?'
  ).bind(themeSlug).first();

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Theme with slug "${themeSlug}" already exists`
    });
  }

  // Find preview image
  let previewImage: { path: string; data: ArrayBuffer } | null = null;
  const previewPaths = ['preview.png', 'preview.jpg', 'preview.jpeg'];
  for (const path of previewPaths) {
    const entry = Array.from(themeFiles.entries()).find(([p]) => 
      p.includes(path) && (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg'))
    );
    if (entry) {
      previewImage = { path: entry[0], data: entry[1] };
      break;
    }
  }

  // Upload preview image
  let previewUrl: string | null = null;
  if (previewImage) {
    const previewKey = `themes/${themeId}/preview.png`;
    await bucket.put(previewKey, previewImage.data, {
      httpMetadata: {
        contentType: 'image/png',
      },
    });
    previewUrl = `/api/images/${previewKey}`;
  }

  // Find screenshots
  const screenshots: Array<{ path: string; data: ArrayBuffer }> = [];
  let screenshotIndex = 1;
  while (true) {
    const screenshotPath = `screenshot${screenshotIndex}.png`;
    const entry = Array.from(themeFiles.entries()).find(([p]) => 
      p.includes(screenshotPath) || p.includes(`screenshot${screenshotIndex}.jpg`)
    );
    if (!entry) break;
    screenshots.push({ path: entry[0], data: entry[1] });
    screenshotIndex++;
  }

  // Upload screenshots
  const screenshotUrls: string[] = [];
  for (let i = 0; i < screenshots.length; i++) {
    const screenshot = screenshots[i];
    const screenshotKey = `themes/${themeId}/screenshot${i + 1}.png`;
    await bucket.put(screenshotKey, screenshot.data, {
      httpMetadata: {
        contentType: 'image/png',
      },
    });
    screenshotUrls.push(`/api/images/${screenshotKey}`);
  }

  // Create ZIP archive
  const zipBuffer = await createZipArchive(themeFiles, themeSlug);
  const zipSize = zipBuffer.byteLength;
  const zipChecksum = await calculateSHA256(zipBuffer);

  // Upload ZIP to R2
  const zipKey = `themes/${themeId}/theme.zip`;
  await bucket.put(zipKey, zipBuffer, {
    httpMetadata: {
      contentType: 'application/zip',
    },
  });
  const zipUrl = `/api/images/${zipKey}`;

  // Create database record
  const now = Date.now();
  await db.prepare(
    `INSERT INTO themes (
      id, name, slug, version, description, author, license,
      category, tags, status, preview_thumbnail_url, preview_screenshots,
      zip_download_url, file_size, checksum, compatibility_min, compatibility_max,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
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
    previewUrl,
    JSON.stringify(screenshotUrls),
    zipUrl,
    zipSize,
    `sha256:${zipChecksum}`,
    manifest.compatibility.minVersion,
    manifest.compatibility.maxVersion || null,
    now,
    now
  ).run();

  // Create submission record
  const submissionId = generateUUID();
  await db.prepare(
    `INSERT INTO theme_submissions (id, theme_id, submitted_by, status, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(submissionId, themeId, adminUser.id, 'pending', now).run();

  // Get created theme
  const theme = await db.prepare(
    'SELECT * FROM themes WHERE id = ?'
  ).bind(themeId).first() as any;

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
      version: '1.0.0'
    }
  };
});
