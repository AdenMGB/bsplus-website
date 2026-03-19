<svelte:options runes={true} />

<script lang="ts">
  import type { PageProps } from './$types';
  import Card from '$components/ui/Card.svelte';
  import Button from '$components/ui/Button.svelte';

  let { data }: PageProps = $props();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const formatVersion = (tag: string) => tag.replace('betterseqtaplus@', 'v');
</script>

<section class="space-y-10 pb-14 pt-6">
  <div class="max-w-4xl space-y-4">
    <div class="section-subtitle">Release notes</div>
    <h1 class="section-title">Keep up with the latest BetterSEQTA and DesQTA releases.</h1>
    <p class="text-lg text-muted">
      We publish change summaries for the browser extension and the desktop app as soon as new versions land.
    </p>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card className="space-y-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="section-subtitle">BetterSEQTA+</div>
          <h2 class="mt-2 text-2xl font-semibold text-white">{data.bqplusRelease ? formatVersion(data.bqplusRelease.tag_name) : 'No release yet'}</h2>
          {#if data.bqplusRelease?.published_at}
            <div class="mt-2 text-sm text-soft">{formatDate(data.bqplusRelease.published_at)}</div>
          {/if}
        </div>
        <Button href="/changelogs/bqplus" variant="ghost">View history</Button>
      </div>

      <div class="prose-theme line-clamp-6 max-w-none text-sm">
        {@html data.renderedBqplus}
      </div>
    </Card>

    <Card className="space-y-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="section-subtitle">DesQTA</div>
          <h2 class="mt-2 text-2xl font-semibold text-white">{data.desqtaRelease?.tag_name ?? 'No release yet'}</h2>
          {#if data.desqtaRelease?.published_at}
            <div class="mt-2 text-sm text-soft">{formatDate(data.desqtaRelease.published_at)}</div>
          {/if}
        </div>
        <Button href="/changelogs/desqta" variant="ghost">View history</Button>
      </div>

      <div class="prose-theme line-clamp-6 max-w-none text-sm">
        {@html data.renderedDesqta}
      </div>
    </Card>
  </div>
</section>
