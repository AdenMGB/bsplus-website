<template>
  <div class="min-h-screen bg-zinc-950 flex flex-col">
    <header class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/theme-of-the-month" class="text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
          <h1 class="text-lg font-semibold text-white">Edit Theme of the Month</h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="remove"
            :disabled="loading || deleting"
            class="rounded-md bg-red-600/20 border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-600/30 disabled:opacity-50 transition-all"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            @click="save"
            :disabled="loading || deleting"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div v-if="loadingEntry" class="text-zinc-500 text-sm">Loading...</div>

      <template v-else-if="form">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-zinc-400">Month</label>
          <input
            v-model="form.month"
            type="month"
            class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <ThemeOfTheMonthThemePicker v-model="form.theme_id" :initial-theme="initialTheme" />

        <ThemeOfTheMonthAiCopyGenerator
          v-model:title="form.title"
          v-model:description="form.description"
          :theme-id="form.theme_id"
          :cover-image="form.cover_image"
        />

        <div class="space-y-2">
          <label class="block text-sm font-medium text-zinc-400">Title</label>
          <input
            v-model="form.title"
            type="text"
            class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-zinc-400">Description</label>
          <textarea
            v-model="form.description"
            rows="5"
            class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          ></textarea>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-zinc-400">Cover Image</label>
          <div class="flex items-center gap-4">
            <div v-if="form.cover_image" class="relative group h-32 w-48 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
              <img :src="form.cover_image" alt="Cover" class="h-full w-full object-cover" />
              <button @click="form.cover_image = ''" class="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: ["admin"],
  layout: false
});

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

interface FormState {
  month: string;
  title: string;
  description: string;
  cover_image: string;
  theme_id: string;
}

const form = ref<FormState | null>(null);
const initialTheme = ref<{ id: string; name: string; slug: string } | null>(null);
const loadingEntry = ref(true);
const loading = ref(false);
const deleting = ref(false);

onMounted(async () => {
  try {
    const data: any = await $fetch(`/api/theme-of-the-month/${id}`);
    form.value = {
      month: data.month,
      title: data.title,
      description: data.description,
      cover_image: data.cover_image || '',
      theme_id: data.theme_id || ''
    };
    initialTheme.value = data.theme || null;
  } catch (e: any) {
    alert(e.data?.message || 'Failed to load entry');
    router.push('/admin/theme-of-the-month');
  } finally {
    loadingEntry.value = false;
  }
});

async function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0 || !form.value) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response: any = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (response.url) form.value.cover_image = response.url;
  } catch (e) {
    console.error('Image upload failed', e);
    alert('Failed to upload image');
  } finally {
    input.value = '';
  }
}

async function save() {
  if (!form.value) return;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(form.value.month)) {
    alert('Please pick a valid month');
    return;
  }
  loading.value = true;
  try {
    await $fetch(`/api/theme-of-the-month/${id}`, {
      method: 'PUT',
      body: {
        month: form.value.month,
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        cover_image: form.value.cover_image || null,
        theme_id: form.value.theme_id || null
      }
    });
    router.push('/admin/theme-of-the-month');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to save changes');
  } finally {
    loading.value = false;
  }
}

async function remove() {
  if (!confirm('Delete this theme of the month entry? This also removes its cover image.')) return;
  deleting.value = true;
  try {
    await $fetch(`/api/theme-of-the-month/${id}`, { method: 'DELETE' });
    router.push('/admin/theme-of-the-month');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete entry');
  } finally {
    deleting.value = false;
  }
}
</script>
