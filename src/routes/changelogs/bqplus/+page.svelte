<svelte:options runes={true} />

<script lang="ts">
  import type { PageProps } from './$types';
  import Card from '$components/ui/Card.svelte';

  let { data }: PageProps = $props();
  const releases = $derived((data.releases as any[]) ?? []);
  let expanded = $state(new Set<number>());

  $effect(() => {
    if (expanded.size === 0 && releases.length > 0) {
      expanded = new Set([releases[0].id]);
    }
  });

  const toggleRelease = (id: number) => {
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    expanded = new Set(expanded);
  };

  const formatVersion = (tag: string) => tag.replace('betterseqtaplus@', 'v');
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
</script>

<section class="mx-auto max-w-5xl space-y-8 pb-14 pt-6">
  <a class="nav-link text-sm" href="/changelogs">&larr; Back to Changelogs</a>
  <div class="space-y-3">
    <div class="section-subtitle">BetterSEQTA+ changelog</div>
    <h1 class="section-title">Complete release history for the browser extension.</h1>
  </div>

  <div class="space-y-4">
    {#each releases as release (release.id)}
      <Card className="overflow-hidden p-0">
        <button class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" type="button" onclick={() => toggleRelease(release.id)}>
          <div>
            <div class="text-xl font-semibold text-white">{release.name || formatVersion(release.tag_name)}</div>
            <div class="mt-2 text-sm text-soft">
              {formatVersion(release.tag_name)} · {formatDate(release.published_at)} · {release.author}
            </div>
          </div>
          <div class="text-sm text-soft">{expanded.has(release.id) ? 'Hide' : 'Show'}</div>
        </button>

        {#if expanded.has(release.id)}
          <div class="border-t border-white/8 px-6 py-5">
            <div class="prose-theme max-w-none text-sm">
              {@html release.renderedBody}
            </div>
            <div class="mt-5">
              <a class="nav-link text-sm" href={release.html_url} rel="noreferrer" target="_blank">View on GitHub</a>
            </div>
          </div>
        {/if}
      </Card>
    {/each}
  </div>
</section>
