<svelte:options runes={true} />

<script lang="ts">
  import Card from '$components/ui/Card.svelte';

  let status = $state('');
  let submitting = $state(false);

  async function uploadTheme(event: SubmitEvent) {
    event.preventDefault();
    submitting = true;
    status = '';

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/admin/themes', {
        method: 'POST',
        body: formData
      });
      const result = (await response.json()) as any;
      status = result.success ? `Uploaded ${result.data.theme.name}` : result.error?.message ?? 'Upload failed';
      if (result.success) {
        form.reset();
      }
    } catch (err) {
      status = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      submitting = false;
    }
  }

  async function previewTheme(event: SubmitEvent) {
    event.preventDefault();
    status = '';
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const response = await fetch('/api/admin/themes/manifest-preview', {
      method: 'POST',
      body: formData
    });
    const result = (await response.json()) as any;
    status = JSON.stringify(result, null, 2);
  }
</script>

<section class="space-y-8">
  <div class="space-y-3">
    <div class="section-subtitle">Theme upload</div>
    <h1 class="text-4xl font-semibold text-white">Upload a marketplace theme</h1>
  </div>

  <div class="grid gap-6 xl:grid-cols-2">
    <Card className="space-y-5">
      <h2 class="text-2xl font-semibold text-white">Publish to marketplace</h2>
      <form class="space-y-4" onsubmit={uploadTheme}>
        <input class="input-surface" name="theme_zip" type="file" required />
        <button class="btn-accent" type="submit" disabled={submitting}>{submitting ? 'Uploading...' : 'Upload theme'}</button>
      </form>
    </Card>

    <Card className="space-y-5">
      <h2 class="text-2xl font-semibold text-white">Preview manifest</h2>
      <form class="space-y-4" onsubmit={previewTheme}>
        <input class="input-surface" name="theme_zip" type="file" required />
        <button class="btn-ghost" type="submit">Preview validation</button>
      </form>
    </Card>
  </div>

  {#if status}
    <Card className="space-y-4">
      <h2 class="text-xl font-semibold text-white">Result</h2>
      <pre class="overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm text-muted">{status}</pre>
    </Card>
  {/if}
</section>
