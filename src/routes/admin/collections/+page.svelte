<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$components/ui/Card.svelte';
  import { readJson } from '$lib/utils/admin';

  let collections = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    const response = await readJson<any>('/api/admin/collections');
    collections = response.data.collections;
    loading = false;
  });
</script>

<section class="space-y-8">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div class="space-y-3">
      <div class="section-subtitle">Collections</div>
      <h1 class="text-4xl font-semibold text-white">Curated theme collections</h1>
    </div>
    <a class="btn-accent" href="/admin/collections/new">New collection</a>
  </div>

  {#if loading}
    <Card>Loading collections...</Card>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each collections as collection (collection.id)}
        <a class="block" href={`/admin/collections/${collection.id}`}>
          <Card className="space-y-4">
            <h2 class="text-2xl font-semibold text-white">{collection.name}</h2>
            <p class="text-muted">{collection.description}</p>
            <div class="text-sm text-soft">{collection.theme_count} themes</div>
          </Card>
        </a>
      {/each}
    </div>
  {/if}
</section>
