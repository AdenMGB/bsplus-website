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
                v-if="theme.status === 'approved' && theme.theme_type === 'betterseqta'"
                :href="theme.theme_json_url"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-md bg-zinc-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-zinc-600"
              >
                View theme.json
              </a>
              <a
                v-if="theme.status === 'approved' && theme.zip_download_url"
                :href="theme.zip_download_url"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-md bg-zinc-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-zinc-600"
              >
                Download ZIP
              </a>
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
        </template>

        <div v-else class="py-16 text-center text-zinc-500">Submission not found.</div>
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
const themeId = computed(() => route.params.id as string);

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
const rejectReason = ref('');
const acting = ref(false);

const { data, pending, refresh } = await useFetch<any>(
  () => `/api/admin/custom-themes/${themeId.value}`,
  { watch: [themeId] }
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
    await $fetch(`/api/admin/custom-themes/${themeId.value}/approve`, {
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
    await $fetch(`/api/admin/custom-themes/${themeId.value}/reject`, {
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
</script>
