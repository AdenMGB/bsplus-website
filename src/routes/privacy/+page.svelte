<svelte:options runes={true} />

<script lang="ts">
  import type { PageProps } from './$types';
  import Card from '$components/ui/Card.svelte';

  let { data }: PageProps = $props();
  const policy = $derived((data.policy as { last_updated?: string; whatsnew_html?: string } | null) ?? null);
</script>

<section class="mx-auto max-w-5xl space-y-8 pb-14 pt-6">
  <div class="space-y-4">
    <div class="section-subtitle">Privacy</div>
    <h1 class="section-title">A clear statement on how BetterSEQTA handles your data.</h1>
    {#if policy?.last_updated}
      <p class="text-sm text-soft">Last updated: {new Date(policy.last_updated).toLocaleString()}</p>
    {/if}
  </div>

  <Card className="prose-theme max-w-none">
    {@html policy?.whatsnew_html ?? '<p>Privacy information is currently unavailable.</p>'}
  </Card>
</section>
