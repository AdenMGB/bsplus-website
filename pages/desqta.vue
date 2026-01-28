<template>
  <div class="relative isolate overflow-hidden">
    <!-- Hero Section -->
    <div class="relative isolate overflow-hidden animate-fade-in">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-8 sm:pb-24 sm:pt-10 lg:px-8 lg:py-40">
        <div class="mx-auto max-w-2xl text-center px-4 sm:px-0">
          <div class="mt-4 sm:mt-0 flex-shrink-0 flex justify-center">
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
          <h1 class="mt-6 sm:mt-8 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display animate-slide-down delay-100">
            DesQTA
          </h1>
          <h2 class="mt-2 text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-blue-300 font-display animate-slide-down delay-100">
            The Desktop Experience
          </h2>
          <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300 animate-fade-in delay-200">
            A powerful desktop application for SEQTA Learn, bringing the full SEQTA experience to your computer with enhanced features, offline support, and optimized performance.
          </p>
          <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-6 animate-fade-in delay-300">
            <NuxtLink
              href="/download"
              class="rounded-md bg-blue-600 px-4 py-2.5 sm:px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Download DesQTA
              <svg class="ml-2 -mr-0.5 h-5 w-5 inline-block transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </NuxtLink>
            <NuxtLink
              href="/comparison"
              class="text-sm font-semibold leading-6 text-white transition-colors duration-200 hover:text-blue-200"
            >
              Compare Features <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Features Section -->
    <div class="py-24 sm:py-32 animate-fade-in delay-200">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-blue-400 animate-slide-down">Why DesQTA?</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down delay-100">
            More than just a browser extension
          </p>
          <p class="mt-6 text-lg leading-8 text-zinc-300 animate-fade-in delay-200">
            DesQTA is a full-featured desktop application that brings SEQTA Learn to your computer with features you can't get anywhere else.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Local Application
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">A native desktop app that runs independently of your browser, giving you a dedicated SEQTA experience.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-100">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              Offline Support
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Access your SEQTA data even when you're offline. View assignments, check schedules, and more without an internet connection.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-200">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Optimized Performance
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Built for speed and efficiency. DesQTA runs faster and uses fewer resources than running SEQTA in a browser.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-300">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              System Integration
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Full integration with your operating system. Native notifications, system tray support, and seamless window management.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-400">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
              Custom Home Page
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">A modern, responsive interface with a custom home page designed to help you stay organized and productive.</p>
            </dd>
          </div>
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-500">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Cloud Sync
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
              <p class="flex-auto">Sync your settings and preferences across all your devices. Your DesQTA experience follows you everywhere.</p>
            </dd>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Features Section -->
    <div class="py-24 sm:py-32 bg-zinc-900/30 animate-fade-in delay-300">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-blue-400 animate-slide-down">Advanced Features</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down delay-100">
            Everything you need, and more
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:max-w-none lg:grid-cols-2">
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enhanced Styling Editor
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Create and customize themes with our powerful styling editor. More control, more options, more ways to make SEQTA yours.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Local Notifications
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Get native system notifications for assignments, messages, and important updates - even when DesQTA is closed.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                RSS News Feeds
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Stay up to date with RSS feed support for news and announcements. Never miss important updates.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cloud-Based Messaging
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Enhanced messaging system with cloud sync. Access your conversations from any device, anytime.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI Integration & Features
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Leverage AI-powered features to enhance your productivity and learning experience.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                To Do List & Focus Timer
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Built-in task management and focus timer to help you stay organized and productive throughout your day.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Student Directory
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Quick access to student information and contact details, all in one convenient place.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Browser Independent
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">No need for Chrome, Firefox, or any browser. DesQTA runs independently, giving you a cleaner, faster experience.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Platform Support Section -->
    <div class="py-24 sm:py-32 animate-fade-in delay-400">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-blue-400 animate-slide-down">Available Platforms</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down delay-100">
            Works on your favorite platform
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <!-- Windows -->
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in">
            <svg class="h-12 w-12 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor">
              <path d="M7,6h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V7 C6,6.448,6.448,6,7,6z"></path>
              <path d="M25.042,21.958V7c0-0.552,0.448-1,1-1H41c0.552,0,1,0.448,1,1v14.958 c0,0.552-0.448,1-1,1H26.042C25.489,22.958,25.042,22.511,25.042,21.958z"></path>
              <path d="M7,25h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V26 C6,25.448,6.448,25,7,25z"></path>
              <path d="M25,41V26c0-0.552,0.448-1,1-1h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H26 C25.448,42,25,41.552,25,41z"></path>
            </svg>
            <dt class="mt-4 text-base font-semibold leading-7 text-white">Windows</dt>
            <dd class="mt-2 text-sm leading-6 text-zinc-300">
              Windows 10 or later
            </dd>
          </div>

          <!-- macOS -->
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-100">
            <svg class="h-12 w-12 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
            </svg>
            <dt class="mt-4 text-base font-semibold leading-7 text-white">macOS</dt>
            <dd class="mt-2 text-sm leading-6 text-zinc-300">
              macOS 10.15 or later
            </dd>
          </div>

          <!-- Linux -->
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-200">
            <svg class="h-12 w-12 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" fill="currentColor" viewBox="0 0 15 15">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M4.53918 2.40715C4.82145 1.0075 6.06066 0 7.49996 0C8.93926 0 10.1785 1.0075 10.4607 2.40715L10.798 4.07944C10.9743 4.9539 11.3217 5.78562 11.8205 6.52763L12.4009 7.39103C12.7631 7.92978 12.9999 8.5385 13.0979 9.17323C13.6747 9.22167 14.1803 9.58851 14.398 10.1283L14.8897 11.3474C15.1376 11.962 14.9583 12.665 14.4455 13.0887L12.5614 14.6458C12.0128 15.0992 11.2219 15.1193 10.6506 14.6944L9.89192 14.1301C9.88189 14.1227 9.87197 14.1151 9.86216 14.1074C9.48973 14.2075 9.09793 14.261 8.69355 14.261H6.30637C5.90201 14.261 5.51023 14.2076 5.13782 14.1074C5.12802 14.1151 5.11811 14.1227 5.10808 14.1301L4.34942 14.6944C3.77811 15.1193 2.98725 15.0992 2.43863 14.6458L0.55446 13.0887C0.0417175 12.665 -0.1376 11.962 0.110281 11.3474L0.602025 10.1283C0.819715 9.58854 1.32527 9.2217 1.90198 9.17324C2 8.5385 2.2368 7.92978 2.59897 7.39103L3.17938 6.52763C3.67818 5.78562 4.02557 4.9539 4.20193 4.07944L4.53918 2.40715ZM10.8445 9.47585C10.6345 9.63293 10.4642 9.84382 10.3561 10.0938L9.58799 11.8713C9.20026 12.0979 8.75209 12.2237 8.28465 12.2237H6.7153C6.24789 12.2237 5.79975 12.0979 5.41203 11.8714L4.64386 10.0938C4.53581 9.8438 4.36552 9.6329 4.15546 9.47582C4.18121 9.15355 4.2689 8.83503 4.41853 8.53826L5.67678 6.04259L5.68433 6.05007C6.68715 7.04458 8.31304 7.04458 9.31585 6.05007L9.32324 6.04274L10.5814 8.53825C10.7311 8.83504 10.8187 9.15357 10.8445 9.47585ZM9.04068 4.26906V3.05592H8.01353V3.85713C8.23151 3.90123 8.44506 3.97371 8.64848 4.07458L9.04068 4.26906ZM6.98638 3.85718V3.05592H5.95923V4.26919L6.3517 4.07458C6.55504 3.97375 6.7685 3.90129 6.98638 3.85718ZM2.03255 10.1864C1.82255 10.1864 1.6337 10.3132 1.55571 10.5066L1.06397 11.7257C0.981339 11.9306 1.04111 12.1649 1.21203 12.3062L3.0962 13.8633C3.27907 14.0144 3.54269 14.0211 3.73313 13.8795L4.49179 13.3152C4.6813 13.1743 4.74901 12.923 4.6557 12.7071L3.69976 10.4951C3.61884 10.3078 3.43316 10.1864 3.22771 10.1864H2.03255ZM13.4443 10.5066C13.3663 10.3132 13.1775 10.1864 12.9674 10.1864H11.7723C11.5668 10.1864 11.3812 10.3078 11.3002 10.4951L10.3443 12.7071C10.251 12.923 10.3187 13.1743 10.5082 13.3152L11.2669 13.8795C11.4573 14.0211 11.7209 14.0144 11.9038 13.8633L13.788 12.3062C13.9589 12.1649 14.0187 11.9306 13.936 11.7257L13.4443 10.5066ZM6.81106 4.98568C7.24481 4.7706 7.75537 4.7706 8.18912 4.98568L8.68739 5.23275L8.58955 5.32978C7.98786 5.92649 7.01232 5.92649 6.41063 5.32978L6.31279 5.23275L6.81106 4.98568Z"/>
            </svg>
            <dt class="mt-4 text-base font-semibold leading-7 text-white">Linux</dt>
            <dd class="mt-2 text-sm leading-6 text-zinc-300">
              Coming soon
            </dd>
          </div>

          <!-- Android -->
          <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] animate-fade-in delay-300">
            <svg class="h-12 w-12 flex-none text-blue-400 transition-transform duration-300 hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5665 0-.9414-.4749-.9414-1.0414s.3749-1.0414.9414-1.0414.9414.4749.9414 1.0414-.3749 1.0414-.9414 1.0414zm-11.046 0c-.5665 0-.9414-.4749-.9414-1.0414s.3749-1.0414.9414-1.0414.9414.4749.9414 1.0414-.3749 1.0414-.9414 1.0414zm11.405-6.34l1.0515-1.9003c.1628-.2938.0589-.6673-.2349-.8301-.2938-.1628-.6673-.0589-.8301.2349L16.8732 8.4103c-1.2513-.5729-2.7665-.9414-4.3732-.9414s-3.1219.3685-4.3732.9414L7.1005 6.4659c-.1628-.2938-.5363-.3977-.8301-.2349-.2938.1628-.3977.5363-.2349.8301L6.9871 8.9614C5.1108 10.0847 3.9795 11.9498 3.9795 14.041h16.041c0-2.0912-1.1313-3.9563-3.0076-5.0796z"></path>
            </svg>
            <dt class="mt-4 text-base font-semibold leading-7 text-white">Android</dt>
            <dd class="mt-2 text-sm leading-6 text-zinc-300">
              Android 7.0+ (API 24)
            </dd>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8 animate-fade-in delay-500">
      <svg class="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
        <defs>
          <pattern id="desqta-pattern" width="200" height="200" x="50%" y="0" patternUnits="userSpaceOnUse">
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="0" class="overflow-visible fill-white/5">
          <path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z M-600 200h201v201h-201Z M400 400h201v201h-201Z M-200 400h201v201h-201Z M200 0h201v201h-201Z M-400 0h201v201h-201Z M0 200h201v201h-201Z M-200 600h201v201h-201Z M400 800h201v201h-201Z" stroke-width="0" />
        </svg>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#desqta-pattern)" />
      </svg>
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down">Ready to experience SEQTA differently?<br>Download DesQTA today.</h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300 animate-fade-in delay-100">
          Get the full desktop experience with offline support, system integration, and so much more.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-x-6 animate-fade-in delay-200">
          <NuxtLink
            href="/download"
            class="rounded-md bg-blue-600 px-4 py-2.5 sm:px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 text-center"
          >
            Download DesQTA
          </NuxtLink>
          <NuxtLink href="/comparison" class="text-sm font-semibold leading-6 text-white transition-colors duration-200 hover:text-blue-200 text-center">
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
  title: "DesQTA - The Desktop Experience",
  meta: [
    {
      name: 'description',
      content: 'DesQTA is a powerful desktop application for SEQTA Learn, bringing the full SEQTA experience to your computer with enhanced features, offline support, and optimized performance.'
    }
  ]
});

const desqtaRelease = ref<any>(null);

const desqtaVersion = computed(() => {
  if (!desqtaRelease.value?.tag_name) return null;
  return desqtaRelease.value.tag_name;
});

onMounted(async () => {
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

.animate-fade-in {
  animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.animate-slide-down {
  animation: slide-down 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
</style>
