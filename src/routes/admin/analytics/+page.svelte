<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$components/ui/Card.svelte';
  import { readJson } from '$lib/utils/admin';

  let loading = $state(true);
  let usage = $state<any>(null);
  let themes = $state<any>(null);
  let error = $state('');

  onMount(async () => {
    try {
      [usage, themes] = await Promise.all([
        readJson('/api/analytics/usage?days=30'),
        readJson('/api/analytics/themes')
      ]);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load analytics';
    } finally {
      loading = false;
    }
  });
</script>

<section class="space-y-8">
  <div class="space-y-3">
    <div class="section-subtitle">Analytics</div>
    <h1 class="text-4xl font-semibold text-white">Usage and marketplace health</h1>
  </div>

  {#if error}
    <Card className="border-red-500/30 text-red-200">{error}</Card>
  {/if}

  {#if loading}
    <Card>Loading analytics...</Card>
  {:else}
    <div class="stat-grid">
      <Card><div class="text-sm text-soft">Total sessions</div><div class="mt-2 text-3xl font-semibold text-white">{usage?.summary?.totalSessions ?? 0}</div></Card>
      <Card><div class="text-sm text-soft">Signed-in sessions</div><div class="mt-2 text-3xl font-semibold text-white">{usage?.summary?.signedInSessions ?? 0}</div></Card>
      <Card><div class="text-sm text-soft">Unique users</div><div class="mt-2 text-3xl font-semibold text-white">{usage?.summary?.uniqueUsers ?? 0}</div></Card>
      <Card><div class="text-sm text-soft">Theme downloads</div><div class="mt-2 text-3xl font-semibold text-white">{themes?.summary?.totalDownloads ?? 0}</div></Card>
      <Card><div class="text-sm text-soft">Approved themes</div><div class="mt-2 text-3xl font-semibold text-white">{themes?.summary?.approved ?? 0}</div></Card>
      <Card><div class="text-sm text-soft">Average rating</div><div class="mt-2 text-3xl font-semibold text-white">{themes?.summary?.avgRating ?? 0}</div></Card>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <Card className="space-y-4">
        <h2 class="text-2xl font-semibold text-white">Daily app usage</h2>
        <div class="overflow-x-auto">
          <table class="surface-table">
            <thead>
              <tr><th>Date</th><th>Sessions</th><th>Signed in</th><th>Anonymous</th></tr>
            </thead>
            <tbody>
              {#each usage?.daily?.slice(-14) ?? [] as row (row.date)}
                <tr>
                  <td>{row.date}</td>
                  <td>{row.total_sessions}</td>
                  <td>{row.signed_in_sessions}</td>
                  <td>{row.anonymous_sessions}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 class="text-2xl font-semibold text-white">Top theme downloads</h2>
        <div class="overflow-x-auto">
          <table class="surface-table">
            <thead>
              <tr><th>Theme</th><th>Author</th><th>Downloads</th><th>Favorites</th></tr>
            </thead>
            <tbody>
              {#each themes?.topByDownloads ?? [] as row (row.id)}
                <tr>
                  <td>{row.name}</td>
                  <td>{row.author}</td>
                  <td>{row.download_count}</td>
                  <td>{row.favorite_count}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  {/if}
</section>
