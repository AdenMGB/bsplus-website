<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Card from '$components/ui/Card.svelte';
  import { readJson, sendJson } from '$lib/utils/admin';

  let post = $state<any>(null);

  onMount(async () => {
    post = await readJson<any>(`/api/news/${page.params.slug}?admin=true`);
  });

  async function savePost(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    await sendJson(`/api/news/${page.params.slug}`, 'PUT', {
      title: data.get('title'),
      slug: data.get('slug'),
      content: data.get('content'),
      cover_image: data.get('cover_image') || undefined,
      published: data.get('published') === 'on'
    });

    window.location.href = '/admin/news';
  }
</script>

<section class="space-y-8">
  {#if !post}
    <Card>Loading post...</Card>
  {:else}
    <div class="space-y-3">
      <div class="section-subtitle">News</div>
      <h1 class="text-4xl font-semibold text-white">Edit post</h1>
    </div>

    <Card className="space-y-5">
      <form class="space-y-4" onsubmit={savePost}>
        <input class="input-surface" name="title" value={post.title} />
        <input class="input-surface" name="slug" value={post.slug} />
        <input class="input-surface" name="cover_image" value={post.cover_image} />
        <textarea class="input-surface min-h-[22rem]" name="content">{post.content}</textarea>
        <label class="flex items-center gap-3 text-sm text-muted"><input checked={post.published} name="published" type="checkbox" /> Published</label>
        <button class="btn-accent" type="submit">Save post</button>
      </form>
    </Card>
  {/if}
</section>
