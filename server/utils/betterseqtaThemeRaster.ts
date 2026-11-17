import {
  betterSeqtaWebpTargetPath,
  isBetterSeqtaRasterBannerPath,
  isBetterSeqtaRasterMarqueePath,
  isRasterThemeImageName,
  THEME_COVER_MAX_EDGE_PX,
  THEME_COVER_WEBP_QUALITY
} from '../../utils/betterseqtaThemeCoverWebp';

import { ensureJsquashReady } from './jsquashInit';

async function decodeRaster(buffer: ArrayBuffer): Promise<ImageData> {
  const head = new Uint8Array(buffer.slice(0, 12));
  const isPng = head[0] === 0x89 && head[1] === 0x50;
  const isJpeg = head[0] === 0xff && head[1] === 0xd8;
  const isWebp =
    head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 && head[8] === 0x57;

  if (isWebp) {
    const { default: decode } = await import('@jsquash/webp/decode');
    return decode(buffer);
  }
  if (isJpeg) {
    const { default: decode } = await import('@jsquash/jpeg/decode');
    return decode(buffer);
  }
  if (isPng) {
    const { default: decode } = await import('@jsquash/png/decode');
    return decode(buffer);
  }
  throw new Error('Unsupported raster format');
}

async function resizeIfNeeded(image: ImageData): Promise<ImageData> {
  const maxEdge = Math.max(image.width, image.height);
  if (maxEdge <= THEME_COVER_MAX_EDGE_PX) return image;
  const scale = THEME_COVER_MAX_EDGE_PX / maxEdge;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const { default: resize } = await import('@jsquash/resize');
  return resize(image, { width, height, method: 'lanczos3', fitMethod: 'stretch' });
}

async function encodeWebp(image: ImageData): Promise<ArrayBuffer> {
  const { default: encode } = await import('@jsquash/webp/encode');
  const quality = Math.round(THEME_COVER_WEBP_QUALITY * 100);
  return encode(image, { quality });
}

export async function rasterBufferToThemeWebp(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  await ensureJsquashReady();
  let image = await decodeRaster(buffer);
  image = await resizeIfNeeded(image);
  return encodeWebp(image);
}

function isRasterCandidatePath(path: string): boolean {
  if (!isRasterThemeImageName(path)) return false;
  return (
    isBetterSeqtaRasterBannerPath(path) ||
    isBetterSeqtaRasterMarqueePath(path) ||
    /banner|marquee|cover/i.test(path)
  );
}

/**
 * Converts PNG/JPEG (and re-encodes WEBP) theme banners to `images/banner.webp` + `images/marquee.webp`.
 */
export async function normalizeBetterSeqtaThemeRasterImages(
  files: Map<string, ArrayBuffer>
): Promise<Map<string, ArrayBuffer>> {
  const out = new Map(files);
  let bannerWebp: ArrayBuffer | null = null;
  let marqueeWebp: ArrayBuffer | null = null;
  const remove: string[] = [];

  for (const [path, data] of files) {
    if (!isRasterCandidatePath(path)) continue;
    try {
      const webp = await rasterBufferToThemeWebp(data);
      if (isBetterSeqtaRasterMarqueePath(path) && !isBetterSeqtaRasterBannerPath(path)) {
        marqueeWebp = webp;
      } else {
        bannerWebp = webp;
      }
      remove.push(path);
    } catch (e) {
      console.warn('[BetterSeqtaThemeRaster] Skipped raster path', path, e);
    }
  }

  if (bannerWebp && !marqueeWebp) marqueeWebp = bannerWebp;
  if (marqueeWebp && !bannerWebp) bannerWebp = marqueeWebp;

  for (const path of remove) {
    out.delete(path);
  }
  if (bannerWebp) {
    out.set(betterSeqtaWebpTargetPath('images/banner.webp', 'banner'), bannerWebp);
  }
  if (marqueeWebp) {
    out.set(betterSeqtaWebpTargetPath('images/marquee.webp', 'marquee'), marqueeWebp);
  }

  return out;
}