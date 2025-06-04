<template>
  <footer>
    <div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
      <nav
        class="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6"
        aria-label="Footer"
      >
        <NuxtLink
          v-for="item in navigation.main"
          :key="item.name"
          :href="item.href"
          class="text-zinc-400 hover:text-white"
          >{{ item.name }}</NuxtLink
        >
      </nav>
      <div class="mt-16 flex justify-center gap-x-10">
        <NuxtLink
          v-for="item in navigation.social"
          :key="item.name"
          :href="item.href"
          class="text-zinc-400 hover:text-zinc-300"
        >
          <span class="sr-only">{{ item.name }}</span>
          <component :is="item.icon" class="size-6" aria-hidden="true" />
        </NuxtLink>
      </div>
      <p class="mt-10 text-center text-sm/6 text-zinc-400">
        &copy; {{ new Date().getFullYear() }} DesQTA. Licensed under MIT License.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { defineComponent, h } from "vue";

const navigation = {
  main: [],
  social: [
    {
      name: "GitHub",
      href: "https://github.com/BetterSEQTA/DesQTA/tree/develop",
      icon: defineComponent({
        render: () =>
          h("svg", { fill: "currentColor", viewBox: "0 0 24 24" }, [
            h("path", {
              "fill-rule": "evenodd",
              d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
              "clip-rule": "evenodd",
            }),
          ]),
      }),
    },
    // {
    //   name: "YouTube",
    //   href: "#",
    //   icon: defineComponent({
    //     render: () =>
    //       h("svg", { fill: "currentColor", viewBox: "0 0 24 24" }, [
    //         h("path", {
    //           "fill-rule": "evenodd",
    //           d: "M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z",
    //           "clip-rule": "evenodd",
    //         }),
    //       ]),
    //   }),
    // },
  ],
};
</script>
