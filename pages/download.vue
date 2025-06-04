<template>
  <div class="relative isolate overflow-hidden">
    <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 animate-fade-in">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-base font-semibold leading-7 text-blue-400 animate-slide-down">Download</h2>
        <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down delay-100">
          Get DesQTA for your platform
        </p>
        <p class="mt-6 text-lg leading-8 text-zinc-300 animate-fade-in delay-200">
          Choose your operating system and start using DesQTA today.
        </p>
      </div>

      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Windows Card -->
        <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in">
          <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
            <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0h11v11H0V0zm1 1v9h9V1H1zm12-1h11v11h-11V0zm1 1v9h9V1h-9zM0 12h11v11H0V12zm1 1v9h9v-9H1zm12-1h11v11h-11V12zm1 1v9h9v-9h-9z"/>
            </svg>
            <span class="ml-2">Windows</span>
          </dt>
          <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
            <p class="flex-auto">Download the latest version for Windows 10 and above.</p>
            <p class="mt-6">
              <a href="https://github.com/AdenMGB/desqta/releases/latest/download/DesQTA-Setup.exe" class="text-sm font-semibold leading-6 text-blue-400 transition-colors duration-200 hover:text-blue-300 focus:text-blue-200">
                Download for Windows <span aria-hidden="true">→</span>
              </a>
            </p>
          </dd>
        </div>
        <!-- macOS Card -->
        <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-100">
          <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
            <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span class="ml-2">macOS</span>
          </dt>
          <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
            <p class="flex-auto">Download the latest version for macOS 10.15 and above.</p>
            <p class="mt-6">
              <a href="https://github.com/AdenMGB/desqta/releases/latest/download/DesQTA.dmg" class="text-sm font-semibold leading-6 text-blue-400 transition-colors duration-200 hover:text-blue-300 focus:text-blue-200">
                Download for macOS <span aria-hidden="true">→</span>
              </a>
            </p>
          </dd>
        </div>
        <!-- Linux Card -->
        <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
          <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
            <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
            </svg>
            <span class="ml-2">Linux</span>
          </dt>
          <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
            <p class="flex-auto">Download the latest version for Linux distributions.</p>
            <p class="mt-6">
              <a href="https://github.com/AdenMGB/desqta/releases/latest/download/DesQTA.AppImage" class="text-sm font-semibold leading-6 text-blue-400 transition-colors duration-200 hover:text-blue-300 focus:text-blue-200">
                Download for Linux <span aria-hidden="true">→</span>
              </a>
            </p>
          </dd>
        </div>
      </div>

      <!-- System Requirements -->
      <div class="mx-auto mt-32 max-w-2xl sm:mt-40 lg:mt-48 lg:max-w-none animate-fade-in delay-300">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-blue-400">System Requirements</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What you need to run DesQTA
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">Windows</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ul class="list-disc pl-6 space-y-3">
                  <li>Windows 10 or later</li>
                  <li>4GB RAM minimum</li>
                  <li>500MB free disk space</li>
                  <li>Internet connection</li>
                </ul>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">macOS</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ul class="list-disc pl-6 space-y-3">
                  <li>macOS 10.15 or later</li>
                  <li>4GB RAM minimum</li>
                  <li>500MB free disk space</li>
                  <li>Internet connection</li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Installation Guide -->
      <div class="mx-auto mt-32 max-w-2xl sm:mt-40 lg:mt-48 lg:max-w-none animate-fade-in delay-400">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-blue-400">Installation Guide</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How to install DesQTA
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">Windows</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ol class="list-decimal pl-6 space-y-3">
                  <li>Download the .exe installer</li>
                  <li>Run the installer</li>
                  <li>Follow the installation wizard</li>
                  <li>Launch DesQTA</li>
                </ol>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">macOS</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ol class="list-decimal pl-6 space-y-3">
                  <li>Download the .dmg file</li>
                  <li>Open the .dmg file</li>
                  <li>Drag DesQTA to Applications</li>
                  <li>Launch from Applications</li>
                </ol>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">Linux</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ol class="list-decimal pl-6 space-y-3">
                  <li>Download the .AppImage</li>
                  <li>Make it executable: chmod +x DesQTA.AppImage</li>
                  <li>Run the AppImage</li>
                  <li>Optional: Move to /usr/local/bin</li>
                </ol>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Download",
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
</style>
