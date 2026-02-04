<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Upload Theme</h2>
          <p class="mt-2 text-lg text-zinc-400">Upload a new theme to the marketplace</p>
        </div>
        <NuxtLink to="/admin/themes" class="flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 transition-all hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
          </svg>
          Back
        </NuxtLink>
      </div>

      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Upload Zone -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h3 class="text-lg font-semibold text-white mb-4">Theme Folder</h3>
          <div
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            :class="[
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
              isDragging ? 'border-green-500 bg-green-500/10' : 'border-zinc-700 bg-zinc-900/30'
            ]"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".zip"
              @change="handleFileSelect"
              class="hidden"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-zinc-500 mx-auto mb-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5m0 0l-4.5-4.5m4.5 4.5l4.5-4.5" />
            </svg>
            <p class="text-white mb-2">Drag and drop your theme ZIP file here</p>
            <p class="text-zinc-400 text-sm mb-4">or</p>
            <button
              @click="fileInput?.click()"
              class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105"
            >
              Browse Files
            </button>
            <p class="text-zinc-500 text-xs mt-4">
              ZIP must contain: theme-manifest.json, styles/ directory, and preview.png (optional)
            </p>
          </div>

          <div v-if="selectedFile" class="mt-4 p-4 bg-zinc-800 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white font-medium">{{ selectedFile.name }}</p>
                <p class="text-zinc-400 text-sm">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button
                @click="selectedFile = null"
                class="text-red-400 hover:text-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Manifest Preview -->
        <div v-if="manifestPreview" class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h3 class="text-lg font-semibold text-white mb-4">Manifest Preview</h3>
          
          <div v-if="manifestPreview.validation" class="mb-6">
            <div v-if="manifestPreview.validation.valid" class="flex items-center gap-2 text-green-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
              Theme structure is valid
            </div>
            <div v-if="manifestPreview.validation.errors?.length" class="text-red-400 mb-2">
              <p class="font-medium mb-1">Errors:</p>
              <ul class="list-disc list-inside text-sm">
                <li v-for="error in manifestPreview.validation.errors" :key="error">{{ error }}</li>
              </ul>
            </div>
            <div v-if="manifestPreview.validation.warnings?.length" class="text-yellow-400">
              <p class="font-medium mb-1">Warnings:</p>
              <ul class="list-disc list-inside text-sm">
                <li v-for="warning in manifestPreview.validation.warnings" :key="warning">{{ warning }}</li>
              </ul>
            </div>
          </div>

          <div v-if="manifestPreview.manifest" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                <p class="text-white">{{ manifestPreview.manifest.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1">Version</label>
                <p class="text-white">{{ manifestPreview.manifest.version }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1">Author</label>
                <p class="text-white">{{ manifestPreview.manifest.author }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1">License</label>
                <p class="text-white">{{ manifestPreview.manifest.license || 'MIT' }}</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Description</label>
              <p class="text-white">{{ manifestPreview.manifest.description }}</p>
            </div>
            <div v-if="manifestPreview.structure" class="mt-4">
              <label class="block text-sm font-medium text-zinc-400 mb-2">File Structure</label>
              <div class="bg-zinc-950 rounded p-4 font-mono text-sm">
                <div v-if="manifestPreview.structure.has_manifest" class="text-green-400">✓ theme-manifest.json</div>
                <div v-if="manifestPreview.structure.has_styles" class="text-green-400">✓ styles/ directory</div>
                <div v-if="manifestPreview.structure.has_preview" class="text-green-400">✓ preview image</div>
                <div v-if="manifestPreview.structure.style_files?.length">
                  <div class="text-zinc-400 mt-2">Style files:</div>
                  <div v-for="file in manifestPreview.structure.style_files" :key="file" class="text-zinc-500 ml-4">- {{ file }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Button -->
        <div v-if="selectedFile && manifestPreview?.validation?.valid" class="flex justify-end">
          <button
            @click="uploadTheme"
            :disabled="uploading"
            class="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {{ uploading ? 'Uploading...' : 'Upload Theme' }}
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

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const manifestPreview = ref<any>(null);
const uploading = ref(false);

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]);
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0]);
  }
}

async function handleFile(file: File) {
  if (!file.name.endsWith('.zip')) {
    alert('Please upload a ZIP file');
    return;
  }
  
  selectedFile.value = file;
  
  // Preview manifest
  try {
    const formData = new FormData();
    formData.append('theme_zip', file);
    
    const response = await $fetch<any>('/api/admin/themes/manifest-preview', {
      method: 'POST',
      body: formData
    });
    
    if (response.success) {
      manifestPreview.value = response.data;
    } else {
      alert('Failed to preview manifest: ' + (response.error?.message || 'Unknown error'));
    }
  } catch (e: any) {
    alert('Failed to preview manifest: ' + (e.data?.error?.message || e.message || 'Unknown error'));
  }
}

async function uploadTheme() {
  if (!selectedFile.value) return;
  
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('theme_zip', selectedFile.value);
    
    const response = await $fetch<any>('/api/admin/themes', {
      method: 'POST',
      body: formData
    });
    
    if (response.success) {
      alert('Theme uploaded successfully!');
      navigateTo(`/admin/themes/${response.data.theme.id}`);
    } else {
      alert('Failed to upload theme: ' + (response.error?.message || 'Unknown error'));
    }
  } catch (e: any) {
    alert('Failed to upload theme: ' + (e.data?.error?.message || e.message || 'Unknown error'));
  } finally {
    uploading.value = false;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
</script>
