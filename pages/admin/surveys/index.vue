<script setup lang="ts">
definePageMeta({ middleware: ['admin'] });

const { data, pending, refresh } = await useFetch<{ surveys: any[] }>('/api/admin/surveys');
</script>

<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <NuxtLink to="/admin" class="mb-4 inline-block text-sm text-zinc-400 hover:text-white">&larr; Dashboard</NuxtLink>
          <h2 class="text-3xl font-bold text-white sm:text-4xl">Milestone Surveys</h2>
          <p class="mt-2 text-zinc-400">Track founding-member surveys and email campaigns.</p>
        </div>
        <NuxtLink
          to="/admin/api-keys"
          class="inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:scale-105 hover:border-zinc-500"
        >
          Service API Keys
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-zinc-500">Loading surveys...</div>

      <div v-else class="grid gap-4">
        <NuxtLink
          v-for="survey in data?.surveys || []"
          :key="survey.id"
          :to="`/admin/surveys/${survey.slug}`"
          class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:scale-[1.02] hover:border-green-500/30"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-semibold text-white">{{ survey.title }}</h3>
              <p class="mt-1 text-sm text-zinc-500">{{ survey.slug }}</p>
            </div>
            <span
              class="rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
              :class="
                survey.status === 'active'
                  ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                  : survey.status === 'closed'
                    ? 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20'
                    : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
              "
            >
              {{ survey.status }}
            </span>
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt class="text-zinc-500">Responses</dt>
              <dd class="font-semibold text-white">{{ survey.stats?.response_count ?? 0 }}</dd>
            </div>
            <div>
              <dt class="text-zinc-500">Queue pending</dt>
              <dd class="font-semibold text-amber-400">{{ survey.stats?.queue_pending ?? 0 }}</dd>
            </div>
            <div>
              <dt class="text-zinc-500">Emails sent</dt>
              <dd class="font-semibold text-green-400">{{ survey.stats?.queue_sent ?? 0 }}</dd>
            </div>
            <div>
              <dt class="text-zinc-500">Failed</dt>
              <dd class="font-semibold text-red-400">{{ survey.stats?.queue_failed ?? 0 }}</dd>
            </div>
          </dl>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
