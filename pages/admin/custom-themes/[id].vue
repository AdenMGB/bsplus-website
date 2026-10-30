<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-5xl px-6 lg:px-8">
      <div class="mb-8">
        <NuxtLink
          to="/admin/custom-themes"
          class="mb-4 inline-block text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-white"
        >
          &larr; Back to Custom Themes
        </NuxtLink>

        <div v-if="pending" class="py-16 text-center text-zinc-500">Loading submission...</div>

        <template v-else-if="theme">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 flex-1">
              <div class="mb-3 flex flex-wrap items-center gap-2">
                <span :class="statusBadgeClass(theme.status)">{{ theme.status }}</span>
                <span :class="typeBadgeClass(theme.theme_type)">
                  {{ theme.theme_type === 'betterseqta' ? 'BetterSEQTA' : 'DesQTA' }}
                </span>
              </div>
              <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{{ theme.name }}</h2>
              <p class="mt-2 font-mono text-sm text-zinc-500">{{ theme.id }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a
                :href="`/api/admin/custom-themes/${themeId}/download`"
                class="inline-flex items-center gap-2 rounded-md bg-zinc-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-zinc-600"
                title="Download theme files from storage for review"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 3.5a.75.75 0 001.09 0l4.25-3.5a.75.75 0 00-1.09-1.03l-2.955 2.369V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                Download
              </a>
              <a
                v-if="theme.status === 'approved' && theme.theme_type === 'betterseqta'"
                :href="theme.theme_json_url"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 shadow-sm transition-all hover:scale-105 hover:border-zinc-500"
              >
                View theme.json
              </a>
              <button
                type="button"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-blue-500"
                @click="showEditModal = true"
              >
                Edit
              </button>
              <button
                v-if="theme.status === 'pending'"
                type="button"
                class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-green-500 disabled:opacity-50"
                :disabled="acting"
                @click="approve"
              >
                Approve
              </button>
              <button
                v-if="theme.status === 'pending'"
                type="button"
                class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-red-500 disabled:opacity-50"
                :disabled="acting"
                @click="showRejectModal = true"
              >
                Reject
              </button>
            </div>
          </div>

          <div class="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">Description</h3>
            <p class="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-100">
              {{ theme.description }}
            </p>
          </div>

          <div
            v-if="theme.submission_notes"
            class="mt-6 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6"
          >
            <h3 class="text-sm font-semibold uppercase tracking-wider text-sky-400">
              Submitter notes
            </h3>
            <p class="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-100">
              {{ theme.submission_notes }}
            </p>
          </div>

          <div
            v-if="theme.status === 'rejected' && theme.rejection_reason"
            class="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
          >
            <h3 class="text-sm font-semibold uppercase tracking-wider text-red-400">
              Rejection reason
            </h3>
            <p class="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-100">
              {{ theme.rejection_reason }}
            </p>
            <p v-if="theme.reviewed_at" class="mt-3 text-sm text-zinc-500">
              Reviewed {{ formatDate(theme.reviewed_at) }}
            </p>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Submitter
              </h3>
              <dl class="mt-4 space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Display name</dt>
                  <dd class="text-right text-zinc-200">{{ submitter?.author || theme.author }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Accounts user ID</dt>
                  <dd class="max-w-[60%] truncate text-right font-mono text-xs text-zinc-400">
                    {{ submitter?.author_id }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Version</dt>
                  <dd class="text-right text-zinc-200">{{ theme.version }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">License</dt>
                  <dd class="text-right text-zinc-200">{{ theme.license || 'MIT' }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Submitted</dt>
                  <dd class="text-right text-zinc-200">{{ formatDate(theme.created_at) }}</dd>
                </div>
                <div v-if="theme.published_at" class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Published</dt>
                  <dd class="text-right text-zinc-200">{{ formatDate(theme.published_at) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Downloads</dt>
                  <dd class="text-right text-zinc-200">{{ theme.download_count ?? 0 }}</dd>
                </div>
              </dl>
            </div>

            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Preview
              </h3>
              <div class="mt-4">
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  :alt="theme.name"
                  class="max-h-48 w-full rounded-lg border border-zinc-700 object-contain"
                />
                <p v-else class="text-sm italic text-zinc-500">No preview image</p>
              </div>
              <div v-if="theme.theme_json_url" class="mt-4">
                <dt class="text-xs font-medium text-zinc-500">Theme JSON URL</dt>
                <dd class="mt-1 break-all font-mono text-xs text-zinc-300">
                  {{ theme.theme_json_url }}
                </dd>
              </div>
            </div>
          </div>

          <div
            v-if="theme.preview?.screenshots?.length"
            class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Screenshots
            </h3>
            <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <img
                v-for="(shot, idx) in theme.preview.screenshots"
                :key="idx"
                :src="shot"
                :alt="`Screenshot ${Number(idx) + 1}`"
                class="h-40 w-full rounded-lg border border-zinc-700 object-cover"
              />
            </div>
          </div>

          <div
            v-if="files.length"
            class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Stored files
            </h3>
            <ul class="mt-4 divide-y divide-zinc-800">
              <li
                v-for="file in files"
                :key="file.id"
                class="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div class="min-w-0">
                  <div class="truncate font-mono text-zinc-200">{{ file.file_path }}</div>
                  <div class="text-xs text-zinc-500">
                    {{ file.file_type }} · {{ formatFileSize(file.file_size) }}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Update theme files
              </h3>
              <a
                :href="`/api/admin/custom-themes/${themeId}/download`"
                class="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Download package
              </a>
            </div>
            <p class="mb-6 text-sm text-zinc-400">
              <template v-if="theme.theme_type === 'betterseqta'">
                Upload a full ZIP or individual files — for example only
                <code class="text-zinc-500">theme.json</code>, or only banner/marquee images.
              </template>
              <template v-else>
                Upload a full DesQTA ZIP or individual files; partial uploads merge with the stored
                package.
              </template>
            </p>
            <div
              :class="[
                'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                isDragging ? 'border-green-500 bg-green-500/10' : 'border-zinc-700 bg-zinc-900/30',
              ]"
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
            >
              <input
                ref="fileInput"
                type="file"
                accept=".zip,.json,.webp,.css,.png,.jpg,.jpeg"
                class="hidden"
                @change="handleFileSelect"
              />
              <p class="mb-2 text-white">Drag and drop a theme ZIP or a single file</p>
              <button
                type="button"
                class="mt-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-green-500"
                @click="fileInput?.click()"
              >
                Browse files
              </button>
            </div>
            <div v-if="selectedUpdateFile" class="mt-4 rounded-lg bg-zinc-800 p-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="font-medium text-white">{{ selectedUpdateFile.name }}</p>
                  <p class="text-sm text-zinc-400">{{ formatFileSize(selectedUpdateFile.size) }}</p>
                </div>
                <button
                  type="button"
                  class="text-red-400 hover:text-red-300"
                  @click="
                    selectedUpdateFile = null;
                    updateManifestPreview = null;
                  "
                >
                  Remove
                </button>
              </div>
            </div>
            <div
              v-if="
                theme.theme_type === 'betterseqta' &&
                updateManifestPreview?.manifest?.id &&
                updateManifestPreview.manifest.id !== themeId
              "
              class="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
            >
              <p class="text-sm text-amber-400">
                Theme ID in upload ({{ updateManifestPreview.manifest.id }}) does not match this
                theme ({{ themeId }}).
              </p>
            </div>
            <div v-if="selectedUpdateFile && canSubmitThemeUpdate" class="mt-6 flex justify-end">
              <button
                type="button"
                class="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
                :disabled="updatingFiles"
                @click="updateThemeFiles"
              >
                {{ updatingFiles ? 'Updating…' : 'Update theme files' }}
              </button>
            </div>
          </div>
        </template>

        <div v-else class="py-16 text-center text-zinc-500">Submission not found.</div>
      </div>

      <!-- Edit modal -->
      <div
        v-if="showEditModal && theme"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      >
        <div class="my-8 w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 class="mb-6 text-lg font-semibold text-white">Edit community theme</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-400">Name *</label>
              <input
                v-model="editForm.name"
                type="text"
                class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-400">Description *</label>
              <textarea
                v-model="editForm.description"
                rows="3"
                class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-400">Slug</label>
              <input
                v-model="editForm.slug"
                type="text"
                class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-zinc-400">Author</label>
                <input
                  v-model="editForm.author"
                  type="text"
                  class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-zinc-400">Version</label>
                <input
                  v-model="editForm.version"
                  type="text"
                  class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-zinc-400">License</label>
                <input
                  v-model="editForm.license"
                  type="text"
                  class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-zinc-400">Category</label>
                <select
                  v-model="editForm.category"
                  class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Uncategorized</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="colorful">Colorful</option>
                  <option value="minimal">Minimal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-zinc-400">Compatibility (min)</label>
                <input
                  v-model="editForm.compatibilityMin"
                  type="text"
                  class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-zinc-400">Compatibility (max)</label>
                <input
                  v-model="editForm.compatibilityMax"
                  type="text"
                  class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-400">Tags (comma-separated)</label>
              <input
                v-model="editForm.tagsInput"
                type="text"
                class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-400">Submitter notes (admin)</label>
              <textarea
                v-model="editForm.submissionNotes"
                rows="2"
                class="block w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div class="flex justify-end gap-2 border-t border-zinc-800 pt-4">
              <button
                type="button"
                class="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
                @click="showEditModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                :disabled="saving || !editForm.name || !editForm.description"
                @click="saveTheme"
              >
                {{ saving ? 'Saving…' : 'Save changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reject modal -->
      <div
        v-if="showRejectModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        @click.self="showRejectModal = false"
      >
        <div class="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-white">Reject submission</h3>
          <p class="mt-2 text-sm text-zinc-400">
            This reason will be visible to the submitter so they can fix and re-upload.
          </p>
          <textarea
            v-model="rejectReason"
            rows="4"
            class="mt-4 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Explain why this theme cannot be approved..."
          />
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500"
              @click="showRejectModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              :disabled="acting || !rejectReason.trim()"
              @click="reject"
            >
              Reject theme
            </button>
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

const route = useRoute();
const themeId = route.params.id as string;

useHead({
  title: 'Review Custom Theme — Admin',
});

interface ThemeFile {
  id: string;
  file_path: string;
  file_type: string;
  file_size: number;
}

const showRejectModal = ref(false);
const showEditModal = ref(false);
const rejectReason = ref('');
const acting = ref(false);
const saving = ref(false);

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const selectedUpdateFile = ref<File | null>(null);
const updateManifestPreview = ref<any>(null);
const updatingFiles = ref(false);

const editForm = ref({
  name: '',
  slug: '',
  description: '',
  author: '',
  version: '',
  license: '',
  category: '',
  compatibilityMin: '',
  compatibilityMax: '',
  tagsInput: '',
  submissionNotes: '',
});

const canSubmitThemeUpdate = computed(() => {
  const prev = updateManifestPreview.value as {
    validation?: { valid?: boolean };
    manifest?: { id?: string };
    imageOnly?: boolean;
  } | null;
  if (!selectedUpdateFile.value || !prev?.validation?.valid) return false;
  if (theme.value?.theme_type === 'betterseqta') {
    if (prev.manifest?.id && prev.manifest.id !== themeId) return false;
    if (prev.imageOnly) return true;
    if (prev.manifest?.id === themeId) return true;
    return false;
  }
  return true;
});

watch(showEditModal, (isOpen) => {
  if (!isOpen || !theme.value) return;
  const t = theme.value as Record<string, unknown>;
  editForm.value = {
    name: String(t.name || ''),
    slug: String(t.slug || ''),
    description: String(t.description || ''),
    author: String(t.author || ''),
    version: String(t.version || ''),
    license: String(t.license || 'MIT'),
    category: String(t.category || ''),
    compatibilityMin: String((t.compatibility as { min?: string })?.min ?? ''),
    compatibilityMax: String((t.compatibility as { max?: string })?.max ?? ''),
    tagsInput: Array.isArray(t.tags) ? (t.tags as string[]).join(', ') : '',
    submissionNotes: String(t.submission_notes || ''),
  };
});

const { data, pending, refresh } = await useFetch<any>(
  () => `/api/admin/custom-themes/${themeId}`,
  { watch: [() => themeId] }
);

const theme = computed(() => data.value?.data?.theme ?? null);
const files = computed<ThemeFile[]>(() => data.value?.data?.files ?? []);
const submitter = computed(() => data.value?.data?.submitter ?? null);

const previewUrl = computed(() => {
  const t = theme.value;
  if (!t) return null;
  return t.preview?.thumbnail || t.coverImage || t.cover_image_url || null;
});

async function approve() {
  if (!confirm('Approve this theme for public distribution?')) return;
  acting.value = true;
  try {
    await $fetch(`/api/admin/custom-themes/${themeId}/approve`, {
      method: 'POST',
      body: {},
    });
    await refresh();
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to approve');
  } finally {
    acting.value = false;
  }
}

async function reject() {
  if (!rejectReason.value.trim()) return;
  acting.value = true;
  try {
    await $fetch(`/api/admin/custom-themes/${themeId}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value.trim() },
    });
    showRejectModal.value = false;
    rejectReason.value = '';
    await refresh();
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to reject');
  } finally {
    acting.value = false;
  }
}

function formatDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };
  return `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${map[status] || map.pending}`;
}

function typeBadgeClass(type: string) {
  return type === 'betterseqta'
    ? 'inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20'
    : 'inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20';
}

async function saveTheme() {
  if (!editForm.value.name || !editForm.value.description) return;
  saving.value = true;
  try {
    const tags = editForm.value.tagsInput
      ? editForm.value.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    await $fetch(`/api/admin/custom-themes/${themeId}`, {
      method: 'PUT',
      body: {
        name: editForm.value.name,
        slug: editForm.value.slug.trim(),
        description: editForm.value.description,
        author: editForm.value.author,
        version: editForm.value.version,
        license: editForm.value.license,
        category: editForm.value.category || null,
        tags,
        compatibility_min: editForm.value.compatibilityMin.trim() || null,
        compatibility_max: editForm.value.compatibilityMax.trim() || null,
        submission_notes: editForm.value.submissionNotes.trim() || null,
      },
    });
    showEditModal.value = false;
    await refresh();
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to update theme');
  } finally {
    saving.value = false;
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) handleUpdateFile(files[0]!);
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files?.length) handleUpdateFile(target.files[0]!);
}

async function handleUpdateFile(file: File) {
  if (!/\.(zip|json|webp|css|png|jpg|jpeg)$/i.test(file.name)) {
    alert('Please upload a .zip, .json, .webp, .css, or image file');
    return;
  }
  selectedUpdateFile.value = file;
  updateManifestPreview.value = null;
  try {
    const formData = new FormData();
    if (file.name.toLowerCase().endsWith('.zip')) {
      formData.append('theme_zip', file);
    } else {
      formData.append(file.name, file);
    }
    const response = await $fetch<any>('/api/admin/themes/manifest-preview', {
      method: 'POST',
      body: formData,
    });
    if (response.success) {
      updateManifestPreview.value = response.data;
      return;
    }
    if (theme.value?.theme_type === 'betterseqta' && /\.webp$/i.test(file.name)) {
      updateManifestPreview.value = {
        theme_type: 'betterseqta',
        validation: { valid: true, warnings: [], errors: [] },
        manifest: null,
        imageOnly: true,
      };
      return;
    }
    if (theme.value?.theme_type !== 'betterseqta') {
      updateManifestPreview.value = {
        theme_type: 'desqta',
        validation: {
          valid: true,
          warnings: ['Partial upload — merged with the existing package on save.'],
          errors: [],
        },
        manifest: null,
        partialUpload: true,
      };
      return;
    }
    alert('Failed to preview: ' + (response.error?.message || 'Unknown error'));
    selectedUpdateFile.value = null;
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to preview upload');
    selectedUpdateFile.value = null;
  }
}

async function updateThemeFiles() {
  if (!selectedUpdateFile.value) return;
  updatingFiles.value = true;
  try {
    const formData = new FormData();
    const file = selectedUpdateFile.value;
    if (file.name.toLowerCase().endsWith('.zip')) {
      formData.append('theme_zip', file);
    } else {
      formData.append(file.name, file);
    }
    const response = await $fetch<any>(`/api/admin/custom-themes/${themeId}/update-files`, {
      method: 'POST',
      body: formData,
    });
    if (response.success) {
      selectedUpdateFile.value = null;
      updateManifestPreview.value = null;
      await refresh();
    } else {
      alert(response.error?.message || 'Failed to update theme files');
    }
  } catch (e: any) {
    alert(e?.data?.message || e?.statusMessage || 'Failed to update theme files');
  } finally {
    updatingFiles.value = false;
  }
}
</script>
