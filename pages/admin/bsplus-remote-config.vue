<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-6xl px-6 lg:px-8">
      <AdminPageHeader title="BS+ remote config" description="Per-client controls, kill switch, feature gates, campaigns, and extension telemetry." />

      <p v-if="errorMessage" class="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="mb-4 rounded-lg border border-green-500/30 bg-green-950/40 px-4 py-3 text-sm text-green-200">
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
            <dt class="text-xs text-zinc-500">Published</dt>
            <dd class="mt-1 truncate text-sm font-mono text-zinc-300">{{ publishedMeta?.configVersion ?? '—' }}</dd>
          </div>
        </div>

        <div class="mb-6 flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            :class="activeTab === t.id ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
            @click="activeTab = t.id"
          >
            {{ t.label }}
          </button>
          <div class="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-lg border border-zinc-600 bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:scale-105 hover:border-zinc-500 disabled:opacity-50"
              :disabled="githubSyncing"
              @click="forceGithubSync"
            >
              {{ githubSyncing ? 'Syncing GitHub…' : 'Force GitHub mirror sync' }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-orange-500/40 bg-orange-600/10 px-4 py-2 text-sm font-semibold text-orange-300 transition-all duration-200 hover:scale-105 disabled:opacity-50"
              :disabled="publishing"
              @click="publish"
            >
              {{ publishing ? 'Publishing…' : 'Publish to extensions' }}
            </button>
          </div>
        </div>

        <AdminBsplusClientControl
          v-show="activeTab === 'client'"
          :catalog="catalog"
          :campaigns="campaigns"
          @notify="onClientControlNotify"
        />

        <!-- Global -->
        <form v-show="activeTab === 'global'" class="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6" @submit.prevent="saveGlobal">
          <h2 class="text-lg font-semibold text-white">Global controls</h2>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-2 text-sm text-zinc-200">
              Remote mode
              <select v-model="form.mode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500">
                <option value="on">on — normal operation</option>
                <option value="off">off — kill switch (SW + settings still work)</option>
              </select>
            </label>
            <label class="flex items-center gap-2 self-end text-sm text-zinc-200">
              <input v-model="form.allowLocalOverride" type="checkbox" class="rounded border-zinc-600" />
              Allow local override (“Run locally anyway”)
            </label>
          </div>

          <label class="block text-sm text-zinc-200">
            Status message (when kill switch off)
            <input
              v-model="form.statusMessage"
              type="text"
              maxlength="500"
              class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block text-sm text-zinc-200">
              Maintenance title
              <input v-model="form.maintenanceTitle" type="text" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500" />
            </label>
            <label class="block text-sm text-zinc-200">
              Maintenance body
              <textarea v-model="form.maintenanceBody" rows="2" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500" />
            </label>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block text-sm text-zinc-200">
              Min extension version (semver)
              <input v-model="form.minExtensionVersion" type="text" placeholder="e.g. 3.7.0" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500" />
            </label>
            <label class="block text-sm text-zinc-200">
              Force update URL
              <input v-model="form.forceUpdateUrl" type="url" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500" />
            </label>
          </div>

          <fieldset class="rounded-xl border border-zinc-800 p-4">
            <legend class="px-2 text-sm font-medium text-zinc-300">Hostname policy</legend>
            <div class="mt-2 grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-2 text-sm text-zinc-200">
                Mode
                <select v-model="form.hostnamePolicyMode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                  <option value="">Disabled</option>
                  <option value="allowlist">Allowlist — only listed suffixes</option>
                  <option value="denylist">Denylist — block listed suffixes</option>
                </select>
              </label>
              <label class="block text-sm text-zinc-200 md:col-span-2">
                Suffixes (one per line, e.g. <code class="text-zinc-400">school.edu.au</code>)
                <textarea v-model="form.hostnameSuffixes" rows="3" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white" />
              </label>
            </div>
          </fieldset>

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

          <button
            type="submit"
            class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'Saving…' : 'Save global draft' }}
          </button>
        </form>

        <!-- Features -->
        <div v-show="activeTab === 'features'" class="space-y-8">
          <p class="text-sm text-zinc-500">
            Modes match the extension:
            <span v-for="(doc, mode) in catalog?.featureModes" :key="mode" class="mr-3 inline-block">
              <strong class="text-zinc-400">{{ doc.label }}</strong> — {{ doc.description }}
            </span>
          </p>

          <section v-for="group in catalog?.featureGroups ?? []" :key="group.id" class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 class="mb-4 text-lg font-semibold text-white">{{ group.label }}</h2>
            <div class="space-y-4">
              <div
                v-for="item in group.items"
                :key="item.key"
                class="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4"
              >
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-white">{{ item.label }}</p>
                    <p class="text-xs text-zinc-500">{{ item.key }}</p>
                    <p class="mt-1 text-xs text-zinc-400">{{ item.effect }}</p>
                  </div>
                  <div class="flex shrink-0 flex-wrap items-center gap-2">
                    <select
                      v-model="featureDraft[item.key].mode"
                      class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                    >
                      <option v-for="m in featureModeOptions" :key="m" :value="m">{{ m }}</option>
                    </select>
                    <button
                      type="button"
                      class="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                      :disabled="featureSaving === item.key"
                      @click="saveFeature(item.key)"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div v-if="needsMessage(featureDraft[item.key].mode)" class="mt-3 grid gap-2 md:grid-cols-3">
                  <input
                    v-model="featureDraft[item.key].messageTitle"
                    placeholder="Message title"
                    class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  />
                  <input
                    v-model="featureDraft[item.key].messageBody"
                    placeholder="Message body (required for banner/block/greyout)"
                    class="md:col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  />
                  <select v-model="featureDraft[item.key].messageSeverity" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
                    <option value="info">info</option>
                    <option value="warning">warning</option>
                    <option value="error">error</option>
                  </select>
                </div>
                <AdminBsplusAudienceEditor
                  v-if="featureDraft[item.key]?.mode && featureDraft[item.key].mode !== 'allow'"
                  v-model="featureTargeting[item.key]"
                  title="Feature audience (optional)"
                  class="mt-4"
                />
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-dashed border-zinc-700 p-6">
            <h3 class="text-sm font-semibold text-white">Custom feature key</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <input v-model="customFeatureKey" placeholder="plugin.my-plugin" class="min-w-[240px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <select v-model="customFeatureMode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
                <option v-for="m in featureModeOptions" :key="m" :value="m">{{ m }}</option>
              </select>
              <button type="button" class="rounded-lg bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600" @click="saveCustomFeature">Add / update</button>
            </div>
          </section>
        </div>

        <!-- Campaigns -->
        <div v-show="activeTab === 'campaigns'" class="grid gap-6 xl:grid-cols-[minmax(240px,320px)_1fr]">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 class="mb-4 text-lg font-semibold text-white">Campaigns</h2>
            <ul class="space-y-2">
              <li v-for="c in campaigns" :key="c.id">
                <button
                  type="button"
                  class="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-200"
                  :class="campaignEditId === c.id ? 'border-orange-500 bg-orange-950/30 text-white' : 'border-zinc-800 text-zinc-300 hover:border-zinc-600'"
                  @click="loadCampaignIntoForm(c)"
                >
                  <span class="font-medium">{{ c.header?.title ?? c.id }}</span>
                  <span class="ml-2 text-xs text-zinc-500">p{{ c.priority }} · {{ c.enabled === false ? 'disabled' : 'enabled' }}</span>
                </button>
              </li>
            </ul>
            <button type="button" class="mt-4 text-sm text-orange-400 hover:text-orange-300" @click="resetCampaignForm">+ New campaign</button>
          </div>

          <form class="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 xl:max-w-none" @submit.prevent="saveCampaign">
            <h2 class="text-lg font-semibold text-white">{{ campaignEditId ? 'Edit campaign' : 'New campaign' }}</h2>
            <div class="grid gap-4 lg:grid-cols-2">
              <input v-model="campaignForm.id" :readonly="!!campaignEditId" placeholder="id (auto if empty)" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white lg:col-span-2" />
              <input v-model.number="campaignForm.priority" type="number" placeholder="Priority" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <label class="flex items-center gap-2 text-sm text-zinc-200">
                <input v-model="campaignForm.enabled" type="checkbox" /> Enabled
              </label>
              <input v-model="campaignForm.activeFrom" type="datetime-local" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <input v-model="campaignForm.activeTo" type="datetime-local" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <input v-model="campaignForm.headerTitle" placeholder="Header title" required class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <input v-model="campaignForm.headerSubtitle" placeholder="Header subtitle" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <div class="flex gap-2 lg:col-span-2">
                <select v-model="campaignForm.heroType" class="w-36 shrink-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
                  <option value="">No hero</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input v-model="campaignForm.heroUrl" placeholder="Hero URL (HTTPS)" class="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              </div>
              <input v-model="campaignForm.minVersion" placeholder="minVersion (semver)" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <input v-model="campaignForm.maxVersion" placeholder="maxVersion (semver)" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            </div>

            <AdminBsplusAudienceEditor v-model="campaignAudience" title="Campaign audience" class="lg:col-span-2" />

            <div class="lg:col-span-2">
              <label class="mb-2 block text-sm font-medium text-zinc-300">Campaign body</label>
              <TiptapEditor v-model="campaignForm.bodyHtml" compact :enable-images="true" class="min-h-[280px]" />
            </div>

            <AdminBsplusCampaignButtonEditor
              v-model="campaignForm.buttons"
              :action-options="catalog?.campaign?.buttonActions"
            />

            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-2 text-sm text-zinc-200">
                <input v-model="campaignForm.requireAcknowledge" type="checkbox" /> Require acknowledge
              </label>
              <label class="flex items-center gap-2 text-sm text-zinc-200">
                <input v-model="campaignForm.omitBodyFromSnapshot" type="checkbox" /> Omit body from snapshot
              </label>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="submit" class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="campaignSaving">
                {{ campaignSaving ? 'Saving…' : 'Save campaign draft' }}
              </button>
              <button
                v-if="campaignEditId"
                type="button"
                class="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
                @click="deleteCampaign"
              >
                Delete
              </button>
            </div>
          </form>
        </div>

        <!-- Remote theme -->
        <div v-show="activeTab === 'remoteTheme'" class="grid gap-6 lg:grid-cols-2">
          <form class="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6" @submit.prevent="saveRemoteThemeDirective">
            <h2 class="text-lg font-semibold text-white">Remote theme directive</h2>
            <p class="text-sm text-zinc-500">
              Published in the config snapshot as <code class="text-zinc-400">remoteTheme</code>. Packages are served from
              <code class="text-zinc-400">https://betterseqta.org/api/bsplus/…</code>.
            </p>
            <label class="flex flex-col gap-2 text-sm text-zinc-200">
              Policy mode
              <select v-model="remoteThemeForm.mode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                <option value="">Inactive (omit from snapshot)</option>
                <option value="off">off — end remote theme</option>
                <option value="optional">optional — user may turn off</option>
                <option value="forced">forced — enforce remote policy</option>
              </select>
            </label>
            <label class="flex flex-col gap-2 text-sm text-zinc-200">
              Application mode
              <select v-model="remoteThemeForm.applicationMode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                <option value="replace">replace — remote theme replaces user theme</option>
                <option value="overlay">overlay — layer on top of user theme</option>
              </select>
            </label>
            <p
              v-if="remoteThemeForm.mode === 'forced' && remoteThemeForm.applicationMode === 'replace'"
              class="rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-100"
            >
              Forced + replace locks the theme picker and swaps to the remote package only.
            </p>
            <p
              v-else-if="remoteThemeForm.mode === 'forced' && remoteThemeForm.applicationMode === 'overlay'"
              class="rounded-lg border border-blue-500/30 bg-blue-950/30 px-3 py-2 text-xs text-blue-100"
            >
              Forced + overlay keeps the theme picker for the base theme; remote layers stay until the directive ends.
            </p>
            <input v-model="remoteThemeForm.packageId" placeholder="packageId (e.g. school-brand-2026)" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <input v-model="remoteThemeForm.packageVersion" placeholder="packageVersion (optional, defaults to package row)" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <input v-model="remoteThemeForm.activeFrom" type="datetime-local" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <input v-model="remoteThemeForm.activeTo" type="datetime-local" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <input v-model="remoteThemeForm.messageTitle" placeholder="Message title" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <textarea v-model="remoteThemeForm.messageBody" rows="2" placeholder="Message body" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <label v-if="remoteThemeForm.mode === 'optional'" class="flex items-center gap-2 text-sm text-zinc-200">
              <input v-model="remoteThemeForm.allowUserOptOut" type="checkbox" class="rounded border-zinc-600" />
              Allow user opt-out
            </label>
            <AdminBsplusAudienceEditor v-model="remoteThemeAudience" title="Remote theme audience (optional)" />
            <div class="flex flex-wrap gap-2">
              <button type="submit" class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="remoteThemeSaving">
                {{ remoteThemeSaving ? 'Saving…' : 'Save directive draft' }}
              </button>
              <button type="button" class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300" @click="clearRemoteThemeDirective">
                Clear directive
              </button>
            </div>
          </form>

          <form class="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6" @submit.prevent="saveRemoteThemePackage">
            <h2 class="text-lg font-semibold text-white">Theme packages</h2>
            <ul v-if="remoteThemePackages.length" class="mb-4 max-h-40 space-y-1 overflow-y-auto text-sm text-zinc-400">
              <li v-for="p in remoteThemePackages" :key="p.packageId">
                <button type="button" class="text-left hover:text-orange-300" @click="loadRemoteThemePackage(p.packageId)">
                  {{ p.packageId }} · v{{ p.version }} · {{ p.enabled ? 'enabled' : 'disabled' }}
                </button>
              </li>
            </ul>
            <input v-model="packageForm.packageId" placeholder="packageId" required class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <input v-model="packageForm.version" placeholder="version" required class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <label class="flex flex-col gap-2 text-sm text-zinc-200">
              Package application mode
              <select v-model="packageForm.applicationMode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                <option value="replace">replace</option>
                <option value="overlay">overlay</option>
              </select>
            </label>
            <label class="flex flex-col gap-2 text-sm text-zinc-200">
              Content type
              <select v-model="packageForm.contentMode" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white">
                <option value="theme">Single theme (theme.json / ZIP)</option>
                <option value="layers">Overlay layers (stacked CSS)</option>
              </select>
            </label>
            <label class="flex items-center gap-2 text-sm text-zinc-200">
              <input v-model="packageForm.enabled" type="checkbox" class="rounded border-zinc-600" /> Enabled
            </label>
            <AdminBsplusRemoteThemeUpload
              v-if="packageForm.contentMode === 'theme'"
              v-model:model-theme-json="packageForm.themeJson"
              @update:theme="parsedPackageTheme = $event"
              @suggest-package-id="onSuggestPackageId"
            />
            <AdminBsplusOverlayLayersEditor
              v-else
              v-model="packageForm.overlayLayers"
            />
            <button type="submit" class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="packageSaving">
              {{ packageSaving ? 'Saving…' : 'Save package' }}
            </button>
          </form>
        </div>

        <!-- Per install / user overrides -->
        <div v-show="activeTab === 'overrides'" class="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <form class="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6" @submit.prevent="submitOverride">
            <h2 class="text-lg font-semibold text-white">New override</h2>
            <select v-model="overrideForm.scope" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
              <option value="install">install</option>
              <option value="user">user</option>
            </select>
            <AdminBsplusScopeSearch
              v-model="overrideForm.scopeId"
              :mode="overrideForm.scope"
              :label="overrideForm.scope === 'user' ? 'Target user' : 'Target install'"
              :placeholder="overrideForm.scope === 'user' ? 'Search accounts…' : 'Search install ID…'"
            />
            <select v-model="overrideForm.kind" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
              <option value="feature">feature</option>
              <option value="feature_allow">feature_allow</option>
              <option value="campaign_force_include">campaign_force_include</option>
              <option value="campaign_force_exclude">campaign_force_exclude</option>
              <option value="global">global</option>
              <option value="remote_theme">remote_theme</option>
            </select>
            <input v-model="overrideForm.targetKey" placeholder="target key (feature/campaign id)" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <textarea v-model="overrideForm.valueJson" rows="6" required placeholder='{"mode":"block","message":{"body":"…"}}' class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-white" />
            <button type="submit" class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white" :disabled="overrideSaving">
              {{ overrideSaving ? 'Saving…' : 'Add override' }}
            </button>
          </form>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div class="mb-4 flex flex-wrap items-end gap-2">
              <input v-model="overrideFilterScopeId" placeholder="Filter scope UUID" class="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
              <button type="button" class="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200" @click="loadOverrides">Refresh</button>
            </div>
            <ul class="space-y-3 text-sm">
              <li v-for="o in overrides" :key="o.id" class="rounded-lg border border-zinc-800 p-3">
                <div class="font-mono text-xs text-orange-300">{{ o.scope }} / {{ o.scopeId }}</div>
                <div class="text-zinc-300">{{ o.kind }} {{ o.targetKey ? `→ ${o.targetKey}` : '' }}</div>
                <pre class="mt-2 max-h-24 overflow-auto text-xs text-zinc-500">{{ JSON.stringify(o.value, null, 2) }}</pre>
                <button type="button" class="mt-2 text-red-400 hover:text-red-300" @click="removeOverride(o.id)">Delete</button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Theme analytics -->
        <div v-show="activeTab === 'analytics'" class="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div class="flex flex-wrap items-end gap-3">
            <h2 class="text-lg font-semibold text-white">Extension theme analytics</h2>
            <select v-model.number="analyticsDays" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
              <option :value="7">7 days</option>
              <option :value="30">30 days</option>
              <option :value="90">90 days</option>
            </select>
            <AdminBsplusScopeSearch
              v-model="analyticsFilterUserId"
              mode="user"
              label=""
              placeholder="Filter by user…"
              class="min-w-[240px] flex-1"
            />
            <AdminBsplusScopeSearch
              v-model="analyticsFilterInstallId"
              mode="install"
              label=""
              placeholder="Filter by install…"
              class="min-w-[240px] flex-1"
            />
            <button type="button" class="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200" @click="loadThemeAnalytics">Refresh</button>
          </div>
          <div v-if="themeAnalytics" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl border border-zinc-800 p-4">
              <p class="text-xs text-zinc-500">Download events</p>
              <p class="text-2xl font-bold text-white">{{ themeAnalytics.downloads?.total_downloads ?? 0 }}</p>
            </div>
            <div class="rounded-xl border border-zinc-800 p-4">
              <p class="text-xs text-zinc-500">Catalog events</p>
              <p class="text-2xl font-bold text-white">{{ themeAnalytics.catalog?.total_events ?? 0 }}</p>
            </div>
            <div class="rounded-xl border border-zinc-800 p-4 lg:col-span-2">
              <p class="mb-2 text-xs text-zinc-500">Binding (downloads)</p>
              <ul class="space-y-1 text-sm text-zinc-300">
                <li v-for="row in themeAnalytics.downloads?.by_binding ?? []" :key="row.binding">
                  {{ row.binding }}: <strong class="text-white">{{ row.count }}</strong>
                </li>
              </ul>
            </div>
          </div>
          <div v-if="themeAnalytics?.downloads?.recent?.length" class="overflow-x-auto rounded-lg border border-zinc-800">
            <table class="min-w-full text-left text-xs text-zinc-300">
              <thead class="bg-zinc-950 text-zinc-500">
                <tr>
                  <th class="px-3 py-2">When</th>
                  <th class="px-3 py-2">Theme</th>
                  <th class="px-3 py-2">User</th>
                  <th class="px-3 py-2">Install</th>
                  <th class="px-3 py-2">Ext</th>
                  <th class="px-3 py-2">Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in themeAnalytics.downloads.recent" :key="String(row.id)" class="border-t border-zinc-800">
                  <td class="px-3 py-2 font-mono">{{ formatAnalyticsTime(row.occurred_at) }}</td>
                  <td class="px-3 py-2">{{ row.theme_id }}</td>
                  <td class="px-3 py-2 font-mono">{{ shortId(row.user_id) }}</td>
                  <td class="px-3 py-2 font-mono">{{ shortId(row.install_id) }}</td>
                  <td class="px-3 py-2">{{ row.extension_version || '—' }}</td>
                  <td class="px-3 py-2">{{ row.auth_method }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' });

type FeatureDraft = {
  mode: string;
  messageTitle: string;
  messageBody: string;
  messageSeverity: 'info' | 'warning' | 'error';
};

const tabs = [
  { id: 'client', label: 'Client control' },
  { id: 'global', label: 'Global' },
  { id: 'features', label: 'Feature gates' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'remoteTheme', label: 'Remote theme' },
  { id: 'overrides', label: 'Overrides' },
  { id: 'analytics', label: 'Theme analytics' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const activeTab = ref<TabId>('client');
const loading = ref(true);
const saving = ref(false);
const publishing = ref(false);
const githubSyncing = ref(false);
const featureSaving = ref('');
const campaignSaving = ref(false);
const remoteThemeSaving = ref(false);
const packageSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const catalog = ref<any>(null);
const publishedMeta = ref<{ configVersion: string; etag: string } | null>(null);
const installStats = ref<Record<string, number> | null>(null);

const form = reactive({
  mode: 'on' as 'on' | 'off',
  allowLocalOverride: true,
  statusMessage: '',
  maintenanceTitle: '',
  maintenanceBody: '',
  minExtensionVersion: '',
  forceUpdateUrl: '',
  hostnamePolicyMode: '' as '' | 'allowlist' | 'denylist',
  hostnameSuffixes: '',
  disableCloudSync: false,
  disableThemeStore: false,
  disableFeedbackSubmit: false,
});

const featureModeOptions = ['allow', 'hide', 'banner', 'block', 'greyout', 'temp_hide'];
const featureDraft = reactive<Record<string, FeatureDraft>>({});
const featureTargeting = reactive<Record<string, Record<string, unknown> | null>>({});
const customFeatureKey = ref('');
const customFeatureMode = ref('hide');

const campaigns = ref<any[]>([]);
const campaignEditId = ref('');
const campaignForm = reactive({
  id: '',
  priority: 10,
  enabled: true,
  activeFrom: '',
  activeTo: '',
  headerTitle: '',
  headerSubtitle: '',
  heroType: '' as '' | 'image' | 'video',
  heroUrl: '',
  bodyHtml: '',
  buttons: [{ id: 'dismiss', label: 'Got it', action: 'dismiss' }] as Array<Record<string, unknown>>,
  minVersion: '',
  maxVersion: '',
  requireAcknowledge: false,
  omitBodyFromSnapshot: false,
});

const campaignAudience = ref<Record<string, unknown> | null>(null);

const remoteThemePackages = ref<any[]>([]);
const remoteThemeForm = reactive({
  mode: '' as '' | 'off' | 'optional' | 'forced',
  applicationMode: 'replace' as 'replace' | 'overlay',
  packageId: '',
  packageVersion: '',
  activeFrom: '',
  activeTo: '',
  messageTitle: '',
  messageBody: '',
  allowUserOptOut: true,
});

const remoteThemeAudience = ref<Record<string, unknown> | null>(null);

const packageForm = reactive({
  packageId: '',
  version: '1',
  enabled: true,
  applicationMode: 'replace' as 'replace' | 'overlay',
  contentMode: 'theme' as 'theme' | 'layers',
  themeJson: '',
  overlayLayers: [] as Array<Record<string, unknown>>,
});

const parsedPackageTheme = ref<Record<string, unknown> | null>(null);

const overrides = ref<any[]>([]);
const overrideFilterScopeId = ref('');
const overrideSaving = ref(false);
const overrideForm = reactive({
  scope: 'install' as 'install' | 'user',
  scopeId: '',
  kind: 'feature',
  targetKey: '',
  valueJson: '{"mode":"block","message":{"body":"Override message"}}',
});

const analyticsDays = ref(30);
const analyticsFilterUserId = ref('');
const analyticsFilterInstallId = ref('');
const themeAnalytics = ref<any>(null);

function onSuggestPackageId(id: string) {
  if (!packageForm.packageId.trim()) {
    packageForm.packageId = id;
  }
}

function needsMessage(mode: string) {
  return mode === 'banner' || mode === 'block' || mode === 'greyout';
}

function ensureFeatureDraft(key: string, existing?: any) {
  if (featureDraft[key]) return;
  featureDraft[key] = {
    mode: existing?.mode ?? 'allow',
    messageTitle: existing?.message?.title ?? '',
    messageBody: existing?.message?.body ?? '',
    messageSeverity: existing?.message?.severity ?? 'info',
  };
  if (!(key in featureTargeting)) {
    featureTargeting[key] = existing?.targeting ?? null;
  }
}

function initFeatureDraftFromCatalog(features: Record<string, any>) {
  for (const group of catalog.value?.featureGroups ?? []) {
    for (const item of group.items) {
      ensureFeatureDraft(item.key, features[item.key]);
    }
  }
}

function toIsoFromDatetimeLocal(value: string): string {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function fromIsoToDatetimeLocal(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function loadAll() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [globalRes, statsRes, campaignsRes, packagesRes] = await Promise.all([
      $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/global'),
      $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/installs/stats'),
      $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/campaigns'),
      $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-theme-packages'),
    ]);

    catalog.value = globalRes.data?.catalog ?? null;
    const g = globalRes.data?.global;
    const features = globalRes.data?.features ?? {};

    if (g) {
      form.mode = g.mode === 'off' ? 'off' : 'on';
      form.allowLocalOverride = g.allowLocalOverride !== false;
      form.statusMessage = g.statusMessage || '';
      form.maintenanceTitle = g.maintenance?.title || '';
      form.maintenanceBody = g.maintenance?.body || '';
      form.minExtensionVersion = g.minExtensionVersion || '';
      form.forceUpdateUrl = g.forceUpdateUrl || '';
      form.disableCloudSync = !!g.disableCloudSync;
      form.disableThemeStore = !!g.disableThemeStore;
      form.disableFeedbackSubmit = !!g.disableFeedbackSubmit;
      form.hostnamePolicyMode = g.hostnamePolicy?.mode ?? '';
      form.hostnameSuffixes = (g.hostnamePolicy?.suffixes ?? []).join('\n');
    }

    initFeatureDraftFromCatalog(features);
    publishedMeta.value = globalRes.data?.published ?? null;
    installStats.value = statsRes.data ?? null;
    campaigns.value = campaignsRes.data?.campaigns ?? [];
    remoteThemePackages.value = packagesRes.data?.packages ?? [];

    const rt = globalRes.data?.remoteTheme;
    if (rt?.mode) {
      remoteThemeForm.mode = rt.mode;
      remoteThemeForm.applicationMode = rt.applicationMode === 'overlay' ? 'overlay' : 'replace';
      remoteThemeForm.packageId = rt.packageId ?? '';
      remoteThemeForm.packageVersion = rt.packageVersion ?? '';
      remoteThemeForm.activeFrom = rt.activeFrom ? fromIsoToDatetimeLocal(rt.activeFrom) : '';
      remoteThemeForm.activeTo = rt.activeTo ? fromIsoToDatetimeLocal(rt.activeTo) : '';
      remoteThemeForm.messageTitle = rt.message?.title ?? '';
      remoteThemeForm.messageBody = rt.message?.body ?? '';
      remoteThemeForm.allowUserOptOut = rt.allowUserOptOut !== false;
    }
    remoteThemeAudience.value = globalRes.data?.remoteThemeTargeting ?? null;
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Failed to load';
  } finally {
    loading.value = false;
  }
}

async function saveGlobal() {
  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const suffixes = form.hostnameSuffixes
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    let hostnamePolicy: { mode: string; suffixes: string[] } | null = null;
    if (form.hostnamePolicyMode && suffixes.length) {
      hostnamePolicy = { mode: form.hostnamePolicyMode, suffixes };
    }

    const maintenance =
      form.maintenanceTitle.trim() || form.maintenanceBody.trim()
        ? {
            title: form.maintenanceTitle.trim() || undefined,
            body: form.maintenanceBody.trim() || undefined,
          }
        : null;

    await $fetch('/api/bsplus/admin/remote-config/global', {
      method: 'PATCH',
      body: {
        mode: form.mode,
        allowLocalOverride: form.allowLocalOverride,
        statusMessage: form.statusMessage.trim() || null,
        maintenance,
        minExtensionVersion: form.minExtensionVersion.trim() || null,
        forceUpdateUrl: form.forceUpdateUrl.trim() || null,
        hostnamePolicy,
        disableCloudSync: form.disableCloudSync,
        disableThemeStore: form.disableThemeStore,
        disableFeedbackSubmit: form.disableFeedbackSubmit,
      },
    });
    successMessage.value = 'Global draft saved. Publish when ready.';
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Save failed';
  } finally {
    saving.value = false;
  }
}

async function saveFeature(key: string) {
  featureSaving.value = key;
  errorMessage.value = '';
  try {
    const draft = featureDraft[key];
    if (!draft || draft.mode === 'allow') {
      await $fetch(`/api/bsplus/admin/remote-config/features/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      }).catch(() => {});
      successMessage.value = `Cleared gate for ${key}`;
      return;
    }
    const message = needsMessage(draft.mode)
      ? {
          title: draft.messageTitle.trim() || undefined,
          body: draft.messageBody.trim() || 'Unavailable',
          severity: draft.messageSeverity,
        }
      : undefined;
    await $fetch(`/api/bsplus/admin/remote-config/features/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      body: { mode: draft.mode, message, targeting: featureTargeting[key] ?? null },
    });
    successMessage.value = `Saved ${key}`;
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Feature save failed';
  } finally {
    featureSaving.value = '';
  }
}

async function saveCustomFeature() {
  const key = customFeatureKey.value.trim();
  if (!key) return;
  ensureFeatureDraft(key, { mode: customFeatureMode.value });
  featureDraft[key].mode = customFeatureMode.value;
  await saveFeature(key);
}

function resetCampaignForm() {
  campaignEditId.value = '';
  Object.assign(campaignForm, {
    id: '',
    priority: 10,
    enabled: true,
    activeFrom: '',
    activeTo: '',
    headerTitle: '',
    headerSubtitle: '',
    heroType: '',
    heroUrl: '',
    bodyHtml: '',
    buttons: [{ id: 'dismiss', label: 'Got it', action: 'dismiss' }],
    minVersion: '',
    maxVersion: '',
    requireAcknowledge: false,
    omitBodyFromSnapshot: false,
  });
  campaignAudience.value = null;
}

function loadCampaignIntoForm(c: any) {
  campaignEditId.value = c.id;
  campaignForm.id = c.id;
  campaignForm.priority = c.priority ?? 0;
  campaignForm.enabled = c.enabled !== false;
  campaignForm.activeFrom = fromIsoToDatetimeLocal(c.activeFrom);
  campaignForm.activeTo = fromIsoToDatetimeLocal(c.activeTo);
  campaignForm.headerTitle = c.header?.title ?? '';
  campaignForm.headerSubtitle = c.header?.subtitle ?? '';
  campaignForm.heroType = c.hero?.type ?? '';
  campaignForm.heroUrl = c.hero?.url ?? '';
  campaignForm.bodyHtml = c.bodyHtml ?? '';
  campaignForm.buttons = Array.isArray(c.buttons) && c.buttons.length
    ? c.buttons.map((b: Record<string, unknown>) => ({ ...b }))
    : [{ id: 'dismiss', label: 'Got it', action: 'dismiss' }];
  campaignForm.minVersion = c.minVersion ?? '';
  campaignForm.maxVersion = c.maxVersion ?? '';
  campaignAudience.value = c.targeting ?? null;
  campaignForm.requireAcknowledge = !!c.requireAcknowledge;
  campaignForm.omitBodyFromSnapshot = !!c.omitBodyFromSnapshot;
}

async function saveCampaign() {
  campaignSaving.value = true;
  errorMessage.value = '';
  try {
    const payload = {
      id: campaignForm.id.trim() || undefined,
      priority: campaignForm.priority,
      enabled: campaignForm.enabled,
      activeFrom: toIsoFromDatetimeLocal(campaignForm.activeFrom),
      activeTo: toIsoFromDatetimeLocal(campaignForm.activeTo),
      header: {
        title: campaignForm.headerTitle.trim(),
        subtitle: campaignForm.headerSubtitle.trim() || undefined,
      },
      hero:
        campaignForm.heroType && campaignForm.heroUrl
          ? { type: campaignForm.heroType, url: campaignForm.heroUrl.trim() }
          : null,
      bodyHtml: campaignForm.bodyHtml,
      buttons: campaignForm.buttons,
      minVersion: campaignForm.minVersion.trim() || null,
      maxVersion: campaignForm.maxVersion.trim() || null,
      targeting: campaignAudience.value,
      requireAcknowledge: campaignForm.requireAcknowledge,
      omitBodyFromSnapshot: campaignForm.omitBodyFromSnapshot,
    };
    if (campaignEditId.value) {
      await $fetch(`/api/bsplus/admin/remote-config/campaigns/${encodeURIComponent(campaignEditId.value)}`, {
        method: 'PATCH',
        body: payload,
      });
    } else {
      const res = await $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/campaigns', {
        method: 'POST',
        body: payload,
      });
      campaignEditId.value = res.data?.campaign?.id ?? '';
    }
    const list = await $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/campaigns');
    campaigns.value = list.data?.campaigns ?? [];
    successMessage.value = 'Campaign draft saved.';
  } catch (e: any) {
    errorMessage.value = e?.message || e?.data?.message || 'Campaign save failed';
  } finally {
    campaignSaving.value = false;
  }
}

async function deleteCampaign() {
  if (!campaignEditId.value) return;
  if (!confirm('Delete this campaign?')) return;
  await $fetch(`/api/bsplus/admin/remote-config/campaigns/${encodeURIComponent(campaignEditId.value)}`, {
    method: 'DELETE',
  });
  resetCampaignForm();
  const list = await $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/campaigns');
  campaigns.value = list.data?.campaigns ?? [];
  successMessage.value = 'Campaign deleted.';
}

async function saveRemoteThemeDirective() {
  remoteThemeSaving.value = true;
  errorMessage.value = '';
  try {
    let remoteTheme: Record<string, unknown> | null = null;
    if (remoteThemeForm.mode) {
      remoteTheme = { mode: remoteThemeForm.mode };
      if (remoteThemeForm.mode !== 'off') {
        remoteTheme.packageId = remoteThemeForm.packageId.trim();
        if (remoteThemeForm.packageVersion.trim()) {
          remoteTheme.packageVersion = remoteThemeForm.packageVersion.trim();
        }
        if (remoteThemeForm.activeFrom) {
          remoteTheme.activeFrom = toIsoFromDatetimeLocal(remoteThemeForm.activeFrom);
        }
        if (remoteThemeForm.activeTo) {
          remoteTheme.activeTo = toIsoFromDatetimeLocal(remoteThemeForm.activeTo);
        }
        if (remoteThemeForm.messageBody.trim()) {
          remoteTheme.message = {
            title: remoteThemeForm.messageTitle.trim() || undefined,
            body: remoteThemeForm.messageBody.trim(),
          };
        }
        if (remoteThemeForm.mode === 'optional' && remoteThemeForm.allowUserOptOut) {
          remoteTheme.allowUserOptOut = true;
        }
        if (remoteThemeForm.applicationMode === 'overlay') {
          remoteTheme.applicationMode = 'overlay';
        }
      }
    }
    await $fetch('/api/bsplus/admin/remote-config/global', {
      method: 'PATCH',
      body: { remoteTheme, remoteThemeTargeting: remoteThemeAudience.value },
    });
    successMessage.value = 'Remote theme directive saved.';
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Save failed';
  } finally {
    remoteThemeSaving.value = false;
  }
}

async function clearRemoteThemeDirective() {
  remoteThemeForm.mode = '';
  remoteThemeForm.applicationMode = 'replace';
  remoteThemeForm.packageId = '';
  remoteThemeForm.packageVersion = '';
  remoteThemeForm.activeFrom = '';
  remoteThemeForm.activeTo = '';
  remoteThemeForm.messageTitle = '';
  remoteThemeForm.messageBody = '';
  await saveRemoteThemeDirective();
}

async function loadRemoteThemePackage(packageId: string) {
  try {
    const res = await $fetch<{ success: boolean; data: any }>(
      `/api/bsplus/admin/remote-theme-packages/${encodeURIComponent(packageId)}`
    );
    const p = res.data?.package;
    if (!p) return;
    packageForm.packageId = p.packageId;
    packageForm.version = p.version;
    packageForm.enabled = p.enabled !== false;
    packageForm.applicationMode = p.applicationMode === 'overlay' ? 'overlay' : 'replace';
    packageForm.contentMode = p.overlayLayers?.length ? 'layers' : 'theme';
    packageForm.overlayLayers = Array.isArray(p.overlayLayers) ? p.overlayLayers.map((l: Record<string, unknown>) => ({ ...l })) : [];
    packageForm.themeJson = p.themeJson || '';
    try {
      parsedPackageTheme.value = p.themeJson ? JSON.parse(p.themeJson) : null;
    } catch {
      parsedPackageTheme.value = null;
    }
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Failed to load package';
  }
}

async function saveRemoteThemePackage() {
  packageSaving.value = true;
  errorMessage.value = '';
  try {
    let theme: unknown = parsedPackageTheme.value;
    const body: Record<string, unknown> = {
      packageId: packageForm.packageId.trim(),
      version: packageForm.version.trim(),
      enabled: packageForm.enabled,
      applicationMode: packageForm.applicationMode,
    };

    if (packageForm.contentMode === 'layers') {
      if (!packageForm.overlayLayers.length) {
        throw new Error('Add at least one overlay layer');
      }
      body.overlayLayers = packageForm.overlayLayers;
    } else {
      if (!theme && packageForm.themeJson.trim()) {
        theme = JSON.parse(packageForm.themeJson);
      }
      if (!theme) {
        throw new Error('Upload or paste a valid BetterSEQTA theme first');
      }
      body.theme = theme;
    }

    await $fetch('/api/bsplus/admin/remote-theme-packages', {
      method: 'POST',
      body,
    });
    const list = await $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-theme-packages');
    remoteThemePackages.value = list.data?.packages ?? [];
    successMessage.value = 'Remote theme package saved.';
  } catch (e: any) {
    errorMessage.value = e?.message || e?.data?.message || 'Package save failed';
  } finally {
    packageSaving.value = false;
  }
}

async function publish() {
  publishing.value = true;
  errorMessage.value = '';
  try {
    const res = await $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/publish', {
      method: 'POST',
    });
    publishedMeta.value = {
      configVersion: res.data?.configVersion,
      etag: res.data?.etag,
    };
    const gh = res.data?.github;
    if (gh?.synced) {
      successMessage.value = `Published to API/D1 and GitHub mirror (${gh.files?.length ?? 4} files). etag ${res.data?.etag ?? ''}`;
    } else if (gh?.skipped_reason === 'missing_token') {
      successMessage.value = 'Published to API. GitHub sync skipped (token not configured).';
    } else if (gh?.error) {
      successMessage.value = 'Published to API.';
      errorMessage.value = `GitHub mirror failed: ${gh.error}`;
    } else {
      successMessage.value = 'Published — extensions pick up on next poll (~20 min).';
    }
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Publish failed';
  } finally {
    publishing.value = false;
  }
}

async function forceGithubSync() {
  githubSyncing.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const res = await $fetch<{ success: boolean; data: any }>(
      '/api/bsplus/admin/remote-config/sync-github',
      { method: 'POST' }
    );
    const gh = res.data?.github;
    if (gh?.synced) {
      successMessage.value = `GitHub mirror synced (${gh.commit?.slice(0, 7) ?? 'ok'}). Uses draft config with current published configVersion.`;
    } else {
      errorMessage.value = gh?.error || res.data?.message || 'GitHub sync failed';
    }
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'GitHub sync failed';
  } finally {
    githubSyncing.value = false;
  }
}

function onClientControlNotify(payload: { type: 'success' | 'error'; message: string }) {
  if (payload.type === 'success') {
    successMessage.value = payload.message;
    errorMessage.value = '';
  } else {
    errorMessage.value = payload.message;
    successMessage.value = '';
  }
}

onMounted(loadAll);

watch(activeTab, (tab) => {
  if (tab === 'overrides') loadOverrides();
  if (tab === 'analytics') loadThemeAnalytics();
});

async function loadOverrides() {
  try {
    const res = await $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/remote-config/overrides', {
      query: overrideFilterScopeId.value.trim() ? { scopeId: overrideFilterScopeId.value.trim() } : {},
    });
    overrides.value = res.data?.overrides ?? [];
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Failed to load overrides';
  }
}

async function submitOverride() {
  overrideSaving.value = true;
  errorMessage.value = '';
  try {
    let value: unknown;
    try {
      value = JSON.parse(overrideForm.valueJson);
    } catch {
      throw new Error('value JSON is invalid');
    }
    await $fetch('/api/bsplus/admin/remote-config/overrides', {
      method: 'POST',
      body: {
        scope: overrideForm.scope,
        scopeId: overrideForm.scopeId.trim(),
        kind: overrideForm.kind,
        targetKey: overrideForm.targetKey.trim() || null,
        value,
      },
    });
    successMessage.value = 'Override saved (publish to apply to extensions)';
    await loadOverrides();
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Override save failed';
  } finally {
    overrideSaving.value = false;
  }
}

async function removeOverride(id: string) {
  if (!confirm('Delete this override?')) return;
  await $fetch(`/api/bsplus/admin/remote-config/overrides/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await loadOverrides();
}

async function loadThemeAnalytics() {
  try {
    const query: Record<string, string> = { days: String(analyticsDays.value) };
    if (analyticsFilterUserId.value.trim()) query.user_id = analyticsFilterUserId.value.trim();
    if (analyticsFilterInstallId.value.trim()) query.install_id = analyticsFilterInstallId.value.trim();
    const res = await $fetch<{ success: boolean; data: any }>('/api/bsplus/admin/theme-analytics/summary', {
      query,
    });
    themeAnalytics.value = res.data;
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Failed to load theme analytics';
  }
}

function formatAnalyticsTime(unix: unknown) {
  const n = Number(unix);
  if (!Number.isFinite(n)) return '—';
  return new Date(n * 1000).toLocaleString();
}

function shortId(value: unknown) {
  if (value == null || value === '') return '—';
  const s = String(value);
  return s.length > 12 ? `${s.slice(0, 8)}…` : s;
}
</script>
