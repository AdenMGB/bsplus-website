<svelte:options runes={true} />

<script lang="ts">
  import type { PageProps } from './$types';
  import Button from '$components/ui/Button.svelte';
  import Card from '$components/ui/Card.svelte';
  import { Icon, ArrowTopRightOnSquare, ArrowDownTray, ComputerDesktop, DevicePhoneMobile } from 'svelte-hero-icons';
  import { downloadPlatforms } from '$lib/content/site';

  let { data }: PageProps = $props();
</script>

<section class="space-y-10 pb-12 pt-6 md:space-y-12 md:pt-10">
  <div class="hero-panel px-6 py-8 md:px-8 md:py-10 xl:px-12">
    <div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
      <div class="space-y-5">
        <div class="eyebrow-badge">Downloads</div>
        <h1 class="section-title max-w-4xl">Choose the BetterSEQTA experience that fits how you work.</h1>
        <p class="hero-kicker">
          Install the extension for the quickest upgrade, or download DesQTA for the full desktop experience with a wider layout and room for more powerful workflows.
        </p>
        <div class="flex flex-wrap gap-3">
          <Button href="#desqta-downloads">
            <Icon class="h-5 w-5" src={ArrowDownTray} />
            Desktop downloads
          </Button>
          <Button href="/comparison" variant="ghost">
            Compare editions
            <Icon class="h-5 w-5" src={ArrowTopRightOnSquare} />
          </Button>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="metric-card">
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Desktop release</div>
          <div class="mt-3 text-2xl font-semibold text-white">{data.release?.tag_name ?? 'Latest build'}</div>
          <div class="mt-1 text-sm text-muted">Current DesQTA version across supported platforms.</div>
        </div>
        <div class="metric-card">
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Install choices</div>
          <div class="mt-3 text-2xl font-semibold text-white">Browser + desktop</div>
          <div class="mt-1 text-sm text-muted">Chrome, Edge, Firefox, Windows, macOS, Android, and more.</div>
        </div>
      </div>
    </div>
  </div>

  <section class="space-y-6">
    <div class="max-w-3xl space-y-3">
      <div class="section-subtitle">Extension install</div>
      <h2 class="text-3xl font-semibold tracking-tight text-white md:text-4xl">Get BetterSEQTA+ in your browser in a few clicks.</h2>
      <p class="text-lg leading-8 text-muted">
        Fastest way to improve SEQTA Learn if you already live in your browser day to day.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-3">
      <Card className="space-y-5 p-6 md:p-7">
        <div class="space-y-2">
          <div class="section-subtitle">Chrome</div>
          <h3 class="text-2xl font-semibold text-white">Chrome Web Store</h3>
          <p class="text-muted">Install the main browser build for Chrome and Chromium-based browsers.</p>
        </div>
        <Button href="https://chromewebstore.google.com/detail/betterseqta+/afdgaoaclhkhemfkkkonemoapeinchel">Add to Chrome</Button>
      </Card>

      <Card className="space-y-5 p-6 md:p-7">
        <div class="space-y-2">
          <div class="section-subtitle">Edge</div>
          <h3 class="text-2xl font-semibold text-white">Microsoft Edge</h3>
          <p class="text-muted">Same fast install path for Edge users who want the browser-first experience.</p>
        </div>
        <Button href="https://chromewebstore.google.com/detail/betterseqta+/afdgaoaclhkhemfkkkonemoapeinchel">Add to Edge</Button>
      </Card>

      <Card className="space-y-5 p-6 md:p-7">
        <div class="space-y-2">
          <div class="section-subtitle">Firefox</div>
          <h3 class="text-2xl font-semibold text-white">Mozilla Add-ons</h3>
          <p class="text-muted">Grab the Firefox version if you want BetterSEQTA+ without switching browsers.</p>
        </div>
        <Button href="https://addons.mozilla.org/en-US/firefox/addon/betterseqta-plus/">Add to Firefox</Button>
      </Card>
    </div>
  </section>

  <section class="space-y-6" id="desqta-downloads">
    <div class="max-w-3xl space-y-3">
      <div class="section-subtitle">Desktop and mobile</div>
      <h2 class="text-3xl font-semibold tracking-tight text-white md:text-4xl">Download DesQTA for the devices you already use.</h2>
      <p class="text-lg leading-8 text-muted">
        The full BetterSEQTA desktop experience with platform-native installs and room for a much broader UI.
      </p>
    </div>

    <div class="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
      {#each downloadPlatforms as platform}
        <Card className="flex h-full flex-col gap-5 p-6 md:p-7">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-2">
              <div class="section-subtitle">{platform.label}</div>
              <h3 class="text-2xl font-semibold text-white">{platform.label}</h3>
            </div>
            <div class="rounded-2xl border border-white/8 bg-white/5 p-3 text-white">
              {#if platform.key === 'android'}
                <Icon class="h-6 w-6" src={DevicePhoneMobile} />
              {:else}
                <Icon class="h-6 w-6" src={ComputerDesktop} />
              {/if}
            </div>
          </div>

          <p class="text-base leading-7 text-muted">{platform.blurb}</p>

          {#if data.release?.tag_name}
            <div class="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-soft">
              Latest release: <span class="font-semibold text-white">{data.release.tag_name}</span>
            </div>
          {/if}

          <div class="mt-auto space-y-3">
            {#if platform.key === 'windows'}
              <Button href={data.links.exe || '#'}>{platform.primary}</Button>
              <Button href={data.links.msi || '#'} variant="ghost">Download MSI</Button>
            {:else if platform.key === 'macos'}
              <Button href={data.links.dmg || '#'}>{platform.primary}</Button>
            {:else if platform.key === 'android'}
              <Button href={data.links.apk || '#'}>{platform.primary}</Button>
            {:else}
              <Button variant="ghost" className="w-full justify-center opacity-70">{platform.primary}</Button>
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  </section>
</section>
