<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Card from '$components/ui/Card.svelte';
  import { readJson, sendJson } from '$lib/utils/admin';

  let collection = $state<any>(null);
  let loading = $state(true);
  let message = $state('');

  onMount(async () => {
    const response = await readJson<any>(`/api/collections/${page.params.id}`);
    collection = response.data.collection;
    loading = false;
  });

  async function saveCollection(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const payload = {
      name: data.get('name'),
      description: data.get('description'),
      theme_ids: String(data.get('theme_ids') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      featured: data.get('featured') === 'on'
    };

    const response = await sendJson<any>(`/api/admin/collections/${page.params.id}`, 'PUT', payload);
    collection = response.data.collection;
    message = 'Collection updated';
  }

  async function deleteCollection() {
    if (!confirm('Delete this collection?')) return;
    await fetch(`/api/admin/collections/${page.params.id}`, { method: 'DELETE' });
    window.location.href = '/admin/collections';
  }
</script>

<section class="space-y-8">
  {#if loading}
    <Card>Loading collection...</Card>
  {:else if collection}
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-3">
        <div class="section-subtitle">Collection detail</div>
        <h1 class="text-4xl font-semibold text-white">{collection.name}</h1>
      </div>
      <button class="btn-ghost" type="button" onclick={deleteCollection}>Delete</button>
    </div>

    {#if message}
      <Card>{message}</Card>
    {/if}

    <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="space-y-5">
        <form class="space-y-4" onsubmit={saveCollection}>
          <input class="input-surface" name="name" value={collection.name} />
          <textarea class="input-surface min-h-32" name="description">{collection.description}</textarea>
          <input class="input-surface" name="theme_ids" value={collection.themes.map((theme: any) => theme.id).join(', ')} />
          <label class="flex items-center gap-3 text-sm text-muted"><input name="featured" type="checkbox" checked={collection.featured} /> Featured</label>
          <button class="btn-accent" type="submit">Save collection</button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 class="text-2xl font-semibold text-white">Included themes</h2>
        <div class="space-y-3">
          {#each collection.themes ?? [] as theme (theme.id)}
            <div class="rounded-xl border border-white/8 px-4 py-3">
              <div class="font-medium text-white">{theme.name}</div>
              <div class="mt-1 text-sm text-soft">{theme.author}</div>
            </div>
          {/each}
        </div>
      </Card>
    </div>
  {/if}
</section>
