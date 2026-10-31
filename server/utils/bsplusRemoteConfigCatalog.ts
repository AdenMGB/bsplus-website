/**
 * Known remote-config targets in BetterSEQTA+ (extension repo).
 * Used for admin UI presets and documentation — keys not listed can still be set via API.
 */

export type CatalogFeatureItem = {
  key: string;
  label: string;
  description: string;
  /** Extension behavior summary */
  effect: string;
};

export type CatalogFeatureGroup = {
  id: string;
  label: string;
  items: CatalogFeatureItem[];
};

export const FEATURE_MODE_DOCS: Record<
  string,
  { label: string; description: string }
> = {
  allow: {
    label: 'Allow',
    description: 'Default — no remote restriction.',
  },
  hide: {
    label: 'Hide',
    description: 'Remove UI entry (sidebar, menu, settings nav).',
  },
  banner: {
    label: 'Banner',
    description: 'Show an info/warning banner on the page (pages only). Optional message.',
  },
  block: {
    label: 'Block',
    description: 'Replace page content with a message (pages only).',
  },
  greyout: {
    label: 'Grey out',
    description: 'Plugin will not start; settings control can show disabled state.',
  },
  temp_hide: {
    label: 'Temp hide',
    description: 'Hide until the next published configVersion, then auto-allow.',
  },
};

export const GLOBAL_FIELD_DOCS = [
  {
    field: 'mode',
    description:
      'Global kill switch: off skips SEQTA inject; service worker + settings popup still run.',
  },
  {
    field: 'allowLocalOverride',
    description: 'When off/kill or hostname blocked, user can enable “Run locally anyway” in settings.',
  },
  {
    field: 'statusMessage',
    description: 'Shown in settings status strip when kill switch is off.',
  },
  {
    field: 'maintenance',
    description: 'Optional title/body shown in status strip (overrides generic kill text when set).',
  },
  {
    field: 'minExtensionVersion',
    description: 'Semver — below this, plugins/pages gated; strip shows update message.',
  },
  {
    field: 'forceUpdateUrl',
    description: 'Link appended to min-version message in settings strip.',
  },
  {
    field: 'hostnamePolicy',
    description:
      'allowlist or denylist of hostname suffixes — BS+ disabled on non-matching SEQTA sites (override optional).',
  },
  {
    field: 'disableCloudSync',
    description: 'Blocks cloud settings sync in the extension.',
  },
  {
    field: 'disableThemeStore',
    description: 'Disables theme store UI in the extension.',
  },
  {
    field: 'disableFeedbackSubmit',
    description: 'Blocks feedback submission from the extension.',
  },
] as const;

/** Built-in plugins registered in BetterSEQTA-Plus `src/plugins/index.ts` */
const PLUGIN_IDS = [
  'themes',
  'animated-background',
  'notificationCollector',
  'timetable',
  'profile-picture',
  'assessments-overview',
  'background-music',
  'app-icons',
  'assessments-average',
  'timetableEdit',
  'messageFolders',
  'enhanced-navigation',
  'global-search',
  'grade-analytics',
  'error-page-kitten',
  'timetable-classmates',
] as const;

const PLUGIN_LABELS: Record<string, string> = {
  themes: 'Themes',
  'animated-background': 'Animated background',
  notificationCollector: 'Notification collector',
  timetable: 'Timetable enhancements',
  'profile-picture': 'Profile picture',
  'assessments-overview': 'Assessments overview',
  'background-music': 'Background music',
  'app-icons': 'App icons',
  'assessments-average': 'Assessments average',
  timetableEdit: 'Timetable edit',
  messageFolders: 'Message folders',
  'enhanced-navigation': 'Enhanced navigation',
  'global-search': 'Global search',
  'grade-analytics': 'Grade analytics',
  'error-page-kitten': 'Error page kitten',
  'timetable-classmates': 'Timetable classmates',
};

export const BSPLUS_REMOTE_FEATURE_GROUPS: CatalogFeatureGroup[] = [
  {
    id: 'pages',
    label: 'SEQTA pages',
    items: [
      {
        key: 'page.home',
        label: 'Home',
        description: 'BetterSEQTA home page loader',
        effect: 'hide removes sidebar entry; banner/block on #home-container',
      },
      {
        key: 'page.news',
        label: 'News',
        description: 'BetterSEQTA news feed page',
        effect: 'hide removes sidebar entry; banner/block on #news-container',
      },
      {
        key: 'page.analytics',
        label: 'Analytics',
        description: 'Grade analytics sidebar + page',
        effect: 'hide removes analytics menu item',
      },
    ],
  },
  {
    id: 'plugins',
    label: 'Plugins',
    items: PLUGIN_IDS.map((id) => ({
      key: `plugin.${id}`,
      label: PLUGIN_LABELS[id] ?? id,
      description: `Built-in plugin: ${id}`,
      effect: 'hide/greyout/block prevent plugin start; greyout common for soft disable',
    })),
  },
  {
    id: 'settings',
    label: 'Settings popup',
    items: [
      {
        key: 'settings.nav.cloud',
        label: 'My Account (cloud)',
        description: 'Account / cloud nav section',
        effect: 'hide removes “My Account” from settings sidebar',
      },
      {
        key: 'settings.section.general',
        label: 'General section',
        description: 'General settings section',
        effect: 'hide removes section from settings nav',
      },
      {
        key: 'settings.section.appearance',
        label: 'Appearance section',
        description: 'Appearance settings',
        effect: 'hide removes section from settings nav',
      },
      {
        key: 'settings.section.timetable',
        label: 'Timetable section',
        description: 'Timetable plugin settings',
        effect: 'hide removes section from settings nav',
      },
      {
        key: 'settings.section.assessments',
        label: 'Assessments section',
        description: 'Assessments plugin settings',
        effect: 'hide removes section from settings nav',
      },
      {
        key: 'settings.section.features',
        label: 'Features section',
        description: 'Feature plugins settings',
        effect: 'hide removes section from settings nav',
      },
      {
        key: 'settings.section.advanced',
        label: 'Advanced section',
        description: 'Dev/advanced settings (dev mode)',
        effect: 'hide removes section from settings nav',
      },
      {
        key: 'settings.section.shortcuts',
        label: 'Shortcuts section',
        description: 'Keyboard shortcuts settings',
        effect: 'hide removes section from settings nav',
      },
      {
        key: 'settings.control.onoff',
        label: 'Master on/off toggle',
        description: 'BetterSEQTA+ master switch in General',
        effect: 'greyout disables toggle UI with optional message',
      },
    ],
  },
];

export const CAMPAIGN_BUTTON_ACTIONS = [
  { action: 'dismiss', label: 'Dismiss', description: 'Close popup and mark seen' },
  { action: 'url', label: 'Open URL', description: 'Opens url in new tab; requires url field' },
  {
    action: 'openSettingsSection',
    label: 'Open settings section',
    description: 'Opens settings popup to section id (e.g. general, appearance)',
  },
] as const;

export const CAMPAIGN_HERO_TYPES = ['image', 'video'] as const;

export const REMOTE_THEME_APPLICATION_MODE_DOCS = [
  {
    value: 'replace',
    label: 'Replace',
    description: 'Remote package replaces the user theme while active (default).',
  },
  {
    value: 'overlay',
    label: 'Overlay',
    description: 'User theme stays selected; remote CSS/DOM layers stack on top.',
  },
] as const;

export function getBsplusRemoteConfigCatalog() {
  return {
    globalFields: GLOBAL_FIELD_DOCS,
    featureModes: FEATURE_MODE_DOCS,
    featureGroups: BSPLUS_REMOTE_FEATURE_GROUPS,
    remoteTheme: {
      applicationModes: REMOTE_THEME_APPLICATION_MODE_DOCS,
      maxOverlayLayers: 5,
      directiveFields: [
        'packageId',
        'packageVersion',
        'mode',
        'applicationMode',
        'activeFrom',
        'activeTo',
        'message',
        'allowUserOptOut',
      ],
    },
    campaign: {
      buttonActions: CAMPAIGN_BUTTON_ACTIONS,
      heroTypes: CAMPAIGN_HERO_TYPES,
      fields: [
        'id',
        'priority',
        'activeFrom',
        'activeTo',
        'header.title',
        'header.subtitle',
        'hero.type',
        'hero.url',
        'hero.alt',
        'bodyHtml',
        'buttons',
        'requireAcknowledge',
        'omitBodyFromSnapshot',
        'enabled',
        'minVersion',
        'maxVersion',
      ],
    },
  };
}

export function allCatalogFeatureKeys(): string[] {
  return BSPLUS_REMOTE_FEATURE_GROUPS.flatMap((g) => g.items.map((i) => i.key));
}
