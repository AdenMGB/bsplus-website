import { getBucket } from './r2';
import type { H3Event } from 'h3';
import { createHash } from 'crypto';

export interface ThemeManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;
  compatibility: {
    minVersion: string;
    maxVersion?: string;
  };
  preview?: {
    thumbnail?: string;
    screenshots?: string[];
  };
  settings?: {
    defaultAccentColor?: string;
    defaultTheme?: string;
    supportsLightMode?: boolean;
    supportsDarkMode?: boolean;
    supportsSystemMode?: boolean;
  };
  customProperties?: Record<string, string>;
  fonts?: Record<string, string>;
  animations?: Record<string, any>;
  features?: Record<string, boolean>;
  tags?: string[];
  category?: string;
}

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export async function calculateSHA256(buffer: ArrayBuffer): Promise<string> {
  // Use Web Crypto API which is available in Cloudflare Workers
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function parseManifest(manifestContent: string): Promise<ThemeManifest> {
  try {
    const manifest = JSON.parse(manifestContent) as ThemeManifest;
    
    // Validate required fields
    if (!manifest.name || !manifest.version || !manifest.description || !manifest.author) {
      throw new Error('Missing required fields in manifest');
    }

    if (!manifest.compatibility || !manifest.compatibility.minVersion) {
      throw new Error('Missing compatibility.minVersion in manifest');
    }

    return manifest;
  } catch (error: any) {
    throw new Error(`Invalid manifest JSON: ${error.message}`);
  }
}

export interface BetterSeqtaTheme {
  id: string;
  name: string;
  description: string;
  CustomCSS: string;
  defaultColour?: string;
  CanChangeColour?: boolean;
  coverImage?: string;
  images?: string[];
  [key: string]: unknown;
}

export function detectThemeType(files: Map<string, ArrayBuffer>): 'betterseqta' | 'desqta' | null {
  const hasManifest = files.has('theme-manifest.json') ||
    Array.from(files.keys()).some(k => k.endsWith('/theme-manifest.json'));
  const hasStyles = Array.from(files.keys()).some(k =>
    k.includes('/styles/') || k.startsWith('styles/')
  );
  if (hasManifest && hasStyles) return 'desqta';

  const themeJsonPaths = ['theme.json', ...Array.from(files.keys()).filter(k => k.endsWith('/theme.json'))];
  for (const path of themeJsonPaths) {
    const data = files.get(path);
    if (!data) continue;
    try {
      const parsed = JSON.parse(new TextDecoder().decode(data)) as Record<string, unknown>;
      if (parsed.CustomCSS && parsed.id && parsed.name) return 'betterseqta';
    } catch {
      // not valid JSON
    }
  }
  return null;
}

export function validateBetterSeqtaStructure(files: Map<string, ArrayBuffer>): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const themeJsonPaths = ['theme.json', ...Array.from(files.keys()).filter(k => k.endsWith('/theme.json'))];
  const themeJsonPath = themeJsonPaths.find(p => files.has(p));
  if (!themeJsonPath) {
    errors.push('Missing theme.json');
    return { valid: false, errors, warnings };
  }

  try {
    const data = files.get(themeJsonPath)!;
    const parsed = JSON.parse(new TextDecoder().decode(data)) as BetterSeqtaTheme;
    if (!parsed.CustomCSS) errors.push('theme.json must have CustomCSS');
    if (!parsed.id) errors.push('theme.json must have id');
    if (!parsed.name) errors.push('theme.json must have name');
    if (!parsed.description) errors.push('theme.json must have description');
  } catch (e: unknown) {
    errors.push(`Invalid theme.json: ${e instanceof Error ? e.message : 'parse error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export async function parseBetterSeqtaTheme(themeJsonContent: string): Promise<BetterSeqtaTheme> {
  const parsed = JSON.parse(themeJsonContent) as BetterSeqtaTheme;
  if (!parsed.CustomCSS || !parsed.id || !parsed.name || !parsed.description) {
    throw new Error('theme.json must have CustomCSS, id, name, and description');
  }
  return parsed;
}

const MAX_EXTERNAL_THEME_JSON_URL_LEN = 4096;

/** HTTPS URL for externally hosted theme.json (e.g. GitHub raw). Used for pseudo BetterSEQTA themes. */
export function normalizeAndValidateExternalThemeJsonUrl(
  raw: string | undefined | null
): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return { ok: false, error: 'external_theme_json_url is required for pseudo themes' };
  }
  if (trimmed.length > MAX_EXTERNAL_THEME_JSON_URL_LEN) {
    return { ok: false, error: 'external_theme_json_url is too long' };
  }
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return { ok: false, error: 'external_theme_json_url must be a valid URL' };
  }
  if (u.protocol !== 'https:') {
    return { ok: false, error: 'external_theme_json_url must use HTTPS' };
  }
  return { ok: true, url: u.href };
}

export function validateThemeStructure(files: Map<string, ArrayBuffer>): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for manifest
  const hasManifest = files.has('theme-manifest.json') || 
                      Array.from(files.keys()).some(k => k.endsWith('/theme-manifest.json'));
  
  if (!hasManifest) {
    errors.push('Missing theme-manifest.json');
  }

  // Check for styles directory
  const hasStyles = Array.from(files.keys()).some(k => 
    k.includes('/styles/') || k.startsWith('styles/')
  );

  if (!hasStyles) {
    errors.push('Missing styles/ directory');
  }

  // Check for at least one CSS file
  const hasCSS = Array.from(files.keys()).some(k => k.endsWith('.css'));
  if (!hasCSS) {
    errors.push('No CSS files found in styles/ directory');
  }

  // Check for preview image (warning, not error)
  const hasPreview = Array.from(files.keys()).some(k => 
    k.includes('preview.') && (k.endsWith('.png') || k.endsWith('.jpg') || k.endsWith('.jpeg'))
  );
  if (!hasPreview) {
    warnings.push('No preview image found (preview.png or preview.jpg)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export async function uploadToR2(
  event: H3Event,
  data: ArrayBuffer | Uint8Array,
  key: string,
  contentType?: string
): Promise<string> {
  const bucket = getBucket(event);
  
  await bucket.put(key, data, {
    httpMetadata: {
      contentType: contentType || 'application/octet-stream',
    },
  });

  // Return URL that will be served via /api/images/[key]
  return `/api/images/${key}`;
}

export function inferCategory(manifest: ThemeManifest): string {
  // Infer category from tags or name
  const tags = manifest.tags || [];
  const name = manifest.name.toLowerCase();

  if (tags.some(t => t.toLowerCase().includes('dark')) || name.includes('dark')) {
    return 'dark';
  }
  if (tags.some(t => t.toLowerCase().includes('light')) || name.includes('light')) {
    return 'light';
  }
  if (tags.some(t => t.toLowerCase().includes('colorful')) || name.includes('color')) {
    return 'colorful';
  }
  if (tags.some(t => t.toLowerCase().includes('minimal')) || name.includes('minimal')) {
    return 'minimal';
  }

  return 'other';
}

// Helper to create ZIP archive from files map
// Uses @zip.js/zip.js which is compatible with Cloudflare Workers
export async function createZipArchive(
  files: Map<string, ArrayBuffer>,
  themeSlug: string
): Promise<ArrayBuffer> {
  // Dynamic import to avoid issues if library not installed
  const zipJs = await import('@zip.js/zip.js');
  const { ZipWriter, BlobWriter, BlobReader } = zipJs;
  
  const zipWriter = new ZipWriter(new BlobWriter());
  
  // Add all files to ZIP with proper paths (theme-slug/...)
  for (const [path, data] of files.entries()) {
    // Normalize path - ensure it starts with theme-slug/
    // Remove leading slashes and normalize
    let normalizedPath = path.replace(/^\/+/, '');
    if (!normalizedPath.startsWith(themeSlug + '/')) {
      normalizedPath = `${themeSlug}/${normalizedPath}`;
    }
    
    // Remove any duplicate slashes
    normalizedPath = normalizedPath.replace(/\/+/g, '/');
    
    // Use BlobReader to read the ArrayBuffer data
    const blob = new Blob([data]);
    await zipWriter.add(normalizedPath, new BlobReader(blob));
  }
  
  const resultBlob = await zipWriter.close();
  return await resultBlob.arrayBuffer();
}

/** Extract a ZIP archive into a path → file map (same layout as upload handlers). */
export async function extractZipToMap(zipBuffer: ArrayBuffer): Promise<Map<string, ArrayBuffer>> {
  const out = new Map<string, ArrayBuffer>();
  const zipJs = await import('@zip.js/zip.js');
  const { ZipReader, BlobReader, BlobWriter } = zipJs;
  const zipReader = new ZipReader(new BlobReader(new Blob([new Uint8Array(zipBuffer)])));
  const entries = await zipReader.getEntries();

  for (const entry of entries) {
    if (!entry.directory) {
      const data = await entry.getData(new BlobWriter());
      const arrayBuffer = await data.arrayBuffer();
      out.set(entry.filename, arrayBuffer);
    }
  }

  await zipReader.close();
  return out;
}

/** Directory prefix before theme-manifest.json in a DesQTA package (e.g. slug folder inside the zip). */
export function inferThemeDirPrefix(files: Map<string, ArrayBuffer>): string {
  const m = Array.from(files.keys()).find((k) => k.endsWith('theme-manifest.json'));
  if (!m) return '';
  const i = m.lastIndexOf('/');
  return i === -1 ? '' : m.slice(0, i);
}

/** Overlay new files onto a base map; keys without the base prefix get prefixed (matches stored DesQTA zips). */
export function mergeThemeFileMaps(
  base: Map<string, ArrayBuffer>,
  overlay: Map<string, ArrayBuffer>,
  themeSlug: string
): Map<string, ArrayBuffer> {
  const merged = new Map(base);
  const basePrefix = inferThemeDirPrefix(base) || themeSlug;
  for (const [path, data] of overlay) {
    let key = path.replace(/^\/+/, '');
    if (basePrefix && !key.startsWith(`${basePrefix}/`)) {
      key = `${basePrefix}/${key}`;
    }
    merged.set(key, data);
  }
  return merged;
}

export interface ParsedThemeUpload {
  themeFiles: Map<string, ArrayBuffer>;
  submissionNotes?: string;
  pseudoThemeRequested?: boolean;
  externalThemeJsonUrl?: string;
}

/** Parse multipart theme upload (ZIP or loose files). Shared by admin and custom-theme uploads. */
export async function parseThemeUploadMultipart(
  event: H3Event,
  options?: { readAdminFields?: boolean }
): Promise<ParsedThemeUpload> {
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded'
    });
  }

  const getMultipartText = (name: string): string | undefined => {
    const part = formData.find((p) => p.name === name && !p.filename);
    if (!part?.data) return undefined;
    return new TextDecoder().decode(part.data).trim();
  };

  const submissionNotes = getMultipartText('submission_notes');
  let pseudoThemeRequested: boolean | undefined;
  let externalThemeJsonUrl: string | undefined;

  if (options?.readAdminFields) {
    pseudoThemeRequested = ['1', 'true', 'on', 'yes'].includes(
      (getMultipartText('pseudo_theme') ?? '').toLowerCase()
    );
    externalThemeJsonUrl = getMultipartText('external_theme_json_url');
  }

  let zipFile: { filename?: string; data: Uint8Array } | null = null;
  const themeFiles = new Map<string, ArrayBuffer>();

  for (const part of formData) {
    if (
      (part.name === 'theme_zip' || part.name === 'theme_folder') &&
      part.filename?.endsWith('.zip')
    ) {
      zipFile = part;
    } else if (part.filename) {
      const path = part.name || part.filename;
      themeFiles.set(path, new Uint8Array(part.data).buffer);
    }
  }

  if (zipFile) {
    try {
      const extracted = await extractZipToMap(new Uint8Array(zipFile.data).buffer);
      for (const [path, data] of extracted) {
        themeFiles.set(path, data);
      }
    } catch (error: unknown) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  if (themeFiles.size === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No theme files found in upload'
    });
  }

  return {
    themeFiles,
    submissionNotes,
    pseudoThemeRequested,
    externalThemeJsonUrl
  };
}

export interface ThemeStorageLayout {
  /** R2 key prefix without trailing slash, e.g. `themes/abc` or `custom-themes/abc` */
  r2BaseKey: string;
  siteUrl: string;
  /** Full public URL for theme.json, e.g. https://…/api/themes/abc/theme.json */
  themeJsonUrl: string;
  /** When true, asset URLs are `/api/images/...` (official store). Default false = absolute URLs. */
  relativeImageUrls?: boolean;
}

export function themeStorageLayout(
  storageRoot: 'themes' | 'custom-themes',
  themeId: string,
  siteUrl: string,
  jsonApiSegment: 'themes' | 'custom-themes',
  options?: { relativeImageUrls?: boolean }
): ThemeStorageLayout {
  const base = `${storageRoot}/${themeId}`;
  return {
    r2BaseKey: base,
    siteUrl,
    themeJsonUrl: `${siteUrl}/api/${jsonApiSegment}/${themeId}/theme.json`,
    relativeImageUrls: options?.relativeImageUrls
  };
}

function imagePublicUrl(siteUrl: string, r2Key: string, relative = false): string {
  return relative ? `/api/images/${r2Key}` : `${siteUrl}/api/images/${r2Key}`;
}

export interface BetterSeqtaAssetUploadResult {
  themeJsonUrl: string;
  coverImageUrl: string | null;
  marqueeImageUrl: string | null;
  isPseudoTheme: boolean;
}

/** Upload BetterSEQTA theme.json and optional banner/marquee images to R2. */
export async function uploadBetterSeqtaThemeAssets(
  bucket: any,
  themeId: string,
  themeFiles: Map<string, ArrayBuffer>,
  layout: ThemeStorageLayout,
  options?: {
    themeJsonContent?: string;
    pseudoExternalUrl?: string | null;
  }
): Promise<BetterSeqtaAssetUploadResult> {
  const themeJsonPath =
    Array.from(themeFiles.keys()).find((k) => k.endsWith('/theme.json')) ?? 'theme.json';
  const themeJsonContent =
    options?.themeJsonContent ?? new TextDecoder().decode(themeFiles.get(themeJsonPath)!);

  let themeJsonUrl = layout.themeJsonUrl;
  let isPseudoTheme = false;

  if (options?.pseudoExternalUrl) {
    themeJsonUrl = options.pseudoExternalUrl;
    isPseudoTheme = true;
  } else {
    const themeJsonKey = `${layout.r2BaseKey}/theme.json`;
    await bucket.put(themeJsonKey, new TextEncoder().encode(themeJsonContent), {
      httpMetadata: { contentType: 'application/json' }
    });
  }

  let coverImageUrl: string | null = null;
  let marqueeImageUrl: string | null = null;

  const bannerEntry = Array.from(themeFiles.entries()).find(
    ([p]) => p.includes('images/banner.webp') || p.includes('banner.webp')
  );
  if (bannerEntry) {
    const bannerKey = `${layout.r2BaseKey}/images/banner.webp`;
    await bucket.put(bannerKey, bannerEntry[1], {
      httpMetadata: { contentType: 'image/webp' }
    });
    coverImageUrl = imagePublicUrl(layout.siteUrl, bannerKey, layout.relativeImageUrls);
  }

  const marqueeEntry = Array.from(themeFiles.entries()).find(
    ([p]) => p.includes('images/marquee.webp') || p.includes('marquee.webp')
  );
  if (marqueeEntry) {
    const marqueeKey = `${layout.r2BaseKey}/images/marquee.webp`;
    await bucket.put(marqueeKey, marqueeEntry[1], {
      httpMetadata: { contentType: 'image/webp' }
    });
    marqueeImageUrl = imagePublicUrl(layout.siteUrl, marqueeKey, layout.relativeImageUrls);
  }

  return { themeJsonUrl, coverImageUrl, marqueeImageUrl, isPseudoTheme };
}

export interface DesqtaAssetUploadResult {
  previewUrl: string | null;
  screenshotUrls: string[];
  zipUrl: string;
  zipSize: number;
  zipChecksum: string;
  /** R2 keys written (for optional file tracking) */
  r2Keys: Array<{ path: string; key: string; fileType: string; size: number; mimeType?: string; checksum?: string }>;
}

/** Upload DesQTA preview, screenshots, and rebuilt ZIP to R2. */
export async function uploadDesqtaThemeAssets(
  bucket: any,
  themeId: string,
  themeSlug: string,
  themeFiles: Map<string, ArrayBuffer>,
  layout: ThemeStorageLayout
): Promise<DesqtaAssetUploadResult> {
  const r2Keys: DesqtaAssetUploadResult['r2Keys'] = [];
  let previewUrl: string | null = null;

  const previewPaths = ['preview.png', 'preview.jpg', 'preview.jpeg'];
  for (const path of previewPaths) {
    const entry = Array.from(themeFiles.entries()).find(
      ([p]) =>
        p.includes(path) && (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg'))
    );
    if (entry) {
      const previewKey = `${layout.r2BaseKey}/preview.png`;
      await bucket.put(previewKey, entry[1], {
        httpMetadata: { contentType: 'image/png' }
      });
      previewUrl = imagePublicUrl(layout.siteUrl, previewKey, layout.relativeImageUrls);
      r2Keys.push({
        path: entry[0],
        key: previewKey,
        fileType: 'preview',
        size: entry[1].byteLength,
        mimeType: 'image/png'
      });
      break;
    }
  }

  const screenshotUrls: string[] = [];
  let screenshotIndex = 1;
  while (true) {
    const screenshotPath = `screenshot${screenshotIndex}.png`;
    const entry = Array.from(themeFiles.entries()).find(
      ([p]) => p.includes(screenshotPath) || p.includes(`screenshot${screenshotIndex}.jpg`)
    );
    if (!entry) break;

    const screenshotKey = `${layout.r2BaseKey}/screenshot${screenshotIndex}.png`;
    await bucket.put(screenshotKey, entry[1], {
      httpMetadata: { contentType: 'image/png' }
    });
    screenshotUrls.push(imagePublicUrl(layout.siteUrl, screenshotKey, layout.relativeImageUrls));
    r2Keys.push({
      path: entry[0],
      key: screenshotKey,
      fileType: 'screenshot',
      size: entry[1].byteLength,
      mimeType: 'image/png'
    });
    screenshotIndex++;
  }

  const zipBuffer = await createZipArchive(themeFiles, themeSlug);
  const zipSize = zipBuffer.byteLength;
  const zipChecksum = await calculateSHA256(zipBuffer);
  const zipKey = `${layout.r2BaseKey}/theme.zip`;
  await bucket.put(zipKey, zipBuffer, {
    httpMetadata: { contentType: 'application/zip' }
  });
  const zipUrl = imagePublicUrl(layout.siteUrl, zipKey, layout.relativeImageUrls);
  r2Keys.push({
    path: 'theme.zip',
    key: zipKey,
    fileType: 'zip',
    size: zipSize,
    mimeType: 'application/zip',
    checksum: `sha256:${zipChecksum}`
  });

  return {
    previewUrl,
    screenshotUrls,
    zipUrl,
    zipSize,
    zipChecksum,
    r2Keys
  };
}
