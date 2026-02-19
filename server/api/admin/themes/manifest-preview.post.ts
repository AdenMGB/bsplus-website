import { requireAdmin } from '../../../utils/auth';
import {
  parseManifest,
  parseBetterSeqtaTheme,
  validateThemeStructure,
  validateBetterSeqtaStructure,
  detectThemeType
} from '../../../utils/themes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded'
    });
  }

  const themeFiles = new Map<string, ArrayBuffer>();
  let zipFile: { data: Uint8Array } | null = null;

  for (const part of formData) {
    if (part.filename?.endsWith('.zip') || part.name === 'theme_zip' || part.name === 'theme_folder') {
      zipFile = part;
    } else if (part.filename) {
      const path = part.name || part.filename;
      themeFiles.set(path, new Uint8Array(part.data).buffer);
    }
  }

  // If ZIP file provided, extract it
  if (zipFile) {
    try {
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
    } catch (error: unknown) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  const themeType = detectThemeType(themeFiles);

  if (!themeType) {
    return {
      success: false,
      data: null,
      error: {
        code: 'UNKNOWN_THEME_TYPE',
        message: 'Could not detect theme type. Expected DesQTA (theme-manifest.json + styles/) or BetterSEQTA (theme.json with CustomCSS, id, name).'
      },
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  // BetterSEQTA flow
  if (themeType === 'betterseqta') {
    const validation = validateBetterSeqtaStructure(themeFiles);
    const themeJsonPath = Array.from(themeFiles.keys()).find(k => k.endsWith('/theme.json')) ?? 'theme.json';
    const themeJsonData = themeFiles.get(themeJsonPath);
    let manifest = null;
    if (themeJsonData) {
      try {
        manifest = await parseBetterSeqtaTheme(new TextDecoder().decode(themeJsonData));
      } catch {
        // validation will have errors
      }
    }
    const hasBanner = Array.from(themeFiles.keys()).some(k => k.includes('banner.webp'));
    const hasMarquee = Array.from(themeFiles.keys()).some(k => k.includes('marquee.webp'));
    return {
      success: true,
      data: {
        theme_type: 'betterseqta',
        manifest,
        structure: {
          has_manifest: !!manifest,
          has_theme_json: !!themeJsonData,
          has_banner: hasBanner,
          has_marquee: hasMarquee
        },
        validation
      },
      error: null,
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  // DesQTA flow
  const manifestEntry = Array.from(themeFiles.entries()).find(([path]) =>
    path.endsWith('theme-manifest.json')
  );

  if (!manifestEntry) {
    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_MANIFEST',
        message: 'theme-manifest.json not found'
      },
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  let manifest;
  try {
    const manifestContent = new TextDecoder().decode(manifestEntry[1]);
    manifest = await parseManifest(manifestContent);
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_MANIFEST',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  const validation = validateThemeStructure(themeFiles);
  const styleFiles = Array.from(themeFiles.keys())
    .filter(path => path.includes('/styles/') || path.includes('styles/'))
    .map(path => path.split('/').pop() || path);

  const hasPreview = Array.from(themeFiles.keys()).some(k =>
    k.includes('preview.') && (k.endsWith('.png') || k.endsWith('.jpg') || k.endsWith('.jpeg'))
  );

  return {
    success: true,
    data: {
      theme_type: 'desqta',
      manifest,
      structure: {
        has_manifest: true,
        has_preview: hasPreview,
        has_styles: styleFiles.length > 0,
        style_files: styleFiles,
        missing_files: [],
        extra_files: []
      },
      validation
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
