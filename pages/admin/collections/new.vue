<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-4xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Create Collection</h2>
          <p class="mt-2 text-lg text-zinc-400">Create a new theme collection</p>
        </div>
        <NuxtLink to="/admin/collections" class="flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 transition-all hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
          </svg>
          Back
        </NuxtLink>
      </div>

      <div class="space-y-8">
        <!-- Basic Info -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h3 class="text-lg font-semibold text-white mb-6">Basic Information</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Collection Name *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Dark Mode Essentials"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="A collection of the best dark themes..."
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="form.featured"
                type="checkbox"
                id="featured"
                class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-green-500"
              />
              <label for="featured" class="text-sm font-medium text-zinc-300 cursor-pointer">Featured Collection</label>
            </div>
          </div>
        </div>

        <!-- Cover Image -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h3 class="text-lg font-semibold text-white mb-4">Cover Image</h3>
          <div class="flex items-center gap-4">
            <div v-if="coverImagePreview" class="relative group h-32 w-48 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
              <img :src="coverImagePreview" alt="Cover" class="h-full w-full object-cover" />
              <button @click="form.cover_image = ''; coverImagePreview = ''" class="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <div v-else class="h-32 w-48 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" @change="handleCoverImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span class="text-xs">Upload Cover</span>
            </div>
          </div>
        </div>

        <!-- Theme Selection -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h3 class="text-lg font-semibold text-white mb-4">Select Themes</h3>
          <div class="mb-4">
            <input
              v-model="themeSearch"
              type="text"
              placeholder="Search themes..."
              class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div class="space-y-4">
            <div v-if="selectedThemes.length > 0">
              <label class="block text-sm font-medium text-zinc-400 mb-2">Selected Themes ({{ selectedThemes.length }})</label>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="theme in selectedThemes"
                  :key="theme.id"
                  class="flex items-center gap-2 bg-zinc-800 rounded px-3 py-1.5"
                >
                  <span class="text-sm text-white">{{ theme.name }}</span>
                  <button
                    @click="removeTheme(theme.id)"
                    class="text-red-400 hover:text-red-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-2">Available Themes</label>
              <div class="max-h-64 overflow-y-auto space-y-2">
                <div
                  v-for="theme in filteredThemes"
                  :key="theme.id"
                  @click="toggleTheme(theme)"
                  class="flex items-center gap-3 p-3 bg-zinc-800 rounded hover:bg-zinc-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="isThemeSelected(theme.id)"
                    @change="toggleTheme(theme)"
                    class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-green-500 focus:ring-green-500"
                  />
                  <img
                    v-if="theme.preview?.thumbnail"
                    :src="theme.preview.thumbnail"
                    :alt="theme.name"
                    class="h-10 w-16 object-cover rounded border border-zinc-700"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-white">{{ theme.name }}</p>
                    <p class="text-xs text-zinc-400">{{ theme.author }}</p>
                  </div>
                </div>
                <div v-if="filteredThemes.length === 0" class="text-center py-4 text-zinc-500 text-sm">
                  No themes found
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <NuxtLink to="/admin/collections" class="rounded-md bg-zinc-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 transition-colors">
            Cancel
          </NuxtLink>
          <button
            @click="saveCollection"
            :disabled="!form.name || selectedThemes.length === 0 || saving"
            class="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {{ saving ? 'Saving...' : 'Create Collection' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"]
});

const router = useRouter();

const form = ref({
  name: '',
  description: '',
  featured: false,
  cover_image: ''
});

const coverImagePreview = ref('');
const themeSearch = ref('');
const selectedThemes = ref<any[]>([]);
const saving = ref(false);

const { data: themesData } = await useFetch<any>('/api/themes', {
  query: { limit: '1000' } // Get all themes
});

const allThemes = computed(() => {
  const themes = themesData.value?.data?.themes || [];
  // Filter to only approved themes (public API already does this, but extra safety)
  return themes.filter((t: any) => t.status === 'approved');
});

const filteredThemes = computed(() => {
  let themes = allThemes.value.filter((t: any) => !isThemeSelected(t.id));
  if (themeSearch.value) {
    const query = themeSearch.value.toLowerCase();
    themes = themes.filter((t: any) =>
      t.name.toLowerCase().includes(query) ||
      t.author.toLowerCase().includes(query)
    );
  }
  return themes;
});

function isThemeSelected(id: string) {
  return selectedThemes.value.some(t => t.id === id);
}

function toggleTheme(theme: any) {
  const index = selectedThemes.value.findIndex(t => t.id === theme.id);
  if (index >= 0) {
    selectedThemes.value.splice(index, 1);
  } else {
    selectedThemes.value.push(theme);
  }
}

function removeTheme(id: string) {
  selectedThemes.value = selectedThemes.value.filter(t => t.id !== id);
}

async function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response: any = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.url) {
      form.value.cover_image = response.url;
      coverImagePreview.value = response.url;
    }
  } catch (error) {
    console.error('Image upload failed', error);
    alert('Failed to upload image');
  } finally {
    input.value = '';
  }
}

async function saveCollection() {
  if (!form.value.name || selectedThemes.value.length === 0) return;

  saving.value = true;
  try {
    await $fetch('/api/admin/collections', {
      method: 'POST',
      body: {
        name: form.value.name,
        description: form.value.description,
        featured: form.value.featured,
        theme_ids: selectedThemes.value.map(t => t.id),
        cover_image: form.value.cover_image
      }
    });
    router.push('/admin/collections');
  } catch (e: any) {
    alert('Failed to create collection: ' + (e.data?.error?.message || e.message || 'Unknown error'));
  } finally {
    saving.value = false;
  }
}
</script>
