<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$components/ui/Card.svelte';
  import { readJson } from '$lib/utils/admin';

  let questions = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    questions = await readJson<any[]>('/api/questionnaire');
    loading = false;
  });

  async function deleteQuestion(id: string) {
    if (!confirm('Delete this question?')) return;
    await fetch(`/api/questionnaire/${id}`, { method: 'DELETE' });
    questions = questions.filter((question) => question.id !== id);
  }
</script>

<section class="space-y-8">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div class="space-y-3">
      <div class="section-subtitle">Questionnaire</div>
      <h1 class="text-4xl font-semibold text-white">Daily questions</h1>
    </div>
    <a class="btn-accent" href="/admin/questionnaire/create">Create question</a>
  </div>

  {#if loading}
    <Card>Loading questions...</Card>
  {:else}
    <div class="space-y-4">
      {#each questions as question (question.id)}
        <Card className="space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-white">{question.question}</h2>
              <div class="mt-2 text-sm text-soft">{question.is_active ? 'Active' : 'Queued'} · {question.total_votes} votes</div>
            </div>
            <div class="flex flex-wrap gap-3">
              <a class="btn-ghost" href={`/admin/questionnaire/edit/${question.id}`}>Edit</a>
              <button class="btn-ghost" type="button" onclick={() => deleteQuestion(question.id)}>Delete</button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</section>
