export type AccentName = 'emerald' | 'indigo' | 'cyan';

export interface ThemeState {
  mode: 'dark';
  accent: AccentName;
}

export const themeState: ThemeState = {
  mode: 'dark',
  accent: 'emerald'
};

export const accentOptions: Record<AccentName, { label: string }> = {
  emerald: { label: 'Emerald' },
  indigo: { label: 'Indigo' },
  cyan: { label: 'Cyan' }
};
