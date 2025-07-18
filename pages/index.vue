<template>
  <div class="relative">
    <!-- Hero Section -->
    <div class="relative isolate overflow-hidden animate-fade-in">
      <div class="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div class="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <div class="mt-24 sm:mt-32 lg:mt-16">
            <a href="/download" class="inline-flex space-x-6 animate-slide-down">
              <span class="rounded-full bg-zinc-500/10 px-3 py-1 text-sm font-semibold leading-6 text-zinc-400 ring-1 ring-inset ring-zinc-500/20">
                Latest Release
              </span>
              <span class="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-zinc-300">
                <span>Just shipped v3.4.8</span>
                <svg class="h-5 w-5 text-zinc-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </span>
            </a>
          </div>
          <h1 class="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl font-display animate-slide-down delay-100">
            BetterSEQTA+
          </h1>
          <h2 class="mt-2 text-2xl font-medium tracking-tight text-zinc-400 sm:text-3xl font-display animate-slide-down delay-100">
            SEQTA Learn Enhanced
          </h2>
          <p class="mt-6 text-lg leading-8 text-zinc-300 animate-fade-in delay-200">
            Transform your SEQTA Learn experience with our powerful browser extension,
            bringing beautiful themes, live wallpapers, and enhanced features to make SEQTA actually enjoyable!
          </p>
          <div class="mt-10 flex items-center gap-x-6 animate-fade-in delay-300">
            <NuxtLink
              href="/download"
              class="rounded-md bg-zinc-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 transition-all duration-200"
            >
              Add to Chrome
              <ArrowDownTrayIcon class="ml-2 -mr-0.5 h-5 w-5 inline-block transition-transform duration-300 hover:scale-110" />
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
              <PaintBrushIcon class="h-7 w-7 flex-none text-zinc-400 transition-transform duration-300 hover:scale-110" aria-hidden="true" />
              Beautiful Themes
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Transform SEQTA into something actually beautiful with custom themes and live wallpapers.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-100">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <MoonIcon class="h-7 w-7 flex-none text-zinc-400 transition-transform duration-300 hover:scale-110" aria-hidden="true" />
              Dark Mode
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Protect your eyes with a beautiful dark mode that won't burn your eyes at night.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <SparklesIcon class="h-7 w-7 flex-none text-zinc-400 transition-transform duration-300 hover:scale-110" aria-hidden="true" />
              Enhanced Interface
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Enjoy a better-looking interface with improved organization and next lesson notifications.</p>
            </dd>
          </div>
        </div>
      </div>
    </div>

    <!-- Screenshots Section -->
    <!-- Temporarily commented out until we have actual images
    <div class="py-24 sm:py-32 animate-fade-in delay-200">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-zinc-400 animate-slide-down">Screenshots</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down delay-100">
            See BetterSEQTA+ in action
          </p>
          <p class="mt-6 text-lg leading-8 text-zinc-300 animate-fade-in delay-200">
            Take a look at some of the key features and interfaces of BetterSEQTA+.
          </p>
        </div>
        <div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in">
            <img src="https://raw.githubusercontent.com/AdenMGB/desqta-website/refs/heads/main/public/images/ss/homepage.png" alt="Homepage" class="w-full h-auto object-cover" />
            <div class="p-6">
              <h3 class="text-lg font-semibold text-white">Homepage</h3>
              <p class="mt-2 text-zinc-300">Your personalized dashboard with upcoming assessments and notices.</p>
            </div>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-100">
            <img src="https://raw.githubusercontent.com/AdenMGB/desqta-website/refs/heads/main/public/images/ss/assements.png" alt="Assessments View" class="w-full h-auto object-cover" />
            <div class="p-6">
              <h3 class="text-lg font-semibold text-white">Assessments</h3>
              <p class="mt-2 text-zinc-300">View and manage your assessments with an intuitive interface.</p>
            </div>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
            <img src="https://raw.githubusercontent.com/AdenMGB/desqta-website/refs/heads/main/public/images/ss/courses.png" alt="Courses Dashboard" class="w-full h-auto object-cover" />
            <div class="p-6">
              <h3 class="text-lg font-semibold text-white">Courses</h3>
              <p class="mt-2 text-zinc-300">Access your courses and learning materials in one place.</p>
            </div>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
            <img src="https://raw.githubusercontent.com/AdenMGB/desqta-website/refs/heads/main/public/images/ss/dashboard.png" alt="Dashboard Overview" class="w-full h-auto object-cover" />
            <div class="p-6">
              <h3 class="text-lg font-semibold text-white">Dashboard</h3>
              <p class="mt-2 text-zinc-300">Get a quick overview of your important information and tasks.</p>
            </div>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in">
            <img src="https://raw.githubusercontent.com/AdenMGB/desqta-website/refs/heads/main/public/images/ss/message_inbox.png" alt="Direqt Messages" class="w-full h-auto object-cover" />
            <div class="p-6">
              <h3 class="text-lg font-semibold text-white">Direqt Messages</h3>
              <p class="mt-2 text-zinc-300">Stay connected with teachers and students through the messaging system.</p>
            </div>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-100">
            <img src="https://raw.githubusercontent.com/AdenMGB/desqta-website/refs/heads/main/public/images/ss/news.png" alt="News Feed" class="w-full h-auto object-cover" />
            <div class="p-6">
              <h3 class="text-lg font-semibold text-white">News Feed</h3>
              <p class="mt-2 text-zinc-300">Stay updated with the latest news and announcements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    -->

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
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down">Ready to transform SEQTA?<br>Add BetterSEQTA+ to Chrome today.</h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300 animate-fade-in delay-100">
          Join thousands of students and teachers who are already using BetterSEQTA+ to make SEQTA Learn actually enjoyable!
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6 animate-fade-in delay-200">
          <NuxtLink
            href="/download"
            class="rounded-md bg-zinc-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 transition-all duration-200"
          >
            Add to Chrome
          </NuxtLink>
          <NuxtLink href="/comparison" class="text-sm font-semibold leading-6 text-white transition-colors duration-200 hover:text-zinc-400">
            Learn more <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PaintBrushIcon,
  MoonIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/24/outline";

useHead({
  title: "Home",
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
