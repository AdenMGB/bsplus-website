<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-3xl px-6 lg:px-8">
      <AdminPageHeader
        title="BS+ status"
        description="Pause BetterSEQTA+ or disable features. Saved to the BS-Status repo on GitHub, which the extension reads. Changes reach users within about 5 minutes."
      />

      <p v-if="error" class="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{{ error }}</p>
      <p v-if="saved" class="mb-4 rounded-lg border border-green-500/30 bg-green-950/40 px-4 py-3 text-sm text-green-200">Saved to GitHub.</p>

      <div v-if="!status" class="text-zinc-500">Loading…</div>

      <form v-else class="space-y-8" @submit.prevent="save">
        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <label class="flex items-center gap-3 text-white">
            <input v-model="status.off" type="checkbox" class="h-4 w-4 accent-orange-500" />
            Pause BetterSEQTA+ for everyone
          </label>
          <p class="mt-2 text-sm text-zinc-500">
            Users see your message once and can choose Run Anyway. This can never lock anyone out.
          </p>
          <textarea
            v-model="message"
            rows="3"
            maxlength="300"
            placeholder="Message shown to users"
            class="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 class="font-semibold text-white">Disabled for everyone</h2>
          <input
            v-model="globalFeatures"
            list="bsplus-features"
            placeholder="page.news, plugin.globalSearch"
            class="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 class="font-semibold text-white">Disabled for specific SEQTA sites</h2>
          <div v-for="(row, i) in sites" :key="i" class="mt-3 flex gap-2">
            <input v-model="row.host" placeholder="learn.school.edu.au" class="w-1/3 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <input v-model="row.features" list="bsplus-features" placeholder="page.news, ui.sidebar.styled" class="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <button type="button" class="px-2 text-zinc-500 hover:text-red-400" @click="sites.splice(i, 1)">Remove</button>
          </div>
          <button type="button" class="mt-4 text-sm text-orange-400 hover:text-orange-300" @click="sites.push({ host: '', features: '' })">Add site</button>
        </section>

        <datalist id="bsplus-features">
          <option v-for="key in knownFeatures" :key="key" :value="key" />
        </datalist>
        <p class="text-xs text-zinc-500">
          Also accepted: <code>plugin.&lt;plugin id&gt;</code> and <code>settings.section.&lt;section id&gt;</code>. Separate keys with commas.
        </p>

        <button type="submit" :disabled="saving" class="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'] });

type Status = { off: boolean; message: string | null; disabledFeatures: string[]; sites: Record<string, string[]> };

const knownFeatures = [
  'page.home', 'page.news', 'page.analytics', 'themeStore.install', 'feedback.submit',
  'ui.sidebar.styled', 'ui.sidebar.edit', 'ui.titlebar.custom', 'ui.titlebar.founderBadge', 'settings.nav.cloud',
];

const split = (text: string) => text.split(',').map((v) => v.trim()).filter(Boolean);

const status = ref<Status | null>(null);
const message = ref('');
const globalFeatures = ref('');
const sites = ref<{ host: string; features: string }[]>([]);
const error = ref('');
const saved = ref(false);
const saving = ref(false);

function load(data: Status) {
  status.value = data;
  message.value = data.message ?? '';
  globalFeatures.value = data.disabledFeatures.join(', ');
  sites.value = Object.entries(data.sites).map(([host, features]) => ({ host, features: features.join(', ') }));
}

onMounted(async () => {
  try {
    load(await $fetch<Status>('/api/bsplus/admin/status'));
  } catch (e: any) {
    error.value = e?.statusMessage || 'Failed to load status';
  }
});

async function save() {
  saving.value = true;
  error.value = '';
  saved.value = false;
  try {
    load(
      await $fetch<Status>('/api/bsplus/admin/status', {
        method: 'PUT',
        body: {
          off: status.value!.off,
          message: message.value,
          disabledFeatures: split(globalFeatures.value),
          sites: Object.fromEntries(sites.value.map((r) => [r.host, split(r.features)])),
        },
      }),
    );
    saved.value = true;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Failed to save';
  } finally {
    saving.value = false;
  }
}
</script>
