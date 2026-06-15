<template>
  <button
    type="button"
    class="hamburger-btn inline-flex items-center justify-center rounded-full p-2 text-zinc-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95"
    :class="active ? 'hamburger-btn--open' : 'hover:bg-zinc-800/50'"
    :aria-label="active ? 'Close menu' : 'Open menu'"
    :aria-expanded="active"
    @click="$emit('click')"
  >
    <svg
      class="ham hamRotate ham8"
      :class="{ active }"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <path
        class="line top"
        d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"
      />
      <path class="line middle" d="m 30,50 h 40" />
      <path
        class="line bottom"
        d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  active?: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<style scoped>
/* Hamburger #8 — ainalem/CodePen LJYRxz (ported from betterseqta-accounts) */
.hamburger-btn {
  --hamburger-duration: 0.48s;
  -webkit-tap-highlight-color: transparent;
}

.hamburger-btn--open {
  background: transparent;
}

.hamburger-btn .ham {
  width: 1.75rem;
  height: 1.75rem;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: transform var(--hamburger-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.hamburger-btn .hamRotate.active {
  transform: rotate(45deg);
}

.hamburger-btn .ham .line {
  fill: none;
  stroke: rgb(161 161 170);
  stroke-width: 5.5;
  stroke-linecap: round;
  transition:
    stroke-dasharray var(--hamburger-duration),
    stroke-dashoffset var(--hamburger-duration),
    stroke 0.2s ease;
}

.hamburger-btn:hover .ham .line,
.hamburger-btn--open .ham .line {
  stroke: rgb(244 244 245);
}

.hamburger-btn .ham8 .top {
  stroke-dasharray: 40 160;
}

.hamburger-btn .ham8 .middle {
  stroke-dasharray: 40 142;
  transform-origin: 50%;
  transition: transform var(--hamburger-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.hamburger-btn .ham8 .bottom {
  stroke-dasharray: 40 85;
  transform-origin: 50%;
  transition:
    transform var(--hamburger-duration) cubic-bezier(0.22, 1, 0.36, 1),
    stroke-dashoffset var(--hamburger-duration);
}

.hamburger-btn .ham8.active .top {
  stroke-dashoffset: -64px;
}

.hamburger-btn .ham8.active .middle {
  transform: rotate(90deg);
}

.hamburger-btn .ham8.active .bottom {
  stroke-dashoffset: -64px;
}

@media (prefers-reduced-motion: reduce) {
  .hamburger-btn .ham,
  .hamburger-btn .ham .line,
  .hamburger-btn .ham8 .middle,
  .hamburger-btn .ham8 .bottom {
    transition-duration: 0.01ms;
  }
}
</style>
