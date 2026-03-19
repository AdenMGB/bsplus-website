<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$components/ui/Card.svelte';
  import { readJson, sendJson } from '$lib/utils/admin';

  let posts = $state<any[]>([]);

  onMount(async () => {
    posts = await readJson<any[]>('/api/news?admin=true&limit=100');
  });

  async function togglePublish(slug: string, current: boolean) {
    await sendJson(`/api/news/publish?slug=${encodeURIComponent(slug)}`, 'PATCH', { published: !current });
    posts = posts.map((post) => (post.slug === slug ? { ...post, published: !current } : post));
  }

  async function deletePost(id: number) {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/news/${id}`, { method: 'DELETE' });
    posts = posts.filter((post) => post.id !== id);
  }
</script>

<section class="space-y-8">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div class="space-y-3">
      <div class="section-subtitle">News</div>
      <h1 class="text-4xl font-semibold text-white">Manage posts</h1>
    </div>
    <a class="btn-accent" href="/admin/news/create">Create post</a>
  </div>

  <div class="space-y-4">
    {#each posts as post (post.id)}
      <Card className="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold text-white">{post.title}</h2>
            <div class="mt-2 text-sm text-soft">{post.published ? 'Published' : 'Draft'} · {post.slug}</div>
          </div>
          <div class="flex flex-wrap gap-3">
            <a class="btn-ghost" href={`/admin/news/edit/${post.slug}`}>Edit</a>
            <button class="btn-ghost" type="button" onclick={() => togglePublish(post.slug, post.published)}>{post.published ? 'Unpublish' : 'Publish'}</button>
            <button class="btn-ghost" type="button" onclick={() => deletePost(post.id)}>Delete</button>
          </div>
        </div>
      </Card>
    {/each}
  </div>
</section>
