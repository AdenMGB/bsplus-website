<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <NuxtLink
            to="/admin"
            class="mb-4 inline-block text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-white"
          >
            &larr; Back to Dashboard
          </NuxtLink>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Extension Feedback</h2>
          <p class="mt-2 text-lg text-zinc-400">
            Triage BetterSEQTA+ bug reports, feature requests, and questions
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-600/10 px-4 py-2 text-sm font-medium text-amber-300 transition-all duration-200 hover:scale-105 hover:bg-amber-600/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50"
            :disabled="notifying"
            @click="notifyAdminsNow"
          >
            {{ notifying ? 'Sending digest...' : 'Send admin digest' }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            :disabled="pending"
            @click="refreshAll"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-5 w-5"
              :class="pending ? 'animate-spin' : ''"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm text-zinc-400">Open</dt>
          <dd class="mt-2 text-3xl font-bold text-white">{{ stats?.open ?? 0 }}</dd>
        </div>
        <div class="rounded-2xl border border-amber-500/20 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm text-zinc-400">New / received</dt>
          <dd class="mt-2 text-3xl font-bold text-amber-400">{{ stats?.received ?? 0 }}</dd>
        </div>
        <div class="rounded-2xl border border-sky-500/20 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm text-zinc-400">Awaiting reply</dt>
          <dd class="mt-2 text-3xl font-bold text-sky-400">{{ stats?.awaiting_reply ?? 0 }}</dd>
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm text-zinc-400">Last 7 days</dt>
          <dd class="mt-2 text-3xl font-bold text-white">{{ stats?.last_7_days ?? 0 }}</dd>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-wrap items-center gap-4">
        <div class="min-w-[220px] flex-1">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search subject or message..."
            class="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 transition-colors duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            @keyup.enter="applyFilters"
          />
        </div>
        <select
          v-model="statusFilter"
          class="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white transition-colors duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          @change="applyFilters"
        >
          <option value="">All statuses</option>
          <option v-for="status in STATUSES" :key="status" :value="status">
            {{ formatLabel(status) }}
          </option>
        </select>
        <select
          v-model="categoryFilter"
          class="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white transition-colors duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          @change="applyFilters"
        >
          <option value="">All categories</option>
          <option v-for="category in CATEGORIES" :key="category" :value="category">
            {{ formatLabel(category) }}
          </option>
        </select>
        <button
          type="button"
          class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-green-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          @click="applyFilters"
        >
          Apply
        </button>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:scale-105 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          @click="clearFilters"
        >
          Clear
        </button>
      </div>

      <div class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-zinc-900/50 text-white">
              <tr>
                <th scope="col" class="px-6 py-3 font-semibold">Feedback</th>
                <th scope="col" class="px-6 py-3 font-semibold">Category</th>
                <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                <th scope="col" class="px-6 py-3 font-semibold">Contact</th>
                <th scope="col" class="px-6 py-3 font-semibold">Submitted</th>
                <th scope="col" class="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr
                v-for="item in items"
                :key="item.id"
                class="transition-colors duration-200 hover:bg-zinc-800/50"
              >
                <td class="px-6 py-4">
                  <div class="max-w-md font-medium text-white truncate">
                    {{ item.subject || 'Untitled' }}
                  </div>
                  <div class="mt-1 max-w-md truncate text-xs text-zinc-500">
                    {{ item.message }}
                  </div>
                  <div class="mt-1 font-mono text-xs text-zinc-600">{{ item.id }}</div>
                </td>
                <td class="px-6 py-4">
                  <span :class="categoryBadgeClass(item.category)">
                    {{ formatLabel(item.category) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="statusBadgeClass(item.status)">
                    {{ formatLabel(item.status) }}
                  </span>
                  <div
                    v-if="item.admin_response"
                    class="mt-1 text-xs text-emerald-400"
                  >
                    Replied
                  </div>
                </td>
                <td class="px-6 py-4 text-zinc-400">
                  <template v-if="item.contact?.include && item.contact.email">
                    <div class="text-white">{{ item.contact.name || '—' }}</div>
                    <div class="text-xs">{{ item.contact.email }}</div>
                  </template>
                  <span v-else class="text-zinc-600">Anonymous</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-zinc-400">
                  {{ formatDate(item.created_at) }}
                  <div class="text-xs text-zinc-600">
                    v{{ item.extension?.version }} · {{ item.extension?.browser }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <NuxtLink
                    :to="`/admin/feedback/${item.id}`"
                    class="mr-3 font-medium text-indigo-400 transition-colors duration-200 hover:text-indigo-300"
                  >
                    Open
                  </NuxtLink>
                  <button
                    v-if="item.status === 'received'"
                    type="button"
                    class="mr-3 font-medium text-amber-400 transition-colors duration-200 hover:text-amber-300"
                    :disabled="updatingId === item.id"
                    @click="quickStatus(item, 'triaged')"
                  >
                    Triage
                  </button>
                  <button
                    v-if="item.status !== 'spam'"
                    type="button"
                    class="font-medium text-red-400 transition-colors duration-200 hover:text-red-300"
                    :disabled="updatingId === item.id"
                    @click="quickStatus(item, 'spam')"
                  >
                    Spam
                  </button>
                </td>
              </tr>
              <tr v-if="pending">
                <td colspan="6" class="px-6 py-12 text-center text-zinc-500">Loading feedback...</td>
              </tr>
              <tr v-else-if="!items.length">
                <td colspan="6" class="px-6 py-12 text-center italic text-zinc-500">
                  No feedback matches these filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="nextCursor"
          class="border-t border-zinc-800 px-6 py-4 text-center"
        >
          <button
            type="button"
            class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105 hover:border-zinc-500 disabled:opacity-50"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load more' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
});

useHead({
  title: 'Extension Feedback — Admin',
});

const STATUSES = [
  'received',
  'triaged',
  'in_progress',
  'resolved',
  'wontfix',
  'spam',
] as const;

const CATEGORIES = ['bug', 'feature', 'question', 'other'] as const;

interface FeedbackItem {
  id: string;
  subject: string | null;
  message: string;
  category: string;
  status: string;
  created_at: string;
  admin_response?: string | null;
  contact?: { include: boolean; name: string | null; email: string | null };
  extension?: { version: string; browser: string };
}

interface FeedbackListResponse {
  items: FeedbackItem[];
  next_cursor: string | null;
  limit: number;
}

interface FeedbackStats {
  total: number;
  open: number;
  received: number;
  last_7_days: number;
  awaiting_reply: number;
  by_status: Record<string, number>;
}

const searchQuery = ref('');
const statusFilter = ref('');
const categoryFilter = ref('');
const appliedSearch = ref('');
const appliedStatus = ref('');
const appliedCategory = ref('');
const cursor = ref<string | null>(null);
const items = ref<FeedbackItem[]>([]);
const nextCursor = ref<string | null>(null);
const pending = ref(true);
const loadingMore = ref(false);
const updatingId = ref<string | null>(null);
const notifying = ref(false);

const { data: stats, refresh: refreshStats } = await useFetch<FeedbackStats>(
  '/api/bsplus/feedback/stats',
  { lazy: true }
);

const hasActiveFilters = computed(
  () => !!(appliedSearch.value || appliedStatus.value || appliedCategory.value)
);

function buildQuery(extra: Record<string, string | undefined> = {}) {
  const query: Record<string, string> = { limit: '30', ...extra };
  if (appliedStatus.value) query.status = appliedStatus.value;
  if (appliedCategory.value) query.category = appliedCategory.value;
  if (appliedSearch.value) query.q = appliedSearch.value;
  return query;
}

async function fetchPage(append = false) {
  if (append) {
    loadingMore.value = true;
  } else {
    pending.value = true;
  }

  try {
    const query = buildQuery(
      append && nextCursor.value ? { cursor: nextCursor.value } : {}
    );
    const data = await $fetch<FeedbackListResponse>('/api/bsplus/feedback', { query });
    items.value = append ? [...items.value, ...data.items] : data.items;
    nextCursor.value = data.next_cursor;
  } catch (e: any) {
    alert(e?.data?.message || e?.message || 'Failed to load feedback');
  } finally {
    pending.value = false;
    loadingMore.value = false;
  }
}

function applyFilters() {
  appliedSearch.value = searchQuery.value.trim();
  appliedStatus.value = statusFilter.value;
  appliedCategory.value = categoryFilter.value;
  nextCursor.value = null;
  fetchPage(false);
}

function clearFilters() {
  searchQuery.value = '';
  statusFilter.value = '';
  categoryFilter.value = '';
  appliedSearch.value = '';
  appliedStatus.value = '';
  appliedCategory.value = '';
  nextCursor.value = null;
  fetchPage(false);
}

function loadMore() {
  if (!nextCursor.value || loadingMore.value) return;
  fetchPage(true);
}

async function refreshAll() {
  await Promise.all([fetchPage(false), refreshStats()]);
}

async function notifyAdminsNow() {
  notifying.value = true;
  try {
    const result = await $fetch<{
      notified: number;
      admins: number;
      skipped: boolean;
      reason?: string;
    }>('/api/bsplus/feedback/notify-admins', { method: 'POST' });

    if (result.skipped) {
      alert(result.reason || 'No digest sent');
    } else {
      alert(`Digest sent to ${result.admins} admin(s) covering ${result.notified} item(s).`);
    }
    await refreshStats();
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to send digest');
  } finally {
    notifying.value = false;
  }
}

async function quickStatus(item: FeedbackItem, status: string) {
  updatingId.value = item.id;
  try {
    await $fetch(`/api/bsplus/feedback/${item.id}`, {
      method: 'PATCH',
      body: { status },
    });
    item.status = status;
    await refreshStats();
  } catch (e: any) {
    alert(e?.data?.message || 'Failed to update status');
  } finally {
    updatingId.value = null;
  }
}

function formatLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    received: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    triaged: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    wontfix: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/20',
    spam: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };
  return `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${map[status] || map.received}`;
}

function categoryBadgeClass(category: string) {
  const map: Record<string, string> = {
    bug: 'bg-red-500/10 text-red-300 ring-red-500/20',
    feature: 'bg-purple-500/10 text-purple-300 ring-purple-500/20',
    question: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
    other: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/20',
  };
  return `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${map[category] || map.other}`;
}

await fetchPage(false);
</script>
