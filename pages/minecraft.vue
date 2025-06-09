<template>
  <div class="relative min-h-screen">
    <!-- Video Background -->
    <video
      class="fixed inset-0 w-full h-full object-cover"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      x-webkit-airplay="allow"
    >
      <source src="https://github.com/AdenMGB/bsplus-website/raw/refs/heads/main/public/images/2025_06_06_12_32_38.mp4" type="video/mp4">
    </video>

    <!-- Gradient Overlay -->
    <div class="fixed inset-0 bg-gradient-to-b from-zinc-900/90 to-zinc-900/95"></div>

    <!-- Content -->
    <div class="relative isolate">
      <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-slide-down">
            BetterSEQTA Plus Minecraft Server
          </h1>
          <p class="mt-6 text-lg leading-8 text-zinc-300 animate-fade-in delay-100">
            Join our community in Minecraft!
          </p>
          <div class="mt-4 text-xl font-semibold text-white animate-fade-in delay-150">
            Server IP: mc.betterseqta.org
          </div>
        </div>

        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div class="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            <!-- Features -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 animate-fade-in delay-200">
              <h2 class="text-2xl font-bold text-white mb-6">Server Features</h2>
              <ul class="space-y-4 text-zinc-300">
                <li class="flex items-center gap-3">
                  <svg class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  SMP (Survival Multiplayer) as our first release gamemode
                </li>
                <li class="flex items-center gap-3">
                  <svg class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Community events and competitions
                </li>
                <li class="flex items-center gap-3">
                  <svg class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Custom world generation
                </li>
                <li class="flex items-center gap-3">
                  <svg class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Regular updates and maintenance
                </li>
                <li class="flex items-center gap-3">
                  <svg class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  The End dimension will be enabled during an upcoming live event
                </li>
              </ul>
            </div>

            <!-- Join Now -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 animate-fade-in delay-300">
              <h2 class="text-2xl font-bold text-white mb-6">Join Now</h2>
              <p class="text-zinc-300 mb-6">
                The server is now live! Join our Discord community to stay updated on events, announcements, and connect with other players!
              </p>
              <a
                href="https://discord.gg/nv6YSjpEM4"
                class="inline-flex items-center gap-x-2 rounded-md bg-zinc-400/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
              >
                Join Discord
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Guide Section -->
      <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl animate-fade-in">
            Quick Guide: Quickshop Hikari
          </h2>
          <p class="mt-4 text-lg leading-8 text-zinc-300 animate-fade-in delay-100">
            Learn how to use our shop system in this quick tutorial
          </p>
        </div>
        <div class="mt-10 mx-auto max-w-3xl">
          <video
            class="w-full rounded-xl shadow-2xl"
            controls
            preload="metadata"
          >
            <source src="https://raw.githubusercontent.com/AdenMGB/bsplus-website/refs/heads/main/public/images/2025-06-09%2009-51-43.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Minecraft Server",
});
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-24px); }
  to { opacity: 1; transform: none; }
}
.animate-fade-in {
  animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.animate-slide-down {
  animation: slide-down 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
</style>