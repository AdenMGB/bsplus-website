<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h2>
          <p class="mt-2 text-lg text-zinc-400">Welcome back, Admin.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
        <!-- Stats Cards -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <dt class="text-sm font-medium leading-6 text-zinc-400">Total Posts</dt>
          <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.news?.total || 0 }}</dd>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <dt class="text-sm font-medium leading-6 text-zinc-400">Published</dt>
          <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.news?.published || 0 }}</dd>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <dt class="text-sm font-medium leading-6 text-zinc-400">Extension Sessions</dt>
          <div class="flex items-baseline gap-2">
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.sessions?.total || 0 }}</dd>
            <button @click="flushSessions" class="text-xs text-green-500 hover:text-green-400 font-medium flex items-center gap-1" title="Force update from buffer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
          <p v-if="stats.sessions?.buffer" class="text-xs text-zinc-500 mt-2">
            Next update: {{ getTimeUntil(stats.sessions.buffer.nextFlushEstimate) }}
            ({{ stats.sessions.buffer.totalBuffered }} buffered)
          </p>
          <NuxtLink to="/admin/analytics" class="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 hover:border-green-600/40 px-3 py-1.5 text-xs font-medium text-green-400 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            View Charts
          </NuxtLink>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <dt class="text-sm font-medium leading-6 text-zinc-400">DesQTA Sessions</dt>
          <div class="flex items-baseline gap-2">
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.desqtaSessions?.total || 0 }}</dd>
            <button @click="flushSessions" class="text-xs text-green-500 hover:text-green-400 font-medium flex items-center gap-1" title="Force update from buffer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
          <p v-if="stats.desqtaSessions?.buffer" class="text-xs text-zinc-500 mt-2">
            Next update: {{ getTimeUntil(stats.desqtaSessions.buffer.nextFlushEstimate) }}
            ({{ stats.desqtaSessions.buffer.totalBuffered }} buffered)
          </p>
          <NuxtLink to="/admin/analytics" class="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 hover:border-blue-600/40 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            View Charts
          </NuxtLink>
        </div>
      </div>

      <!-- News Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">News Management</h3>
          <NuxtLink to="/admin/news/create" class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Post
          </NuxtLink>
        </div>

        <!-- Recent Posts Table -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 class="text-base font-semibold leading-7 text-white">Recent Posts</h3>
            <NuxtLink to="/admin/news" class="text-sm font-medium text-green-500 hover:text-green-400">View all</NuxtLink>
          </div>
          <div class="flow-root">
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-zinc-900/50 text-white">
                  <tr>
                    <th scope="col" class="px-6 py-3 font-semibold">Title</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Author</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Date</th>
                    <th scope="col" class="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800">
                  <tr v-for="post in recentPosts" :key="post.id" class="hover:bg-zinc-800/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-white">{{ post.title }}</td>
                    <td class="px-6 py-4 text-zinc-400">{{ post.author_name }}</td>
                    <td class="px-6 py-4">
                      <span :class="[
                        post.published ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                      ]">
                        {{ post.published ? 'Published' : 'Draft' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-zinc-400">{{ formatDate(post.created_at) }}</td>
                    <td class="px-6 py-4 text-right">
                      <button 
                        @click="togglePublish(post)" 
                        :class="[
                          post.published 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-green-400 hover:text-green-300',
                          'font-medium transition-colors mr-4'
                        ]"
                      >
                        {{ post.published ? 'Unpublish' : 'Publish' }}
                      </button>
                      <NuxtLink :to="`/admin/news/edit/${post.slug}`" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors mr-4">Edit</NuxtLink>
                      <button @click="deletePost(post.id)" class="text-red-400 hover:text-red-300 font-medium transition-colors">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="!recentPosts || recentPosts.length === 0">
                     <td colspan="5" class="px-6 py-8 text-center text-zinc-500 italic">No posts found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
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

const { data: posts } = await useFetch<any[]>('/api/news?admin=true');
const { data: analyticsStats } = await useFetch<any>('/api/analytics/stats');

const recentPosts = computed(() => {
  return posts.value ? posts.value.slice(0, 5) : [];
});

const stats = computed(() => {
  if (!posts.value) return { news: { total: 0, published: 0 }, sessions: { total: 0 }, desqtaSessions: { total: 0 } };
  
  // Merge basic post stats with analytics stats
  return {
    news: {
      total: posts.value.length,
      published: posts.value.filter(p => p.published).length
    },
    // Use optional chaining for analytics data as it might be null initially
    sessions: analyticsStats.value?.sessions || { total: 0 },
    desqtaSessions: analyticsStats.value?.desqtaSessions || { total: 0 }
  };
});

function getTimeUntil(timestamp: number) {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'Any moment';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '< 1 min';
  if (minutes > 60) return `~${Math.floor(minutes / 60)} hrs`;
  return `~${minutes} mins`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function togglePublish(post: any) {
  try {
    const result = await $fetch<{ success: boolean; published: boolean }>(`/api/news/publish?slug=${post.slug}`, { 
      method: 'PATCH',
      body: { published: !post.published }
    });
    // Update local state
    if (posts.value) {
      const index = posts.value.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts.value[index].published = result.published ? 1 : 0;
      }
    }
  } catch (e) {
    alert('Failed to toggle publish status');
  }
}

async function deletePost(id: number) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    await $fetch(`/api/news/${id}`, { method: 'DELETE' });
    // Refresh data
    const { data } = await useFetch('/api/news?admin=true');
    posts.value = data.value as any[];
  } catch (e) {
    alert('Failed to delete post');
  }
}

async function flushSessions() {
  try {
    await $fetch('/api/analytics/flush', { method: 'POST' });
    refreshNuxtData(); // Refreshes all useFetch data
  } catch (e) {
    alert('Failed to flush sessions');
  }
}
</script>

