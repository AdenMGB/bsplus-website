/**
 * BetterSEQTA+ theme store flavours — master ↔ slave linkage (DB: flavour_master_id).
 */

/** Public API shape nested under masters (BetterSEQTA extension contract). */
export interface ThemeFlavourEntry {
  id: string;
  name: string;
  accent_color: string;
  cover_image: string | null;
  marquee_image: string | null;
}

export function sqlExcludeFlavorSlaveThemes(): string {
  return '(flavour_master_id IS NULL)';
}

function rowToFlavour(theme: Record<string, unknown>): ThemeFlavourEntry {
  const accent =
    typeof theme.default_colour === 'string' && theme.default_colour.trim()
      ? theme.default_colour.trim()
      : 'rgba(148,163,184,1)';
  return {
    id: theme.id as string,
    name: theme.name as string,
    accent_color: accent,
    cover_image: (theme.cover_image_url as string | null) ?? null,
    marquee_image: (theme.marquee_image_url as string | null) ?? null
  };
}

/**
 * Load approved BS+ slave variants for the given master theme ids (batch).
 */
export async function loadFlavoursForMasters(
  db: any,
  masterIds: string[]
): Promise<Map<string, ThemeFlavourEntry[]>> {
  const map = new Map<string, ThemeFlavourEntry[]>();
  for (const id of masterIds) {
    map.set(id, []);
  }
  if (masterIds.length === 0) {
    return map;
  }

  const placeholders = masterIds.map(() => '?').join(',');
  const result = await db
    .prepare(
      `SELECT * FROM themes
       WHERE flavour_master_id IN (${placeholders})
       AND status = 'approved'
       AND theme_type = 'betterseqta'
       ORDER BY flavour_master_id ASC, flavour_sort_order ASC, created_at ASC`
    )
    .bind(...masterIds)
    .all();

  for (const row of result.results as Record<string, unknown>[]) {
    const masterId = row.flavour_master_id as string;
    const list = map.get(masterId);
    if (list) list.push(rowToFlavour(row));
  }
  return map;
}

export function betterseqtaThemeRole(
  theme: Record<string, unknown>,
  flavours: ThemeFlavourEntry[] | undefined
): 'standard' | 'master' | 'slave' {
  const mid =
    typeof theme.flavour_master_id === 'string' ? theme.flavour_master_id.trim() : '';
  if (mid.length > 0) return 'slave';
  if (flavours && flavours.length > 0) return 'master';
  return 'standard';
}
