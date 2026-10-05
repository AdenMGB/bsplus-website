<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex flex-col gap-6 mb-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">CSS Backgrounds</h2>
          <p class="mt-2 text-lg text-zinc-400">
            Upload images for the random theme background API. Images are stored in R2 as WebP.
          </p>
        </div>
        <NuxtLink
          to="/admin"
          class="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:scale-105 hover:bg-zinc-800"
        >
          Back to dashboard
        </NuxtLink>
      </div>

      <div class="mb-10 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-6">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-cyan-400">Public CSS URL</h3>
        <p class="mt-2 text-sm text-zinc-400">
          Use this stable URL in CustomCSS. Each request serves a random uploaded background.
        </p>
        <code class="mt-4 block break-all rounded-lg bg-black/40 px-4 py-3 text-sm text-cyan-200 ring-1 ring-cyan-500/30">
          {{ publicCssUrl }}
        </code>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600/20 px-4 py-2 text-sm font-medium text-cyan-300 ring-1 ring-cyan-500/30 transition-all duration-200 hover:scale-105 hover:bg-cyan-600/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          @click="copyPublicUrl"
        >
          Copy URL
        </button>
      </div>

      <div class="mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Upload background</h3>
        <form class="flex flex-col gap-4 sm:flex-row sm:items-end" @submit.prevent="upload">
          <div class="flex-1">
            <label class="block text-sm font-medium text-zinc-400 mb-2">Image file</label>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-500"
              @change="onFileChange"
            />
            <p class="mt-2 text-xs text-zinc-500">JPEG, PNG, WebP, etc. — converted and compressed to WebP on upload (max 12MB).</p>
          </div>
          <button
            type="submit"
            :disabled="!selectedFile || uploading"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <svg v-if="uploading" class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ uploading ? 'Uploading…' : 'Upload' }}
          </button>
        </form>
        <p v-if="uploadError" class="mt-4 text-sm text-red-400">{{ uploadError }}</p>
      </div>

      <div v-if="pending" class="flex items-center gap-2 text-zinc-500">
        <svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading backgrounds…
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="bg in backgrounds"
          :key="bg.id"
          class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-200 hover:border-zinc-700"
        >
          <div class="aspect-video bg-zinc-950">
            <img
              :src="bg.preview_url"
              :alt="bg.original_filename || 'Background'"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="p-4">
            <p class="truncate text-sm font-medium text-white">
              {{ bg.original_filename || bg.id }}
            </p>
            <p class="mt-1 text-xs text-zinc-500">
              {{ bg.width }}×{{ bg.height }} · {{ formatBytes(bg.byte_size) }}
            </p>
            <button
              type="button"
              class="mt-4 text-sm font-medium text-red-400 transition-colors hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded-md px-1"
              @click="removeBackground(bg.id)"
            >
              Delete
            </button>
          </div>
        </div>
        <div
          v-if="!backgrounds.length"
          class="col-span-full rounded-2xl border border-dashed border-zinc-700 py-16 text-center text-zinc-500"
        >
          No backgrounds yet. Upload at least one image for the public API to respond.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
});

const requestUrl = useRequestURL();

const { data, pending, refresh } = await useFetch<{
  data?: { public_url_path?: string; backgrounds?: BackgroundItem[] };
}>('/api/admin/backgrounds');

const backgrounds = computed(() => data.value?.data?.backgrounds ?? []);

const publicCssUrl = computed(() => {
  const path = data.value?.data?.public_url_path ?? '/api/background.webp';
  return `${requestUrl.origin}${path}`;
});

interface BackgroundItem {
  id: string;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  preview_url: string;
}

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const uploadError = ref('');

function onFileChange(event: Event) {
  uploadError.value = '';
  const input = event.target as HTMLInputElement;
  selectedFile.value = input.files?.[0] ?? null;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function copyPublicUrl() {
  try {
    await navigator.clipboard.writeText(publicCssUrl.value);
  } catch {
    alert(publicCssUrl.value);
  }
}

async function upload() {
  if (!selectedFile.value) return;
  uploading.value = true;
  uploadError.value = '';
  try {
    const body = new FormData();
    body.append('file', selectedFile.value);
    await $fetch('/api/admin/backgrounds', { method: 'POST', body });
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    await refresh();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string; message?: string }; message?: string };
    uploadError.value =
      err?.data?.statusMessage ?? err?.data?.message ?? err?.message ?? 'Upload failed';
  } finally {
    uploading.value = false;
  }
}

async function removeBackground(id: string) {
  if (!confirm('Delete this background? It will be removed from R2 and the random pool.')) return;
  try {
    await $fetch(`/api/admin/backgrounds/${id}`, { method: 'DELETE' });
    await refresh();
  } catch {
    alert('Failed to delete background');
  }
}
</script>
