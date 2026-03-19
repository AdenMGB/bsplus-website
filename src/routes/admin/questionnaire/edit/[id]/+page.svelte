<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Card from '$components/ui/Card.svelte';
  import { readJson, sendJson } from '$lib/utils/admin';

  let question = $state<any>(null);

  onMount(async () => {
    question = await readJson<any>(`/api/questionnaire/${page.params.id}`);
  });

  async function saveQuestion(event: SubmitEvent) {
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
      expiresAt: data.get('expiresAt'),
      is_active: data.get('is_active') === 'on'
    };

    question = await sendJson<any>(`/api/questionnaire/${page.params.id}`, 'PUT', payload);
  }
</script>

<section class="space-y-8">
  {#if !question}
    <Card>Loading question...</Card>
  {:else}
    <div class="space-y-3">
      <div class="section-subtitle">Questionnaire</div>
      <h1 class="text-4xl font-semibold text-white">Edit question</h1>
    </div>

    <Card className="space-y-5">
      <form class="space-y-4" onsubmit={saveQuestion}>
        <input class="input-surface" name="question" value={question.question} />
        <textarea class="input-surface min-h-32" name="options">{question.options.join('\n')}</textarea>
        <input class="input-surface" name="cover_image" value={question.cover_image} />
        <input class="input-surface" name="expiresAt" value={question.expires_at_formatted} />
        <label class="flex items-center gap-3 text-sm text-muted"><input checked={question.is_active} name="is_active" type="checkbox" /> Active</label>
        <button class="btn-accent" type="submit">Save question</button>
      </form>
    </Card>
  {/if}
</section>
