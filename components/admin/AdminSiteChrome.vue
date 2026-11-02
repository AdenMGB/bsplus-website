<template>
  <div
    v-if="isAdminArea"
    class="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <NuxtLink
            to="/admin"
            class="shrink-0 text-sm font-semibold text-zinc-300 transition-colors duration-200 hover:text-white"
          >
            Admin
          </NuxtLink>
          <span v-if="currentItem && route.path !== '/admin'" class="hidden text-zinc-600 sm:inline">/</span>
          <span v-if="currentItem && route.path !== '/admin'" class="truncate text-sm text-zinc-400">
            {{ currentItem.label }}
          </span>
        </div>

        <div class="admin-nav-scroll flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.id"
            :to="item.to"
            class="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500"
            :class="
              isActive(item)
                ? 'border-orange-500/50 bg-orange-600/15 text-orange-200'
                : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            "
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { flatAdminNavItems, adminNavItemForPath, type AdminNavItem } from '~/composables/useAdminNav';

const route = useRoute();

const isAdminArea = computed(() => route.path.startsWith('/admin'));

const currentItem = computed(() => adminNavItemForPath(route.path));

const quickLinks = computed(() => flatAdminNavItems());

function isActive(item: AdminNavItem) {
  const current = adminNavItemForPath(route.path);
  return current?.id === item.id;
}
</script>

<style scoped>
.admin-nav-scroll {
  scrollbar-width: thin;
}
</style>
