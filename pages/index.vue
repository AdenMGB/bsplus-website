<template>
  <div class="relative">
    <!-- Hero Section -->
    <div class="relative isolate overflow-hidden animate-fade-in">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-8 sm:pb-24 sm:pt-10 lg:px-8 lg:py-40">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <!-- BetterSEQTA+ Section -->
          <div class="relative flex">
            <div class="relative rounded-2xl bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 p-8 sm:p-10 lg:p-12 text-center shadow-xl hover:shadow-2xl transition-all duration-300 w-full flex flex-col">
              <div class="mt-4 sm:mt-0 flex-shrink-0">
                <a href="/download" class="inline-flex flex-wrap items-center justify-center gap-2 sm:space-x-3 animate-slide-down">
                  <span class="rounded-full bg-zinc-500/20 px-3 py-1 text-xs sm:text-sm font-semibold leading-6 text-zinc-300 ring-1 ring-inset ring-zinc-500/30">
                    Latest Release
                  </span>
                  <span class="inline-flex items-center space-x-2 text-xs sm:text-sm font-medium leading-6 text-zinc-200">
                    <span v-if="BSPlusVersion">Just shipped {{ BSPlusVersion }}</span>
                    <span v-else>Just shipped</span>
                    <svg class="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </a>
              </div>
              <h1 class="mt-6 sm:mt-8 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display animate-slide-down delay-100 flex-shrink-0">
                BetterSEQTA+
              </h1>
              <h2 class="mt-2 text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-300 font-display animate-slide-down delay-100 flex-shrink-0">
                SEQTA Learn Enhanced
              </h2>
              <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300 animate-fade-in delay-200 flex-grow">
                Transform your SEQTA Learn experience with our powerful browser extension,
                bringing beautiful themes, live wallpapers, and enhanced features to make SEQTA actually enjoyable!
              </p>
              <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-6 animate-fade-in delay-300 flex-shrink-0">
                <NuxtLink
                  href="/download"
                  class="rounded-md bg-zinc-600 px-4 py-2.5 sm:px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 transition-all duration-200"
                >
                  Get BetterSEQTA+
                  <svg class="ml-2 -mr-0.5 h-5 w-5 inline-block transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </NuxtLink>
                <NuxtLink
                  href="#features"
                  class="text-sm font-semibold leading-6 text-white transition-colors duration-200 hover:text-zinc-400"
                >
                  Learn more <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- DesQTA Section -->
          <div class="relative flex">
            <div class="relative rounded-2xl bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 p-8 sm:p-10 lg:p-12 text-center shadow-xl hover:shadow-2xl transition-all duration-300 w-full flex flex-col overflow-hidden">
              <!-- Subtle blue blur hints -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              <div class="relative z-10 flex flex-col h-full">
              <div class="mt-4 sm:mt-0 flex-shrink-0">
                <a href="/download" class="inline-flex flex-wrap items-center justify-center gap-2 sm:space-x-3 animate-slide-down">
                  <span class="rounded-full bg-blue-500/20 px-3 py-1 text-xs sm:text-sm font-semibold leading-6 text-blue-200 ring-1 ring-inset ring-blue-500/30">
                    Desktop App
                  </span>
                  <span class="inline-flex items-center space-x-2 text-xs sm:text-sm font-medium leading-6 text-zinc-200">
                    <span v-if="desqtaVersion">Just shipped {{ desqtaVersion }}</span>
                    <span v-else>Just shipped</span>
                    <svg class="h-4 w-4 sm:h-5 sm:w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </a>
              </div>
              <h1 class="mt-6 sm:mt-8 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display animate-slide-down delay-100 flex-shrink-0">
                DesQTA
              </h1>
              <h2 class="mt-2 text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-blue-300 font-display animate-slide-down delay-100 flex-shrink-0">
                The Desktop Experience
              </h2>
              <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300 animate-fade-in delay-200 flex-grow">
                A powerful desktop application for SEQTA Learn, bringing the full SEQTA experience to your computer with enhanced features and performance.
              </p>
              <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-6 animate-fade-in delay-300 flex-shrink-0">
                <NuxtLink
                  href="/download"
                  class="rounded-md bg-blue-600 px-4 py-2.5 sm:px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                >
                  Download DesQTA
                  <svg class="ml-2 -mr-0.5 h-5 w-5 inline-block transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </NuxtLink>
                <NuxtLink
                  href="/desqta"
                  class="text-sm font-semibold leading-6 text-white transition-colors duration-200 hover:text-blue-200"
                >
                  Learn more <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Feature Section -->
    <div id="features" class="py-24 sm:py-32 animate-fade-in delay-200">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-zinc-400 animate-slide-down">Enhanced Experience</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down delay-100">
            Making SEQTA Learn actually enjoyable!
          </p>
          <p class="mt-6 text-lg leading-8 text-zinc-300 animate-fade-in delay-200">
            BetterSEQTA+ brings beautiful themes, live wallpapers, and enhanced features to transform your SEQTA Learn experience.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-zinc-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 3V7M15 3V6M4 10H20M12 21C10.2337 21 8.91561 19.3737 9.28133 17.6457L9.34332 17.3528C9.56076 16.3254 9.04388 15.2832 8.09439 14.8346L5.9897 13.8401C4.77487 13.2661 4 12.043 4 10.6994V4.63149C4 3.73044 4.73044 3 5.63149 3H18.3685C19.2696 3 20 3.73044 20 4.63149V10.6994C20 12.043 19.2251 13.2661 18.0103 13.8401L15.9056 14.8346C14.9561 15.2832 14.4392 16.3254 14.6567 17.3528L14.7187 17.6457C15.0844 19.3737 13.7663 21 12 21Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Beautiful Themes
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Transform SEQTA into something actually beautiful with custom themes and live wallpapers.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-100">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-zinc-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark Mode
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Protect your eyes with a beautiful dark mode that won't burn your eyes at night.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-zinc-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Enhanced Interface
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Enjoy a better-looking interface with improved organization and next lesson notifications.</p>
            </dd>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8 animate-fade-in delay-300">
      <svg class="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
        <defs>
          <pattern id="1d4240dd-898f-445f-932d-e2872fd12de3" width="200" height="200" x="50%" y="0" patternUnits="userSpaceOnUse">
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="0" class="overflow-visible fill-white/5">
          <path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z M-600 200h201v201h-201Z M400 400h201v201h-201Z M-200 400h201v201h-201Z M200 0h201v201h-201Z M-400 0h201v201h-201Z M0 200h201v201h-201Z M-200 600h201v201h-201Z M400 800h201v201h-201Z" stroke-width="0" />
        </svg>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#1d4240dd-898f-445f-932d-e2872fd12de3)" />
      </svg>
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down">Ready to transform SEQTA?<br>Get started today.</h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300 animate-fade-in delay-100">
          Whether you prefer the browser extension or the full desktop experience, we've got you covered.
        </p>
          <div class="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-x-6 animate-fade-in delay-200">
            <NuxtLink
              href="/download"
              class="rounded-md bg-zinc-600 px-4 py-2.5 sm:px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 transition-all duration-200 text-center"
            >
              Download Now
            </NuxtLink>
            <NuxtLink href="/comparison" class="text-sm font-semibold leading-6 text-white transition-colors duration-200 hover:text-zinc-400 text-center">
              Compare Features <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

useHead({
  title: "Home",
});

const BSPlusRelease = ref<any>(null);
const desqtaRelease = ref<any>(null);

const BSPlusVersion = computed(() => {
  if (!BSPlusRelease.value?.tag_name) return null;
  return BSPlusRelease.value.tag_name.replace('betterseqtaplus@', 'v');
});

const desqtaVersion = computed(() => {
  if (!desqtaRelease.value?.tag_name) return null;
  return desqtaRelease.value.tag_name;
});

onMounted(async () => {
  try {
    // Fetch BetterSEQTA+ browser extension release
    const response = await fetch('https://api.github.com/repos/betterseqta/betterseqta-plus/releases?per_page=1');
    const data = await response.json();
    if (data && data.length > 0) {
      BSPlusRelease.value = data[0];
    }
  } catch (error) {
    console.error('Error fetching BetterSEQTA+ release:', error);
  }

  try {
    // Fetch DesQTA release
    const response = await fetch('https://api.github.com/repos/betterseqta/desqta/releases?per_page=1');
    const data = await response.json();
    if (data && data.length > 0) {
      desqtaRelease.value = data[0];
    }
  } catch (error) {
    console.error('Error fetching DesQTA release:', error);
  }
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

/* Confetti Animation */

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
