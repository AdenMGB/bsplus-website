<script setup lang="ts">
definePageMeta({ middleware: ['admin'] });

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));

const { data, pending, refresh } = await useFetch(() => `/api/admin/surveys/${slug.value}`);
const { data: responsesData, refresh: refreshResponses } = await useFetch(
  () => `/api/admin/surveys/${slug.value}/responses`,
  { query: { limit: 200 } }
);

const seeding = ref(false);
const updatingStatus = ref(false);
const seedResult = ref<any>(null);

const queueTotal = computed(() => {
  const stats = data.value?.stats;
  if (!stats) return 0;
  return (
    (stats.queue_pending || 0) +
    (stats.queue_sent || 0) +
    (stats.queue_failed || 0) +
    (stats.queue_skipped || 0)
  );
});

const queueProgress = computed(() => {
  const stats = data.value?.stats;
  if (!stats || !queueTotal.value) return 0;
  return Math.round(((stats.queue_sent || 0) / queueTotal.value) * 100);
});

async function seedCampaign() {
  if (!confirm('Seed email queue for all founding 2,500 users from accounts export?')) return;
  seeding.value = true;
  seedResult.value = null;
  try {
    seedResult.value = await $fetch(`/api/admin/surveys/${slug.value}/campaign/seed`, {
      method: 'POST',
      body: { limit: 2500 },
    });
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to seed campaign');
  } finally {
    seeding.value = false;
  }
}

async function setStatus(status: string) {
  updatingStatus.value = true;
  try {
    await $fetch(`/api/admin/surveys/${slug.value}/status`, {
      method: 'PATCH',
      body: { status },
    });
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to update status');
  } finally {
    updatingStatus.value = false;
  }
}

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join('|');
  return String(value ?? '');
}

function exportCsv() {
  const rows = responsesData.value?.responses || [];
  const header = [
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
        row.user_id,
        row.signup_number ?? '',
        row.completed_at ?? '',
        answers.performance_rating ?? '',
        answers.nps_rating ?? '',
        answers.referral_source ?? '',
        formatAnswer(answers.cloud_features),
        formatAnswer(answers.improvements),
        JSON.stringify(answers.additional_feedback || '').replace(/"/g, '""'),
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug.value}-responses.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatTs(ts?: number | null) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
}
</script>

<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <NuxtLink to="/admin/surveys" class="mb-4 inline-block text-sm text-zinc-400 hover:text-white">&larr; All surveys</NuxtLink>

      <div v-if="pending" class="text-zinc-500">Loading survey...</div>

      <template v-else-if="data?.survey">
        <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-3xl font-bold text-white">{{ data.survey.title }}</h2>
            <p class="mt-2 text-zinc-400">{{ data.survey.description }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a
              :href="`/surveys/${slug}`"
              target="_blank"
              rel="noopener"
              class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105"
            >
              Preview live survey
            </a>
            <button
              type="button"
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
              :disabled="updatingStatus"
              @click="setStatus(data.survey.status === 'active' ? 'closed' : 'active')"
            >
              {{ data.survey.status === 'active' ? 'Close survey' : 'Activate survey' }}
            </button>
          </div>
        </div>

        <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Responses</dt>
            <dd class="mt-2 text-3xl font-bold text-white">{{ data.stats.response_count }}</dd>
          </div>
          <div class="rounded-2xl border border-sky-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Link clicks</dt>
            <dd class="mt-2 text-3xl font-bold text-sky-400">{{ data.stats.queue_clicked || 0 }}</dd>
          </div>
          <div class="rounded-2xl border border-amber-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Queue pending</dt>
            <dd class="mt-2 text-3xl font-bold text-amber-400">{{ data.stats.queue_pending }}</dd>
          </div>
          <div class="rounded-2xl border border-green-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Sent</dt>
            <dd class="mt-2 text-3xl font-bold text-green-400">{{ data.stats.queue_sent }}</dd>
          </div>
          <div class="rounded-2xl border border-red-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Failed</dt>
            <dd class="mt-2 text-3xl font-bold text-red-400">{{ data.stats.queue_failed }}</dd>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Skipped</dt>
            <dd class="mt-2 text-3xl font-bold text-zinc-300">{{ data.stats.queue_skipped }}</dd>
          </div>
        </div>

        <div class="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Email campaign</h3>
              <p class="mt-1 text-sm text-zinc-400">
                Seeds queue from accounts signup-order export, then sends the first batch immediately (up to 40 emails when mail quota allows). Cron continues draining every 30 minutes.
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
              :disabled="seeding"
              @click="seedCampaign"
            >
              {{ seeding ? 'Seeding & sending…' : 'Send survey emails (seed queue)' }}
            </button>
          </div>

          <div v-if="queueTotal" class="mt-4">
            <div class="mb-2 flex justify-between text-sm text-zinc-400">
              <span>Campaign progress</span>
              <span>{{ queueProgress }}% sent</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div class="h-full bg-green-500 transition-all duration-200" :style="{ width: `${queueProgress}%` }" />
            </div>
          </div>

          <pre v-if="seedResult" class="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-green-400">{{ seedResult }}</pre>
        </div>

        <div class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <div class="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h3 class="text-base font-semibold text-white">Responses ({{ responsesData?.total ?? 0 }})</h3>
            <button
              type="button"
              class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-all duration-200 hover:scale-105"
              @click="exportCsv"
            >
              Export CSV
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-zinc-900/50 text-zinc-300">
                <tr>
                  <th class="px-6 py-3 font-semibold">User</th>
                  <th class="px-6 py-3 font-semibold">Signup #</th>
                  <th class="px-6 py-3 font-semibold">Performance</th>
                  <th class="px-6 py-3 font-semibold">NPS</th>
                  <th class="px-6 py-3 font-semibold">Completed</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr v-for="row in responsesData?.responses || []" :key="row.id" class="hover:bg-zinc-800/40">
                  <td class="px-6 py-4 font-mono text-xs text-zinc-300">{{ row.user_id }}</td>
                  <td class="px-6 py-4 text-white">{{ row.signup_number ?? '—' }}</td>
                  <td class="px-6 py-4 text-zinc-300">{{ row.answers?.performance_rating ?? '—' }}</td>
                  <td class="px-6 py-4 text-zinc-300">{{ row.answers?.nps_rating ?? '—' }}</td>
                  <td class="px-6 py-4 text-zinc-400">{{ formatTs(row.completed_at) }}</td>
                </tr>
                <tr v-if="!(responsesData?.responses || []).length">
                  <td colspan="5" class="px-6 py-8 text-center text-zinc-500 italic">No responses yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
