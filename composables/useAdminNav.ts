export type AdminNavItem = {
  id: string;
  label: string;
  description: string;
  to: string;
  accent: string;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'hub',
    label: 'Hub',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Overview and shortcuts across admin',
        to: '/admin',
        accent: 'text-zinc-200 border-zinc-600',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        description: 'App usage and theme metrics',
        to: '/admin/analytics',
        accent: 'text-emerald-400 border-emerald-500/40',
      },
    ],
  },
  {
    id: 'content',
    label: 'Content & store',
    items: [
      {
        id: 'themes',
        label: 'Official themes',
        description: 'Marketplace theme moderation',
        to: '/admin/themes',
        accent: 'text-purple-400 border-purple-500/40',
      },
      {
        id: 'custom-themes',
        label: 'Custom themes',
        description: 'User-submitted theme review',
        to: '/admin/custom-themes',
        accent: 'text-violet-400 border-violet-500/40',
      },
      {
        id: 'collections',
        label: 'Collections',
        description: 'Curated theme groups',
        to: '/admin/collections',
        accent: 'text-blue-400 border-blue-500/40',
      },
      {
        id: 'totm',
        label: 'Theme of the month',
        description: 'Featured monthly theme',
        to: '/admin/theme-of-the-month',
        accent: 'text-pink-400 border-pink-500/40',
      },
      {
        id: 'backgrounds',
        label: 'CSS backgrounds',
        description: 'Live wallpaper assets',
        to: '/admin/backgrounds',
        accent: 'text-cyan-400 border-cyan-500/40',
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      {
        id: 'news',
        label: 'News',
        description: 'Site announcements',
        to: '/admin/news',
        accent: 'text-green-400 border-green-500/40',
      },
      {
        id: 'questionnaire',
        label: 'Daily questions',
        description: 'Poll queue and votes',
        to: '/admin/questionnaire',
        accent: 'text-indigo-400 border-indigo-500/40',
      },
      {
        id: 'surveys',
        label: 'Milestone surveys',
        description: 'Founding member surveys',
        to: '/admin/surveys',
        accent: 'text-lime-400 border-lime-500/40',
      },
    ],
  },
  {
    id: 'extension',
    label: 'BetterSEQTA+',
    items: [
      {
        id: 'feedback',
        label: 'Feedback',
        description: 'Extension bug reports & ideas',
        to: '/admin/feedback',
        accent: 'text-amber-400 border-amber-500/40',
      },
      {
        id: 'remote-config',
        label: 'Remote config',
        description: 'Kill switch, campaigns, targeting',
        to: '/admin/bsplus-remote-config',
        accent: 'text-orange-400 border-orange-500/40',
      },
    ],
  },
  {
    id: 'ops',
    label: 'Operations',
    items: [
      {
        id: 'api-keys',
        label: 'Service API keys',
        description: 'Interop keys for other services',
        to: '/admin/api-keys',
        accent: 'text-zinc-300 border-zinc-500/40',
      },
    ],
  },
];

export function flatAdminNavItems(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((g) => g.items);
}

export function adminNavItemForPath(path: string): AdminNavItem | null {
  const normalized = path.replace(/\/$/, '') || '/admin';
  const items = flatAdminNavItems().sort((a, b) => b.to.length - a.to.length);
  for (const item of items) {
    if (item.to === '/admin') {
      if (normalized === '/admin') return item;
      continue;
    }
    if (normalized === item.to || normalized.startsWith(`${item.to}/`)) {
      return item;
    }
  }
  return null;
}
