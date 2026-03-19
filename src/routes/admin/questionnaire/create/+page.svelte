<svelte:options runes={true} />

<script lang="ts">
  import Card from '$components/ui/Card.svelte';
  import { sendJson } from '$lib/utils/admin';

  let mode = $state<'manual' | 'queued'>('manual');

  async function createQuestion(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const payload = {
      question: data.get('question'),
      options: String(data.get('options') ?? '')
        .split('\n')
        .map((option) => option.trim())
        .filter(Boolean),
      cover_image: data.get('cover_image') || undefined,
      expiresAt: mode === 'manual' ? data.get('expiresAt') : undefined,
      duration: mode === 'queued' ? Number(data.get('duration')) : undefined,
      auto_activate: mode === 'queued',
      queue_order: mode === 'queued' ? Number(data.get('queue_order')) : undefined
    };

    await sendJson('/api/questionnaire/create', 'POST', payload);
    window.location.href = '/admin/questionnaire';
  }
</script>

<section class="space-y-8">
  <div class="space-y-3">
    <div class="section-subtitle">Questionnaire</div>
    <h1 class="text-4xl font-semibold text-white">Create question</h1>
  </div>

  <Card className="space-y-5">
    <form class="space-y-4" onsubmit={createQuestion}>
      <input class="input-surface" name="question" placeholder="Question" required />
      <textarea class="input-surface min-h-32" name="options" placeholder="One option per line" required></textarea>
      <input class="input-surface" name="cover_image" placeholder="Cover image URL" />

      <div class="flex gap-3 text-sm text-muted">
        <label><input checked={mode === 'manual'} name="mode" type="radio" onclick={() => (mode = 'manual')} /> Manual expiry</label>
        <label><input checked={mode === 'queued'} name="mode" type="radio" onclick={() => (mode = 'queued')} /> Queue question</label>
      </div>

      {#if mode === 'manual'}
        <input class="input-surface" name="expiresAt" placeholder="YYYY-MM-DD HH:mm" required />
      {:else}
        <input class="input-surface" name="duration" placeholder="Duration in seconds" type="number" required />
        <input class="input-surface" name="queue_order" placeholder="Queue order" type="number" required />
      {/if}

      <button class="btn-accent" type="submit">Create question</button>
    </form>
  </Card>
</section>
