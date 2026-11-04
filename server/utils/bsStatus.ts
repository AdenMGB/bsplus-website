import type { H3Event } from 'h3';

export type BsStatus = {
  off: boolean;
  message: string | null;
  disabledFeatures: string[];
  sites: Record<string, string[]>;
};

const GITHUB_API = 'https://api.github.com';
const FEATURE_KEY = /^[A-Za-z][A-Za-z0-9._-]{0,63}$/;
const HOSTNAME = /^[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?$/;

function featureList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v).trim()).filter((v) => FEATURE_KEY.test(v)))];
}

export function normalizeBsStatus(raw: any): BsStatus {
  const sites: Record<string, string[]> = {};
  for (const [host, features] of Object.entries(raw?.sites ?? {})) {
    const name = host.trim().toLowerCase();
    const list = featureList(features);
    if (HOSTNAME.test(name) && list.length) sites[name] = list;
  }
  const message = typeof raw?.message === 'string' ? raw.message.trim().slice(0, 300) : '';
  return {
    off: raw?.off === true,
    message: message || null,
    disabledFeatures: featureList(raw?.disabledFeatures),
    sites,
  };
}

function repoFile(event: H3Event) {
  const config = useRuntimeConfig(event);
  const token = String(config.githubBsStatusToken ?? '').trim();
  if (!token) {
    throw createError({ statusCode: 503, statusMessage: 'GITHUB_BS_STATUS_TOKEN is not configured' });
  }
  return {
    url: `${GITHUB_API}/repos/BetterSEQTA/BS-Status/contents/config/status.json`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'BetterSEQTA-Website',
    },
  };
}

async function readFile(event: H3Event): Promise<{ status: BsStatus; sha?: string }> {
  const { url, headers } = repoFile(event);
  const res = await fetch(`${url}?ref=main`, { headers });
  if (res.status === 404) return { status: normalizeBsStatus(null) };
  if (!res.ok) throw createError({ statusCode: 502, statusMessage: `GitHub read failed (${res.status})` });
  const file = (await res.json()) as { sha: string; content: string };
  const text = new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)));
  return { status: normalizeBsStatus(JSON.parse(text)), sha: file.sha };
}

export const readBsStatus = async (event: H3Event) => (await readFile(event)).status;

export async function writeBsStatus(event: H3Event, input: unknown, author: string): Promise<BsStatus> {
  const status = normalizeBsStatus(input);
  const { sha } = await readFile(event);
  const { url, headers } = repoFile(event);
  const bytes = new TextEncoder().encode(`${JSON.stringify(status, null, 2)}\n`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Update status (${author})`,
      content: btoa(String.fromCharCode(...bytes)),
      branch: 'main',
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw createError({ statusCode: 502, statusMessage: `GitHub write failed (${res.status})` });
  return status;
}
