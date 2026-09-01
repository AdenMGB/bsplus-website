<script setup lang="ts">
const props = defineProps<{
  displayName?: string | null;
  signupNumber?: number | null;
}>();

const emit = defineEmits<{
  continue: [];
}>();

const formattedNumber = computed(() => {
  if (!props.signupNumber) return null;
  return props.signupNumber.toLocaleString();
});
</script>

<template>
  <section class="relative overflow-hidden rounded-2xl border border-green-500/30 bg-zinc-900/80 p-8 text-center shadow-xl backdrop-blur-sm">
    <div class="party-lights pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

    <div class="relative z-10">
      <div class="mb-4 text-5xl">🎂🎉</div>
      <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Congratulations<span v-if="displayName">, {{ displayName }}</span>!
      </h1>
      <p class="mt-4 text-lg leading-relaxed text-zinc-300">
        BetterSEQTA Cloud just hit
        <span class="font-semibold text-green-400">2,500 users</span>.
      </p>
      <p v-if="formattedNumber" class="mt-3 text-xl text-white">
        You're user
        <span class="bg-gradient-to-r from-green-400 to-lime-300 bg-clip-text text-3xl font-black text-transparent">
          #{{ formattedNumber }}
        </span>
        — a founding Cloud member.
      </p>
      <p v-else class="mt-3 text-zinc-400">
        Sign in to see your signup number and founder badges.
      </p>

      <button
        type="button"
        class="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-green-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        @click="emit('continue')"
      >
        Continue
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.party-lights {
  background:
    radial-gradient(circle at 10% 20%, rgba(34, 197, 94, 0.35), transparent 40%),
    radial-gradient(circle at 90% 15%, rgba(234, 179, 8, 0.35), transparent 35%),
    radial-gradient(circle at 20% 85%, rgba(236, 72, 153, 0.3), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3), transparent 35%);
  animation: partyPulse 4s ease-in-out infinite alternate;
}

@keyframes partyPulse {
  0% {
    filter: hue-rotate(0deg);
    transform: scale(1);
  }
  100% {
    filter: hue-rotate(35deg);
    transform: scale(1.03);
  }
}
</style>
