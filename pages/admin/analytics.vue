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
            v-model="selectedPeriod"
            class="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors duration-200"
          >
            <option :value="7">Last 7 Days</option>
            <option :value="14">Last 14 Days</option>
            <option :value="30">Last 30 Days</option>
            <option :value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards - App Usage -->
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

      <!-- Theme Analytics -->
      <section class="mb-12">
        <h3 class="mb-6 text-xl font-semibold text-white">Theme Marketplace</h3>
        <p class="mb-4 text-sm text-zinc-500">Theme stats are all-time (not filtered by period).</p>
        <div v-if="themeLoading" class="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-12">
          <div class="text-zinc-400">Loading theme analytics...</div>
        </div>
        <div v-else class="space-y-6">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Total Themes</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ themeData.summary?.total ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Approved</dt>
              <dd class="mt-1 text-2xl font-bold text-emerald-400">{{ themeData.summary?.approved ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Downloads</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ themeData.summary?.totalDownloads ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Favorites</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ themeData.summary?.totalFavorites ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Ratings</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ themeData.summary?.totalRatings ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Avg Rating</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ themeData.summary?.avgRating ?? 0 }}</dd>
            </div>
          </div>
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 class="mb-4 text-lg font-semibold text-white">By Category</h4>
              <div v-if="!themeData.byCategory?.length" class="py-6 text-center text-sm text-zinc-500">No categories</div>
              <div v-else class="space-y-2">
                <div v-for="c in themeData.byCategory" :key="c.category" class="flex justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2">
                  <span class="capitalize text-white">{{ c.category }}</span>
                  <span class="text-zinc-400">{{ c.count }} themes · {{ c.downloads }} downloads</span>
                </div>
              </div>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 class="mb-4 text-lg font-semibold text-white">Top by Downloads</h4>
              <div v-if="!themeData.topByDownloads?.length" class="py-6 text-center text-sm text-zinc-500">No themes</div>
              <div v-else class="space-y-2">
                <div v-for="t in themeData.topByDownloads" :key="t.id" class="flex justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2">
                  <span class="truncate text-white">{{ t.name }}</span>
                  <span class="ml-2 shrink-0 text-zinc-400">{{ t.download_count }} downloads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Questionnaire Analytics -->
      <section class="mb-12">
        <h3 class="mb-6 text-xl font-semibold text-white">Daily Questions</h3>
        <div v-if="questionnaireLoading" class="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-12">
          <div class="text-zinc-400">Loading questionnaire analytics...</div>
        </div>
        <div v-else class="space-y-6">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Total Questions</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ questionnaireData.summary?.totalQuestions ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Total Votes</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ questionnaireData.summary?.totalVotes ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Unique Voters</dt>
              <dd class="mt-1 text-2xl font-bold text-white">{{ questionnaireData.summary?.uniqueVoters ?? 0 }}</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-xs font-medium text-zinc-500">Buffered</dt>
              <dd class="mt-1 text-2xl font-bold text-amber-400">{{ questionnaireData.summary?.bufferTotal ?? 0 }}</dd>
            </div>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h4 class="mb-4 text-lg font-semibold text-white">Recent Questions & Votes</h4>
            <div v-if="!questionnaireData.questions?.length" class="py-6 text-center text-sm text-zinc-500">No questions</div>
            <div v-else class="space-y-2">
              <div v-for="q in questionnaireData.questions" :key="q.id" class="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="truncate font-medium text-white">{{ q.question }}</span>
                  <span v-if="q.is_active" class="ml-2 text-xs text-emerald-400">Active</span>
                </div>
                <span class="ml-4 shrink-0 text-zinc-400">{{ q.total_votes }} votes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Accounts Analytics (from accounts.betterseqta.org) -->
      <section class="mb-12">
        <h3 class="mb-6 text-xl font-semibold text-white">Accounts (BetterSEQTA Cloud)</h3>
        <div v-if="accountsLoading" class="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-12">
          <div class="text-zinc-400">Loading accounts...</div>
        </div>
        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-sm font-medium text-zinc-400">Total Users</dt>
              <dd v-if="accountsData.users?.error" class="mt-2 text-sm text-amber-400">
                {{ accountsData.users.error }}
              </dd>
              <dd v-else class="mt-2 text-3xl font-bold text-white">
                {{ accountsData.users?.total ?? '—' }}
              </dd>
              <dd class="mt-1 text-xs text-zinc-500">From accounts.betterseqta.org</dd>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]">
              <dt class="text-sm font-medium text-zinc-400">Reserved Clients</dt>
              <dd v-if="accountsData.reservedClients?.error" class="mt-2 text-sm text-amber-400">
                {{ accountsData.reservedClients.error }}
              </dd>
              <dd v-else class="mt-2 text-3xl font-bold text-white">
                {{ accountsData.reservedClients?.count ?? '—' }}
              </dd>
              <dd class="mt-1 text-xs text-zinc-500">DesQTA client instances</dd>
            </div>
            <div
              v-if="accountsUsersData.total != null"
              class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]"
            >
              <dt class="text-sm font-medium text-zinc-400">Admins</dt>
              <dd class="mt-2 text-3xl font-bold text-white">{{ accountsUsersData.adminCount ?? '—' }}</dd>
              <dd class="mt-1 text-xs text-zinc-500">From full user export</dd>
            </div>
            <div
              v-if="accountsUsersData.topDomains?.length"
              class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02]"
            >
              <dt class="text-sm font-medium text-zinc-400">Top Domain</dt>
              <dd class="mt-2 text-xl font-bold text-white truncate" :title="accountsUsersData.topDomains[0]?.domain">
                {{ accountsUsersData.topDomains[0]?.domain ?? '—' }}
              </dd>
              <dd class="mt-1 text-xs text-zinc-500">{{ accountsUsersData.topDomains[0]?.count ?? 0 }} users</dd>
            </div>
          </div>

          <!-- Signups over time & email domains -->
          <div v-if="accountsUsersLoading" class="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-12">
            <div class="text-zinc-400">Loading user analytics...</div>
          </div>
          <div v-else-if="!accountsUsersData.error" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 class="mb-4 text-lg font-semibold text-white">User Signups Over Time</h4>
              <div v-if="!signupsChartData.length" class="flex min-h-[300px] items-center justify-center text-zinc-500">
                No signup data
              </div>
              <div v-else class="space-y-6">
                <div>
                  <p class="mb-2 text-sm text-zinc-400">Daily signups</p>
                  <AreaChart
                    :data="signupsChartData"
                    :chart-config="signupsChartConfig"
                    container-class="min-h-[240px]"
                  />
                </div>
                <div>
                  <p class="mb-2 text-sm text-zinc-400">Cumulative users</p>
                  <AreaChart
                    :data="signupsChartData"
                    :chart-config="cumulativeChartConfig"
                    container-class="min-h-[240px]"
                  />
                </div>
              </div>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 class="mb-4 text-lg font-semibold text-white">Most Used Email Domains</h4>
              <div v-if="!accountsUsersData.topDomains?.length" class="flex min-h-[200px] items-center justify-center text-zinc-500">
                No domain data
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="d in accountsUsersData.topDomains"
                  :key="d.domain"
                  class="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3"
                >
                  <span class="font-mono text-sm text-white">{{ d.domain }}</span>
                  <span class="ml-4 shrink-0 text-zinc-400">{{ d.count }} users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-if="accountsData.users?.error || accountsData.reservedClients?.error" class="mt-4 text-sm text-zinc-500">
          Set <code class="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">ACCOUNTS_API_KEY</code> in env to enable. Use the same API key as in Admin → API Keys.
        </p>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import AreaChart from '~/components/charts/AreaChart.vue';

definePageMeta({
  middleware: ['admin'],
});

const selectedPeriod = ref<number | 'all'>(30);
const usageLoading = ref(true);
const themeLoading = ref(true);
const questionnaireLoading = ref(true);
const accountsLoading = ref(true);
const accountsUsersLoading = ref(true);
const themeData = ref<any>({ summary: {}, byCategory: [], topByDownloads: [] });
const questionnaireData = ref<any>({ summary: {}, questions: [] });
const accountsData = ref<any>({ users: {}, reservedClients: {} });
const accountsUsersData = ref<any>({
  error: null,
  total: null,
  signupsOverTime: [],
  topDomains: [],
  adminCount: null,
});
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

const usageChartConfig = {
  total_sessions: { label: 'Sessions', color: '#a78bfa' },
};
const signedInChartConfig = {
  signed_in_sessions: { label: 'Cloud Signed-in', color: '#34d399' },
  anonymous_sessions: { label: 'Anonymous', color: '#64748b' },
};
const signupsChartConfig = {
  daily_signups: { label: 'Daily Signups', color: '#34d399' },
};
const cumulativeChartConfig = {
  cumulative_signups: { label: 'Cumulative Users', color: '#60a5fa' },
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

const signupsChartData = computed(() =>
  (accountsUsersData.value.signupsOverTime || []).map((d: { timestamp: number; daily_signups: number; cumulative_signups: number }) => ({
    timestamp: d.timestamp,
    daily_signups: d.daily_signups,
    cumulative_signups: d.cumulative_signups,
  }))
);

async function loadThemeData() {
  themeLoading.value = true;
  try {
    themeData.value = await $fetch<any>('/api/analytics/themes');
  } catch {
    themeData.value = { summary: {}, byCategory: [], topByDownloads: [] };
  } finally {
    themeLoading.value = false;
  }
}

async function loadQuestionnaireData() {
  questionnaireLoading.value = true;
  try {
    const daysParam =
      selectedPeriod.value === 'all' ? 'all' : selectedPeriod.value;
    questionnaireData.value = await $fetch<any>(
      `/api/analytics/questionnaire?days=${daysParam}`
    );
  } catch {
    questionnaireData.value = { summary: {}, questions: [] };
  } finally {
    questionnaireLoading.value = false;
  }
}

async function loadAccountsData() {
  accountsLoading.value = true;
  try {
    accountsData.value = await $fetch<any>('/api/analytics/accounts');
  } catch {
    accountsData.value = { users: {}, reservedClients: {} };
  } finally {
    accountsLoading.value = false;
  }
}

async function loadAccountsUsersData() {
  accountsUsersLoading.value = true;
  try {
    const daysParam =
      selectedPeriod.value === 'all' ? 'all' : selectedPeriod.value;
    accountsUsersData.value = await $fetch<any>(
      `/api/analytics/accounts/users?days=${daysParam}`
    );
  } catch {
    accountsUsersData.value = {
      error: 'Failed to load',
      total: null,
      signupsOverTime: [],
      topDomains: [],
      adminCount: null,
    };
  } finally {
    accountsUsersLoading.value = false;
  }
}

async function loadUsageData() {
  usageLoading.value = true;
  try {
    const daysParam =
      selectedPeriod.value === 'all' ? 'all' : selectedPeriod.value;
    const data = await $fetch<any>(`/api/analytics/usage?days=${daysParam}`);
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

function loadTimeFilteredData() {
  loadUsageData();
  loadQuestionnaireData();
  loadAccountsUsersData();
}

watch(selectedPeriod, () => {
  loadTimeFilteredData();
});

onMounted(() => {
  loadUsageData();
  loadThemeData();
  loadQuestionnaireData();
  loadAccountsData();
  loadAccountsUsersData();
});
</script>
