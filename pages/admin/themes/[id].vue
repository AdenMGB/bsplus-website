<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <NuxtLink to="/admin/themes" class="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
          </svg>
          Back to Themes
        </NuxtLink>
        <div class="flex gap-2">
          <button
            @click="showEditModal = true"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:scale-105"
          >
            Edit
          </button>
          <button
            v-if="theme?.status === 'pending'"
            @click="showApproveModal = true"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105"
          >
            Approve
          </button>
          <button
            v-if="theme?.status === 'pending'"
            @click="showRejectModal = true"
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-all hover:scale-105"
          >
            Reject
          </button>
          <button
            @click="showDeleteModal = true"
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-all hover:scale-105"
          >
            Delete
          </button>
        </div>
      </div>

      <div v-if="theme" class="space-y-8">
        <!-- Header -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <div class="flex items-start gap-6">
            <img
              v-if="theme.preview?.thumbnail"
              :src="theme.preview.thumbnail"
              :alt="theme.name"
              class="h-32 w-48 object-cover rounded-lg border border-zinc-700"
            />
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-3xl font-bold text-white">{{ theme.name }}</h1>
                <span :class="[
                  theme.status === 'approved' ? 'bg-green-500/10 text-green-400 ring-green-500/20' :
                  theme.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20' :
                  'bg-red-500/10 text-red-400 ring-red-500/20',
                  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                ]">
                  {{ theme.status }}
                </span>
                <span v-if="theme.featured" class="inline-flex items-center rounded-md bg-blue-500/10 text-blue-400 ring-blue-500/20 px-2 py-1 text-xs font-medium ring-1 ring-inset">
                  Featured
                </span>
              </div>
              <p class="text-zinc-400 mb-4">{{ theme.description }}</p>
              <div class="flex flex-wrap gap-4 text-sm">
                <div>
                  <span class="text-zinc-500">Author:</span>
                  <span class="text-white ml-2">{{ theme.author }}</span>
                </div>
                <div>
                  <span class="text-zinc-500">Version:</span>
                  <span class="text-white ml-2">{{ theme.version }}</span>
                </div>
                <div>
                  <span class="text-zinc-500">Category:</span>
                  <span class="text-white ml-2">{{ theme.category || 'Uncategorized' }}</span>
                </div>
                <div>
                  <span class="text-zinc-500">License:</span>
                  <span class="text-white ml-2">{{ theme.license }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Downloads</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ theme.download_count || 0 }}</dd>
          </div>
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Favorites</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ theme.favorite_count || 0 }}</dd>
          </div>
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <dt class="text-sm font-medium leading-6 text-zinc-400">Rating</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">
              {{ theme.rating_average?.toFixed(1) || '0.0' }}
              <span class="text-lg text-zinc-500">({{ theme.rating_count || 0 }})</span>
            </dd>
          </div>
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <dt class="text-sm font-medium leading-6 text-zinc-400">File Size</dt>
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ formatFileSize(theme.file_size || 0) }}</dd>
          </div>
        </div>

        <!-- Screenshots -->
        <div v-if="theme.preview?.screenshots?.length" class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h2 class="text-xl font-semibold text-white mb-4">Screenshots</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <img
              v-for="(screenshot, idx) in theme.preview.screenshots"
              :key="idx"
              :src="screenshot"
              :alt="`Screenshot ${Number(idx) + 1}`"
              class="w-full h-48 object-cover rounded-lg border border-zinc-700"
            />
          </div>
        </div>

        <!-- Metadata -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h2 class="text-xl font-semibold text-white mb-4">Theme Information</h2>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Compatibility</label>
              <p class="text-white">{{ theme.compatibility?.min }} - {{ theme.compatibility?.max || 'Latest' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Created</label>
              <p class="text-white">{{ formatDate(theme.created_at) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Published</label>
              <p class="text-white">{{ theme.published_at ? formatDate(theme.published_at) : 'Not published' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Checksum</label>
              <p class="text-white font-mono text-xs">{{ theme.checksum }}</p>
            </div>
          </div>
          <div v-if="theme.tags?.length" class="mt-4">
            <label class="block text-sm font-medium text-zinc-400 mb-2">Tags</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in theme.tags"
                :key="tag"
                class="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Update Files Section -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h2 class="text-xl font-semibold text-white mb-4">Update Theme Files</h2>
          <p class="text-zinc-400 mb-6">Upload a new ZIP file to update the theme files. This will replace the existing ZIP, preview image, and screenshots.</p>
          
          <div
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            :class="[
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
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

          <div v-if="selectedUpdateFile" class="mt-4 p-4 bg-zinc-800 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white font-medium">{{ selectedUpdateFile.name }}</p>
                <p class="text-zinc-400 text-sm">{{ formatFileSize(selectedUpdateFile.size) }}</p>
              </div>
              <button
                @click="selectedUpdateFile = null; updateManifestPreview = null"
                class="text-red-400 hover:text-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Manifest Preview -->
          <div v-if="updateManifestPreview" class="mt-6 p-4 bg-zinc-800 rounded-lg">
            <h3 class="text-sm font-semibold text-white mb-3">Manifest Preview</h3>
            
            <div v-if="updateManifestPreview.validation" class="mb-4">
              <div v-if="updateManifestPreview.validation.valid" class="flex items-center gap-2 text-green-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
                Theme structure is valid
              </div>
              <div v-if="updateManifestPreview.validation.errors?.length" class="text-red-400 mb-2">
                <p class="font-medium mb-1">Errors:</p>
                <ul class="list-disc list-inside text-sm">
                  <li v-for="error in updateManifestPreview.validation.errors" :key="error">{{ error }}</li>
                </ul>
              </div>
              <div v-if="updateManifestPreview.validation.warnings?.length" class="text-yellow-400">
                <p class="font-medium mb-1">Warnings:</p>
                <ul class="list-disc list-inside text-sm">
                  <li v-for="warning in updateManifestPreview.validation.warnings" :key="warning">{{ warning }}</li>
                </ul>
              </div>
            </div>

            <div v-if="updateManifestPreview.manifest" class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-zinc-400">Name:</span>
                <span class="text-white ml-2">{{ updateManifestPreview.manifest.name }}</span>
              </div>
              <div>
                <span class="text-zinc-400">Version:</span>
                <span class="text-white ml-2">{{ updateManifestPreview.manifest.version }}</span>
              </div>
              <div>
                <span class="text-zinc-400">Author:</span>
                <span class="text-white ml-2">{{ updateManifestPreview.manifest.author }}</span>
              </div>
              <div>
                <span class="text-zinc-400">License:</span>
                <span class="text-white ml-2">{{ updateManifestPreview.manifest.license || 'MIT' }}</span>
              </div>
            </div>
          </div>

          <!-- Update Button -->
          <div v-if="selectedUpdateFile && updateManifestPreview?.validation?.valid" class="mt-6 flex justify-end">
            <button
              @click="updateThemeFiles"
              :disabled="updatingFiles"
              class="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              {{ updatingFiles ? 'Updating...' : 'Update Theme Files' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Approve Modal -->
      <div v-if="showApproveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-white mb-4">Approve Theme</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Notes (optional)</label>
              <textarea
                v-model="approveNotes"
                rows="3"
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Add any notes about this approval..."
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="markFeatured"
                type="checkbox"
                id="featured"
                class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-green-500"
              />
              <label for="featured" class="text-sm font-medium text-zinc-300 cursor-pointer">Mark as Featured</label>
            </div>
            <div class="flex gap-2 justify-end">
              <button
                @click="showApproveModal = false"
                class="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="approveTheme"
                class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reject Modal -->
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-white mb-4">Reject Theme</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Rejection Reason</label>
              <textarea
                v-model="rejectReason"
                rows="3"
                required
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Explain why this theme is being rejected..."
              />
            </div>
            <div class="flex gap-2 justify-end">
              <button
                @click="showRejectModal = false"
                class="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="rejectTheme"
                :disabled="!rejectReason"
                class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal && theme" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full my-8">
          <h3 class="text-lg font-semibold text-white mb-6">Edit Theme</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Name *</label>
              <input
                v-model="editForm.name"
                type="text"
                required
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Description *</label>
              <textarea
                v-model="editForm.description"
                rows="3"
                required
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Category</label>
              <select
                v-model="editForm.category"
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Uncategorized</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="colorful">Colorful</option>
                <option value="minimal">Minimal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1">Tags (comma-separated)</label>
              <input
                v-model="editForm.tagsInput"
                type="text"
                placeholder="gradient, warm, sunset"
                class="block w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p class="text-xs text-zinc-500 mt-1">Separate tags with commas</p>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="editForm.featured"
                type="checkbox"
                id="edit-featured"
                class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
              />
              <label for="edit-featured" class="text-sm font-medium text-zinc-300 cursor-pointer">Featured Theme</label>
            </div>
            <div class="flex gap-2 justify-end pt-4 border-t border-zinc-800">
              <button
                @click="showEditModal = false"
                class="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveTheme"
                :disabled="saving || !editForm.name || !editForm.description"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-white mb-4">Delete Theme</h3>
          <p class="text-zinc-400 mb-6">Are you sure you want to delete this theme? This action cannot be undone.</p>
          <div class="flex gap-2 justify-end">
            <button
              @click="showDeleteModal = false"
              class="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="deleteTheme"
              class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
            >
              Delete
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

const route = useRoute();
const router = useRouter();
const themeId = route.params.id as string;

// Fetch theme data - we'll get all themes and filter, or use public endpoint
const { data: themesData, refresh } = await useFetch<any>('/api/admin/themes');

const theme = computed(() => {
  if (!themesData.value?.data?.themes) return null;
  const found = themesData.value.data.themes.find((t: any) => t.id === themeId);
  if (found) {
    // Ensure preview structure is correct
    return {
      ...found,
      preview: {
        thumbnail: found.preview_thumbnail_url || found.preview?.thumbnail,
        screenshots: found.preview_screenshots ? (typeof found.preview_screenshots === 'string' ? JSON.parse(found.preview_screenshots) : found.preview_screenshots) : (found.preview?.screenshots || [])
      }
    };
  }
  return null;
});

const showApproveModal = ref(false);
const showRejectModal = ref(false);
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const approveNotes = ref('');
const markFeatured = ref(false);
const rejectReason = ref('');
const saving = ref(false);

// Update files state
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const selectedUpdateFile = ref<File | null>(null);
const updateManifestPreview = ref<any>(null);
const updatingFiles = ref(false);

const editForm = ref({
  name: '',
  description: '',
  category: '',
  tagsInput: '',
  featured: false
});

// Initialize edit form when edit modal opens
watch(showEditModal, (isOpen) => {
  if (isOpen && theme.value) {
    editForm.value = {
      name: theme.value.name || '',
      description: theme.value.description || '',
      category: theme.value.category || '',
      tagsInput: theme.value.tags?.join(', ') || '',
      featured: theme.value.featured || false
    };
  }
});

async function approveTheme() {
  try {
    await $fetch(`/api/admin/themes/${themeId}/approve`, {
      method: 'POST',
      body: { notes: approveNotes.value }
    });
    if (markFeatured.value) {
      await $fetch(`/api/admin/themes/${themeId}`, {
        method: 'PUT',
        body: { featured: true }
      });
    }
    showApproveModal.value = false;
    await refresh();
    router.push('/admin/themes');
  } catch (e) {
    alert('Failed to approve theme');
  }
}

async function rejectTheme() {
  if (!rejectReason.value) return;
  try {
    await $fetch(`/api/admin/themes/${themeId}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value }
    });
    showRejectModal.value = false;
    await refresh();
    router.push('/admin/themes');
  } catch (e) {
    alert('Failed to reject theme');
  }
}

async function saveTheme() {
  if (!editForm.value.name || !editForm.value.description) {
    alert('Name and description are required');
    return;
  }

  saving.value = true;
  try {
    // Parse tags from comma-separated string
    const tags = editForm.value.tagsInput
      ? editForm.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    await $fetch(`/api/admin/themes/${themeId}`, {
      method: 'PUT',
      body: {
        name: editForm.value.name,
        description: editForm.value.description,
        category: editForm.value.category || null,
        tags: tags,
        featured: editForm.value.featured
      }
    });
    
    showEditModal.value = false;
    await refresh();
  } catch (e: any) {
    alert('Failed to update theme: ' + (e.data?.error?.message || e.message || 'Unknown error'));
  } finally {
    saving.value = false;
  }
}

async function deleteTheme() {
  try {
    await $fetch(`/api/admin/themes/${themeId}`, {
      method: 'DELETE'
    });
    showDeleteModal.value = false;
    router.push('/admin/themes');
  } catch (e) {
    alert('Failed to delete theme');
  }
}

function formatDate(timestamp: number) {
  // Timestamp is already in milliseconds
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleUpdateFile(files[0]);
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleUpdateFile(target.files[0]);
  }
}

async function handleUpdateFile(file: File) {
  if (!file.name.endsWith('.zip')) {
    alert('Please upload a ZIP file');
    return;
  }
  
  selectedUpdateFile.value = file;
  
  // Preview manifest
  try {
    const formData = new FormData();
    formData.append('theme_zip', file);
    
    const response = await $fetch<any>('/api/admin/themes/manifest-preview', {
      method: 'POST',
      body: formData
    });
    
    if (response.success) {
      updateManifestPreview.value = response.data;
    } else {
      alert('Failed to preview manifest: ' + (response.error?.message || 'Unknown error'));
      selectedUpdateFile.value = null;
      updateManifestPreview.value = null;
    }
  } catch (e: any) {
    alert('Failed to preview manifest: ' + (e.data?.error?.message || e.message || 'Unknown error'));
    selectedUpdateFile.value = null;
    updateManifestPreview.value = null;
  }
}

async function updateThemeFiles() {
  if (!selectedUpdateFile.value) return;
  
  updatingFiles.value = true;
  try {
    const formData = new FormData();
    formData.append('theme_zip', selectedUpdateFile.value);
    
    const response = await $fetch<any>(`/api/admin/themes/${themeId}/update-files`, {
      method: 'POST',
      body: formData
    });
    
    if (response.success) {
      alert('Theme files updated successfully!');
      selectedUpdateFile.value = null;
      updateManifestPreview.value = null;
      await refresh();
    } else {
      alert('Failed to update theme files: ' + (response.error?.message || 'Unknown error'));
    }
  } catch (e: any) {
    alert('Failed to update theme files: ' + (e.data?.error?.message || e.message || 'Unknown error'));
  } finally {
    updatingFiles.value = false;
  }
}
</script>
