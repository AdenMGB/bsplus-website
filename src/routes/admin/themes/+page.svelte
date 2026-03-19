<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$components/ui/Card.svelte';
  import { readJson } from '$lib/utils/admin';

  let loading = $state(true);
  let error = $state('');
  let themes = $state<any[]>([]);

  onMount(async () => {
    try {
      const response = await readJson<any>('/api/admin/themes?limit=100');
      themes = response.data.themes;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load themes';
    } finally {
      loading = false;
    }
  });
</script>

<section class="space-y-8">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div class="space-y-3">
      <div class="section-subtitle">Themes</div>
      <h1 class="text-4xl font-semibold text-white">Marketplace submissions</h1>
    </div>
    <a class="btn-accent" href="/admin/themes/upload">Upload theme</a>
  </div>

  {#if error}
    <Card className="border-red-500/30 text-red-200">{error}</Card>
  {:else if loading}
    <Card>Loading themes...</Card>
  {:else}
    <Card className="overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="surface-table">
          <thead>
            <tr><th>Name</th><th>Status</th><th>Type</th><th>Downloads</th><th>Updated</th><th></th></tr>
          </thead>
          <tbody>
            {#each themes as theme (theme.id)}
              <tr>
                <td class="font-medium text-white">{theme.name}</td>
                <td>{theme.status}</td>
                <td>{theme.theme_type}</td>
                <td>{theme.download_count}</td>
                <td>{new Date(theme.updated_at).toLocaleDateString()}</td>
                <td><a class="nav-link text-sm" href={`/admin/themes/${theme.id}`}>Open</a></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card>
  {/if}
</section>
