import type { H3Event } from 'h3';
import { getDB } from './db';
import { getBucket } from './r2';
import { getGroqConfig, type GroqContentPart } from './groq';

const MAX_BASE64_BYTES = 4 * 1024 * 1024;
const THEME_JSON_FETCH_MS = 8000;

export interface TotmThemeContext {
  metadata: Record<string, unknown>;
  themeJsonSummary: Record<string, unknown> | null;
  imageParts: GroqContentPart[];
}

function parseImageKey(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\/api\/images\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function mimeFromKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function loadImagePart(
  event: H3Event,
  url: string | null | undefined
): Promise<GroqContentPart | null> {
  const key = parseImageKey(url);
  if (!key) return null;

  try {
    const bucket = getBucket(event);
    const object = await bucket.get(key);
    if (!object) return null;

    const buffer = await object.arrayBuffer();
    if (buffer.byteLength > MAX_BASE64_BYTES) {
      console.warn(`[TOTM AI] Skipping oversized image: ${key} (${buffer.byteLength} bytes)`);
      return null;
    }

    const httpContentType = object.httpMetadata?.contentType;
    const mime =
      httpContentType && httpContentType.startsWith('image/')
        ? httpContentType
        : mimeFromKey(key);

    const base64 = arrayBufferToBase64(buffer);
    return {
      type: 'image_url',
      image_url: { url: `data:${mime};base64,${base64}` }
    };
  } catch (e) {
    console.warn(`[TOTM AI] Failed to load image ${key}:`, e);
    return null;
  }
}

function summarizeThemeJson(parsed: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  const keys = [
    'id',
    'name',
    'description',
    'defaultColour',
    'defaultColor',
    'CanChangeColour',
    'CanChangeColor',
    'version'
  ];
  for (const k of keys) {
    if (parsed[k] !== undefined) summary[k] = parsed[k];
  }
  if (Array.isArray(parsed.images) && parsed.images.length > 0) {
    summary.images = parsed.images.slice(0, 5);
  }
  return summary;
}

async function loadThemeJsonSummary(
  event: H3Event,
  theme: {
    id: string;
    theme_type?: string;
    theme_json_url?: string | null;
    is_pseudo_theme?: number | boolean;
  }
): Promise<Record<string, unknown> | null> {
  if (theme.theme_type !== 'betterseqta') return null;

  let raw: string | null = null;

  if (theme.is_pseudo_theme && theme.theme_json_url) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), THEME_JSON_FETCH_MS);
      const res = await fetch(theme.theme_json_url, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) raw = await res.text();
    } catch (e) {
      console.warn('[TOTM AI] Failed to fetch external theme.json:', e);
    }
  } else {
    try {
      const bucket = getBucket(event);
      const object = await bucket.get(`themes/${theme.id}/theme.json`);
      if (object) {
        raw = await object.text();
      }
    } catch (e) {
      console.warn('[TOTM AI] Failed to load theme.json from R2:', e);
    }
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return summarizeThemeJson(parsed);
  } catch {
    return null;
  }
}

export async function buildTotmGenerateContext(
  event: H3Event,
  themeId: string,
  totmCoverImage?: string | null
): Promise<TotmThemeContext> {
  const db = getDB(event);
  const { maxImages } = getGroqConfig(event);

  const theme = (await db
    .prepare(
      `SELECT id, name, slug, description, author, category, tags, theme_type,
              cover_image_url, marquee_image_url, preview_screenshots,
              theme_json_url, is_pseudo_theme
       FROM themes WHERE id = ? LIMIT 1`
    )
    .bind(themeId)
    .first()) as Record<string, unknown> | null;

  if (!theme) {
    throw createError({ statusCode: 400, message: 'Linked theme does not exist' });
  }

  if (theme.theme_type !== 'betterseqta') {
    throw createError({
      statusCode: 400,
      message: 'Theme of the month can only use BetterSEQTA+ themes for AI generation'
    });
  }

  let tags: string[] = [];
  if (theme.tags) {
    try {
      tags = JSON.parse(theme.tags as string) as string[];
    } catch {
      tags = [];
    }
  }

  let screenshots: string[] = [];
  if (theme.preview_screenshots) {
    try {
      screenshots = JSON.parse(theme.preview_screenshots as string) as string[];
    } catch {
      screenshots = [];
    }
  }

  const metadata: Record<string, unknown> = {
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    author: theme.author,
    category: theme.category,
    tags,
    theme_type: theme.theme_type
  };

  const themeJsonSummary = await loadThemeJsonSummary(event, {
    id: theme.id as string,
    theme_type: theme.theme_type as string,
    theme_json_url: theme.theme_json_url as string | null,
    is_pseudo_theme: theme.is_pseudo_theme
  });

  const imageUrls: string[] = [];
  const seen = new Set<string>();

  const addUrl = (url: string | null | undefined) => {
    const key = parseImageKey(url);
    if (!key || seen.has(key)) return;
    seen.add(key);
    imageUrls.push(url!);
  };

  addUrl(totmCoverImage);
  addUrl(theme.cover_image_url as string);
  addUrl(theme.marquee_image_url as string);
  for (const shot of screenshots) {
    addUrl(shot);
    if (imageUrls.length >= maxImages) break;
  }

  const imageParts: GroqContentPart[] = [];
  for (const url of imageUrls.slice(0, maxImages)) {
    const part = await loadImagePart(event, url);
    if (part) imageParts.push(part);
  }

  return { metadata, themeJsonSummary, imageParts };
}
