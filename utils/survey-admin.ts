export const SURVEY_REFERRAL_LABELS: Record<string, string> = {
  friend: 'Friend or classmate',
  school: 'School / teacher',
  social_media: 'Social media',
  search: 'Search engine',
  extension: 'BetterSEQTA+ extension',
  other: 'Other',
};

export const SURVEY_FIELD_LABELS = {
  performance_rating: 'Performance rating',
  cloud_features: 'Cloud features requested',
  improvements: 'Improvements that matter most',
  nps_rating: 'Likelihood to recommend',
  referral_source: 'How they found BetterSEQTA Cloud',
  additional_feedback: 'Additional feedback',
} as const;

export function surveyDisplayName(response: {
  display_name?: string | null;
  username?: string | null;
  email?: string | null;
  user_id: string;
}): string {
  return response.display_name || response.username || response.email || response.user_id;
}

export function formatSurveyReferral(value: unknown): string {
  const key = String(value ?? '').trim();
  return SURVEY_REFERRAL_LABELS[key] || key || '—';
}

export function distributionPercent(count: number, total: number): number {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}
