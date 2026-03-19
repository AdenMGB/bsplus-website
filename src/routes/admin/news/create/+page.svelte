<svelte:options runes={true} />

<script lang="ts">
  import Card from '$components/ui/Card.svelte';
  import { sendJson } from '$lib/utils/admin';

  async function createPost(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    await sendJson('/api/news', 'POST', {
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
  <div class="space-y-3">
    <div class="section-subtitle">News</div>
    <h1 class="text-4xl font-semibold text-white">Create post</h1>
  </div>

  <Card className="space-y-5">
    <form class="space-y-4" onsubmit={createPost}>
      <input class="input-surface" name="title" placeholder="Title" required />
      <input class="input-surface" name="slug" placeholder="slug" required />
      <input class="input-surface" name="cover_image" placeholder="Cover image URL" />
      <textarea class="input-surface min-h-[22rem]" name="content" placeholder="HTML content" required></textarea>
      <label class="flex items-center gap-3 text-sm text-muted"><input name="published" type="checkbox" /> Publish immediately</label>
      <button class="btn-accent" type="submit">Create post</button>
    </form>
  </Card>
</section>
