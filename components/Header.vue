<template>
  <header class="isolate z-10 absolute top-0 inset-x-0">
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      aria-label="Global"
    >
      <div class="flex lg:flex-1">
        <NuxtLink href="/" class="-m-1.5 p-1.5 transition-transform duration-200 hover:scale-105 active:scale-95">
          <span class="sr-only">DesQTA</span>
          <img src="https://raw.githubusercontent.com/BetterSEQTA/DesQTA/refs/heads/develop/static/32x32.png" alt="DesQTA logo" class="h-8 w-8" />
        </NuxtLink>
      </div>
      <div class="relative z-[60] flex lg:hidden">
        <HamburgerButton
          :active="mobileMenuOpen"
          @click="toggleMobileMenu"
        />
      </div>

      <PopoverGroup class="hidden lg:flex lg:gap-x-12">
        <!--
        <Popover>
          <PopoverButton
            class="flex items-center gap-x-1 text-sm/6 font-semibold text-zinc-100"
          >
            Features
            <ChevronDownIcon
              class="size-5 flex-none text-zinc-400"
              aria-hidden="true"
            />
          </PopoverButton>

          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <PopoverPanel
              class="absolute inset-x-0 top-0 -z-10 bg-zinc-900 pt-14 shadow-lg ring-1 ring-zinc-900/5"
            >
              <div
                class="mx-auto grid max-w-7xl grid-cols-4 gap-x-4 px-6 py-10 lg:px-8 xl:gap-x-8"
              >
                <div
                  v-for="item in features"
                  :key="item.name"
                  class="transition group relative rounded-lg p-6 text-sm/6 hover:bg-zinc-800"
                >
                  <div
                    class="transition flex size-11 items-center justify-center rounded-lg bg-zinc-950 group-hover:bg-zinc-900"
                  >
                    <component
                      :is="item.icon"
                      class="transition size-6 text-zinc-600 group-hover:text-zinc-500"
                      aria-hidden="true"
                    />
                  </div>
                  <NuxtLink
                    :href="item.href"
                    class="transition mt-6 block font-semibold text-zinc-100"
                  >
                    {{ item.name }}
                    <span class="absolute inset-0" />
                  </NuxtLink>
                  <p class="mt-1 text-zinc-400">{{ item.description }}</p>
                </div>
              </div>
              <div class="bg-zinc-950 h-3" />
            </PopoverPanel>
          </transition>
        </Popover>
        -->

        <NuxtLink
          v-for="(route, i) in routes"
          :key="i"
          :href="route.href"
          class="nav-link-polish text-sm/6 font-semibold text-zinc-100"
          >{{ route.name }}</NuxtLink
        >
      </PopoverGroup>

      <div class="hidden lg:flex lg:flex-1 lg:justify-end items-center">
        <template v-if="loading">
          <div class="h-5 w-12 bg-zinc-800/50 rounded animate-pulse"></div>
        </template>
        <template v-else-if="user">
          <Menu as="div" class="relative" v-slot="{ open }">
            <MenuButton
              class="user-badge flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-zinc-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.96]"
              :class="open ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/50'"
            >
              <img
                v-if="user.pfpUrl"
                :src="user.pfpUrl"
                :alt="user.username"
                class="h-6 w-6 shrink-0 rounded-full ring-2 ring-zinc-800"
              />
              <span class="max-w-[120px] truncate leading-normal">{{ user.displayName || user.username }}</span>
              <ChevronDownIcon
                class="user-badge-chevron h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                :class="open ? '-rotate-180' : ''"
              />
            </MenuButton>
            <transition name="user-menu">
              <MenuItems
                v-show="open"
                class="user-menu-panel absolute right-0 z-50 mt-2 w-52 origin-top rounded-2xl border border-zinc-700/80 bg-zinc-900/85 p-2 shadow-xl backdrop-blur-xl ring-1 ring-black/5 focus:outline-none"
              >
                <MenuItem v-if="user.admin_level && user.admin_level >= 1" v-slot="{ active }">
                  <NuxtLink
                    to="/admin"
                    class="user-menu-item block rounded-lg py-2 pl-3 pr-3 text-sm font-medium text-green-400 transition-all duration-200"
                    :class="active ? 'bg-zinc-800 pl-[14px]' : 'hover:bg-zinc-800/80 hover:pl-[14px]'"
                    :style="{ '--stagger-idx': 1 }"
                  >
                    Admin
                  </NuxtLink>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="https://accounts.betterseqta.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="user-menu-item block rounded-lg py-2 pl-3 pr-3 text-sm font-medium text-zinc-100 transition-all duration-200"
                    :class="active ? 'bg-zinc-800 pl-[14px]' : 'hover:bg-zinc-800/80 hover:pl-[14px]'"
                    :style="{ '--stagger-idx': user.admin_level && user.admin_level >= 1 ? 2 : 1 }"
                  >
                    Account
                  </a>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    type="button"
                    class="user-menu-item block w-full rounded-lg py-2 pl-3 pr-3 text-left text-sm font-medium text-zinc-100 transition-all duration-200"
                    :class="active ? 'bg-zinc-800 pl-[14px]' : 'hover:bg-zinc-800/80 hover:pl-[14px]'"
                    :style="{ '--stagger-idx': user.admin_level && user.admin_level >= 1 ? 3 : 2 }"
                    @click="logout"
                  >
                    Logout
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </template>
        <button 
          v-else 
          @click="login" 
          class="rounded-lg px-3 py-1.5 text-sm/6 font-semibold text-zinc-100 transition-all duration-200 hover:bg-zinc-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95"
        >
          Login
        </button>
      </div>
    </nav>
    <MobileMenu
      :open="mobileMenuOpen"
      :routes="routes"
      @close="mobileMenuOpen = false"
    />
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  PopoverGroup,
} from "@headlessui/vue";
import {
  ServerStackIcon,
  ShareIcon,
  SquaresPlusIcon,
} from "@heroicons/vue/24/outline";
import HamburgerButton from "./HamburgerButton.vue";
import MobileMenu from "./MobileMenu.vue";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
  RectangleGroupIcon,
} from "@heroicons/vue/20/solid";
import SteamIcon from "./SteamIcon.vue";

const routes = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "DesQTA",
    href: "/desqta",
  },
  {
    name: "Comparison",
    href: "/comparison",
  },
  {
    name: "Download",
    href: "/download",
  },
  {
    name: "Themes",
    href: "/themes",
  },
  {
    name: "Privacy",
    href: "/privacy",
  },
  {
    name: "News",
    href: "/news",
  },
  {
    name: "Changelogs",
    href: "/changelogs",
  },
];

const quickstartLink = "https://github.com/BetterSEQTA/DesQTA/tree/develop";

const features = [
  {
    name: "Library Management",
    description:
      "Learn how Drop can help you manage your library, and enhance it with metadata.",
    href: "/features/library",
    icon: ServerStackIcon,
  },
  {
    name: "Sharing",
    description:
      "Learn how Drop allows you to share your game library with friends & family.",
    href: "/features/sharing",
    icon: ShareIcon,
  },
  {
    name: "Steamworks",
    description:
      "Learn how Drop's Steamworks library can emulate Steam's features on your Drop server.",
    href: "#",
    icon: SteamIcon,
  },
  {
    name: "Integrations",
    description:
      "Learn how to integrate your other tools and software with Drop.",
    href: "#",
    icon: SquaresPlusIcon,
  },
];

const router = useRouter();
const mobileMenuOpen = ref(false);

router.afterEach(() => {
  mobileMenuOpen.value = false;
});

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

const { user, login, logout, loading } = useAuth();
</script>

<style scoped>
/* User dropdown: springy panel + staggered items (enter) / damped fast exit */
.user-menu-enter-active {
  transition:
    transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.28s ease-in,
    backdrop-filter 0.45s ease,
    -webkit-backdrop-filter 0.45s ease;
}

.user-menu-enter-from {
  transform: scale(0.8) translateY(-10px);
  transform-origin: top center;
  opacity: 0;
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
}

.user-menu-enter-to {
  transform: scale(1) translateY(0);
  opacity: 1;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.user-menu-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.18s ease-out,
    backdrop-filter 0.22s ease,
    -webkit-backdrop-filter 0.22s ease;
}

.user-menu-leave-from {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.user-menu-leave-to {
  transform: scale(0.82) translateY(-6px);
  opacity: 0;
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
}

@keyframes user-menu-item-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-menu-item {
  animation: user-menu-item-in 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: calc(var(--stagger-idx, 0) * 30ms);
}

@keyframes user-menu-item-out {
  to {
    opacity: 0;
    transform: translateY(8px);
  }
}

.user-menu-leave-active .user-menu-item {
  animation: user-menu-item-out 0.16s ease-out forwards !important;
  animation-delay: 0ms !important;
}

@media (prefers-reduced-motion: reduce) {
  .user-menu-enter-active,
  .user-menu-leave-active {
    transition: none;
  }

  .user-menu-item {
    animation: none !important;
  }
}
</style>
