<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Collections</h2>
          <p class="mt-2 text-lg text-zinc-400">Manage theme collections</p>
        </div>
        <NuxtLink to="/admin/collections/new" class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Collection
        </NuxtLink>
      </div>

      <!-- Collections Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="collection in collections"
          :key="collection.id"
          class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
        >
          <div class="aspect-video bg-zinc-900 relative">
            <img
              v-if="collection.cover_image_url"
              :src="collection.cover_image_url"
              :alt="collection.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-zinc-700">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <span v-if="collection.featured" class="absolute top-2 right-2 inline-flex items-center rounded-md bg-blue-500/10 text-blue-400 ring-blue-500/20 px-2 py-1 text-xs font-medium ring-1 ring-inset">
              Featured
            </span>
          </div>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-white mb-2">{{ collection.name }}</h3>
            <p class="text-zinc-400 text-sm mb-4 line-clamp-2">{{ collection.description || 'No description' }}</p>
            <div class="flex items-center justify-between">
              <span class="text-zinc-500 text-sm">{{ collection.theme_count || 0 }} themes</span>
              <div class="flex gap-2">
                <NuxtLink :to="`/admin/collections/${collection.id}`" class="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">Edit</NuxtLink>
                <button
                  @click="deleteCollection(collection.id)"
                  class="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!collections || collections.length === 0" class="col-span-full text-center py-12 text-zinc-500 italic">
          No collections found. Create your first collection!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"]
});

const { data: collectionsData, refresh } = await useFetch<any>('/api/admin/collections');

const collections = computed(() => collectionsData.value?.data?.collections || []);

async function deleteCollection(id: string) {
  if (!confirm('Are you sure you want to delete this collection?')) return;
  try {
    await $fetch(`/api/admin/collections/${id}`, {
      method: 'DELETE'
    });
    await refresh();
  } catch (e) {
    alert('Failed to delete collection');
  }
}
</script>
