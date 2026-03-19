<script lang="ts">
  import Card from '$components/ui/Card.svelte';
  import { comparisonRows } from '$lib/content/site';

  const renderValue = (value: boolean | 'partial') => {
    if (value === true) return 'Yes';
    if (value === 'partial') return 'Partial';
    return 'No';
  };

  const tone = (value: boolean | 'partial') => {
    if (value === true) return 'text-emerald-300';
    if (value === 'partial') return 'text-amber-300';
    return 'text-slate-400';
  };
</script>

<section class="space-y-10 pb-14 pt-6">
  <div class="max-w-4xl space-y-4">
    <div class="section-subtitle">Compare editions</div>
    <h1 class="section-title">Choose the BetterSEQTA setup that matches how you study.</h1>
    <p class="text-lg text-muted">
      BetterSEQTA+ is the quick browser upgrade. DesQTA is the full desktop experience. Both are built
      to be a clear step up from stock SEQTA Learn.
    </p>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card>
      <h2 class="text-2xl font-semibold text-white">Vanilla SEQTA</h2>
      <ul class="mt-4 space-y-3 text-muted">
        <li>Basic interface and fixed layout</li>
        <li>Limited customization</li>
        <li>No polished dark mode</li>
        <li>No live wallpapers or enhanced organization</li>
      </ul>
    </Card>

    <Card>
      <h2 class="text-2xl font-semibold text-white">BetterSEQTA ecosystem</h2>
      <ul class="mt-4 space-y-3 text-muted">
        <li>Beautiful themes and dark surfaces</li>
        <li>Live wallpapers and custom styling</li>
        <li>Desktop-native workflow through DesQTA</li>
        <li>Ongoing feature development for admin and student tools</li>
      </ul>
    </Card>
  </div>

  <Card className="overflow-hidden p-0">
    <div class="overflow-x-auto">
      <table class="surface-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th class="text-center">BetterSEQTA+</th>
            <th class="text-center">DesQTA</th>
            <th class="text-center">Vanilla SEQTA</th>
          </tr>
        </thead>
        <tbody>
          {#each comparisonRows as row}
            <tr>
              <td class="font-medium text-white">{row[0]}</td>
              <td class={`text-center ${tone(row[1])}`}>{renderValue(row[1])}</td>
              <td class={`text-center ${tone(row[2])}`}>{renderValue(row[2])}</td>
              <td class={`text-center ${tone(row[3])}`}>{renderValue(row[3])}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card>
</section>
