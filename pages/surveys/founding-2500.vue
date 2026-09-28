<script setup lang="ts">
import { primaryFounderBadgeForSignup } from '~/utils/badges';

definePageMeta({
  layout: 'default',
});

useHead({
  title: 'BetterSEQTA Cloud — 2,500 Users Celebration Survey',
});

const route = useRoute();
const { user, loading: authLoading, fetchUser, login } = useAuth();

const step = ref<'intro' | 'auth' | 'ineligible' | 'survey' | 'done'>('intro');
const submitError = ref('');
const submitting = ref(false);
const confettiRef = ref<{ burst?: () => void } | null>(null);

const inviteQuery = computed(() => {
  const invite = route.query.invite;
  return typeof invite === 'string' ? invite : '';
});

const apiQuery = computed(() => (inviteQuery.value ? { invite: inviteQuery.value } : undefined));

const { data: statusData, refresh: refreshStatus } = await useFetch(
  () => `/api/surveys/founding-2500/status`,
  { query: apiQuery, credentials: 'include' }
);

const eligibilityUrl = computed(() =>
  inviteQuery.value
    ? `/api/surveys/founding-2500/eligibility?invite=${encodeURIComponent(inviteQuery.value)}`
    : '/api/surveys/founding-2500/eligibility'
);

const {
  data: eligibilityData,
  pending: eligibilityPending,
  refresh: refreshEligibility,
} = await useFetch(eligibilityUrl, {
  immediate: false,
  credentials: 'include',
});

onMounted(async () => {
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
  await fetchUser(headers);
  if (inviteQuery.value) {
    await refreshEligibility();
  }
  await resolveStep();
});

watch(user, () => {
  resolveStep();
});

watch(statusData, () => {
  resolveStep();
});

async function resolveStep() {
  if (authLoading.value) return;

  if (statusData.value?.completed || eligibilityData.value?.completed) {
    step.value = 'done';
    return;
  }

  if (!user.value) {
    if (inviteQuery.value && statusData.value?.invite?.valid) {
      step.value = 'intro';
      return;
    }
    step.value = step.value === 'intro' ? 'intro' : 'auth';
    return;
  }

  await refreshEligibility();
  if (eligibilityData.value?.completed) {
    step.value = 'done';
    return;
  }

  if (eligibilityData.value && !eligibilityData.value.eligible) {
    step.value = 'ineligible';
    return;
  }

  if (eligibilityData.value?.eligible) {
    step.value = 'survey';
  }
}

function handleIntroContinue() {
  if (!user.value) {
    step.value = 'auth';
    return;
  }
  resolveStep();
}

function signIn() {
  login('/surveys/founding-2500');
}

const form = reactive({
  performance_rating: 8,
  cloud_features: '',
  improvements: '',
  nps_rating: 9,
  referral_source: '',
  additional_feedback: '',
});

const referralOptions = [
  { value: 'friend', label: 'Friend or classmate' },
  { value: 'school', label: 'School / teacher' },
  { value: 'social_media', label: 'Social media' },
  { value: 'search', label: 'Search engine' },
  { value: 'extension', label: 'BetterSEQTA+ extension' },
  { value: 'other', label: 'Other' },
];

const displayName = computed(
  () =>
    eligibilityData.value?.displayName ||
    statusData.value?.invite?.display_name ||
    user.value?.displayName ||
    user.value?.username ||
    null
);

const resolvedSignupNumber = computed(
  () => eligibilityData.value?.signup_number ?? statusData.value?.invite?.signup_number ?? null
);

const primaryBadge = computed(() => primaryFounderBadgeForSignup(resolvedSignupNumber.value));

const earnedBadges = computed(() => {
  if (primaryBadge.value) return [primaryBadge.value.key];
  const fromApi = (eligibilityData.value?.badges || []).map((b: any) => b.badge_key || b.key).filter(Boolean);
  if (fromApi.length) return [fromApi[0]];
  return [];
});

async function submitSurvey() {
  submitError.value = '';
  submitting.value = true;
  try {
    await $fetch('/api/surveys/founding-2500/responses', {
      method: 'POST',
      query: apiQuery.value,
      body: { ...form },
      credentials: 'include',
    });
    step.value = 'done';
    await refreshStatus();
    confettiRef.value?.burst?.();
  } catch (error: any) {
    submitError.value = error?.data?.statusMessage || error?.statusMessage || 'Failed to submit survey';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="relative min-h-[80vh] overflow-hidden py-16 sm:py-24">
    <div class="pointer-events-none fixed inset-0 z-0">
      <SurveyConfettiCanvas ref="confettiRef" :active="step !== 'ineligible'" />
    </div>

    <div class="relative z-10 mx-auto max-w-3xl px-6">
      <div v-if="step === 'intro'">
        <SurveyCelebrationIntro
          :display-name="displayName"
          :signup-number="resolvedSignupNumber"
          @continue="handleIntroContinue"
        />
      </div>

      <div v-else-if="step === 'auth'" class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center backdrop-blur-sm">
        <SurveyCelebrationIntro
          :display-name="null"
          :signup-number="null"
          @continue="signIn"
        />
        <p class="mt-6 text-zinc-400">Sign in with your BetterSEQTA account to check eligibility and share feedback.</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          @click="signIn"
        >
          Sign in to continue
        </button>
      </div>

      <div v-else-if="step === 'ineligible'" class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center">
        <div class="text-4xl">💙</div>
        <h2 class="mt-4 text-2xl font-bold text-white">Thanks for being part of BetterSEQTA</h2>
        <p class="mt-3 text-zinc-400">
          This celebration survey is reserved for our first 2,500 Cloud members.
          <span v-if="resolvedSignupNumber">You're user #{{ resolvedSignupNumber.toLocaleString() }}.</span>
        </p>
        <NuxtLink
          to="/"
          class="mt-6 inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105 hover:border-zinc-500"
        >
          Back to home
        </NuxtLink>
      </div>

      <form
        v-else-if="step === 'survey'"
        class="space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 backdrop-blur-sm"
        @submit.prevent="submitSurvey"
      >
        <div>
          <h2 class="text-2xl font-bold text-white">Founding member feedback</h2>
          <p class="mt-2 text-zinc-400">
            Help shape BetterSEQTA Cloud — this takes about 2 minutes.
          </p>
        </div>

        <div
          v-if="primaryBadge || resolvedSignupNumber"
          class="rounded-xl border border-green-500/30 bg-green-500/5 p-4 sm:p-5"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-left">
              <p class="text-sm font-medium text-white">Your founder badge</p>
              <p class="mt-1 text-sm leading-relaxed text-zinc-300">
                <span v-if="resolvedSignupNumber">
                  As user #{{ resolvedSignupNumber.toLocaleString() }}, you're one of our first 2,500 Cloud members
                </span>
                <span v-else>
                  You're one of our first 2,500 Cloud members
                </span>
                <span v-if="primaryBadge">
                  — and you've earned the exclusive
                  <span class="font-semibold text-green-400">{{ primaryBadge.label }}</span>
                  badge on your profile.
                </span>
                <span v-else>.</span>
                Thank you for being here from the start.
              </p>
            </div>
            <BadgesUserBadge
              v-if="primaryBadge"
              :badge-key="primaryBadge.key"
              :signup-number="resolvedSignupNumber"
              :signed-up-at="eligibilityData?.created_at"
              class="shrink-0 self-start sm:self-center"
            />
          </div>
        </div>

        <fieldset>
          <legend class="text-sm font-medium text-white">How well do you think BetterSEQTA performs?</legend>
          <input v-model.number="form.performance_rating" type="range" min="1" max="10" class="mt-3 w-full accent-green-500" />
          <div class="mt-1 text-sm text-green-400">{{ form.performance_rating }} / 10</div>
        </fieldset>

        <fieldset>
          <legend class="text-sm font-medium text-white">Which BetterSEQTA Cloud features would you like to see next?</legend>
          <textarea
            v-model="form.cloud_features"
            required
            rows="4"
            maxlength="5000"
            class="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Tell us what you'd love in BetterSEQTA Cloud — sync, themes, mobile, anything..."
          />
        </fieldset>

        <fieldset>
          <legend class="text-sm font-medium text-white">What BetterSEQTA / DesQTA improvements matter most to you?</legend>
          <textarea
            v-model="form.improvements"
            required
            rows="4"
            maxlength="5000"
            class="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Performance, UI polish, SEQTA integration, DesQTA, reliability — whatever matters most..."
          />
        </fieldset>

        <fieldset>
          <legend class="text-sm font-medium text-white">How likely are you to recommend BetterSEQTA?</legend>
          <input v-model.number="form.nps_rating" type="range" min="1" max="10" class="mt-3 w-full accent-green-500" />
          <div class="mt-1 text-sm text-green-400">{{ form.nps_rating }} / 10</div>
        </fieldset>

        <fieldset>
          <legend class="text-sm font-medium text-white">What brought you to BetterSEQTA Cloud?</legend>
          <select
            v-model="form.referral_source"
            required
            class="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option disabled value="">Select one</option>
            <option v-for="option in referralOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </fieldset>

        <fieldset>
          <legend class="text-sm font-medium text-white">Anything else you'd love to see from us?</legend>
          <textarea
            v-model="form.additional_feedback"
            rows="4"
            maxlength="5000"
            class="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Optional — features, polish, wild ideas..."
          />
        </fieldset>

        <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

        <button
          type="submit"
          :disabled="submitting || eligibilityPending"
          class="w-full rounded-lg bg-green-600 px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-green-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {{ submitting ? 'Submitting...' : 'Submit feedback' }}
        </button>
      </form>

      <div v-else-if="step === 'done'" class="rounded-2xl border border-green-500/30 bg-zinc-900/90 p-8 text-center backdrop-blur-sm">
        <div class="text-5xl">🎉</div>
        <h2 class="mt-4 text-3xl font-bold text-white">Thank you!</h2>
        <p class="mt-3 text-zinc-300">
          Your feedback helps us build BetterSEQTA Cloud for founding members like you.
        </p>
        <p
          v-if="primaryBadge && resolvedSignupNumber"
          class="mt-2 text-sm text-zinc-400"
        >
          Your {{ primaryBadge.label }} badge is waiting on your profile — thanks for helping us celebrate 2,500 users.
        </p>
        <div v-if="earnedBadges.length" class="mt-6 flex flex-wrap justify-center gap-2">
          <BadgesUserBadge
            v-for="badgeKey in earnedBadges"
            :key="badgeKey"
            :badge-key="badgeKey"
            :signup-number="resolvedSignupNumber"
            :signed-up-at="eligibilityData?.created_at"
          />
        </div>
        <NuxtLink
          to="/"
          class="mt-8 inline-flex rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-green-500"
        >
          Back to BetterSEQTA
        </NuxtLink>
      </div>

      <div v-if="authLoading || eligibilityPending" class="mt-6 text-center text-sm text-zinc-500">
        Checking your account...
      </div>
    </div>
  </div>
</template>
