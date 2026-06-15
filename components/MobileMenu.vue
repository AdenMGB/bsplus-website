<template>
  <Teleport to="body">
    <div
      class="mobile-menu-layer"
      :class="{ 'mobile-menu-layer--visible': isExpanded || isClosing }"
      :aria-hidden="!open && !isClosing"
    >
      <div
        class="mobile-menu-backdrop"
        aria-hidden="true"
        @click="close"
      />

      <aside
        class="mobile-menu-root"
        :aria-hidden="!open"
        :aria-expanded="open"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div
          class="mobile-menu-shell"
          :class="{ 'mobile-menu-shell--open': isExpanded }"
        >
          <div
            class="mobile-menu-circle"
            :class="{
              'mobile-menu-circle--open': isExpanded,
              'mobile-menu-circle--ready': hasAnimated,
            }"
          />

          <div class="mobile-menu-content">
            <div
              class="mobile-menu-brand mobile-menu-reveal"
              :class="{ 'mobile-menu-reveal--visible': isExpanded }"
              :style="{ '--reveal-delay': '0.08s' }"
            >
              <NuxtLink href="/" class="-m-1.5 p-1.5" @click="close">
                <span class="sr-only">DesQTA</span>
                <img
                  src="https://raw.githubusercontent.com/BetterSEQTA/DesQTA/refs/heads/develop/static/32x32.png"
                  alt="DesQTA logo"
                  class="h-8 w-8"
                />
              </NuxtLink>
            </div>

            <nav class="mobile-menu-nav" aria-label="Mobile">
              <NuxtLink
                v-for="(route, index) in routes"
                :key="route.href"
                :href="route.href"
                class="mobile-menu-link mobile-menu-reveal"
                :class="{ 'mobile-menu-reveal--visible': isExpanded }"
                :style="{ '--reveal-delay': `${0.14 + index * 0.05}s` }"
                @click="close"
              >
                {{ route.name }}
              </NuxtLink>
            </nav>

            <div class="mobile-menu-footer">
              <template v-if="loading">
                <div
                  class="mobile-menu-reveal h-10 rounded-lg bg-zinc-800/50 animate-pulse"
                  :class="{ 'mobile-menu-reveal--visible': isExpanded }"
                  :style="{ '--reveal-delay': `${0.14 + routes.length * 0.05}s` }"
                />
              </template>
              <template v-else-if="user">
                <div
                  class="mobile-menu-user mobile-menu-reveal"
                  :class="{ 'mobile-menu-reveal--visible': isExpanded }"
                  :style="{ '--reveal-delay': `${0.14 + routes.length * 0.05}s` }"
                >
                  <img
                    v-if="user.pfpUrl"
                    :src="user.pfpUrl"
                    :alt="user.username"
                    class="h-8 w-8 shrink-0 rounded-full ring-2 ring-zinc-700"
                  />
                  <span class="truncate font-semibold text-zinc-100">
                    {{ user.displayName || user.username }}
                  </span>
                </div>
                <NuxtLink
                  v-if="user.admin_level && user.admin_level >= 1"
                  to="/admin"
                  class="mobile-menu-link mobile-menu-link--accent mobile-menu-reveal"
                  :class="{ 'mobile-menu-reveal--visible': isExpanded }"
                  :style="{ '--reveal-delay': `${0.2 + routes.length * 0.05}s` }"
                  @click="close"
                >
                  Admin
                </NuxtLink>
                <a
                  href="https://accounts.betterseqta.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mobile-menu-link mobile-menu-reveal"
                  :class="{ 'mobile-menu-reveal--visible': isExpanded }"
                  :style="{ '--reveal-delay': `${0.26 + routes.length * 0.05}s` }"
                  @click="close"
                >
                  Account
                </a>
                <button
                  type="button"
                  class="mobile-menu-link mobile-menu-link--muted mobile-menu-reveal"
                  :class="{ 'mobile-menu-reveal--visible': isExpanded }"
                  :style="{ '--reveal-delay': `${0.32 + routes.length * 0.05}s` }"
                  @click="handleLogout"
                >
                  Logout
                </button>
              </template>
              <button
                v-else
                type="button"
                class="mobile-menu-link mobile-menu-reveal"
                :class="{ 'mobile-menu-reveal--visible': isExpanded }"
                :style="{ '--reveal-delay': `${0.14 + routes.length * 0.05}s` }"
                @click="handleLogin"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";

export type MobileMenuRoute = {
  name: string;
  href: string;
};

const props = defineProps<{
  open: boolean;
  routes: MobileMenuRoute[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const { user, login, logout, loading } = useAuth();

const isExpanded = ref(false);
const hasAnimated = ref(false);
const isClosing = ref(false);
const collapseDurationMs = 360;

function playEnterAnimation() {
  isExpanded.value = false;
  nextTick(() => {
    hasAnimated.value = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isExpanded.value = true;
      });
    });
  });
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      isClosing.value = false;
      lockBodyScroll(true);
      playEnterAnimation();
    } else if (hasAnimated.value) {
      isExpanded.value = false;
      isClosing.value = true;
      window.setTimeout(() => {
        isClosing.value = false;
        lockBodyScroll(false);
      }, collapseDurationMs);
    }
  }
);

function lockBodyScroll(lock: boolean) {
  if (!import.meta.client) return;
  document.body.style.overflow = lock ? "hidden" : "";
}

function close() {
  emit("close");
}

function handleLogin() {
  close();
  login();
}

function handleLogout() {
  close();
  logout();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  lockBodyScroll(false);
});
</script>

<style scoped>
.mobile-menu-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
}

.mobile-menu-layer--visible {
  pointer-events: auto;
}

.mobile-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: rgb(0 0 0 / 0.45);
  opacity: 0;
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
  transition:
    opacity 0.28s ease,
    backdrop-filter 0.35s ease,
    -webkit-backdrop-filter 0.35s ease;
}

.mobile-menu-layer--visible .mobile-menu-backdrop {
  opacity: 1;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.mobile-menu-root {
  --mobile-menu-btn-y: 2.75rem;
  --mobile-menu-btn-x: 2.75rem;
  --mobile-menu-bg: rgb(24 24 27);
  --mobile-menu-border: rgb(39 39 42 / 0.8);
  --mobile-menu-expand-duration: 0.48s;
  --mobile-menu-collapse-duration: 0.36s;

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: min(100%, 24rem);
  height: 100dvh;
  min-height: 100vh;
  pointer-events: none;
}

.mobile-menu-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: transparent;
  border-left: 1px solid transparent;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.1s ease 0s;
}

.mobile-menu-shell--open {
  pointer-events: auto;
  background: var(--mobile-menu-bg);
  border-left-color: var(--mobile-menu-border);
  box-shadow: -4px 0 24px rgb(0 0 0 / 0.35);
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.12s ease var(--mobile-menu-expand-duration);
}

.mobile-menu-circle {
  position: absolute;
  top: var(--mobile-menu-btn-y);
  right: var(--mobile-menu-btn-x);
  z-index: 0;
  width: 280vh;
  height: 280vh;
  border-radius: 50%;
  background: var(--mobile-menu-bg);
  border: 1px solid var(--mobile-menu-border);
  transform: translate(50%, -50%) scale(0);
  transform-origin: center;
  transition:
    transform var(--mobile-menu-expand-duration) cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.15s ease 0s;
}

.mobile-menu-circle:not(.mobile-menu-circle--ready) {
  transition: none;
}

.mobile-menu-circle--open {
  transform: translate(50%, -50%) scale(1);
  border-color: transparent;
  transition:
    transform var(--mobile-menu-expand-duration) cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.15s ease var(--mobile-menu-expand-duration);
}

.mobile-menu-circle--ready:not(.mobile-menu-circle--open) {
  transition-duration: var(--mobile-menu-collapse-duration), 0.1s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1), ease;
  border-color: var(--mobile-menu-border);
}

.mobile-menu-content {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 5.5rem 1.5rem 2rem;
  pointer-events: none;
  overflow-y: auto;
}

.mobile-menu-shell--open .mobile-menu-content {
  pointer-events: auto;
}

.mobile-menu-reveal {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.2s ease var(--reveal-delay, 0s),
    transform 0.2s ease var(--reveal-delay, 0s);
}

.mobile-menu-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

.mobile-menu-reveal:not(.mobile-menu-reveal--visible) {
  transition-delay: 0s;
  transition-duration: 0.1s;
}

.mobile-menu-brand {
  margin-bottom: 2rem;
}

.mobile-menu-nav {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.mobile-menu-link {
  display: block;
  width: 100%;
  border: none;
  border-radius: 0.625rem;
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.25;
  color: rgb(244 244 245);
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.mobile-menu-link:hover {
  background: rgb(39 39 42);
}

.mobile-menu-link--accent {
  color: rgb(74 222 128);
}

.mobile-menu-link--accent:hover {
  color: rgb(134 239 172);
}

.mobile-menu-link--muted {
  color: rgb(161 161 170);
}

.mobile-menu-link--muted:hover {
  color: rgb(244 244 245);
}

.mobile-menu-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgb(63 63 70 / 0.5);
}

.mobile-menu-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem 1rem;
  font-size: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-circle,
  .mobile-menu-backdrop,
  .mobile-menu-reveal {
    transition: none;
  }

  .mobile-menu-reveal {
    opacity: 1;
    transform: none;
  }
}
</style>
