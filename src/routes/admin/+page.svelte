<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$components/ui/Card.svelte';
  import { readJson } from '$lib/utils/admin';

  let loading = $state(true);
  let dashboard = $state({
    stats: null as null | Record<string, any>,
    themes: null as null | Record<string, any>,
    collections: [] as any[],
    questions: [] as any[],
    news: [] as any[]
  });
  let error = $state('');

  onMount(async () => {
    try {
      const [stats, themes, collections, questions, news] = (await Promise.all([
        readJson('/api/analytics/stats'),
        readJson('/api/admin/themes?limit=5'),
        readJson('/api/admin/collections'),
        readJson('/api/questionnaire'),
        readJson('/api/news?admin=true&limit=5')
      ])) as [any, any, any, any[], any[]];

      dashboard = {
        stats,
        themes,
        collections: collections.data.collections,
        questions,
        news
      };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load admin dashboard';
    } finally {
      loading = false;
    }
  });
</script>

<section class="space-y-8 md:space-y-10">
  <div class="hero-panel px-6 py-7 md:px-8 md:py-8">
    <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
      <div class="space-y-4">
        <div class="eyebrow-badge">Admin dashboard</div>
        <h1 class="text-4xl font-semibold tracking-tight text-white md:text-5xl">Overview</h1>
        <p class="max-w-3xl text-base leading-8 text-muted">
          Monitor usage, content, and marketplace activity from a single control surface with a cleaner dark admin shell.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="metric-card">
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">News coverage</div>
          <div class="mt-3 text-2xl font-semibold text-white">{dashboard.stats?.news?.published ?? 0}</div>
          <div class="mt-1 text-sm text-muted">Published announcements live on the site.</div>
        </div>
        <div class="metric-card">
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Theme queue</div>
          <div class="mt-3 text-2xl font-semibold text-white">{dashboard.stats?.themes?.pending ?? 0}</div>
          <div class="mt-1 text-sm text-muted">Submissions waiting for review.</div>
        </div>
      </div>
    </div>
  </div>

  {#if error}
    <Card className="border-red-500/30 text-red-200">{error}</Card>
  {/if}

  {#if loading}
    <Card>Loading dashboard...</Card>
  {:else}
    <div class="stat-grid">
      <div class="metric-card"><div class="text-sm text-soft">News posts</div><div class="mt-2 text-3xl font-semibold text-white">{dashboard.stats?.news?.total ?? 0}</div></div>
      <div class="metric-card"><div class="text-sm text-soft">Published news</div><div class="mt-2 text-3xl font-semibold text-white">{dashboard.stats?.news?.published ?? 0}</div></div>
      <div class="metric-card"><div class="text-sm text-soft">Themes total</div><div class="mt-2 text-3xl font-semibold text-white">{dashboard.stats?.themes?.total ?? 0}</div></div>
      <div class="metric-card"><div class="text-sm text-soft">Pending themes</div><div class="mt-2 text-3xl font-semibold text-white">{dashboard.stats?.themes?.pending ?? 0}</div></div>
      <div class="metric-card"><div class="text-sm text-soft">Browser sessions</div><div class="mt-2 text-3xl font-semibold text-white">{dashboard.stats?.sessions?.total ?? 0}</div></div>
      <div class="metric-card"><div class="text-sm text-soft">DesQTA sessions</div><div class="mt-2 text-3xl font-semibold text-white">{dashboard.stats?.desqtaSessions?.total ?? 0}</div></div>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <Card className="space-y-4 p-7">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-white">Recent news</h2>
          <a class="nav-link text-sm" href="/admin/news">Manage</a>
        </div>
        <div class="space-y-3">
          {#each dashboard.news as post (post.id)}
            <div class="rounded-2xl border border-white/8 bg-white/2 px-4 py-3">
              <div class="font-medium text-white">{post.title}</div>
              <div class="mt-1 text-sm text-soft">{post.published ? 'Published' : 'Draft'}</div>
            </div>
          {/each}
        </div>
      </Card>

      <Card className="space-y-4 p-7">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-white">Questionnaire queue</h2>
          <a class="nav-link text-sm" href="/admin/questionnaire">Manage</a>
        </div>
        <div class="space-y-3">
          {#each dashboard.questions.slice(0, 5) as question (question.id)}
            <div class="rounded-2xl border border-white/8 bg-white/2 px-4 py-3">
              <div class="font-medium text-white">{question.question}</div>
              <div class="mt-1 text-sm text-soft">{question.is_active ? 'Active' : 'Queued'} · {question.total_votes} votes</div>
            </div>
          {/each}
        </div>
      </Card>

      <Card className="space-y-4 p-7">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-white">Latest theme submissions</h2>
          <a class="nav-link text-sm" href="/admin/themes">Manage</a>
        </div>
        <div class="space-y-3">
          {#each dashboard.themes?.data?.themes?.slice(0, 5) ?? [] as theme (theme.id)}
            <div class="rounded-2xl border border-white/8 bg-white/2 px-4 py-3">
              <div class="font-medium text-white">{theme.name}</div>
              <div class="mt-1 text-sm text-soft">{theme.status} · {theme.theme_type}</div>
            </div>
          {/each}
        </div>
      </Card>

      <Card className="space-y-4 p-7">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-white">Collections</h2>
          <a class="nav-link text-sm" href="/admin/collections">Manage</a>
        </div>
        <div class="space-y-3">
          {#each dashboard.collections.slice(0, 5) as collection (collection.id)}
            <div class="rounded-2xl border border-white/8 bg-white/2 px-4 py-3">
              <div class="font-medium text-white">{collection.name}</div>
              <div class="mt-1 text-sm text-soft">{collection.theme_count} themes</div>
            </div>
          {/each}
        </div>
      </Card>
    </div>
  {/if}
</section>
