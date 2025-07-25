<template>
  <div class="relative">
    <!-- DesQTA Announcement Banner -->
    <div class="relative w-full py-10 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border-b border-green-400/30 overflow-hidden">
      <!-- Confetti Animation -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="confetti-container">
          <div class="confetti" v-for="i in 50" :key="i" :style="`--delay: ${Math.random() * 3}s; --left: ${Math.random() * 100}%; --animation-duration: ${3 + Math.random() * 4}s;`"></div>
        </div>
      </div>
      
      <div class="relative mx-auto max-w-7xl px-6 py-8 sm:py-12">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex-1 text-center sm:text-left">
            <div class="flex items-center justify-center sm:justify-start space-x-3 mb-3">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-400/20 text-green-300 border border-green-400/30 animate-pulse">
                🎉 Brand New
              </span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                🚀 Desktop App
              </span>
            </div>
            <h3 class="text-2xl sm:text-3xl font-bold text-white mb-2 animate-slide-down">
              DesQTA
            </h3>
            <p class="text-lg text-zinc-200 mb-4 max-w-2xl">
              BetterSEQTA in a desktop app - the ultimate SEQTA experience with native performance and enhanced features!
            </p>
          </div>
          <div class="flex-shrink-0">
            <a
              href="https://desqta.betterseqta.org"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-semibold hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              Learn More
              <svg class="ml-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
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

/* Confetti Animation */
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #10b981, #059669, #047857, #065f46);
  border-radius: 2px;
  animation: confetti-fall var(--animation-duration) linear infinite;
  animation-delay: var(--delay);
  left: var(--left);
  opacity: 0;
}

.confetti:nth-child(3n) {
  background: linear-gradient(45deg, #f59e0b, #d97706, #b45309, #92400e);
  width: 6px;
  height: 6px;
}

.confetti:nth-child(3n+1) {
  background: linear-gradient(45deg, #3b82f6, #2563eb, #1d4ed8, #1e40af);
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.confetti:nth-child(3n+2) {
  background: linear-gradient(45deg, #8b5cf6, #7c3aed, #6d28d9, #5b21b6);
  width: 4px;
  height: 12px;
  border-radius: 2px;
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
