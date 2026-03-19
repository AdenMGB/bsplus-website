<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Card from '$components/ui/Card.svelte';
  import { readJson, sendJson } from '$lib/utils/admin';

  let theme = $state<any>(null);
  let loading = $state(true);
  let message = $state('');
  let rejectReason = $state('');

  onMount(async () => {
    const response = await readJson<any>(`/api/admin/themes/${page.params.id}`);
    theme = response.data.theme;
    loading = false;
  });

  async function saveTheme(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      tags: String(formData.get('tags') ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      featured: formData.get('featured') === 'on'
    };

    const response = await sendJson<any>(`/api/admin/themes/${page.params.id}`, 'PUT', payload);
    theme = response.data.theme;
    message = 'Theme updated';
  }

  async function approveTheme() {
    await sendJson(`/api/admin/themes/${page.params.id}/approve`, 'POST', { notes: 'Approved from Svelte admin' });
    message = 'Theme approved';
    const response = await readJson<any>(`/api/admin/themes/${page.params.id}`);
    theme = response.data.theme;
  }

  async function rejectTheme() {
    await sendJson(`/api/admin/themes/${page.params.id}/reject`, 'POST', { reason: rejectReason || 'Rejected from Svelte admin' });
    message = 'Theme rejected';
    const response = await readJson<any>(`/api/admin/themes/${page.params.id}`);
    theme = response.data.theme;
  }

  async function deleteTheme() {
    if (!confirm('Delete this theme?')) return;
    await fetch(`/api/admin/themes/${page.params.id}`, { method: 'DELETE' });
    window.location.href = '/admin/themes';
  }
</script>

<section class="space-y-8">
  {#if loading}
    <Card>Loading theme...</Card>
  {:else if theme}
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-3">
        <div class="section-subtitle">Theme detail</div>
        <h1 class="text-4xl font-semibold text-white">{theme.name}</h1>
      </div>
      <div class="flex flex-wrap gap-3">
        <button class="btn-ghost" type="button" onclick={approveTheme}>Approve</button>
        <button class="btn-ghost" type="button" onclick={deleteTheme}>Delete</button>
      </div>
    </div>

    {#if message}
      <Card>{message}</Card>
    {/if}

    <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="space-y-5">
        <form class="space-y-4" onsubmit={saveTheme}>
          <input class="input-surface" name="name" value={theme.name} />
          <textarea class="input-surface min-h-40" name="description">{theme.description}</textarea>
          <input class="input-surface" name="category" value={theme.category} />
          <input class="input-surface" name="tags" value={theme.tags?.join(', ')} />
          <label class="flex items-center gap-3 text-sm text-muted"><input name="featured" type="checkbox" checked={theme.featured} /> Featured</label>
          <button class="btn-accent" type="submit">Save changes</button>
        </form>
      </Card>

      <Card className="space-y-5">
        <h2 class="text-2xl font-semibold text-white">Review</h2>
        <div class="space-y-2 text-sm text-muted">
          <div>Status: <span class="text-white">{theme.status}</span></div>
          <div>Type: <span class="text-white">{theme.theme_type}</span></div>
          <div>Downloads: <span class="text-white">{theme.download_count}</span></div>
          <div>Rating: <span class="text-white">{theme.rating_average}</span></div>
        </div>
        <textarea bind:value={rejectReason} class="input-surface min-h-28" placeholder="Rejection reason"></textarea>
        <button class="btn-ghost" type="button" onclick={rejectTheme}>Reject theme</button>
      </Card>
    </div>
  {/if}
</section>
