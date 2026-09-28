<script setup lang="ts">
definePageMeta({ middleware: ['admin'] });

const { data, refresh, pending } = await useFetch<{ keys: any[] }>('/api/admin/api-keys');

const { data: integrations, refresh: refreshIntegrations } = await useFetch<{
  ok: boolean;
  hasAccountsApiKey: boolean;
  hasMailApiKey: boolean;
  hasMailFromAddress: boolean;
  mailFromAddress: string;
  accountsApiUrl: string;
  mailApiUrl: string;
}>('/api/admin/integrations');

const creating = ref(false);
const newKeyName = ref('');
const createdToken = ref<{ name: string; token: string } | null>(null);

const integrationForm = reactive({
  accountsApiKey: '',
  mailApiKey: '',
  mailFromAddress: '',
});
const integrationSaving = ref(false);

async function createKey() {
  const name = newKeyName.value.trim();
  if (!name) return;
  creating.value = true;
  createdToken.value = null;
  try {
    const result = await $fetch<any>('/api/admin/api-keys', {
      method: 'POST',
      body: { name, scopes: ['surveys:read'] },
    });
    createdToken.value = { name: result.name, token: result.token };
    newKeyName.value = '';
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to create API key');
  } finally {
    creating.value = false;
  }
}

async function saveIntegrations() {
  integrationSaving.value = true;
  try {
    await $fetch('/api/admin/integrations', {
      method: 'PUT',
      body: {
        accountsApiKey: integrationForm.accountsApiKey.trim() || undefined,
        mailApiKey: integrationForm.mailApiKey.trim() || undefined,
        mailFromAddress: integrationForm.mailFromAddress.trim() || undefined,
      },
    });
    integrationForm.accountsApiKey = '';
    integrationForm.mailApiKey = '';
    if (!integrations.value?.hasMailFromAddress) {
      integrationForm.mailFromAddress = '';
    }
    await refreshIntegrations();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to save credentials');
  } finally {
    integrationSaving.value = false;
  }
}

async function revokeKey(id: string) {
  if (!confirm('Revoke this API key?')) return;
  try {
    await $fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' });
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to revoke key');
  }
}

function formatTs(ts?: number | null) {
  if (!ts) return 'Never';
  return new Date(ts * 1000).toLocaleString();
}

watch(
  integrations,
  (value) => {
    if (value?.hasMailFromAddress && value.mailFromAddress && !integrationForm.mailFromAddress) {
      integrationForm.mailFromAddress = value.mailFromAddress;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-5xl px-6 lg:px-8">
      <NuxtLink to="/admin" class="mb-4 inline-block text-sm text-zinc-400 hover:text-white">&larr; Dashboard</NuxtLink>
      <h2 class="text-3xl font-bold text-white">Service API Keys</h2>
      <p class="mt-2 text-zinc-400">Issue keys for other services and store inbound credentials from mail and accounts.</p>

      <div class="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
        <div>
          <h3 class="text-lg font-semibold text-white">External credentials</h3>
          <p class="mt-1 text-sm text-zinc-400">
            Keys created in other BetterSEQTA admin panels. Dev URLs are resolved automatically when running locally.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 text-xs text-zinc-500">
          <div class="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            Accounts API: <code class="text-zinc-300">{{ integrations?.accountsApiUrl || 'http://localhost:8788' }}</code>
          </div>
          <div class="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            Mail API: <code class="text-zinc-300">{{ integrations?.mailApiUrl || 'http://localhost:8789' }}</code>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-300">Accounts API key</label>
            <p class="mb-2 text-xs text-zinc-500">
              Create under Accounts → Admin → API Keys. Used for analytics, surveys, and admin email lookup.
              <span v-if="integrations?.hasAccountsApiKey" class="text-emerald-400">Configured — leave blank to keep.</span>
            </p>
            <input
              v-model="integrationForm.accountsApiKey"
              type="password"
              placeholder="Paste accounts API key"
              autocomplete="off"
              class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-300">Mail API key</label>
            <p class="mb-2 text-xs text-zinc-500">
              Create under Mail → API keys (allowed from must include your from address below).
              <span v-if="integrations?.hasMailApiKey" class="text-emerald-400">Configured — leave blank to keep.</span>
            </p>
            <input
              v-model="integrationForm.mailApiKey"
              type="password"
              placeholder="Paste mail API key (bsm_…)"
              autocomplete="off"
              class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-300">Mail from address</label>
            <p class="mb-2 text-xs text-zinc-500">Must match an address allowed on the mail API key.</p>
            <input
              v-model="integrationForm.mailFromAddress"
              type="email"
              placeholder="noreply@betterseqta.org"
              class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="button"
            class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
            :disabled="integrationSaving"
            @click="saveIntegrations"
          >
            {{ integrationSaving ? 'Saving…' : 'Save external credentials' }}
          </button>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 class="text-lg font-semibold text-white">Issue key (outbound)</h3>
        <p class="mt-1 text-sm text-zinc-400">Keys other services use to call bsplus (e.g. survey interop).</p>
        <div class="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            v-model="newKeyName"
            type="text"
            placeholder="Key name (e.g. accounts-banner-check)"
            class="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
            :disabled="creating"
            @click="createKey"
          >
            {{ creating ? 'Creating...' : 'Create key' }}
          </button>
        </div>

        <div v-if="createdToken" class="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p class="text-sm font-medium text-green-300">Copy this token now — it won't be shown again.</p>
          <p class="mt-2 text-xs text-zinc-400">{{ createdToken.name }}</p>
          <code class="mt-2 block break-all rounded bg-zinc-950 p-3 text-sm text-green-400">{{ createdToken.token }}</code>
        </div>
      </div>

      <div class="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div class="border-b border-zinc-800 px-6 py-4">
          <h3 class="font-semibold text-white">Existing keys</h3>
        </div>
        <div v-if="pending" class="p-6 text-zinc-500">Loading...</div>
        <div v-else class="divide-y divide-zinc-800">
          <div v-for="key in data?.keys || []" :key="key.id" class="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="font-medium text-white">{{ key.name }}</div>
              <div class="mt-1 text-xs text-zinc-500">
                Scopes: {{ (key.scopes || []).join(', ') || 'none' }} · Created {{ formatTs(key.created_at) }} · Last used {{ formatTs(key.last_used_at) }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                :class="key.active ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20'"
              >
                {{ key.active ? 'Active' : 'Revoked' }}
              </span>
              <button
                v-if="key.active"
                type="button"
                class="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-400 transition-all duration-200 hover:scale-105"
                @click="revokeKey(key.id)"
              >
                Revoke
              </button>
            </div>
          </div>
          <div v-if="!(data?.keys || []).length" class="px-6 py-8 text-center text-zinc-500 italic">No API keys yet.</div>
        </div>
      </div>
    </div>
  </div>
</template>
