<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Theme Management</h2>
          <p class="mt-2 text-lg text-zinc-400">Manage themes in the marketplace</p>
        </div>
        <NuxtLink to="/admin/themes/upload" class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Theme
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="mb-8 flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search themes..."
            class="block w-full rounded-md bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
        <select
          v-model="statusFilter"
          class="rounded-md bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          v-model="typeFilter"
          class="rounded-md bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
        >
          <option value="">All Types</option>
          <option value="desqta">DesQTA</option>
          <option value="betterseqta">BetterSEQTA</option>
        </select>
        <select
          v-model="categoryFilter"
          class="rounded-md bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
        >
          <option value="">All Categories</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="colorful">Colorful</option>
          <option value="minimal">Minimal</option>
          <option value="other">Other</option>
        </select>
        <select
          v-model="sortBy"
          class="rounded-md bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
        >
          <option value="created_at">Newest</option>
          <option value="updated_at">Recently Updated</option>
          <option value="download_count">Downloads</option>
          <option value="rating_average">Rating</option>
          <option value="name">Name</option>
        </select>
        <select
          v-model="sortOrder"
          class="rounded-md bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <!-- Themes Table -->
      <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div class="flow-root">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-zinc-900/50 text-white">
                <tr>
                  <th scope="col" class="px-6 py-3 font-semibold">Preview</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Theme</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Author</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Version</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Downloads</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Rating</th>
                  <th scope="col" class="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr v-for="theme in filteredThemes" :key="theme.id" class="hover:bg-zinc-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <img
                      v-if="theme.preview?.thumbnail"
                      :src="theme.preview.thumbnail"
                      :alt="theme.name"
                      class="h-12 w-16 object-cover rounded border border-zinc-700"
                    />
                    <div v-else class="h-12 w-16 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-zinc-600">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-white">{{ theme.name }}</div>
                    <div class="text-xs text-zinc-500 mt-1">{{ theme.category || 'Uncategorized' }}</div>
                  </td>
                  <td class="px-6 py-4 text-zinc-400">{{ theme.author }}</td>
                  <td class="px-6 py-4 text-zinc-400">{{ theme.version }}</td>
                  <td class="px-6 py-4">
                    <span :class="[
                      theme.status === 'approved' ? 'bg-green-500/10 text-green-400 ring-green-500/20' :
                      theme.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20' :
                      'bg-red-500/10 text-red-400 ring-red-500/20',
                      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                    ]">
                      {{ theme.status }}
                    </span>
                    <span v-if="theme.featured" class="ml-2 inline-flex items-center rounded-md bg-blue-500/10 text-blue-400 ring-blue-500/20 px-2 py-1 text-xs font-medium ring-1 ring-inset">
                      Featured
                    </span>
                    <span
                      :class="[
                        theme.theme_type === 'betterseqta' ? 'bg-purple-500/10 text-purple-400 ring-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
                        'ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                      ]"
                    >
                      {{ theme.theme_type === 'betterseqta' ? 'BetterSEQTA' : 'DesQTA' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-zinc-400">{{ theme.download_count || 0 }}</td>
                  <td class="px-6 py-4 text-zinc-400">
                    <div class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4 text-yellow-400">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>{{ theme.rating_average?.toFixed(1) || '0.0' }}</span>
                      <span class="text-zinc-500">({{ theme.rating_count || 0 }})</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <NuxtLink :to="`/admin/themes/${theme.id}`" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View</NuxtLink>
                      <button
                        v-if="theme.status === 'pending'"
                        @click="approveTheme(theme.id)"
                        class="text-green-400 hover:text-green-300 font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        v-if="theme.status === 'pending'"
                        @click="rejectTheme(theme.id)"
                        class="text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        @click="deleteTheme(theme.id)"
                        class="text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!themes || themes.length === 0">
                  <td colspan="8" class="px-6 py-8 text-center text-zinc-500 italic">No themes found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total_pages > 1" class="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
          <div class="text-sm text-zinc-400">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} themes
          </div>
          <div class="flex gap-2">
            <button
              @click="loadPage(pagination.page - 1)"
              :disabled="!pagination.has_prev"
              class="rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              @click="loadPage(pagination.page + 1)"
              :disabled="!pagination.has_next"
              class="rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  middleware: ["admin"]
});

const searchQuery = ref('');
const statusFilter = ref('');
const categoryFilter = ref('');
const typeFilter = ref('');
const sortBy = ref('created_at');
const sortOrder = ref('desc');
const currentPage = ref(1);

const { data: themesData, refresh } = await useFetch<any>('/api/admin/themes', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 20,
    type: typeFilter.value || undefined,
    status: statusFilter.value || undefined,
    category: categoryFilter.value || undefined,
    search: searchQuery.value || undefined,
    sort_by: sortBy.value,
    sort_order: sortOrder.value
  }))
});

const themes = computed(() => themesData.value?.data?.themes || []);
const pagination = computed(() => themesData.value?.data?.pagination || {
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 1,
  has_next: false,
  has_prev: false
});

const filteredThemes = computed(() => themes);

async function loadPage(page: number) {
  if (page < 1 || page > pagination.value.total_pages) return;
  currentPage.value = page;
  await refresh();
}

watch([searchQuery, statusFilter, categoryFilter, typeFilter, sortBy, sortOrder], () => {
  currentPage.value = 1;
});

async function approveTheme(id: string) {
  if (!confirm('Approve this theme?')) return;
  try {
    await $fetch(`/api/admin/themes/${id}/approve`, {
      method: 'POST',
      body: { notes: 'Approved via admin panel' }
    });
    await refresh();
  } catch (e) {
    alert('Failed to approve theme');
  }
}

async function rejectTheme(id: string) {
  const reason = prompt('Rejection reason:');
  if (!reason) return;
  try {
    await $fetch(`/api/admin/themes/${id}/reject`, {
      method: 'POST',
      body: { reason }
    });
    await refresh();
  } catch (e) {
    alert('Failed to reject theme');
  }
}

async function deleteTheme(id: string) {
  if (!confirm('Are you sure you want to delete this theme? This action cannot be undone.')) return;
  try {
    await $fetch(`/api/admin/themes/${id}`, {
      method: 'DELETE'
    });
    await refresh();
  } catch (e) {
    alert('Failed to delete theme');
  }
}
</script>
