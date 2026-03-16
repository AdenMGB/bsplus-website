<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <NuxtLink to="/admin" class="text-sm font-semibold leading-6 text-zinc-400 hover:text-white mb-4 inline-block transition-colors duration-200">
            &larr; Back to Dashboard
          </NuxtLink>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">News</h2>
          <p class="mt-2 text-lg text-zinc-400">Manage news posts</p>
        </div>
        <NuxtLink to="/admin/news/create" class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Post
        </NuxtLink>
      </div>

      <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
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
                <tr v-for="post in posts" :key="post.id" class="hover:bg-zinc-800/50 transition-colors">
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
                        post.published ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300',
                        'font-medium transition-colors mr-4'
                      ]"
                    >
                      {{ post.published ? 'Unpublish' : 'Publish' }}
                    </button>
                    <NuxtLink :to="`/admin/news/edit/${post.slug}`" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors mr-4">Edit</NuxtLink>
                    <button @click="deletePost(post.id)" class="text-red-400 hover:text-red-300 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
                <tr v-if="!posts?.length">
                  <td colspan="5" class="px-6 py-12 text-center text-zinc-500 italic">No posts found.</td>
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
definePageMeta({
  middleware: ['admin'],
});

const { data: posts, refresh } = await useFetch<any[]>('/api/news?admin=true');

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function togglePublish(post: any) {
  try {
    const result = await $fetch<{ success: boolean; published: boolean }>(`/api/news/publish?slug=${post.slug}`, {
      method: 'PATCH',
      body: { published: !post.published },
    });
    if (posts.value) {
      const index = posts.value.findIndex((p) => p.id === post.id);
      if (index !== -1) {
        posts.value[index].published = result.published ? 1 : 0;
      }
    }
  } catch {
    alert('Failed to toggle publish status');
  }
}

async function deletePost(id: number) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    await $fetch(`/api/news/${id}`, { method: 'DELETE' });
    await refresh();
  } catch {
    alert('Failed to delete post');
  }
}
</script>
