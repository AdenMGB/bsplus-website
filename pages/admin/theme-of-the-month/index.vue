<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Theme of the Month</h2>
          <p class="mt-2 text-lg text-zinc-400">Highlight one theme per calendar month</p>
        </div>
        <NuxtLink
          to="/admin/theme-of-the-month/create"
          class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Entry
        </NuxtLink>
      </div>

      <div v-if="current" class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">Current Month</h3>
        <div class="bg-zinc-900/50 border border-green-500/20 rounded-xl overflow-hidden flex flex-col md:flex-row">
          <div v-if="current.cover_image" class="md:w-64 h-48 md:h-auto bg-zinc-800 shrink-0">
            <img :src="current.cover_image" :alt="current.title" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 p-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-medium text-green-400 uppercase">Active · {{ formatMonth(current.month) }}</span>
            </div>
            <h4 class="text-white font-semibold text-xl mb-2">{{ current.title }}</h4>
            <p class="text-sm text-zinc-400 line-clamp-3 mb-4">{{ current.description }}</p>
            <div class="flex items-center gap-4">
              <NuxtLink :to="`/admin/theme-of-the-month/edit/${current.id}`" class="text-sm font-medium text-indigo-400 hover:text-indigo-300">Edit</NuxtLink>
              <span v-if="current.theme" class="text-xs text-zinc-500">Linked: {{ current.theme.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="upcoming.length > 0" class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">Upcoming</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="entry in upcoming" :key="entry.id" class="bg-zinc-900/50 border border-blue-500/20 rounded-xl overflow-hidden">
            <div v-if="entry.cover_image" class="aspect-video bg-zinc-800">
              <img :src="entry.cover_image" :alt="entry.title" class="w-full h-full object-cover" />
            </div>
            <div class="p-4">
              <div class="text-xs font-medium text-blue-400 uppercase mb-1">{{ formatMonth(entry.month) }}</div>
              <h4 class="text-white font-medium mb-1 truncate">{{ entry.title }}</h4>
              <p class="text-xs text-zinc-500 line-clamp-2 mb-3">{{ entry.description }}</p>
              <NuxtLink :to="`/admin/theme-of-the-month/edit/${entry.id}`" class="text-xs font-medium text-indigo-400 hover:text-indigo-300">Edit</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 class="text-base font-semibold leading-7 text-white">All Entries</h3>
          <NuxtLink to="/admin" class="text-sm font-medium text-zinc-400 hover:text-white">Back to admin</NuxtLink>
        </div>
        <div class="flow-root">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-zinc-900/50 text-white">
                <tr>
                  <th scope="col" class="px-6 py-3 font-semibold">Month</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Title</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Linked Theme</th>
                  <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                  <th scope="col" class="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr v-for="entry in (entries ?? [])" :key="entry.id" class="hover:bg-zinc-800/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-white">{{ formatMonth(entry.month) }}</td>
                  <td class="px-6 py-4">
                    <div class="text-white max-w-md truncate">{{ entry.title }}</div>
                  </td>
                  <td class="px-6 py-4 text-zinc-400">
                    <span v-if="entry.theme">{{ entry.theme.name }}</span>
                    <span v-else class="italic text-zinc-600">No theme linked</span>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="[
                      statusClass(entry.month),
                      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                    ]">
                      {{ statusLabel(entry.month) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <NuxtLink :to="`/admin/theme-of-the-month/edit/${entry.id}`" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors mr-4">Edit</NuxtLink>
                    <button @click="deleteEntry(entry.id)" class="text-red-400 hover:text-red-300 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
                <tr v-if="!entries || entries.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-zinc-500 italic">No entries yet. Create one to get started.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

definePageMeta({
  middleware: ["admin"]
});

interface ThemeOfTheMonthEntry {
  id: string;
  month: string;
  title: string;
  description: string;
  cover_image: string | null;
  theme_id: string | null;
  theme: { id: string; name: string; slug: string } | null;
  created_at: number;
  updated_at: number;
}

const { data: entries, refresh } = await useFetch<ThemeOfTheMonthEntry[]>('/api/theme-of-the-month');

function currentMonthKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

const current = computed(() => entries.value?.find(e => e.month === currentMonthKey()) || null);

const upcoming = computed(() => {
  const key = currentMonthKey();
  return (entries.value ?? []).filter(e => e.month > key).sort((a, b) => a.month.localeCompare(b.month));
});

function statusLabel(month: string): string {
  const key = currentMonthKey();
  if (month === key) return 'Current';
  if (month > key) return 'Upcoming';
  return 'Past';
}

function statusClass(month: string): string {
  const key = currentMonthKey();
  if (month === key) return 'bg-green-500/10 text-green-400 ring-green-500/20';
  if (month > key) return 'bg-blue-500/10 text-blue-400 ring-blue-500/20';
  return 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20';
}

function formatMonth(month: string): string {
  const [yyyy, mm] = month.split('-');
  const date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

async function deleteEntry(id: string) {
  if (!confirm('Delete this theme of the month entry? This also removes its cover image.')) return;
  try {
    await $fetch(`/api/theme-of-the-month/${id}`, { method: 'DELETE' });
    await refresh();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete entry');
  }
}
</script>
