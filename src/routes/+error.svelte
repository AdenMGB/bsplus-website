<svelte:options runes={true} />

<script lang="ts">
  import Button from '$components/ui/Button.svelte';

  let { error, status } = $props<{ error: App.Error; status: number }>();
</script>

<div class="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
  <div class="glass-card w-full space-y-6 p-8 text-center md:p-12">
    <div class="section-subtitle">Something went wrong</div>
    <h1 class="section-title">{status}</h1>
    <p class="mx-auto max-w-2xl text-base text-muted">
      {error?.message ?? 'The page could not be rendered.'}
    </p>
    <div class="flex flex-wrap justify-center gap-3">
      <Button href="/">Back home</Button>
      <Button href="/download" variant="ghost">Go to downloads</Button>
    </div>
  </div>
</div>
