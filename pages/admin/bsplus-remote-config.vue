<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-4xl px-6 lg:px-8">
      <NuxtLink
        to="/admin"
        class="mb-4 inline-block text-sm font-semibold text-zinc-400 transition-colors duration-200 hover:text-white"
      >
        &larr; Back to Dashboard
      </NuxtLink>

      <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">BS+ Remote Config</h1>
          <p class="mt-2 text-lg text-zinc-400">
            Kill switch, feature gates, and campaigns for the extension (publish to go live).
          </p>
          <p class="mt-2 text-sm text-zinc-500">
            API reference: <code class="text-zinc-400">docs/bsplus-remote-config-api.md</code>
          </p>
        </div>
      </div>

      <p v-if="errorMessage" class="mb-6 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="mb-6 rounded-lg border border-green-500/30 bg-green-950/40 px-4 py-3 text-sm text-green-200">
        {{ successMessage }}
      </p>

      <div v-if="loading" class="text-zinc-500">Loading…</div>

      <template v-else>
        <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <dt class="text-xs text-zinc-500">Total installs</dt>
            <dd class="mt-1 text-2xl font-bold text-white">{{ installStats?.total_installs ?? '—' }}</dd>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <dt class="text-xs text-zinc-500">Active 24h</dt>
            <dd class="mt-1 text-2xl font-bold text-white">{{ installStats?.active_last_24h ?? '—' }}</dd>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <dt class="text-xs text-zinc-500">Active 7d</dt>
            <dd class="mt-1 text-2xl font-bold text-white">{{ installStats?.active_last_7d ?? '—' }}</dd>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <dt class="text-xs text-zinc-500">With cloud user</dt>
            <dd class="mt-1 text-2xl font-bold text-white">{{ installStats?.installs_with_cloud_user ?? '—' }}</dd>
          </div>
        </div>

        <form
          class="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          @submit.prevent="saveGlobal"
        >
          <h2 class="text-lg font-semibold text-white">Global</h2>

          <div class="flex flex-wrap gap-6">
            <label class="flex items-center gap-3 text-sm text-zinc-200">
              <span>Remote mode</span>
              <select
                v-model="form.mode"
                class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="on">on</option>
                <option value="off">off (kill switch)</option>
              </select>
            </label>
            <label class="flex items-center gap-2 text-sm text-zinc-200">
              <input v-model="form.allowLocalOverride" type="checkbox" class="rounded border-zinc-600" />
              Allow local override when off
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300">Status message (settings strip)</label>
            <input
              v-model="form.statusMessage"
              type="text"
              maxlength="500"
              placeholder="Optional banner text"
              class="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2 text-sm text-zinc-200">
              <input v-model="form.disableCloudSync" type="checkbox" class="rounded border-zinc-600" />
              Disable cloud sync
            </label>
            <label class="flex items-center gap-2 text-sm text-zinc-200">
              <input v-model="form.disableThemeStore" type="checkbox" class="rounded border-zinc-600" />
              Disable theme store
            </label>
            <label class="flex items-center gap-2 text-sm text-zinc-200">
              <input v-model="form.disableFeedbackSubmit" type="checkbox" class="rounded border-zinc-600" />
              Disable feedback submit
            </label>
          </div>

          <p v-if="publishedMeta" class="text-xs text-zinc-500">
            Published:
            <span class="font-mono text-zinc-400">{{ publishedMeta.configVersion }}</span>
            · etag {{ publishedMeta.etag }}
          </p>

          <div class="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              :disabled="saving"
            >
              {{ saving ? 'Saving…' : 'Save draft' }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-orange-500/40 bg-orange-600/10 px-4 py-2 text-sm font-semibold text-orange-300 transition-all duration-200 hover:scale-105 hover:bg-orange-600/20 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              :disabled="publishing"
              @click="publish"
            >
              {{ publishing ? 'Publishing…' : 'Publish to extensions' }}
            </button>
          </div>
        </form>

        <p class="mt-8 text-sm text-zinc-500">
          Feature gates and campaigns: use the admin REST API documented in
          <code class="text-zinc-400">docs/bsplus-remote-config-api.md</code>.
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

type GlobalForm = {
  mode: 'on' | 'off';
  allowLocalOverride: boolean;
  statusMessage: string;
  disableCloudSync: boolean;
  disableThemeStore: boolean;
  disableFeedbackSubmit: boolean;
};

const loading = ref(true);
const saving = ref(false);
const publishing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive<GlobalForm>({
  mode: 'on',
  allowLocalOverride: true,
  statusMessage: '',
  disableCloudSync: false,
  disableThemeStore: false,
  disableFeedbackSubmit: false,
});

const publishedMeta = ref<{ configVersion: string; etag: string } | null>(null);
const installStats = ref<Record<string, number> | null>(null);

async function loadAll() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [globalRes, statsRes] = await Promise.all([
      $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/global'),
      $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/installs/stats'),
    ]);
    const g = globalRes.data?.global;
    if (g) {
      form.mode = g.mode === 'off' ? 'off' : 'on';
      form.allowLocalOverride = g.allowLocalOverride !== false;
      form.statusMessage = g.statusMessage || '';
      form.disableCloudSync = !!g.disableCloudSync;
      form.disableThemeStore = !!g.disableThemeStore;
      form.disableFeedbackSubmit = !!g.disableFeedbackSubmit;
    }
    publishedMeta.value = globalRes.data?.published ?? null;
    installStats.value = statsRes.data ?? null;
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Failed to load remote config';
  } finally {
    loading.value = false;
  }
}

async function saveGlobal() {
  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await $fetch('/api/bsplus/admin/remote-config/global', {
      method: 'PATCH',
      body: {
        mode: form.mode,
        allowLocalOverride: form.allowLocalOverride,
        statusMessage: form.statusMessage.trim() || null,
        disableCloudSync: form.disableCloudSync,
        disableThemeStore: form.disableThemeStore,
        disableFeedbackSubmit: form.disableFeedbackSubmit,
      },
    });
    successMessage.value = 'Draft saved. Publish to push to extensions.';
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Save failed';
  } finally {
    saving.value = false;
  }
}

async function publish() {
  publishing.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const res = await $fetch<{ success: boolean; data: any }>(
      '/api/bsplus/admin/remote-config/publish',
      { method: 'POST' }
    );
    publishedMeta.value = {
      configVersion: res.data?.configVersion,
      etag: res.data?.etag,
    };
    successMessage.value = 'Published. Extensions will pick up the new etag on next poll.';
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Publish failed';
  } finally {
    publishing.value = false;
  }
}

onMounted(() => {
  loadAll();
});
</script>
