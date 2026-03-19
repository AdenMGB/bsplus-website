<svelte:options runes={true} />

<script lang="ts">
  import type { PageProps } from './$types';
  import { Icon, ArrowDownTray, ArrowRight, Sparkles, Swatch, Moon } from 'svelte-hero-icons';
  import Button from '$components/ui/Button.svelte';
  import Card from '$components/ui/Card.svelte';
  import { featureCards } from '$lib/content/site';

  let { data }: PageProps = $props();

  const bsPlusVersion = $derived(data.bsPlusRelease?.tag_name?.replace('betterseqtaplus@', 'v'));
  const desqtaVersion = $derived(data.desqtaRelease?.tag_name);
  const releaseHighlights = $derived([
    {
      label: 'Browser extension',
      title: 'BetterSEQTA+',
      accent: 'text-white',
      description: 'Themes, wallpapers, and a much cleaner SEQTA experience directly in your browser.',
      version: bsPlusVersion ?? 'Available now',
      href: '/download',
      secondary: '/comparison'
    },
    {
      label: 'Desktop app',
      title: 'DesQTA',
      accent: 'text-sky-300',
      description: 'A wider desktop workspace with native installs, stronger structure, and deeper platform integration.',
      version: desqtaVersion ?? 'Latest release available',
      href: '/desqta',
      secondary: '/download'
    }
  ]);
</script>

<section class="space-y-10 pb-10 pt-6 md:space-y-14 md:pt-10">
  <div class="hero-panel px-6 py-8 md:px-8 md:py-10 xl:px-12 xl:py-12">
    <div class="hero-grid items-start">
      <div class="space-y-7">
        <div class="eyebrow-badge">SEQTA Learn Enhanced</div>
        <div class="space-y-5">
          <h1 class="section-title max-w-5xl">
            BetterSEQTA+ and DesQTA make SEQTA feel polished, modern, and actually enjoyable to use.
          </h1>
          <p class="hero-kicker">
            The same routes and workflows you already know, rebuilt with stronger dark mode styling,
            better hierarchy, custom themes, live wallpapers, and a wider desktop experience that feels like a real product.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button href="/download">
            <Icon class="h-5 w-5" src={ArrowDownTray} />
            Download now
          </Button>
          <Button href="/comparison" variant="ghost">
            Compare editions
            <Icon class="h-5 w-5" src={ArrowRight} />
          </Button>
        </div>
        <div class="stat-grid">
          <div class="metric-card">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Latest extension</div>
            <div class="mt-3 text-2xl font-semibold text-white">{bsPlusVersion ?? 'Available now'}</div>
            <div class="mt-1 text-sm text-muted">BetterSEQTA+ browser release</div>
          </div>
          <div class="metric-card">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Latest desktop</div>
            <div class="mt-3 text-2xl font-semibold text-white">{desqtaVersion ?? 'Available now'}</div>
            <div class="mt-1 text-sm text-muted">DesQTA app release</div>
          </div>
          <div class="metric-card">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Deployment stack</div>
            <div class="mt-3 text-2xl font-semibold text-white">Cloudflare-native</div>
            <div class="mt-1 text-sm text-muted">Workers, D1, R2, and SvelteKit</div>
          </div>
        </div>
      </div>

      <div class="grid gap-5">
        {#each releaseHighlights as item (item.title)}
          <div class="section-panel min-h-60">
            <div class="flex h-full flex-col justify-between gap-5">
              <div class="space-y-4">
                <div class="section-subtitle">{item.label}</div>
                <div>
                  <h2 class={`text-3xl font-semibold tracking-tight ${item.accent}`}>{item.title}</h2>
                  <div class="mt-2 text-sm font-medium text-soft">{item.version}</div>
                </div>
                <p class="text-base leading-7 text-muted">{item.description}</p>
              </div>
              <div class="flex flex-wrap gap-3">
                <Button href={item.href}>Open</Button>
                <Button href={item.secondary} variant="ghost">Learn more</Button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <section class="space-y-8">
    <div class="max-w-4xl space-y-4">
      <div class="section-subtitle">Designed to feel better</div>
      <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">
        Pulling the best parts of the old look forward, then pushing them a lot further.
      </h2>
      <p class="text-lg leading-8 text-muted">
        The original visual style had the right ingredients: soft glass cards, heavy dark surfaces, bright call-to-actions, and subtle ambient glows.
        This new pass doubles down on those ideas with better spacing, stronger contrast, and clearer product separation.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      {#each featureCards as card, index (card.title)}
        <Card className="space-y-5 p-7 md:p-8">
          <div class="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/8 bg-white/5 text-white shadow-xl">
            {#if index === 0}
              <Icon class="h-6 w-6" src={Swatch} />
            {:else if index === 1}
              <Icon class="h-6 w-6" src={Moon} />
            {:else}
              <Icon class="h-6 w-6" src={Sparkles} />
            {/if}
          </div>
          <h3 class="text-2xl font-semibold tracking-tight text-white">{card.title}</h3>
          <p class="text-base leading-7 text-muted">{card.description}</p>
        </Card>
      {/each}
    </div>
  </section>

  <section class="split-callout">
    <Card className="space-y-4 p-7 md:p-8" hover={false}>
      <div class="section-subtitle">BetterSEQTA+</div>
      <h3 class="text-2xl font-semibold text-white">The fastest upgrade path</h3>
      <ul class="feature-list text-sm">
        <li>Install once and immediately get a more personal, more readable SEQTA experience.</li>
        <li>Perfect for students who want themes, wallpapers, and faster day-to-day browsing.</li>
        <li>Available across major browsers with a lightweight install flow.</li>
      </ul>
    </Card>

    <Card className="space-y-4 p-7 md:p-8" hover={false}>
      <div class="section-subtitle">DesQTA</div>
      <h3 class="text-2xl font-semibold text-white">The full desktop workspace</h3>
      <ul class="feature-list text-sm">
        <li>Native installs, broader layout space, and room for bigger productivity features.</li>
        <li>Built for a more serious desktop workflow without losing the BetterSEQTA identity.</li>
        <li>Ideal if you want the most capable version of the ecosystem.</li>
      </ul>
    </Card>
  </section>

  <section class="pb-8 pt-2 md:pb-14">
    <div class="hero-panel px-6 py-8 md:px-8 md:py-10">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div class="max-w-3xl space-y-4">
          <div class="section-subtitle">Ready to switch?</div>
          <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Start with the extension, go all-in with desktop, or compare both side by side.
          </h2>
          <p class="text-lg leading-8 text-muted">
            However you want to use BetterSEQTA, the goal stays the same: cleaner interface, better dark mode, and a much more intentional product experience.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <Button href="/download">Download</Button>
          <Button href="/desqta" variant="ghost">Explore DesQTA</Button>
        </div>
      </div>
    </div>
  </section>
</section>
