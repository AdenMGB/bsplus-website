<svelte:options runes={true} />

<script lang="ts">
  import type { PageProps } from './$types';
  import Card from '$components/ui/Card.svelte';
  import Button from '$components/ui/Button.svelte';

  let { data }: PageProps = $props();
</script>

<section class="space-y-10 pb-14 pt-6">
  <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
    <Card className="space-y-6 p-8 md:p-10 lg:p-12">
      <div class="section-subtitle">Desktop app</div>
      <h1 class="section-title">DesQTA turns SEQTA Learn into a real desktop workspace.</h1>
      <p class="text-lg leading-8 text-muted">
        Move beyond the browser with offline support, faster navigation, native notifications, and room
        for bigger BetterSEQTA Cloud features.
      </p>
      <div class="flex flex-wrap gap-3">
        <Button href="/download">Download DesQTA</Button>
        <Button href="/comparison" variant="ghost">Compare features</Button>
      </div>
    </Card>

    <Card className="space-y-4 p-8">
      <div class="text-sm font-semibold uppercase tracking-[0.16em] text-soft">Latest release</div>
      <div class="text-3xl font-semibold text-white">{data.release?.tag_name ?? 'Available now'}</div>
      <p class="text-muted">
        Windows, macOS, and Android packages are distributed from the DesQTA release pipeline, with Linux support planned.
      </p>
      <div class="stat-grid">
        <div class="glass-card p-4">
          <div class="text-sm text-soft">Windows</div>
          <div class="mt-2 font-semibold text-white">Supported</div>
        </div>
        <div class="glass-card p-4">
          <div class="text-sm text-soft">macOS</div>
          <div class="mt-2 font-semibold text-white">Supported</div>
        </div>
        <div class="glass-card p-4">
          <div class="text-sm text-soft">Android</div>
          <div class="mt-2 font-semibold text-white">Supported</div>
        </div>
      </div>
    </Card>
  </div>

  <div class="space-y-5">
    <div class="max-w-3xl space-y-3">
      <div class="section-subtitle">Why DesQTA</div>
      <h2 class="text-3xl font-semibold text-white md:text-5xl">A bigger, wider interface for the full BetterSEQTA vision.</h2>
      <p class="text-lg text-muted">
        DesQTA has room for productivity features that do not fit comfortably inside a browser extension.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each data.features as feature}
        <Card className="space-y-4">
          <h3 class="text-xl font-semibold text-white">{feature.title}</h3>
          <p class="text-muted">{feature.description}</p>
        </Card>
      {/each}
    </div>
  </div>
</section>
