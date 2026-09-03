<script setup lang="ts">
definePageMeta({ middleware: ['admin'] });

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));

const { data, pending, refresh } = await useFetch(() => `/api/admin/surveys/${slug.value}`);

const seeding = ref(false);
const draining = ref(false);
const drainResult = ref<any>(null);
const updatingStatus = ref(false);
const seedResult = ref<any>(null);

const testEmail = ref('');
const testSending = ref(false);
const testResult = ref<any>(null);
const memberSearch = ref('');
const membersLoading = ref(false);
const members = ref<Array<{
  id: string;
  email: string;
  displayName?: string | null;
  username?: string | null;
  signup_number: number | null;
}>>([]);

async function loadMembers() {
  membersLoading.value = true;
  try {
    const result = await $fetch<{ members: typeof members.value }>(
      `/api/admin/surveys/${slug.value}/campaign/members`,
      { query: { q: memberSearch.value || undefined, limit: 200 } },
    );
    members.value = result.members || [];
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to load founding members');
  } finally {
    membersLoading.value = false;
  }
}

async function sendTestEmail() {
  const email = testEmail.value.trim();
  if (!email) {
    alert('Choose or enter an email address');
    return;
  }
  if (!confirm(`Send a test survey email to ${email}?`)) return;

  testSending.value = true;
  testResult.value = null;
  try {
    testResult.value = await $fetch(`/api/admin/surveys/${slug.value}/campaign/test-send`, {
      method: 'POST',
      body: { email },
    });
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to send test email');
  } finally {
    testSending.value = false;
  }
}

function pickMember(email: string) {
  testEmail.value = email;
}

const queueTotal = computed(() => {
  const stats = data.value?.stats;
  if (!stats) return 0;
  return (
    (stats.queue_pending || 0) +
    (stats.queue_sent || 0) +
    (stats.queue_failed || 0) +
    (stats.queue_skipped || 0)
  );
});

const queueProgress = computed(() => {
  const stats = data.value?.stats;
  if (!stats || !queueTotal.value) return 0;
  return Math.round(((stats.queue_sent || 0) / queueTotal.value) * 100);
});

async function seedCampaign() {
  if (!confirm('Seed email queue for all founding 2,500 users from accounts export?')) return;
  seeding.value = true;
  seedResult.value = null;
  try {
    seedResult.value = await $fetch(`/api/admin/surveys/${slug.value}/campaign/seed`, {
      method: 'POST',
      body: { limit: 2500 },
    });
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to seed campaign');
  } finally {
    seeding.value = false;
  }
}

async function drainCampaignFullQuota() {
  const pending = data.value?.stats?.queue_pending ?? 0;
  if (!pending) {
    alert('No pending emails in the queue.');
    return;
  }
  if (
    !confirm(
      `Send up to ${Math.min(pending, 500)} pending emails now? Quota checks are skipped — only emails BS Mail confirms will be marked sent.`,
    )
  ) {
    return;
  }

  draining.value = true;
  drainResult.value = null;
  try {
    drainResult.value = await $fetch(`/api/admin/surveys/${slug.value}/campaign/drain`, {
      method: 'POST',
      body: { useFullQuota: true },
    });
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to drain email queue');
  } finally {
    draining.value = false;
  }
}

async function setStatus(status: string) {
  updatingStatus.value = true;
  try {
    await $fetch(`/api/admin/surveys/${slug.value}/status`, {
      method: 'PATCH',
      body: { status },
    });
    await refresh();
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Failed to update status');
  } finally {
    updatingStatus.value = false;
  }
}
</script>

<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <NuxtLink to="/admin/surveys" class="mb-4 inline-block text-sm text-zinc-400 hover:text-white">&larr; All surveys</NuxtLink>

      <div v-if="pending" class="text-zinc-500">Loading survey...</div>

      <template v-else-if="data?.survey">
        <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-3xl font-bold text-white">{{ data.survey.title }}</h2>
            <p class="mt-2 text-zinc-400">{{ data.survey.description }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a
              :href="`/surveys/${slug}`"
              target="_blank"
              rel="noopener"
              class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105"
            >
              Preview live survey
            </a>
            <button
              type="button"
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
              :disabled="updatingStatus"
              @click="setStatus(data.survey.status === 'active' ? 'closed' : 'active')"
            >
              {{ data.survey.status === 'active' ? 'Close survey' : 'Activate survey' }}
            </button>
          </div>
        </div>

        <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Responses</dt>
            <dd class="mt-2 text-3xl font-bold text-white">{{ data.stats.response_count }}</dd>
          </div>
          <div class="rounded-2xl border border-sky-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Link clicks</dt>
            <dd class="mt-2 text-3xl font-bold text-sky-400">{{ data.stats.queue_clicked || 0 }}</dd>
          </div>
          <div class="rounded-2xl border border-amber-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Queue pending</dt>
            <dd class="mt-2 text-3xl font-bold text-amber-400">{{ data.stats.queue_pending }}</dd>
          </div>
          <div class="rounded-2xl border border-green-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Sent</dt>
            <dd class="mt-2 text-3xl font-bold text-green-400">{{ data.stats.queue_sent }}</dd>
          </div>
          <div class="rounded-2xl border border-red-500/20 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Failed</dt>
            <dd class="mt-2 text-3xl font-bold text-red-400">{{ data.stats.queue_failed }}</dd>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <dt class="text-sm text-zinc-400">Skipped</dt>
            <dd class="mt-2 text-3xl font-bold text-zinc-300">{{ data.stats.queue_skipped }}</dd>
          </div>
        </div>

        <div class="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Email campaign</h3>
              <p class="mt-1 text-sm text-zinc-400">
                Seeds queue from accounts signup-order export, then sends the first batch immediately (up to 40 emails when mail quota allows). Cron continues draining every 30 minutes.
              </p>
              <p v-if="data.stats.queue_pending" class="mt-2 text-sm text-amber-400/90">
                {{ data.stats.queue_pending }} emails pending — override sends up to 500 per click and skips quota checks.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                :disabled="seeding"
                @click="seedCampaign"
              >
                {{ seeding ? 'Seeding & sending…' : 'Send survey emails (seed queue)' }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                :disabled="draining || !(data.stats.queue_pending > 0)"
                @click="drainCampaignFullQuota"
              >
                {{ draining ? 'Sending…' : 'Send pending (full quota override)' }}
              </button>
            </div>
          </div>

          <div v-if="queueTotal" class="mt-4">
            <div class="mb-2 flex justify-between text-sm text-zinc-400">
              <span>Campaign progress</span>
              <span>{{ queueProgress }}% sent</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div class="h-full bg-green-500 transition-all duration-200" :style="{ width: `${queueProgress}%` }" />
            </div>
          </div>

          <pre v-if="seedResult" class="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-green-400">{{ seedResult }}</pre>
          <pre v-if="drainResult" class="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-amber-300">{{ drainResult }}</pre>
        </div>

        <div class="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-semibold text-white">Send test email</h3>
              <p class="mt-1 text-sm text-zinc-400">
                Send one survey email to a founding 2,500 member. Subject is prefixed with [TEST]. Uses a fresh invite link.
              </p>

              <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label class="block min-w-0 flex-1">
                  <span class="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Recipient email</span>
                  <input
                    v-model="testEmail"
                    type="email"
                    list="founding-member-emails"
                    placeholder="member@example.com"
                    class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
                <button
                  type="button"
                  class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  :disabled="testSending || !testEmail.trim()"
                  @click="sendTestEmail"
                >
                  {{ testSending ? 'Sending…' : 'Send test' }}
                </button>
              </div>

              <datalist id="founding-member-emails">
                <option v-for="member in members" :key="member.id" :value="member.email">
                  #{{ member.signup_number }} — {{ member.displayName || member.username || member.email }}
                </option>
              </datalist>

              <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  v-model="memberSearch"
                  type="search"
                  placeholder="Search founding members by email, name, or signup #"
                  class="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  @keydown.enter.prevent="loadMembers"
                />
                <button
                  type="button"
                  class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  :disabled="membersLoading"
                  @click="loadMembers"
                >
                  {{ membersLoading ? 'Loading…' : 'Load members' }}
                </button>
              </div>

              <div v-if="members.length" class="mt-4 max-h-56 overflow-y-auto rounded-lg border border-zinc-800">
                <button
                  v-for="member in members"
                  :key="member.id"
                  type="button"
                  class="flex w-full items-center justify-between gap-3 border-b border-zinc-800 px-4 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-zinc-800/60"
                  :class="testEmail === member.email ? 'bg-zinc-800/40' : ''"
                  @click="pickMember(member.email)"
                >
                  <span class="min-w-0 truncate text-zinc-200">
                    {{ member.displayName || member.username || member.email }}
                  </span>
                  <span class="shrink-0 font-mono text-xs text-zinc-500">#{{ member.signup_number }}</span>
                  <span class="hidden shrink-0 text-xs text-zinc-500 sm:inline">{{ member.email }}</span>
                </button>
              </div>
            </div>
          </div>

          <pre v-if="testResult" class="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-sky-400">{{ testResult }}</pre>
        </div>

        <AdminSurveyResponsesPanel :slug="slug" />
      </template>
    </div>
  </div>
</template>
