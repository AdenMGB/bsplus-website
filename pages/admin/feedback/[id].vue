<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-5xl px-6 lg:px-8">
      <div class="mb-8">
        <NuxtLink
          to="/admin/feedback"
          class="mb-4 inline-block text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-white"
        >
          &larr; Back to Feedback
        </NuxtLink>

        <div v-if="pending" class="py-16 text-center text-zinc-500">Loading feedback...</div>

        <template v-else-if="item">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="mb-3 flex flex-wrap items-center gap-2">
                <span :class="categoryBadgeClass(item.category)">
                  {{ formatLabel(item.category) }}
                </span>
                <span :class="statusBadgeClass(item.status)">
                  {{ formatLabel(item.status) }}
                </span>
                <span
                  v-if="item.admin_response"
                  class="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                >
                  Response saved
                </span>
              </div>
              <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {{ item.subject || 'Untitled feedback' }}
              </h2>
              <p class="mt-2 font-mono text-sm text-zinc-500">{{ item.id }}</p>
            </div>
          </div>

          <!-- Message -->
          <div class="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">Message</h3>
            <p class="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-100">
              {{ item.message }}
            </p>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Meta -->
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Technical details
              </h3>
              <dl class="mt-4 space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Submitted</dt>
                  <dd class="text-right text-zinc-200">{{ formatDate(item.created_at) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Extension</dt>
                  <dd class="text-right text-zinc-200">
                    v{{ item.extension?.version }}
                    <span v-if="item.extension?.channel" class="text-zinc-500">
                      ({{ item.extension.channel }})
                    </span>
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Browser</dt>
                  <dd class="text-right text-zinc-200">
                    {{ item.extension?.browser }}
                    <span v-if="item.extension?.browser_version" class="text-zinc-500">
                      {{ item.extension.browser_version }}
                    </span>
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">OS</dt>
                  <dd class="text-right text-zinc-200">{{ item.extension?.os }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Page / locale</dt>
                  <dd class="text-right text-zinc-200">
                    {{ item.context?.page || '—' }}
                    <span v-if="item.context?.locale" class="text-zinc-500">
                      · {{ item.context.locale }}
                    </span>
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Install ID</dt>
                  <dd class="max-w-[60%] truncate text-right font-mono text-xs text-zinc-400">
                    {{ item.install_id }}
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Contact / instance -->
            <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Contact & instance
              </h3>
              <dl class="mt-4 space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">Contact</dt>
                  <dd class="text-right text-zinc-200">
                    <template v-if="item.contact?.include && item.contact.email">
                      <div>{{ item.contact.name || '—' }}</div>
                      <a
                        :href="`mailto:${item.contact.email}`"
                        class="text-green-400 transition-colors duration-200 hover:text-green-300"
                      >
                        {{ item.contact.email }}
                      </a>
                    </template>
                    <span v-else class="text-zinc-500">Not provided</span>
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-zinc-500">SEQTA instance</dt>
                  <dd class="text-right text-zinc-200">
                    <template v-if="item.instance?.include && item.instance.hostname">
                      <div>{{ item.instance.hostname }}</div>
                      <div class="text-xs text-zinc-500">{{ item.instance.product || 'unknown' }}</div>
                    </template>
                    <span v-else class="text-zinc-500">Not provided</span>
                  </dd>
                </div>
                <div v-if="item.user_agent" class="pt-2">
                  <dt class="text-zinc-500">User agent</dt>
                  <dd class="mt-1 break-all text-xs text-zinc-500">{{ item.user_agent }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Status + notes -->
          <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">Triage</h3>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="status in STATUSES"
                :key="status"
                type="button"
                class="rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500"
                :class="
                  draftStatus === status
                    ? statusChipActiveClass(status)
                    : 'bg-zinc-800/50 text-zinc-400 ring-zinc-700 hover:text-zinc-200'
                "
                @click="draftStatus = status"
              >
                {{ formatLabel(status) }}
              </button>
            </div>

            <label class="mt-6 block text-sm font-medium text-zinc-300">
              Internal notes
              <textarea
                v-model="draftNotes"
                rows="4"
                placeholder="Repro steps, related issues, handoff notes..."
                class="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white placeholder:text-zinc-600 transition-colors duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </label>

            <div class="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-green-500 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                :disabled="savingTriage || !triageDirty"
                @click="saveTriage"
              >
                {{ savingTriage ? 'Saving...' : 'Save triage' }}
              </button>
              <button
                v-if="item.status !== 'resolved'"
                type="button"
                class="rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400 transition-all duration-200 hover:scale-105 hover:bg-emerald-500/10 active:scale-95 disabled:opacity-50"
                :disabled="savingTriage"
                @click="markResolved"
              >
                Mark resolved
              </button>
            </div>
            <p v-if="triageMessage" class="mt-3 text-sm text-emerald-400">{{ triageMessage }}</p>
          </div>

          <!-- Respond -->
          <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Respond to user
              </h3>
              <p v-if="!canEmail" class="text-xs text-zinc-500">
                No contact email — you can still save a response note for the record.
              </p>
            </div>

            <div
              v-if="item.admin_response"
              class="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"
            >
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-400">
                <span>Saved response</span>
                <span v-if="item.responded_at">
                  {{ formatDate(item.responded_at) }}
                  <span v-if="item.responded_by"> · {{ item.responded_by }}</span>
                </span>
              </div>
              <p class="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{{ item.admin_response }}</p>
            </div>

            <label class="mt-4 block text-sm font-medium text-zinc-300">
              Reply
              <textarea
                v-model="draftResponse"
                rows="7"
                placeholder="Thanks for the report — here's what we found..."
                class="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white placeholder:text-zinc-600 transition-colors duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </label>

            <div class="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-green-500 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                :disabled="savingResponse || !draftResponse.trim()"
                @click="saveResponse(false)"
              >
                {{ savingResponse ? 'Saving...' : 'Save response' }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400 transition-all duration-200 hover:scale-105 hover:bg-emerald-500/10 active:scale-95 disabled:opacity-50"
                :disabled="savingResponse || !draftResponse.trim()"
                @click="saveResponse(true)"
              >
                Save & mark resolved
              </button>
              <button
                v-if="canEmail"
                type="button"
                class="rounded-lg border border-sky-500/40 px-4 py-2 text-sm font-medium text-sky-400 transition-all duration-200 hover:scale-105 hover:bg-sky-500/10 active:scale-95 disabled:opacity-50"
                :disabled="!draftResponse.trim()"
                @click="openMailto"
              >
                Open email client
              </button>
              <button
                type="button"
                class="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:scale-105 hover:border-zinc-500 active:scale-95 disabled:opacity-50"
                :disabled="!draftResponse.trim()"
                @click="copyResponse"
              >
                {{ copied ? 'Copied' : 'Copy reply' }}
              </button>
            </div>
            <p v-if="responseMessage" class="mt-3 text-sm text-emerald-400">{{ responseMessage }}</p>
            <p class="mt-3 text-xs text-zinc-500">
              Email sending is not wired server-side yet — use “Open email client” to send via your mail app, then save the response here for the triage record.
            </p>
          </div>

          <!-- Same install -->
          <div
            v-if="related.length"
            class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Other feedback from this install
            </h3>
            <ul class="mt-4 divide-y divide-zinc-800">
              <li v-for="rel in related" :key="rel.id" class="py-3">
                <NuxtLink
                  :to="`/admin/feedback/${rel.id}`"
                  class="flex items-start justify-between gap-4 transition-colors duration-200 hover:text-green-400"
                >
                  <div class="min-w-0">
                    <div class="truncate font-medium text-white">{{ rel.subject || 'Untitled' }}</div>
                    <div class="mt-1 text-xs text-zinc-500">
                      {{ formatLabel(rel.category) }} · {{ formatLabel(rel.status) }}
                    </div>
                  </div>
                  <div class="shrink-0 text-xs text-zinc-500">{{ formatDate(rel.created_at) }}</div>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>

        <div v-else class="py-16 text-center text-zinc-500">
          Feedback not found.
          <NuxtLink to="/admin/feedback" class="mt-2 block text-green-400 hover:text-green-300">
            Return to list
          </NuxtLink>
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
const feedbackId = computed(() => String(route.params.id || ''));

const STATUSES = [
  'received',
  'triaged',
  'in_progress',
  'resolved',
  'wontfix',
  'spam',
] as const;

interface FeedbackDetail {
  id: string;
  install_id: string;
  category: string;
  subject: string | null;
  message: string;
  status: string;
  internal_notes: string | null;
  admin_response: string | null;
  responded_at: string | null;
  responded_by: string | null;
  created_at: string;
  updated_at: string;
  user_agent?: string | null;
  extension?: {
    version: string;
    browser: string;
    browser_version: string | null;
    os: string;
    channel: string | null;
  };
  contact?: { include: boolean; name: string | null; email: string | null };
  instance?: { include: boolean; hostname: string | null; product: string | null };
  context?: { page: string | null; locale: string | null; dark_mode: boolean | null };
}

interface FeedbackListResponse {
  items: FeedbackDetail[];
}

const {
  data: item,
  pending,
  refresh,
  error,
} = await useFetch<FeedbackDetail>(() => `/api/bsplus/feedback/${feedbackId.value}`, {
  watch: [feedbackId],
});

const related = ref<FeedbackDetail[]>([]);
const draftStatus = ref('received');
const draftNotes = ref('');
const draftResponse = ref('');
const savingTriage = ref(false);
const savingResponse = ref(false);
const triageMessage = ref('');
const responseMessage = ref('');
const copied = ref(false);

const canEmail = computed(
  () => !!(item.value?.contact?.include && item.value.contact.email)
);

const triageDirty = computed(() => {
  if (!item.value) return false;
  return (
    draftStatus.value !== item.value.status ||
    (draftNotes.value || '') !== (item.value.internal_notes || '')
  );
});

watch(
  item,
  (value) => {
    if (!value) return;
    draftStatus.value = value.status;
    draftNotes.value = value.internal_notes || '';
    draftResponse.value = value.admin_response || '';
    loadRelated(value.install_id, value.id);
  },
  { immediate: true }
);

watch(error, (err) => {
  if (err) {
    console.error(err);
  }
});

useHead({
  title: computed(() =>
    item.value?.subject
      ? `${item.value.subject} — Feedback`
      : 'Feedback Detail — Admin'
  ),
});

async function loadRelated(installId: string, currentId: string) {
  try {
    const data = await $fetch<FeedbackListResponse>('/api/bsplus/feedback', {
      query: { installId, limit: '6' },
    });
    related.value = (data.items || []).filter((row) => row.id !== currentId).slice(0, 5);
  } catch {
    related.value = [];
  }
}

async function saveTriage() {
  if (!item.value) return;
  savingTriage.value = true;
  triageMessage.value = '';
  try {
    await $fetch(`/api/bsplus/feedback/${item.value.id}`, {
      method: 'PATCH',
      body: {
        status: draftStatus.value,
        internal_notes: draftNotes.value.trim() || null,
      },
    });
    await refresh();
    triageMessage.value = 'Triage saved.';
  } catch (e: any) {
    alert(e?.data?.message || 'Failed to save triage');
  } finally {
    savingTriage.value = false;
  }
}

async function markResolved() {
  draftStatus.value = 'resolved';
  await saveTriage();
}

async function saveResponse(alsoResolve: boolean) {
  if (!item.value || !draftResponse.value.trim()) return;
  savingResponse.value = true;
  responseMessage.value = '';
  try {
    const body: Record<string, string> = {
      admin_response: draftResponse.value.trim(),
    };
    if (alsoResolve) body.status = 'resolved';
    else if (item.value.status === 'received') body.status = 'triaged';

    await $fetch(`/api/bsplus/feedback/${item.value.id}`, {
      method: 'PATCH',
      body,
    });
    await refresh();
    responseMessage.value = alsoResolve
      ? 'Response saved and marked resolved.'
      : 'Response saved.';
  } catch (e: any) {
    alert(e?.data?.message || 'Failed to save response');
  } finally {
    savingResponse.value = false;
  }
}

function openMailto() {
  if (!item.value?.contact?.email || !draftResponse.value.trim()) return;
  const subject = encodeURIComponent(
    `Re: ${item.value.subject || 'BetterSEQTA+ feedback'} [${item.value.id}]`
  );
  const body = encodeURIComponent(
    `Hi${item.value.contact.name ? ` ${item.value.contact.name}` : ''},\n\n${draftResponse.value.trim()}\n\n— BetterSEQTA+ team\nReference: ${item.value.id}`
  );
  window.open(`mailto:${item.value.contact.email}?subject=${subject}&body=${body}`, '_blank');
}

async function copyResponse() {
  if (!draftResponse.value.trim()) return;
  try {
    await navigator.clipboard.writeText(draftResponse.value.trim());
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    alert('Could not copy to clipboard');
  }
}

function formatLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    received: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    triaged: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    wontfix: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/20',
    spam: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };
  return `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${map[status] || map.received}`;
}

function statusChipActiveClass(status: string) {
  const map: Record<string, string> = {
    received: 'bg-amber-500/20 text-amber-300 ring-amber-500/40',
    triaged: 'bg-sky-500/20 text-sky-300 ring-sky-500/40',
    in_progress: 'bg-indigo-500/20 text-indigo-300 ring-indigo-500/40',
    resolved: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40',
    wontfix: 'bg-zinc-500/20 text-zinc-200 ring-zinc-500/40',
    spam: 'bg-red-500/20 text-red-300 ring-red-500/40',
  };
  return map[status] || map.received;
}

function categoryBadgeClass(category: string) {
  const map: Record<string, string> = {
    bug: 'bg-red-500/10 text-red-300 ring-red-500/20',
    feature: 'bg-purple-500/10 text-purple-300 ring-purple-500/20',
    question: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
    other: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/20',
  };
  return `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${map[category] || map.other}`;
}
</script>
