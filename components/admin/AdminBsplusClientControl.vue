<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 class="text-lg font-semibold text-white">Find client</h2>
      <p class="mt-1 text-sm text-zinc-400">
        Target a BetterSEQTA account or a specific extension install. Actions create draft overrides — publish remote config when you are ready.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="m in searchModes"
          :key="m.id"
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          :class="searchMode === m.id ? 'bg-orange-600 text-white' : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'"
          @click="switchSearchMode(m.id)"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="mt-4">
        <AdminBsplusScopeSearch
          v-model="searchScopeId"
          :mode="searchMode"
          :label="searchMode === 'user' ? 'Cloud user' : 'Install ID'"
          :placeholder="searchMode === 'user' ? 'Username, email, or user UUID…' : 'Install UUID…'"
          @update:model-value="onSearchScopeChange"
        />
      </div>
    </div>

    <p v-if="localError" class="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
      {{ localError }}
    </p>
    <p v-if="localSuccess" class="rounded-lg border border-green-500/30 bg-green-950/40 px-4 py-3 text-sm text-green-200">
      {{ localSuccess }}
    </p>

    <div v-if="profileLoading" class="text-zinc-500">Loading client profile…</div>

    <template v-else-if="profile">
      <div class="rounded-2xl border border-orange-500/20 bg-orange-950/10 p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-white">
              {{ profile.user?.displayName || profile.user?.username || 'Unknown user' }}
            </h3>
            <p v-if="profile.user" class="mt-1 text-sm text-zinc-400">
              @{{ profile.user.username }} · {{ profile.user.email }}
            </p>
            <p class="mt-2 font-mono text-xs text-zinc-500">
              User ID: {{ profile.user?.id ?? '—' }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 transition-all duration-200 hover:scale-105"
            @click="refreshProfile"
          >
            Refresh
          </button>
        </div>

        <div class="mt-4">
          <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Registered installs</p>
          <p v-if="!profile.installs.length" class="mt-2 text-sm text-zinc-500">No installs linked or registered yet.</p>
          <ul v-else class="mt-2 flex flex-wrap gap-2">
            <li v-for="inst in profile.installs" :key="inst.installId">
              <button
                type="button"
                class="rounded-lg border px-3 py-2 text-left text-xs transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500"
                :class="
                  applyScope === 'install' && activeScopeId === inst.installId
                    ? 'border-orange-500 bg-orange-950/40 text-orange-100'
                    : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-zinc-500'
                "
                @click="selectInstallScope(inst.installId)"
              >
                <span class="font-mono">{{ shortId(inst.installId) }}</span>
                <span class="mt-1 block text-zinc-500">
                  {{ inst.extensionVersion ?? '?' }}
                  <span v-if="inst.linkedCloud" class="text-orange-400"> · cloud</span>
                  <span v-if="inst.registeredOnWebsite" class="text-emerald-400"> · telemetry</span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <span class="text-sm text-zinc-300">Apply actions to:</span>
          <label class="flex items-center gap-2 text-sm text-zinc-200">
            <input v-model="applyScope" type="radio" value="user" class="border-zinc-600" :disabled="!profile.user?.id" />
            All installs for this user
          </label>
          <label class="flex items-center gap-2 text-sm text-zinc-200">
            <input
              v-model="applyScope"
              type="radio"
              value="install"
              class="border-zinc-600"
              :disabled="!activeInstallScopeId"
            />
            This install only
          </label>
          <span v-if="applyScope === 'install'" class="font-mono text-xs text-orange-300">{{ activeScopeId }}</span>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 class="text-lg font-semibold text-white">Feature controls</h3>
          <p class="mt-1 text-sm text-zinc-400">Block, hide, or grey out specific extension features for this client only.</p>

          <input
            v-model="featureFilter"
            type="search"
            placeholder="Filter features…"
            class="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <label class="mt-3 flex flex-col gap-1 text-sm text-zinc-200">
            Default mode
            <select v-model="defaultFeatureMode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
              <option v-for="(doc, key) in featureModeDocs" :key="key" :value="key">{{ doc.label }}</option>
            </select>
          </label>

          <label class="mt-2 flex flex-col gap-1 text-sm text-zinc-200">
            Optional message (banner / block)
            <input
              v-model="featureMessageBody"
              type="text"
              placeholder="Shown when mode is banner or block"
              class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <ul class="mt-4 max-h-80 space-y-2 overflow-auto pr-1">
            <li
              v-for="item in filteredFeatureItems"
              :key="item.key"
              class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-2"
            >
              <div class="min-w-0">
                <div class="text-sm font-medium text-white">{{ item.label }}</div>
                <div class="font-mono text-[10px] text-zinc-500">{{ item.key }}</div>
              </div>
              <div class="flex shrink-0 gap-1">
                <button
                  type="button"
                  class="rounded-md bg-orange-600 px-2 py-1 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  :disabled="actionBusy === item.key"
                  @click="applyFeatureOverride(item.key, defaultFeatureMode)"
                >
                  Apply
                </button>
                <button
                  type="button"
                  class="rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500"
                  :disabled="actionBusy === item.key"
                  title="Remove client-specific restriction (feature_allow)"
                  @click="applyFeatureAllow(item.key)"
                >
                  Allow
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 class="text-lg font-semibold text-white">Campaign popups</h3>
          <p class="mt-1 text-sm text-zinc-400">
            Force-show a campaign for this client, or hide one they would otherwise see.
          </p>

          <label class="mt-4 flex flex-col gap-1 text-sm text-zinc-200">
            Campaign
            <select v-model="selectedCampaignId" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
              <option value="">Select campaign…</option>
              <option v-for="c in campaigns" :key="c.id" :value="c.id">
                {{ c.title || c.id }} ({{ c.id }})
              </option>
            </select>
          </label>

          <div class="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
              :disabled="!selectedCampaignId || campaignBusy"
              @click="applyCampaignOverride('campaign_force_include')"
            >
              Force show popup
            </button>
            <button
              type="button"
              class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition-all duration-200 hover:scale-105 disabled:opacity-50"
              :disabled="!selectedCampaignId || campaignBusy"
              @click="applyCampaignOverride('campaign_force_exclude')"
            >
              Hide from client
            </button>
          </div>
        </section>
      </div>

      <section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-semibold text-white">Active overrides for this client</h3>
          <span class="text-xs text-zinc-500">{{ profile.overrides.length }} draft rule(s)</span>
        </div>
        <ul v-if="profile.overrides.length" class="space-y-3 text-sm">
          <li v-for="o in profile.overrides" :key="o.id" class="rounded-lg border border-zinc-800 p-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span class="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-orange-300">
                  {{ o.scope }} · {{ shortId(o.scopeId) }}
                </span>
                <div class="mt-1 text-zinc-200">
                  {{ o.kind }}
                  <span v-if="o.targetKey" class="text-zinc-400">→ {{ o.targetKey }}</span>
                </div>
              </div>
              <button
                type="button"
                class="text-red-400 hover:text-red-300"
                @click="removeOverride(o.id)"
              >
                Delete
              </button>
            </div>
            <pre class="mt-2 max-h-20 overflow-auto text-xs text-zinc-500">{{ JSON.stringify(o.value, null, 2) }}</pre>
          </li>
        </ul>
        <p v-else class="text-sm text-zinc-500">No overrides yet for this user or their installs.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  catalog: {
    featureGroups?: Array<{
      id: string;
      label: string;
      items: Array<{ key: string; label: string; description?: string }>;
    }>;
    featureModeDocs?: Record<string, { label: string; description: string }>;
  } | null;
  campaigns: Array<{ id: string; title?: string }>;
}>();

const emit = defineEmits<{
  notify: [payload: { type: 'success' | 'error'; message: string }];
}>();

const searchModes = [
  { id: 'user' as const, label: 'User account' },
  { id: 'install' as const, label: 'Install ID' },
];

type SearchMode = (typeof searchModes)[number]['id'];

const searchMode = ref<SearchMode>('user');
const searchScopeId = ref('');
const profile = ref<any>(null);
const profileLoading = ref(false);
const localError = ref('');
const localSuccess = ref('');

const applyScope = ref<'user' | 'install'>('user');
const pinnedInstallId = ref('');

const featureFilter = ref('');
const defaultFeatureMode = ref('greyout');
const featureMessageBody = ref('');
const selectedCampaignId = ref('');
const actionBusy = ref('');
const campaignBusy = ref(false);

const featureModeDocs = computed(
  () => props.catalog?.featureModeDocs ?? { greyout: { label: 'Grey out', description: '' } },
);

const flatFeatureItems = computed(() => {
  const groups = props.catalog?.featureGroups ?? [];
  return groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.label })));
});

const filteredFeatureItems = computed(() => {
  const q = featureFilter.value.trim().toLowerCase();
  if (!q) return flatFeatureItems.value;
  return flatFeatureItems.value.filter(
    (item) =>
      item.key.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q),
  );
});

const activeInstallScopeId = computed(() => {
  if (pinnedInstallId.value) return pinnedInstallId.value;
  if (profile.value?.focus?.type === 'install') return profile.value.focus.id as string;
  return profile.value?.installs?.[0]?.installId ?? '';
});

const activeScopeId = computed(() => {
  if (applyScope.value === 'install') return activeInstallScopeId.value;
  return profile.value?.user?.id ?? searchScopeId.value;
});

function shortId(value: unknown) {
  if (value == null || value === '') return '—';
  const s = String(value);
  return s.length > 14 ? `${s.slice(0, 8)}…${s.slice(-4)}` : s;
}

function switchSearchMode(mode: SearchMode) {
  searchMode.value = mode;
  searchScopeId.value = '';
  profile.value = null;
  pinnedInstallId.value = '';
  localError.value = '';
  localSuccess.value = '';
}

function onSearchScopeChange(id: string) {
  if (!id.trim()) {
    profile.value = null;
    return;
  }
  void loadProfile();
}

async function loadProfile() {
  const id = searchScopeId.value.trim();
  if (!id) return;

  profileLoading.value = true;
  localError.value = '';
  localSuccess.value = '';
  try {
    const query =
      searchMode.value === 'user' ? { userId: id } : { installId: id };
    const res = await $fetch<{ success: boolean; data: any }>(
      '/api/bsplus/admin/client-control/profile',
      { query },
    );
    profile.value = res.data;
    applyScope.value = res.data?.focus?.type === 'install' ? 'install' : 'user';
    if (res.data?.focus?.type === 'install') {
      pinnedInstallId.value = res.data.focus.id;
    } else {
      pinnedInstallId.value = '';
    }
  } catch (e: any) {
    localError.value = e?.data?.message || e?.message || 'Failed to load client profile';
    profile.value = null;
    emit('notify', { type: 'error', message: localError.value });
  } finally {
    profileLoading.value = false;
  }
}

function refreshProfile() {
  void loadProfile();
}

function selectInstallScope(installId: string) {
  pinnedInstallId.value = installId;
  applyScope.value = 'install';
}

function scopePayload() {
  const scope = applyScope.value;
  const scopeId = activeScopeId.value.trim();
  if (!scopeId) throw new Error('Select a user or install first');
  return { scope, scopeId };
}

async function applyFeatureOverride(featureKey: string, mode: string) {
  actionBusy.value = featureKey;
  localError.value = '';
  localSuccess.value = '';
  try {
    const { scope, scopeId } = scopePayload();
    const value: Record<string, unknown> = { mode, featureKey };
    if (featureMessageBody.value.trim() && (mode === 'banner' || mode === 'block')) {
      value.message = { body: featureMessageBody.value.trim() };
    }
    await $fetch('/api/bsplus/admin/remote-config/overrides', {
      method: 'POST',
      body: {
        scope,
        scopeId,
        kind: 'feature',
        targetKey: featureKey,
        value,
        note: `Client control: ${mode} ${featureKey}`,
      },
    });
    localSuccess.value = 'Feature override saved — publish remote config to push to extensions.';
    emit('notify', { type: 'success', message: localSuccess.value });
    await loadProfile();
  } catch (e: any) {
    localError.value = e?.data?.message || e?.message || 'Feature override failed';
    emit('notify', { type: 'error', message: localError.value });
  } finally {
    actionBusy.value = '';
  }
}

async function applyFeatureAllow(featureKey: string) {
  actionBusy.value = featureKey;
  try {
    const { scope, scopeId } = scopePayload();
    await $fetch('/api/bsplus/admin/remote-config/overrides', {
      method: 'POST',
      body: {
        scope,
        scopeId,
        kind: 'feature_allow',
        targetKey: featureKey,
        value: { featureKey },
        note: `Client control: allow ${featureKey}`,
      },
    });
    localSuccess.value = 'Allow override saved — publish when ready.';
    emit('notify', { type: 'success', message: localSuccess.value });
    await loadProfile();
  } catch (e: any) {
    localError.value = e?.data?.message || e?.message || 'Allow override failed';
    emit('notify', { type: 'error', message: localError.value });
  } finally {
    actionBusy.value = '';
  }
}

async function applyCampaignOverride(kind: 'campaign_force_include' | 'campaign_force_exclude') {
  if (!selectedCampaignId.value) return;
  campaignBusy.value = true;
  try {
    const { scope, scopeId } = scopePayload();
    await $fetch('/api/bsplus/admin/remote-config/overrides', {
      method: 'POST',
      body: {
        scope,
        scopeId,
        kind,
        targetKey: selectedCampaignId.value,
        value: { campaignId: selectedCampaignId.value },
        note: `Client control: ${kind}`,
      },
    });
    localSuccess.value =
      kind === 'campaign_force_include'
        ? 'Campaign will be forced for this client after publish.'
        : 'Campaign hidden for this client after publish.';
    emit('notify', { type: 'success', message: localSuccess.value });
    await loadProfile();
  } catch (e: any) {
    localError.value = e?.data?.message || e?.message || 'Campaign override failed';
    emit('notify', { type: 'error', message: localError.value });
  } finally {
    campaignBusy.value = false;
  }
}

async function removeOverride(id: string) {
  if (!confirm('Delete this override?')) return;
  try {
    await $fetch(`/api/bsplus/admin/remote-config/overrides/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    localSuccess.value = 'Override deleted.';
    emit('notify', { type: 'success', message: localSuccess.value });
    await loadProfile();
  } catch (e: any) {
    localError.value = e?.data?.message || e?.message || 'Delete failed';
    emit('notify', { type: 'error', message: localError.value });
  }
}
</script>
