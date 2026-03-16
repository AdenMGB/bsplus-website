<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col gap-6 mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NuxtLink
            to="/admin"
            class="text-sm font-semibold leading-6 text-zinc-400 hover:text-white mb-4 inline-block transition-colors duration-200"
          >
            &larr; Back to Dashboard
          </NuxtLink>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Analytics</h2>
          <p class="mt-2 text-lg text-zinc-400">Session statistics and app usage over time</p>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <select
            v-model="selectedHours"
            @change="loadHourlyData"
            class="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors duration-200"
          >
            <option :value="24">Last 24 Hours</option>
            <option :value="48">Last 48 Hours</option>
            <option :value="168">Last 7 Days</option>
            <option :value="720">Last 30 Days</option>
          </select>
          <select
            v-model="selectedUsageDays"
            @change="loadUsageData"
            class="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors duration-200"
          >
            <option :value="7">Last 7 Days</option>
            <option :value="14">Last 14 Days</option>
            <option :value="30">Last 30 Days</option>
            <option :value="90">Last 90 Days</option>
          </select>
          <button
            @click="flushSessions"
            :disabled="flushing"
            class="inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {{ flushing ? 'Flushing...' : 'Flush Buffers' }}
          </button>
        </div>
      </div>

      <!-- Stats Cards - Row 1: Web/Extension -->
      <div class="mb-8">
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Web & Extension</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Extension Sessions</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ stats.sessions?.total ?? 0 }}
            </dd>
            <dd v-if="stats.sessions?.buffer" class="mt-1 text-xs text-zinc-500">
              {{ stats.sessions.buffer.totalBuffered }} buffered
            </dd>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">DesQTA Web Sessions</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ stats.desqtaSessions?.total ?? 0 }}
            </dd>
            <dd v-if="stats.desqtaSessions?.buffer" class="mt-1 text-xs text-zinc-500">
              {{ stats.desqtaSessions.buffer.totalBuffered }} buffered
            </dd>
          </div>
        </div>
      </div>

      <!-- Stats Cards - Row 2: App Usage (DesQTA) -->
      <div class="mb-12">
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">App Usage (DesQTA / BetterSEQTA Cloud)</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Total Reports</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ usageSummary.totalReports ?? 0 }}
            </dd>
            <dd class="mt-1 text-xs text-zinc-500">
              {{ usageSummary.totalSessions ?? 0 }} sessions reported
            </dd>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Cloud Signed-in</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ usageSummary.signedInReports ?? 0 }}
            </dd>
            <dd class="mt-1 text-xs text-zinc-500">
              {{ signedInPercent }}% of reports · {{ usageSummary.signedInSessions ?? 0 }} sessions
            </dd>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Anonymous</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ usageSummary.anonymousSessions ?? 0 }}
            </dd>
            <dd class="mt-1 text-xs text-zinc-500">
              sessions (not signed in)
            </dd>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Unique Devices</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ usageSummary.uniqueClients ?? 0 }}
            </dd>
            <dd class="mt-1 text-xs text-zinc-500">
              distinct client IDs
            </dd>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Unique Users</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ usageSummary.uniqueUsers ?? 0 }}
            </dd>
            <dd class="mt-1 text-xs text-zinc-500">
              signed-in accounts
            </dd>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
            <dt class="text-sm font-medium leading-6 text-zinc-400">App Versions</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ usageData.byVersion?.length ?? 0 }}
            </dd>
            <dd class="mt-1 text-xs text-zinc-500">
              versions in use
            </dd>
          </div>
        </div>
      </div>

      <!-- App Usage (DesQTA Desktop) - Primary Section -->
      <section class="mb-12">
        <h3 class="mb-6 text-xl font-semibold text-white">App Usage (DesQTA / BetterSEQTA Cloud)</h3>
        <div v-if="usageLoading" class="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-24">
          <div class="text-zinc-400">Loading app usage...</div>
        </div>
        <div
          v-else-if="!usageData.daily?.length && !usageData.byPlatform?.length"
          class="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-24 text-center"
        >
          <p class="text-zinc-400">No app usage data yet</p>
          <p class="mt-2 text-sm text-zinc-500">
            Data appears when DesQTA sends usage reports to <code class="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">POST /api/analytics/usage</code>
          </p>
        </div>
        <div v-else class="space-y-6">
          <!-- Daily Sessions (Total) -->
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h4 class="mb-4 text-lg font-semibold text-white">Daily Sessions</h4>
            <AreaChart
              :data="usageChartData"
              :chart-config="usageChartConfig"
              x-axis-key="timestamp"
              container-class="min-h-[300px]"
            />
          </div>

          <!-- Signed-in vs Anonymous (Stacked) -->
          <div v-if="hasSignedInData" class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h4 class="mb-4 text-lg font-semibold text-white">Cloud Signed-in vs Anonymous Sessions</h4>
            <AreaChart
              :data="usageChartData"
              :chart-config="signedInChartConfig"
              x-axis-key="timestamp"
              stack="auth"
              container-class="min-h-[300px]"
            />
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <!-- Platform Breakdown -->
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 class="mb-4 text-lg font-semibold text-white">Platform Breakdown</h4>
              <div v-if="!usageData.byPlatform?.length" class="py-8 text-center text-sm text-zinc-500">
                No platform data in selected period
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="p in usageData.byPlatform"
                  :key="p.platform"
                  class="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-all duration-200 hover:scale-[1.01]"
                >
                  <div class="flex items-center gap-3">
                    <admin-platform-icon :platform="p.platform" />
                    <div>
                      <span class="font-medium capitalize text-white">{{ p.platform }}</span>
                      <span class="ml-2 text-xs text-zinc-500">{{ p.report_count }} reports</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-semibold text-white">{{ p.total_sessions }}</span>
                    <span class="ml-1 text-sm text-zinc-500">sessions</span>
                    <div v-if="p.signed_in_sessions != null" class="mt-0.5 text-xs text-zinc-500">
                      <span class="text-emerald-400">{{ p.signed_in_sessions }} signed-in</span>
                      <span v-if="p.anonymous_sessions" class="text-zinc-500"> · {{ p.anonymous_sessions }} anon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Version Breakdown -->
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 class="mb-4 text-lg font-semibold text-white">Version Adoption</h4>
              <div v-if="!usageData.byVersion?.length" class="py-8 text-center text-sm text-zinc-500">
                No version data in selected period
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="v in usageData.byVersion"
                  :key="v.app_version"
                  class="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-all duration-200 hover:scale-[1.01]"
                >
                  <span class="font-mono text-sm font-medium text-white">{{ v.app_version }}</span>
                  <div class="text-right">
                    <span class="text-lg font-semibold text-white">{{ v.total_sessions }}</span>
                    <span class="ml-1 text-sm text-zinc-500">sessions</span>
                    <span class="block text-xs text-zinc-500">{{ v.report_count }} reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Web Sessions (Hourly) -->
      <section>
        <h3 class="mb-6 text-xl font-semibold text-white">Web Sessions (Hourly)</h3>
        <div v-if="hourlyLoading" class="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-24">
          <div class="text-zinc-400">Loading hourly data...</div>
        </div>
        <div
          v-else-if="chartData.length === 0"
          class="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-24"
        >
          <div class="text-zinc-400">No hourly data for the selected period</div>
        </div>
        <div v-else class="space-y-6">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h4 class="mb-4 text-lg font-semibold text-white">Extension Sessions</h4>
            <AreaChart :data="chartData" :chart-config="extensionConfig" container-class="min-h-[300px]" />
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h4 class="mb-4 text-lg font-semibold text-white">DesQTA Sessions</h4>
            <AreaChart :data="chartData" :chart-config="desqtaConfig" container-class="min-h-[300px]" />
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h4 class="mb-4 text-lg font-semibold text-white">Combined Sessions</h4>
            <AreaChart :data="chartData" :chart-config="combinedConfig" container-class="min-h-[300px]" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AreaChart from '~/components/charts/AreaChart.vue';

definePageMeta({
  middleware: ['admin'],
});

const selectedHours = ref(24);
const selectedUsageDays = ref(30);
const hourlyLoading = ref(true);
const usageLoading = ref(true);
const flushing = ref(false);
const chartData = ref<any[]>([]);
const stats = ref<any>({});
const usageData = ref<{
  daily: any[];
  byPlatform: any[];
  byVersion: any[];
  summary: {
    totalReports: number;
    totalSessions: number;
    signedInReports: number;
    signedInSessions?: number;
    anonymousSessions?: number;
    uniqueClients?: number;
    uniqueUsers?: number;
  };
}>({
  daily: [],
  byPlatform: [],
  byVersion: [],
  summary: {
    totalReports: 0,
    totalSessions: 0,
    signedInReports: 0,
    signedInSessions: 0,
    anonymousSessions: 0,
    uniqueClients: 0,
    uniqueUsers: 0,
  },
});

const extensionConfig = {
  extension_sessions: { label: 'Extension Sessions', color: '#4ade80' },
};
const desqtaConfig = {
  desqta_sessions: { label: 'DesQTA Sessions', color: '#60a5fa' },
};
const combinedConfig = {
  extension_sessions: { label: 'Extension Sessions', color: '#4ade80' },
  desqta_sessions: { label: 'DesQTA Sessions', color: '#60a5fa' },
};
const usageChartConfig = {
  total_sessions: { label: 'Sessions', color: '#a78bfa' },
};
const signedInChartConfig = {
  signed_in_sessions: { label: 'Cloud Signed-in', color: '#34d399' },
  anonymous_sessions: { label: 'Anonymous', color: '#64748b' },
};

const usageSummary = computed(() => usageData.value.summary || {});

const signedInPercent = computed(() => {
  const total = usageSummary.value.totalReports || 0;
  const signed = usageSummary.value.signedInReports || 0;
  if (total === 0) return 0;
  return Math.round((signed / total) * 100);
});

const hasSignedInData = computed(() => {
  const daily = usageData.value.daily || [];
  return daily.some(
    (d) => (d.signed_in_sessions ?? 0) > 0 || (d.anonymous_sessions ?? 0) > 0
  );
});

const usageChartData = computed(() =>
  (usageData.value.daily || []).map((d) => ({
    timestamp: d.timestamp,
    total_sessions: d.total_sessions,
    signed_in_sessions: d.signed_in_sessions ?? 0,
    anonymous_sessions: d.anonymous_sessions ?? 0,
  }))
);

async function loadStats() {
  try {
    const data = await $fetch<any>('/api/analytics/stats');
    stats.value = data;
  } catch {
    stats.value = {};
  }
}

async function loadHourlyData() {
  hourlyLoading.value = true;
  try {
    const data = await $fetch<any[]>(`/api/analytics/hourly-stats?hours=${selectedHours.value}`);
    chartData.value = data || [];
  } catch {
    chartData.value = [];
  } finally {
    hourlyLoading.value = false;
  }
}

async function loadUsageData() {
  usageLoading.value = true;
  try {
    const data = await $fetch<any>(`/api/analytics/usage?days=${selectedUsageDays.value}`);
    usageData.value = data || {
      daily: [],
      byPlatform: [],
      byVersion: [],
      summary: {
        totalReports: 0,
        totalSessions: 0,
        signedInReports: 0,
        signedInSessions: 0,
        anonymousSessions: 0,
        uniqueClients: 0,
        uniqueUsers: 0,
      },
    };
  } catch {
    usageData.value = {
      daily: [],
      byPlatform: [],
      byVersion: [],
      summary: {
        totalReports: 0,
        totalSessions: 0,
        signedInReports: 0,
        signedInSessions: 0,
        anonymousSessions: 0,
        uniqueClients: 0,
        uniqueUsers: 0,
      },
    };
  } finally {
    usageLoading.value = false;
  }
}

async function flushSessions() {
  flushing.value = true;
  try {
    await $fetch('/api/analytics/flush', { method: 'POST' });
    await loadStats();
    await loadHourlyData();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to flush');
  } finally {
    flushing.value = false;
  }
}

onMounted(() => {
  loadStats();
  loadHourlyData();
  loadUsageData();
});
</script>
