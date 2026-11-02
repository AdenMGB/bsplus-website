<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mb-10">
        <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Admin dashboard</h1>
        <p class="mt-2 text-lg text-zinc-400">
          BetterSEQTA+ website operations — pick an area below or use the admin bar to jump anywhere.
        </p>
      </div>

      <div v-if="attentionItems.length" class="mb-10 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-amber-200">Needs attention</h2>
        <ul class="mt-3 flex flex-wrap gap-2">
          <li v-for="item in attentionItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="inline-flex rounded-lg border border-amber-500/40 bg-amber-900/20 px-3 py-2 text-sm font-medium text-amber-100 transition-all duration-200 hover:scale-105"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div v-if="overviewLoading" class="mb-8 text-zinc-500">Loading overview…</div>

      <section v-for="group in navGroups" :key="group.id" class="mb-12">
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">{{ group.label }}</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="item in group.items"
            :key="item.id"
            :to="item.to"
            class="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02] hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold text-white">{{ item.label }}</h3>
                <p class="mt-1 text-sm text-zinc-500">{{ item.description }}</p>
              </div>
              <span
                class="shrink-0 rounded-lg border px-2 py-1 text-xs font-medium opacity-80"
                :class="item.accent"
              >
                Open
              </span>
            </div>
            <p v-if="statLine(item.id)" class="mt-4 text-sm font-medium text-zinc-300">
              {{ statLine(item.id) }}
            </p>
            <span class="mt-auto pt-4 text-xs text-zinc-600 group-hover:text-orange-400">Manage →</span>
          </NuxtLink>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Quick previews</h2>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-semibold text-white">Recent feedback</h3>
              <NuxtLink to="/admin/feedback" class="text-sm text-amber-400 hover:text-amber-300">All</NuxtLink>
            </div>
            <p v-if="!recentFeedback.length" class="text-sm text-zinc-500">No open items loaded.</p>
            <ul v-else class="space-y-2 text-sm">
              <li v-for="row in recentFeedback" :key="row.id" class="truncate text-zinc-300">
                {{ row.subject || row.category || row.id }}
              </li>
            </ul>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-semibold text-white">Recent themes</h3>
              <NuxtLink to="/admin/themes" class="text-sm text-purple-400 hover:text-purple-300">All</NuxtLink>
            </div>
            <ul v-if="recentThemes.length" class="space-y-2 text-sm">
              <li v-for="theme in recentThemes" :key="theme.id" class="flex justify-between gap-2 text-zinc-300">
                <span class="truncate">{{ theme.name }}</span>
                <span class="shrink-0 text-xs text-zinc-500">{{ theme.status }}</span>
              </li>
            </ul>
            <p v-else class="text-sm text-zinc-500">No themes yet.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ADMIN_NAV_GROUPS } from '~/composables/useAdminNav';

definePageMeta({ middleware: ['admin'] });

const navGroups = ADMIN_NAV_GROUPS.filter((g) => g.id !== 'hub');

const { data: analyticsStats, pending: statsLoading } = useLazyFetch<any>('/api/analytics/stats');
const { data: usageData, pending: usageLoading } = useLazyFetch<any>('/api/analytics/usage?days=30');
const { data: themesData, pending: themesLoading } = useLazyFetch<any>('/api/admin/themes');
const { data: collectionsData, pending: collectionsLoading } = useLazyFetch<any>('/api/admin/collections');
const { data: feedbackStats, pending: feedbackLoading } = useLazyFetch<any>('/api/bsplus/feedback/stats');
const { data: feedbackList } = useLazyFetch<{ items: Array<{ id: string; subject?: string; category?: string }> }>(
  '/api/bsplus/feedback',
  { query: { limit: '5', status: 'open' } },
);
const { data: customThemesAdminData } = useLazyFetch<any>('/api/admin/custom-themes', {
  query: { include_counts: '1', limit: 1, page: 1 },
});
const { data: posts } = useLazyFetch<any[]>('/api/news?admin=true');
const { data: questions } = useLazyFetch<any[]>('/api/questionnaire?admin=true');
const { data: installStats } = useLazyFetch<any>('/api/bsplus/admin/installs/stats');
const { data: surveysData } = useLazyFetch<any>('/api/admin/surveys');

const overviewLoading = computed(
  () =>
    statsLoading.value ||
    usageLoading.value ||
    themesLoading.value ||
    collectionsLoading.value ||
    feedbackLoading.value,
);

const recentThemes = computed(() => (themesData.value?.data?.themes || []).slice(0, 5));
const recentFeedback = computed(() => {
  const raw = feedbackList.value as { items?: Array<{ id: string; subject?: string; category?: string }> } | null;
  return raw?.items?.slice(0, 5) ?? [];
});

const stats = computed(() => {
  const themeStats = analyticsStats.value?.themes;
  const collections = collectionsData.value?.data?.collections || [];
  return {
    themes: {
      total: themeStats?.total ?? 0,
      pending: themeStats?.pending ?? 0,
    },
    collections: { total: collections.length },
    news: {
      total: posts.value?.length || 0,
      published: posts.value?.filter((p) => p.published).length || 0,
    },
    questions: {
      total: questions.value?.length || 0,
      active:
        questions.value?.filter((q) => q.is_active && q.expires_at * 1000 > Date.now()).length || 0,
    },
    customThemes: {
      pending: customThemesAdminData.value?.data?.counts?.pending ?? 0,
      approved: customThemesAdminData.value?.data?.counts?.approved ?? 0,
    },
    usage: usageData.value?.summary || {},
    feedback: feedbackStats.value || {},
    installs: installStats.value?.data || {},
    surveys: (surveysData.value?.surveys || []).length,
  };
});

function statLine(id: string): string {
  const s = stats.value;
  switch (id) {
    case 'analytics':
      return `${s.usage.totalReports ?? 0} reports · ${s.usage.uniqueClients ?? 0} devices (30d)`;
    case 'themes':
      return `${s.themes.total} total · ${s.themes.pending} pending review`;
    case 'custom-themes':
      return `${s.customThemes.pending} pending · ${s.customThemes.approved} approved`;
    case 'collections':
      return `${s.collections.total} collections`;
    case 'news':
      return `${s.news.published}/${s.news.total} published`;
    case 'questionnaire':
      return `${s.questions.active} active · ${s.questions.total} total`;
    case 'surveys':
      return `${s.surveys} survey programs`;
    case 'feedback':
      return `${s.feedback.open ?? 0} open · ${s.feedback.received ?? 0} new`;
    case 'remote-config':
      return `${s.installs.total_installs ?? '—'} installs · ${s.installs.active_last_24h ?? '—'} active 24h`;
    default:
      return '';
  }
}

const attentionItems = computed(() => {
  const items: { label: string; to: string }[] = [];
  const s = stats.value;
  if (s.themes.pending > 0) {
    items.push({ label: `${s.themes.pending} official theme(s) pending`, to: '/admin/themes?status=pending' });
  }
  if (s.customThemes.pending > 0) {
    items.push({ label: `${s.customThemes.pending} custom theme(s) to review`, to: '/admin/custom-themes' });
  }
  if ((s.feedback.open ?? 0) > 0) {
    items.push({ label: `${s.feedback.open} open feedback`, to: '/admin/feedback' });
  }
  return items;
});
</script>
