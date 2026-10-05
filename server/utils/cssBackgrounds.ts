import { PhotonImage, SamplingFilter, resize } from '@cf-wasm/photon/workerd';
import { createError, type H3Event } from 'h3';
import { getDB } from './db';
import { getBucket } from './r2';
import { generateUUID } from './themes';

const R2_PREFIX = 'backgrounds';
const MAX_INPUT_BYTES = 12 * 1024 * 1024;
const MAX_EDGE_PX = 2560;

export const CSS_BACKGROUND_PUBLIC_PATH = '/api/background.webp';

export interface CssBackgroundRow {
  id: string;
  r2_key: string;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  enabled: number;
  created_by: string | null;
  created_at: number;
}

export function cssBackgroundR2Key(id: string): string {
  return `${R2_PREFIX}/${id}.webp`;
}

export function cssBackgroundImageUrl(r2Key: string): string {
  return `/api/images/${r2Key}`;
}

export function isWebpBytes(input: Uint8Array): boolean {
  return (
    input.byteLength >= 12 &&
    input[0] === 0x52 &&
    input[1] === 0x49 &&
    input[2] === 0x46 &&
    input[3] === 0x46 &&
    input[8] === 0x57 &&
    input[9] === 0x45 &&
    input[10] === 0x42 &&
    input[11] === 0x50
  );
}

function assertInputSize(input: Uint8Array): void {
  if (input.byteLength > MAX_INPUT_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: `Image must be smaller than ${MAX_INPUT_BYTES / (1024 * 1024)}MB`,
    });
  }
}

export async function prepareBackgroundWebpBytes(
  input: Uint8Array,
  dimensions?: { width?: number; height?: number }
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  assertInputSize(input);

  if (isWebpBytes(input)) {
    return {
      bytes: input,
      width: dimensions?.width ?? 0,
      height: dimensions?.height ?? 0,
    };
  }

  return encodeImageToWebp(input);
}

export async function encodeImageToWebp(input: Uint8Array): Promise<{
  bytes: Uint8Array;
  width: number;
  height: number;
}> {
  assertInputSize(input);

  const image = PhotonImage.new_from_byteslice(input);

  try {
    const width = image.get_width();
    const height = image.get_height();
    const maxEdge = Math.max(width, height);
    let working = image;

    if (maxEdge > MAX_EDGE_PX) {
      const scale = MAX_EDGE_PX / maxEdge;
      const nextWidth = Math.max(1, Math.round(width * scale));
      const nextHeight = Math.max(1, Math.round(height * scale));
      working = resize(
        image,
        nextWidth,
        nextHeight,
        SamplingFilter.Nearest
      );
    }

    try {
      const bytes = working.get_bytes_webp();
      return {
        bytes,
        width: working.get_width(),
        height: working.get_height(),
      };
    } finally {
      if (working !== image) {
        working.free();
      }
    }
  } finally {
    image.free();
  }
}

export async function pickRandomEnabledBackground(
  event: H3Event
): Promise<CssBackgroundRow | null> {
  const db = getDB(event);
  const row = await db
    .prepare(
      `SELECT id, r2_key, original_filename, width, height, byte_size, enabled, created_by, created_at
       FROM css_backgrounds
       WHERE enabled = 1
       ORDER BY RANDOM()
       LIMIT 1`
    )
    .first<CssBackgroundRow>();

  return row ?? null;
}


export async function insertCssBackground(
  event: H3Event,
  options: {
    originalFilename: string | null;
    webpBytes: Uint8Array;
    width: number | null;
    height: number | null;
    createdBy: string;
  }
): Promise<CssBackgroundRow> {
  const db = getDB(event);
  const bucket = getBucket(event);
  const id = generateUUID();
  const r2Key = cssBackgroundR2Key(id);
  const createdAt = Date.now();

  await bucket.put(r2Key, options.webpBytes, {
    httpMetadata: { contentType: 'image/webp' },
  });

  await db
    .prepare(
      `INSERT INTO css_backgrounds (
        id, r2_key, original_filename, width, height, byte_size, enabled, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
    )
    .bind(
      id,
      r2Key,
      options.originalFilename,
      options.width,
      options.height,
      options.webpBytes.byteLength,
      options.createdBy,
      createdAt
    )
    .run();

  return {
    id,
    r2_key: r2Key,
    original_filename: options.originalFilename,
    width: options.width,
    height: options.height,
    byte_size: options.webpBytes.byteLength,
    enabled: 1,
    created_by: options.createdBy,
    created_at: createdAt,
  };
}

export async function deleteCssBackground(
  event: H3Event,
  id: string
): Promise<boolean> {
  const db = getDB(event);
  const bucket = getBucket(event);

  const row = await db
    .prepare('SELECT r2_key FROM css_backgrounds WHERE id = ?')
    .bind(id)
    .first<{ r2_key: string }>();

  if (!row) {
    return false;
  }

  await bucket.delete(row.r2_key);
  await db.prepare('DELETE FROM css_backgrounds WHERE id = ?').bind(id).run();
  return true;
}

export function mapCssBackgroundForAdmin(row: CssBackgroundRow) {
  return {
    id: row.id,
    original_filename: row.original_filename,
    width: row.width,
    height: row.height,
    byte_size: row.byte_size,
    enabled: Boolean(row.enabled),
    preview_url: cssBackgroundImageUrl(row.r2_key),
    created_at: row.created_at,
  };
}
