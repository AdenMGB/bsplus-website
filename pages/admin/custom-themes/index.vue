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
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Custom Themes</h2>
          <p class="mt-2 text-lg text-zinc-400">
            Review and moderate user-uploaded themes (separate from the official marketplace)
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          :disabled="pending"
          @click="refresh()"
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

      <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div class="rounded-2xl border border-amber-500/20 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm text-zinc-400">Pending review</dt>
          <dd class="mt-2 text-3xl font-bold text-amber-400">{{ pendingCount }}</dd>
        </div>
        <div class="rounded-2xl border border-emerald-500/20 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm text-zinc-400">Approved</dt>
          <dd class="mt-2 text-3xl font-bold text-emerald-400">{{ approvedCount }}</dd>
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm text-zinc-400">Total submissions</dt>
          <dd class="mt-2 text-3xl font-bold text-white">{{ pagination.total }}</dd>
        </div>
      </div>

      <div class="mb-6 flex flex-wrap items-center gap-4">
        <div class="min-w-[220px] flex-1">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search name, description, author..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          v-model="typeFilter"
          class="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white transition-colors duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          @change="applyFilters"
        >
          <option value="">All types</option>
          <option value="betterseqta">BetterSEQTA</option>
          <option value="desqta">DesQTA</option>
        </select>
        <button
          type="button"
          class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-green-500"
          @click="applyFilters"
        >
          Apply
        </button>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-500"
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
                <th scope="col" class="px-6 py-3 font-semibold">Preview</th>
                <th scope="col" class="px-6 py-3 font-semibold">Theme</th>
                <th scope="col" class="px-6 py-3 font-semibold">Submitter</th>
                <th scope="col" class="px-6 py-3 font-semibold">Type</th>
                <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                <th scope="col" class="px-6 py-3 font-semibold">Submitted</th>
                <th scope="col" class="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr
                v-for="theme in themes"
                :key="theme.id"
                class="transition-colors duration-200 hover:bg-zinc-800/50"
              >
                <td class="px-6 py-4">
                  <img
                    v-if="theme.preview?.thumbnail || theme.coverImage"
                    :src="theme.preview?.thumbnail || theme.coverImage"
                    :alt="theme.name"
                    class="h-12 w-16 rounded border border-zinc-700 object-cover"
                  />
                  <div
                    v-else
                    class="flex h-12 w-16 items-center justify-center rounded border border-zinc-700 bg-zinc-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="h-6 w-6 text-zinc-600"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="max-w-xs font-medium text-white">{{ theme.name }}</div>
                  <div class="mt-1 max-w-xs truncate text-xs text-zinc-500">{{ theme.description }}</div>
                  <div class="mt-1 font-mono text-xs text-zinc-600">{{ theme.id }}</div>
                </td>
                <td class="px-6 py-4 text-zinc-400">
                  <div class="text-white">{{ theme.author }}</div>
                </td>
                <td class="px-6 py-4">
                  <span :class="typeBadgeClass(theme.theme_type)">
                    {{ theme.theme_type === 'betterseqta' ? 'BetterSEQTA' : 'DesQTA' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="statusBadgeClass(theme.status)">
                    {{ theme.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-zinc-400">
                  {{ formatDate(theme.created_at) }}
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <NuxtLink
                    :to="`/admin/custom-themes/${theme.id}`"
                    class="mr-3 font-medium text-indigo-400 transition-colors duration-200 hover:text-indigo-300"
                  >
                    Review
                  </NuxtLink>
                  <button
                    v-if="theme.status === 'pending'"
                    type="button"
                    class="mr-3 font-medium text-green-400 transition-colors duration-200 hover:text-green-300"
                    :disabled="actingId === theme.id"
                    @click="approveTheme(theme.id)"
                  >
                    Approve
                  </button>
                  <button
                    v-if="theme.status === 'pending'"
                    type="button"
                    class="font-medium text-red-400 transition-colors duration-200 hover:text-red-300"
                    :disabled="actingId === theme.id"
                    @click="rejectTheme(theme.id)"
                  >
                    Reject
                  </button>
                </td>
              </tr>
              <tr v-if="pending">
                <td colspan="7" class="px-6 py-12 text-center text-zinc-500">Loading submissions...</td>
              </tr>
              <tr v-else-if="!themes.length">
                <td colspan="7" class="px-6 py-12 text-center italic text-zinc-500">
                  No custom theme submissions match these filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="pagination.total_pages > 1"
          class="flex items-center justify-between border-t border-zinc-800 px-6 py-4"
        >
          <div class="text-sm text-zinc-400">
            Page {{ pagination.page }} of {{ pagination.total_pages }} ({{ pagination.total }} total)
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:border-zinc-500 disabled:opacity-50"
              :disabled="pagination.page <= 1"
              @click="loadPage(pagination.page - 1)"
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:border-zinc-500 disabled:opacity-50"
              :disabled="pagination.page >= pagination.total_pages"
              @click="loadPage(pagination.page + 1)"
            >
              Next
            </button>
          </div>
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
  title: 'Custom Themes — Admin',
});

interface CustomThemeItem {
  id: string;
  name: string;
  description: string;
  author: string;
  status: string;
  theme_type: string;
  created_at: number;
  coverImage?: string;
  preview?: { thumbnail?: string };
}

const searchQuery = ref('');
const statusFilter = ref('pending');
const typeFilter = ref('');
const appliedSearch = ref('');
const appliedStatus = ref('pending');
const appliedType = ref('');
const currentPage = ref(1);
const actingId = ref<string | null>(null);

const { data, pending, refresh } = await useFetch<any>('/api/admin/custom-themes', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 20,
    status: appliedStatus.value || undefined,
    type: appliedType.value || undefined,
    search: appliedSearch.value || undefined,
    include_counts: '1',
  })),
});

const themes = computed<CustomThemeItem[]>(() => data.value?.data?.themes ?? []);
const pagination = computed(
  () =>
    data.value?.data?.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 1,
    }
);

const pendingCount = computed(() => data.value?.data?.counts?.pending ?? 0);
const approvedCount = computed(() => data.value?.data?.counts?.approved ?? 0);

const hasActiveFilters = computed(
  () => !!(appliedSearch.value || appliedStatus.value || appliedType.value)
);

function applyFilters() {
  appliedSearch.value = searchQuery.value.trim();
  appliedStatus.value = statusFilter.value;
  appliedType.value = typeFilter.value;
  currentPage.value = 1;
  refresh();
}

function clearFilters() {
  searchQuery.value = '';
  statusFilter.value = '';
  typeFilter.value = '';
  appliedSearch.value = '';
  appliedStatus.value = '';
  appliedType.value = '';
  currentPage.value = 1;
  refresh();
}

function loadPage(page: number) {
  if (page < 1 || page > pagination.value.total_pages) return;
  currentPage.value = page;
  refresh();
}

async function approveTheme(id: string) {
  if (!confirm('Approve this custom theme for public distribution?')) return;
  actingId.value = id;
  try {
    await $fetch(`/api/admin/custom-themes/${id}/approve`, { method: 'POST', body: {} });
    await refresh();
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to approve theme');
  } finally {
    actingId.value = null;
  }
}

async function rejectTheme(id: string) {
  const reason = prompt('Rejection reason (shown to the submitter):');
  if (!reason?.trim()) return;
  actingId.value = id;
  try {
    await $fetch(`/api/admin/custom-themes/${id}/reject`, {
      method: 'POST',
      body: { reason: reason.trim() },
    });
    await refresh();
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to reject theme');
  } finally {
    actingId.value = null;
  }
}

function formatDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };
  return `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${map[status] || map.pending}`;
}

function typeBadgeClass(type: string) {
  return type === 'betterseqta'
    ? 'inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20'
    : 'inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20';
}
</script>
