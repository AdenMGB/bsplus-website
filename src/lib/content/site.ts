export const comparisonRows = [
  ['Better than default SEQTA', true, true, false],
  ['Grades calculator', true, true, false],
  ['Global search', true, true, false],
  ['Custom home page', 'partial', true, false],
  ['Modern responsive interface', 'partial', true, false],
  ['Local notifications', 'partial', true, false],
  ['Local application', false, true, false],
  ['Offline support', false, true, false],
  ['Enhanced styling editor', false, true, false],
  ['Optimized performance', false, true, false],
  ['Full system integration', false, true, false],
  ['Browser independent', false, true, false],
  ['RSS news feeds', false, true, false],
  ['Cloud-based messaging', false, true, false],
  ['Cloud settings sync', false, true, false],
  ['AI integration and features', false, true, false],
  ['To do list', false, true, false],
  ['Focus timer', false, true, false],
  ['Student directory', false, true, false]
] as const;

export const desqtaFeatures = [
  {
    title: 'Local application',
    description: 'A dedicated desktop app that keeps SEQTA separate from the noise and overhead of your browser.'
  },
  {
    title: 'Offline support',
    description: 'View cached schedules, assignments, and classroom context without relying on a stable connection.'
  },
  {
    title: 'Optimized performance',
    description: 'A tighter desktop experience with faster startup, fewer tabs, and fewer wasted resources.'
  },
  {
    title: 'System integration',
    description: 'Native notifications, window management, shortcuts, and tray-style desktop behavior.'
  },
  {
    title: 'Custom dashboard',
    description: 'A homepage built around tasks, lessons, and student productivity rather than generic portal clutter.'
  },
  {
    title: 'Cloud sync',
    description: 'Carry settings and future BetterSEQTA Cloud features between devices with a signed-in experience.'
  }
];

export const downloadPlatforms = [
  { key: 'windows', label: 'Windows', blurb: 'Windows 10 or later', primary: 'Download EXE', secondary: 'Download MSI' },
  { key: 'macos', label: 'macOS', blurb: 'macOS 10.15 or later', primary: 'Download DMG' },
  { key: 'linux', label: 'Linux', blurb: 'Support is planned', primary: 'Coming soon', disabled: true },
  { key: 'android', label: 'Android', blurb: 'Android 7.0+ (API 24)', primary: 'Download APK' }
];

export const featureCards = [
  {
    title: 'Beautiful themes',
    description: 'Replace the stock SEQTA experience with polished color systems, wallpapers, and community themes.'
  },
  {
    title: 'Dark mode done right',
    description: 'A deeper, easier-on-the-eyes dark surface palette that feels native across the whole product.'
  },
  {
    title: 'Smarter workflows',
    description: 'Surface schedules, updates, downloads, and admin tools in a clearer and more focused interface.'
  }
];
