<svelte:options runes={true} />

<script lang="ts">
  import Card from '$components/ui/Card.svelte';
  import { sendJson } from '$lib/utils/admin';

  let message = $state('');

  async function createCollection(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const payload = {
      name: data.get('name'),
      description: data.get('description'),
      slug: data.get('slug'),
      theme_ids: String(data.get('theme_ids') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      cover_image: data.get('cover_image'),
      featured: data.get('featured') === 'on'
    };

    const response = await sendJson<any>('/api/admin/collections', 'POST', payload);
    window.location.href = `/admin/collections/${response.data.collection.id}`;
  }
</script>

<section class="space-y-8">
  <div class="space-y-3">
    <div class="section-subtitle">Collections</div>
    <h1 class="text-4xl font-semibold text-white">Create collection</h1>
  </div>

  {#if message}
    <Card>{message}</Card>
  {/if}

  <Card className="space-y-5">
    <form class="space-y-4" onsubmit={createCollection}>
      <input class="input-surface" name="name" placeholder="Collection name" required />
      <input class="input-surface" name="slug" placeholder="collection-slug" />
      <textarea class="input-surface min-h-32" name="description" placeholder="Description"></textarea>
      <input class="input-surface" name="theme_ids" placeholder="Theme IDs, comma separated" required />
      <input class="input-surface" name="cover_image" placeholder="Cover image URL or uploaded image URL" />
      <label class="flex items-center gap-3 text-sm text-muted"><input name="featured" type="checkbox" /> Featured</label>
      <button class="btn-accent" type="submit">Create collection</button>
    </form>
  </Card>
</section>
