export interface BadgeDefinition {
  key: string;
  label: string;
  threshold: number;
  gradient: string;
}

export const FOUNDER_BADGES: BadgeDefinition[] = [
  { key: 'founder_10', label: 'Pioneer', threshold: 10, gradient: 'from-amber-400 via-yellow-300 to-amber-500' },
  { key: 'founder_25', label: 'Early Adopter', threshold: 25, gradient: 'from-orange-400 via-amber-300 to-orange-500' },
  { key: 'founder_50', label: 'Founding Member', threshold: 50, gradient: 'from-rose-400 via-pink-300 to-rose-500' },
  { key: 'founder_100', label: 'Centurion', threshold: 100, gradient: 'from-purple-400 via-violet-300 to-purple-500' },
  { key: 'founder_250', label: 'Quarter Thousand', threshold: 250, gradient: 'from-indigo-400 via-blue-300 to-indigo-500' },
  { key: 'founder_500', label: 'Half Thousand', threshold: 500, gradient: 'from-sky-400 via-cyan-300 to-sky-500' },
  { key: 'founder_1000', label: 'Thousand Club', threshold: 1000, gradient: 'from-emerald-400 via-green-300 to-emerald-500' },
  { key: 'founder_2500', label: 'Founding Cloud', threshold: 2500, gradient: 'from-green-400 via-lime-300 to-green-500' },
];

export function badgesForSignupNumber(signupNumber: number | null | undefined): BadgeDefinition[] {
  if (!signupNumber || signupNumber < 1) return [];
  return FOUNDER_BADGES.filter((badge) => signupNumber <= badge.threshold);
}

export function primaryFounderBadgeForSignup(signupNumber: number | null | undefined): BadgeDefinition | null {
  if (!signupNumber || signupNumber < 1) return null;
  let best: BadgeDefinition | null = null;
  for (const badge of FOUNDER_BADGES) {
    if (signupNumber <= badge.threshold && (!best || badge.threshold < best.threshold)) {
      best = badge;
    }
  }
  return best;
}

export function badgeByKey(key: string): BadgeDefinition | undefined {
  return FOUNDER_BADGES.find((badge) => badge.key === key);
}

export function formatSignupDate(timestamp?: number | null): string {
  if (!timestamp) return 'Unknown date';
  return new Date(timestamp * 1000).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
