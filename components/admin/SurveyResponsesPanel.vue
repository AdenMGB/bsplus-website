<script setup lang="ts">
import {
  SURVEY_FIELD_LABELS,
  SURVEY_REFERRAL_LABELS,
  distributionPercent,
  formatSurveyReferral,
  surveyDisplayName,
} from '~/utils/survey-admin';

const props = defineProps<{
  slug: string;
}>();

type SurveyResponse = {
  id: string;
  user_id: string;
  signup_number: number | null;
  completed_at: number;
  display_name?: string | null;
  email?: string | null;
  username?: string | null;
  answers: Record<string, unknown> | null;
};

type SurveyOverview = {
  total_responses: number;
  avg_performance_rating: number | null;
  avg_nps_rating: number | null;
  performance_distribution: Record<number, number>;
  nps_distribution: Record<number, number>;
  referral_sources: Record<string, number>;
  with_additional_feedback: number;
};

const activeTab = ref<'overview' | 'individual'>('overview');
const searchQuery = ref('');
const selectedResponseId = ref<string | null>(null);

const { data, pending, refresh } = await useFetch<{
  overview: SurveyOverview;
  responses: SurveyResponse[];
  total: number;
}>(() => `/api/admin/surveys/${props.slug}/responses/overview`);

const filteredResponses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const responses = data.value?.responses || [];
  if (!query) return responses;

  return responses.filter((response) => {
    const name = surveyDisplayName(response).toLowerCase();
    const email = response.email?.toLowerCase() || '';
    const signup = String(response.signup_number ?? '');
    const userId = response.user_id.toLowerCase();
    return name.includes(query) || email.includes(query) || signup.includes(query) || userId.includes(query);
  });
});

const selectedResponse = computed(() => {
  const responses = data.value?.responses || [];
  if (!responses.length) return null;
  const selected = responses.find((response) => response.id === selectedResponseId.value);
  return selected || responses[0];
});

watch(
  () => data.value?.responses,
  (responses) => {
    if (!responses?.length) {
      selectedResponseId.value = null;
      return;
    }
    if (!selectedResponseId.value || !responses.some((response) => response.id === selectedResponseId.value)) {
      selectedResponseId.value = responses[0].id;
    }
  },
  { immediate: true },
);

const referralEntries = computed(() => {
  const overview = data.value?.overview;
  if (!overview) return [];

  return Object.entries(overview.referral_sources)
    .map(([key, count]) => ({
      key,
      label: SURVEY_REFERRAL_LABELS[key] || key,
      count,
      percent: distributionPercent(count, overview.total_responses),
    }))
    .sort((a, b) => b.count - a.count);
});

function ratingBars(distribution: Record<number, number>, total: number) {
  return Array.from({ length: 10 }, (_, index) => {
    const rating = index + 1;
    const count = distribution[rating] || 0;
    return {
      rating,
      count,
      percent: distributionPercent(count, total),
    };
  });
}

const performanceBars = computed(() =>
  ratingBars(data.value?.overview?.performance_distribution || {}, data.value?.overview?.total_responses || 0),
);

const npsBars = computed(() =>
  ratingBars(data.value?.overview?.nps_distribution || {}, data.value?.overview?.total_responses || 0),
);

function formatTs(ts?: number | null) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
}

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  return String(value ?? '').trim();
}

function exportCsv() {
  const rows = data.value?.responses || [];
  const header = [
    'display_name',
    'email',
    'user_id',
    'signup_number',
    'completed_at',
    'performance_rating',
    'nps_rating',
    'referral_source',
    'cloud_features',
    'improvements',
    'additional_feedback',
  ];
  const lines = [header.join(',')];

  for (const row of rows) {
    const answers = row.answers || {};
    lines.push(
      [
        surveyDisplayName(row),
        row.email ?? '',
        row.user_id,
        row.signup_number ?? '',
        row.completed_at ?? '',
        answers.performance_rating ?? '',
        answers.nps_rating ?? '',
        answers.referral_source ?? '',
        formatAnswer(answers.cloud_features),
        formatAnswer(answers.improvements),
        formatAnswer(answers.additional_feedback),
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    );
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.slug}-responses.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
    <div class="flex flex-col gap-4 border-b border-zinc-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-base font-semibold text-white">Response overview ({{ data?.total ?? 0 }})</h3>
        <p class="mt-1 text-sm text-zinc-400">Aggregate results and individual respondent answers.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-all duration-200 hover:scale-105"
          @click="refresh()"
        >
          Refresh
        </button>
        <button
          type="button"
          class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-all duration-200 hover:scale-105"
          @click="exportCsv"
        >
          Export CSV
        </button>
      </div>
    </div>

    <div class="border-b border-zinc-800 px-6">
      <div class="flex gap-1">
        <button
          type="button"
          class="border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200"
          :class="activeTab === 'overview' ? 'border-green-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'"
          @click="activeTab = 'overview'"
        >
          Overview
        </button>
        <button
          type="button"
          class="border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200"
          :class="activeTab === 'individual' ? 'border-green-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'"
          @click="activeTab = 'individual'"
        >
          Individual responses
        </button>
      </div>
    </div>

    <div v-if="pending" class="px-6 py-10 text-center text-zinc-500">Loading responses...</div>

    <div v-else-if="!data?.total" class="px-6 py-10 text-center text-zinc-500 italic">No responses yet.</div>

    <div v-else-if="activeTab === 'overview'" class="space-y-6 p-6">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p class="text-sm text-zinc-400">Total responses</p>
          <p class="mt-2 text-3xl font-bold text-white">{{ data.overview.total_responses }}</p>
        </div>
        <div class="rounded-xl border border-green-500/20 bg-zinc-950/60 p-4">
          <p class="text-sm text-zinc-400">Avg performance</p>
          <p class="mt-2 text-3xl font-bold text-green-400">
            {{ data.overview.avg_performance_rating ?? '—' }}
            <span v-if="data.overview.avg_performance_rating" class="text-base font-medium text-zinc-500">/ 10</span>
          </p>
        </div>
        <div class="rounded-xl border border-sky-500/20 bg-zinc-950/60 p-4">
          <p class="text-sm text-zinc-400">Avg NPS</p>
          <p class="mt-2 text-3xl font-bold text-sky-400">
            {{ data.overview.avg_nps_rating ?? '—' }}
            <span v-if="data.overview.avg_nps_rating" class="text-base font-medium text-zinc-500">/ 10</span>
          </p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p class="text-sm text-zinc-400">With extra feedback</p>
          <p class="mt-2 text-3xl font-bold text-white">{{ data.overview.with_additional_feedback }}</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <h4 class="text-sm font-semibold text-white">Performance rating distribution</h4>
          <div class="mt-4 space-y-2">
            <div v-for="bar in performanceBars" :key="`perf-${bar.rating}`" class="flex items-center gap-3">
              <span class="w-6 text-xs font-medium text-zinc-400">{{ bar.rating }}</span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  class="h-full rounded-full bg-green-500 transition-all duration-200"
                  :style="{ width: `${bar.percent}%` }"
                />
              </div>
              <span class="w-10 text-right text-xs text-zinc-500">{{ bar.count }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <h4 class="text-sm font-semibold text-white">NPS distribution</h4>
          <div class="mt-4 space-y-2">
            <div v-for="bar in npsBars" :key="`nps-${bar.rating}`" class="flex items-center gap-3">
              <span class="w-6 text-xs font-medium text-zinc-400">{{ bar.rating }}</span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  class="h-full rounded-full bg-sky-500 transition-all duration-200"
                  :style="{ width: `${bar.percent}%` }"
                />
              </div>
              <span class="w-10 text-right text-xs text-zinc-500">{{ bar.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
        <h4 class="text-sm font-semibold text-white">Referral sources</h4>
        <div v-if="referralEntries.length" class="mt-4 space-y-3">
          <div v-for="entry in referralEntries" :key="entry.key" class="space-y-1">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-zinc-200">{{ entry.label }}</span>
              <span class="text-zinc-500">{{ entry.count }} ({{ entry.percent }}%)</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                class="h-full rounded-full bg-amber-500 transition-all duration-200"
                :style="{ width: `${entry.percent}%` }"
              />
            </div>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-zinc-500 italic">No referral data yet.</p>
      </div>
    </div>

    <div v-else class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div class="border-b border-zinc-800 lg:border-b-0 lg:border-r">
        <div class="border-b border-zinc-800 px-4 py-3">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by name, email, signup #, or user ID"
            class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div class="max-h-[32rem] overflow-y-auto">
          <button
            v-for="response in filteredResponses"
            :key="response.id"
            type="button"
            class="flex w-full items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3 text-left transition-colors duration-200 last:border-b-0 hover:bg-zinc-800/50"
            :class="selectedResponse?.id === response.id ? 'bg-zinc-800/60' : ''"
            @click="selectedResponseId = response.id"
          >
            <div class="min-w-0">
              <p class="truncate font-medium text-white">{{ surveyDisplayName(response) }}</p>
              <p v-if="response.email" class="truncate text-xs text-zinc-500">{{ response.email }}</p>
              <p class="mt-1 text-xs text-zinc-500">
                Performance {{ response.answers?.performance_rating ?? '—' }} · NPS {{ response.answers?.nps_rating ?? '—' }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="font-mono text-xs text-zinc-500">#{{ response.signup_number ?? '—' }}</p>
              <p class="mt-1 text-xs text-zinc-600">{{ formatTs(response.completed_at) }}</p>
            </div>
          </button>
          <p v-if="!filteredResponses.length" class="px-4 py-8 text-center text-sm text-zinc-500 italic">
            No responses match your search.
          </p>
        </div>
      </div>

      <div v-if="selectedResponse" class="p-6">
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-white">{{ surveyDisplayName(selectedResponse) }}</h4>
          <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-zinc-500">Signup #</dt>
              <dd class="text-white">{{ selectedResponse.signup_number ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-zinc-500">Completed</dt>
              <dd class="text-white">{{ formatTs(selectedResponse.completed_at) }}</dd>
            </div>
            <div v-if="selectedResponse.email">
              <dt class="text-zinc-500">Email</dt>
              <dd class="truncate text-white">{{ selectedResponse.email }}</dd>
            </div>
            <div>
              <dt class="text-zinc-500">User ID</dt>
              <dd class="break-all font-mono text-xs text-zinc-400">{{ selectedResponse.user_id }}</dd>
            </div>
          </dl>
        </div>

        <div class="space-y-4">
          <div class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">{{ SURVEY_FIELD_LABELS.performance_rating }}</p>
            <p class="mt-2 text-2xl font-bold text-green-400">
              {{ selectedResponse.answers?.performance_rating ?? '—' }}
              <span v-if="selectedResponse.answers?.performance_rating" class="text-sm font-medium text-zinc-500">/ 10</span>
            </p>
          </div>

          <div class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">{{ SURVEY_FIELD_LABELS.nps_rating }}</p>
            <p class="mt-2 text-2xl font-bold text-sky-400">
              {{ selectedResponse.answers?.nps_rating ?? '—' }}
              <span v-if="selectedResponse.answers?.nps_rating" class="text-sm font-medium text-zinc-500">/ 10</span>
            </p>
          </div>

          <div class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">{{ SURVEY_FIELD_LABELS.referral_source }}</p>
            <p class="mt-2 text-white">{{ formatSurveyReferral(selectedResponse.answers?.referral_source) }}</p>
          </div>

          <div class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">{{ SURVEY_FIELD_LABELS.cloud_features }}</p>
            <p class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {{ formatAnswer(selectedResponse.answers?.cloud_features) || '—' }}
            </p>
          </div>

          <div class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">{{ SURVEY_FIELD_LABELS.improvements }}</p>
            <p class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {{ formatAnswer(selectedResponse.answers?.improvements) || '—' }}
            </p>
          </div>

          <div class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">{{ SURVEY_FIELD_LABELS.additional_feedback }}</p>
            <p class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {{ formatAnswer(selectedResponse.answers?.additional_feedback) || '—' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
