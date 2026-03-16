<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex flex-col gap-6 mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h2>
          <p class="mt-2 text-lg text-zinc-400">Welcome back, Admin.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/admin/analytics" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-3 py-2 text-sm font-medium text-emerald-400 transition-all duration-200 hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Analytics
          </NuxtLink>
          <NuxtLink to="/admin/themes" class="inline-flex items-center gap-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 px-3 py-2 text-sm font-medium text-purple-400 transition-all duration-200 hover:scale-105">
            Themes
          </NuxtLink>
          <NuxtLink to="/admin/collections" class="inline-flex items-center gap-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-3 py-2 text-sm font-medium text-blue-400 transition-all duration-200 hover:scale-105">
            Collections
          </NuxtLink>
          <NuxtLink to="/admin/questionnaire" class="inline-flex items-center gap-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-2 text-sm font-medium text-indigo-400 transition-all duration-200 hover:scale-105">
            Questions
          </NuxtLink>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="mb-12">
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Overview</h3>
        <div v-if="overviewLoading" class="mb-8 flex items-center gap-2 text-zinc-500">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading stats...
        </div>
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <!-- Stats Cards -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm font-medium leading-6 text-zinc-400">Themes</dt>
          <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.themes?.total || 0 }}</dd>
          <dd class="mt-1 text-sm text-zinc-500">{{ stats.themes?.pending || 0 }} pending</dd>
          <NuxtLink to="/admin/themes" class="mt-4 inline-flex items-center gap-2 rounded-md bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/20 hover:border-purple-600/40 px-3 py-1.5 text-xs font-medium text-purple-400 transition-all hover:scale-105">
            Manage Themes
          </NuxtLink>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm font-medium leading-6 text-zinc-400">Collections</dt>
          <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.collections?.total || 0 }}</dd>
          <dd class="mt-1 text-sm text-zinc-500">{{ stats.collections?.totalThemes || 0 }} themes total</dd>
          <NuxtLink to="/admin/collections" class="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 hover:border-blue-600/40 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:scale-105">
            Manage Collections
          </NuxtLink>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm font-medium leading-6 text-zinc-400">News Posts</dt>
          <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.news?.total || 0 }}</dd>
          <dd class="mt-1 text-sm text-zinc-500">{{ stats.news?.published || 0 }} published</dd>
          <NuxtLink to="/admin/news/create" class="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 hover:border-green-600/40 px-3 py-1.5 text-xs font-medium text-green-400 transition-all hover:scale-105">
            Create Post
          </NuxtLink>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm font-medium leading-6 text-zinc-400">Extension Sessions</dt>
          <div class="flex items-baseline gap-2">
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.sessions?.total || 0 }}</dd>
            <button @click="flushSessions" class="text-xs text-green-500 hover:text-green-400 font-medium flex items-center gap-1" title="Force update from buffer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
          <p v-if="stats.sessions?.buffer" class="text-xs text-zinc-500 mt-2">
            Next update: {{ getTimeUntil(stats.sessions.buffer.nextFlushEstimate) }}
            ({{ stats.sessions.buffer.totalBuffered }} buffered)
          </p>
          <NuxtLink to="/admin/analytics" class="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 hover:border-green-600/40 px-3 py-1.5 text-xs font-medium text-green-400 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            View Charts
          </NuxtLink>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm font-medium leading-6 text-zinc-400">Daily Questions</dt>
          <div class="flex items-baseline gap-2">
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.questions?.total || 0 }}</dd>
            <button @click="syncVotes" :disabled="syncingVotes" class="text-xs text-green-500 hover:text-green-400 font-medium flex items-center gap-1 disabled:opacity-50" title="Sync votes to database">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {{ syncingVotes ? 'Syncing...' : 'Sync Votes' }}
            </button>
          </div>
          <p class="text-xs text-zinc-500 mt-2">
            {{ stats.questions?.active || 0 }} active
          </p>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm font-medium leading-6 text-zinc-400">DesQTA Sessions</dt>
          <div class="flex items-baseline gap-2">
            <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ stats.desqtaSessions?.total || 0 }}</dd>
            <button @click="flushSessions" class="text-xs text-green-500 hover:text-green-400 font-medium flex items-center gap-1" title="Force update from buffer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
          <p v-if="stats.desqtaSessions?.buffer" class="text-xs text-zinc-500 mt-2">
            Next update: {{ getTimeUntil(stats.desqtaSessions.buffer.nextFlushEstimate) }}
            ({{ stats.desqtaSessions.buffer.totalBuffered }} buffered)
          </p>
          <NuxtLink to="/admin/analytics" class="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 hover:border-blue-600/40 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            View Charts
          </NuxtLink>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]">
          <dt class="text-sm font-medium leading-6 text-zinc-400">App Usage (30d)</dt>
          <dd class="mt-2 text-3xl font-bold tracking-tight text-white">{{ usageSummary.totalReports ?? 0 }}</dd>
          <dd class="mt-1 text-sm text-zinc-500">{{ usageSummary.totalSessions ?? 0 }} sessions · {{ usageSummary.uniqueClients ?? 0 }} devices</dd>
          <NuxtLink to="/admin/analytics" class="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/20 hover:border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:scale-105">
            Full Analytics
          </NuxtLink>
        </div>
        </div>
      </div>

      <!-- Collections Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Collections</h3>
          <NuxtLink to="/admin/collections/new" class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Collection
          </NuxtLink>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 class="text-base font-semibold leading-7 text-white">Recent Collections</h3>
            <NuxtLink to="/admin/collections" class="text-sm font-medium text-blue-500 hover:text-blue-400">View all</NuxtLink>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <NuxtLink
                v-for="collection in recentCollections"
                :key="collection.id"
                :to="`/admin/collections/${collection.id}`"
                class="flex items-center gap-4 p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <div class="aspect-video w-16 shrink-0 rounded overflow-hidden bg-zinc-900">
                  <img v-if="collection.cover_image_url" :src="collection.cover_image_url" :alt="collection.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-zinc-600">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-white truncate">{{ collection.name }}</div>
                  <div class="text-xs text-zinc-500 mt-0.5">{{ collection.theme_count || 0 }} themes</div>
                </div>
              </NuxtLink>
              <div v-if="collectionsLoading" class="col-span-full text-center py-8 text-zinc-500">
                Loading collections...
              </div>
              <div v-else-if="!recentCollections?.length" class="col-span-full text-center py-8 text-zinc-500 italic">
                No collections yet. Create your first collection!
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Questions Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Daily Questions</h3>
          <NuxtLink to="/admin/questionnaire/create" class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Question
          </NuxtLink>
        </div>

        <!-- Recent Questions Table -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 class="text-base font-semibold leading-7 text-white">Recent Questions</h3>
            <NuxtLink to="/admin/questionnaire" class="text-sm font-medium text-blue-500 hover:text-blue-400">View all</NuxtLink>
          </div>
          <div class="flow-root">
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-zinc-900/50 text-white">
                  <tr>
                    <th scope="col" class="px-6 py-3 font-semibold">Question</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Expires</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Votes</th>
                    <th scope="col" class="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800">
                  <tr v-for="q in recentQuestions" :key="q.id" class="hover:bg-zinc-800/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-medium text-white max-w-md truncate">{{ q.question }}</div>
                      <div class="text-xs text-zinc-500 mt-1">
                        {{ q.is_active ? 'Currently Active' : 'Next in Queue' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-zinc-400">
                      <div v-if="q.is_active">{{ q.expires_at_formatted }}</div>
                      <div v-else class="text-zinc-500">Auto-activates after current</div>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="[
                        q.is_active ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                      ]">
                        {{ q.is_active ? 'Active' : 'Queued' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-zinc-400">{{ q.total_votes || 0 }}</td>
                    <td class="px-6 py-4 text-right">
                      <NuxtLink :to="`/admin/questionnaire/edit/${q.id}`" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Edit</NuxtLink>
                    </td>
                  </tr>
                  <tr v-if="questionsLoading">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-500">Loading questions...</td>
                  </tr>
                  <tr v-else-if="!recentQuestions || recentQuestions.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-500 italic">No questions found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Themes Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Theme Marketplace</h3>
          <div class="flex gap-2">
            <NuxtLink to="/admin/themes/upload" class="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-all hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Upload Theme
            </NuxtLink>
            <NuxtLink to="/admin/collections" class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:scale-105">
              Collections
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Themes Table -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 class="text-base font-semibold leading-7 text-white">Recent Themes</h3>
            <NuxtLink to="/admin/themes" class="text-sm font-medium text-purple-500 hover:text-purple-400">View all</NuxtLink>
          </div>
          <div class="flow-root">
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-zinc-900/50 text-white">
                  <tr>
                    <th scope="col" class="px-6 py-3 font-semibold">Theme</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Author</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Downloads</th>
                    <th scope="col" class="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800">
                  <tr v-for="theme in recentThemes" :key="theme.id" class="hover:bg-zinc-800/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-medium text-white">{{ theme.name }}</div>
                      <div class="text-xs text-zinc-500 mt-1">{{ theme.version }}</div>
                    </td>
                    <td class="px-6 py-4 text-zinc-400">{{ theme.author }}</td>
                    <td class="px-6 py-4">
                      <span :class="[
                        theme.status === 'approved' ? 'bg-green-500/10 text-green-400 ring-green-500/20' :
                        theme.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20' :
                        'bg-red-500/10 text-red-400 ring-red-500/20',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                      ]">
                        {{ theme.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-zinc-400">{{ theme.download_count || 0 }}</td>
                    <td class="px-6 py-4 text-right">
                      <NuxtLink :to="`/admin/themes/${theme.id}`" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View</NuxtLink>
                    </td>
                  </tr>
                  <tr v-if="themesLoading">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-500">Loading themes...</td>
                  </tr>
                  <tr v-else-if="!recentThemes || recentThemes.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-500 italic">No themes found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Summary -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Analytics Summary</h3>
          <NuxtLink to="/admin/analytics" class="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
            </svg>
            Full Analytics
          </NuxtLink>
        </div>
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-zinc-800">
            <h3 class="text-base font-semibold leading-7 text-white">App Usage (Last 30 Days)</h3>
          </div>
          <div class="p-6">
            <div v-if="usageData?.byPlatform?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div
                v-for="p in usageData.byPlatform"
                :key="p.platform"
                class="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3"
              >
                <admin-platform-icon :platform="p.platform" />
                <div>
                  <span class="font-medium capitalize text-white">{{ p.platform }}</span>
                  <span class="block text-sm text-zinc-500">{{ p.total_sessions }} sessions</span>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center text-zinc-500 text-sm">
              No app usage data yet. Data appears when DesQTA sends usage reports.
            </div>
          </div>
        </div>
      </div>

      <!-- News Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">News Management</h3>
          <NuxtLink to="/admin/news/create" class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Post
          </NuxtLink>
        </div>

        <!-- Recent Posts Table -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 class="text-base font-semibold leading-7 text-white">Recent Posts</h3>
            <NuxtLink to="/admin/news" class="text-sm font-medium text-green-500 hover:text-green-400">View all</NuxtLink>
          </div>
          <div class="flow-root">
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-zinc-900/50 text-white">
                  <tr>
                    <th scope="col" class="px-6 py-3 font-semibold">Title</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Author</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Status</th>
                    <th scope="col" class="px-6 py-3 font-semibold">Date</th>
                    <th scope="col" class="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800">
                  <tr v-for="post in recentPosts" :key="post.id" class="hover:bg-zinc-800/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-white">{{ post.title }}</td>
                    <td class="px-6 py-4 text-zinc-400">{{ post.author_name }}</td>
                    <td class="px-6 py-4">
                      <span :class="[
                        post.published ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                      ]">
                        {{ post.published ? 'Published' : 'Draft' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-zinc-400">{{ formatDate(post.created_at) }}</td>
                    <td class="px-6 py-4 text-right">
                      <button 
                        @click="togglePublish(post)" 
                        :class="[
                          post.published 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-green-400 hover:text-green-300',
                          'font-medium transition-colors mr-4'
                        ]"
                      >
                        {{ post.published ? 'Unpublish' : 'Publish' }}
                      </button>
                      <NuxtLink :to="`/admin/news/edit/${post.slug}`" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors mr-4">Edit</NuxtLink>
                      <button @click="deletePost(post.id)" class="text-red-400 hover:text-red-300 font-medium transition-colors">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="postsLoading">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-500">Loading posts...</td>
                  </tr>
                  <tr v-else-if="!recentPosts || recentPosts.length === 0">
                     <td colspan="5" class="px-6 py-8 text-center text-zinc-500 italic">No posts found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"]
});

const { data: posts, pending: postsLoading, refresh: refreshPosts } = useLazyFetch<any[]>('/api/news?admin=true');
const { data: analyticsStats, pending: statsLoading } = useLazyFetch<any>('/api/analytics/stats');
const { data: usageData, pending: usageLoading } = useLazyFetch<any>('/api/analytics/usage?days=30');
const { data: questions, refresh: refreshQuestions, pending: questionsLoading } = useLazyFetch<any[]>('/api/questionnaire?admin=true');
const { data: themesData, pending: themesLoading } = useLazyFetch<any>('/api/admin/themes');
const { data: collectionsData, pending: collectionsLoading } = useLazyFetch<any>('/api/admin/collections');

const recentPosts = computed(() => {
  return posts.value ? posts.value.slice(0, 5) : [];
});

const recentQuestions = computed(() => {
  if (!questions.value) return [];
  // Show current active question first, then next in queue
  const active = questions.value.find(q => q.is_active && q.expires_at * 1000 > Date.now());
  const queued = questions.value
    .filter(q => !q.is_active && q.auto_activate)
    .sort((a, b) => (a.queue_order || 0) - (b.queue_order || 0));
  
  const result = [];
  if (active) result.push(active);
  if (queued.length > 0) result.push(queued[0]);
  
  return result.slice(0, 2);
});

const recentThemes = computed(() => {
  const themes = themesData.value?.data?.themes || [];
  return themes.slice(0, 5);
});

const recentCollections = computed(() => {
  const collections = collectionsData.value?.data?.collections || [];
  return collections.slice(0, 6);
});

const usageSummary = computed(() => usageData.value?.summary || {});

const overviewLoading = computed(() =>
  statsLoading.value || usageLoading.value || themesLoading.value || collectionsLoading.value
);

const stats = computed(() => {
  const themeStats = analyticsStats.value?.themes;
  const collections = collectionsData.value?.data?.collections || [];
  const totalThemesInCollections = collections.reduce((sum: number, c: any) => sum + (c.theme_count || 0), 0);
  return {
    themes: {
      total: themeStats?.total ?? 0,
      pending: themeStats?.pending ?? 0,
      approved: themeStats?.approved ?? 0
    },
    collections: {
      total: collections.length,
      totalThemes: totalThemesInCollections
    },
    news: {
      total: posts.value?.length || 0,
      published: posts.value?.filter(p => p.published).length || 0
    },
    questions: {
      total: questions.value?.length || 0,
      active: questions.value?.filter(q => q.is_active && q.expires_at * 1000 > Date.now()).length || 0
    },
    sessions: analyticsStats.value?.sessions || { total: 0 },
    desqtaSessions: analyticsStats.value?.desqtaSessions || { total: 0 }
  };
});

const syncingVotes = ref(false);

async function syncVotes() {
  syncingVotes.value = true;
  try {
    const result = await $fetch<{ success: boolean; flushed: number }>('/api/questionnaire/sync-votes', {
      method: 'POST'
    });
    alert(`Successfully synced ${result.flushed} votes to database`);
    refreshQuestions();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to sync votes');
  } finally {
    syncingVotes.value = false;
  }
}

function getTimeUntil(timestamp: number) {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'Any moment';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '< 1 min';
  if (minutes > 60) return `~${Math.floor(minutes / 60)} hrs`;
  return `~${minutes} mins`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function togglePublish(post: any) {
  try {
    const result = await $fetch<{ success: boolean; published: boolean }>(`/api/news/publish?slug=${post.slug}`, { 
      method: 'PATCH',
      body: { published: !post.published }
    });
    // Update local state
    if (posts.value) {
      const index = posts.value.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts.value[index].published = result.published ? 1 : 0;
      }
    }
  } catch (e) {
    alert('Failed to toggle publish status');
  }
}

async function deletePost(id: number) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    await $fetch(`/api/news/${id}`, { method: 'DELETE' });
    await refreshPosts();
  } catch (e) {
    alert('Failed to delete post');
  }
}

async function flushSessions() {
  try {
    await $fetch('/api/analytics/flush', { method: 'POST' });
    refreshNuxtData(); // Refreshes all useFetch data
  } catch (e) {
    alert('Failed to flush sessions');
  }
}
</script>

