<svelte:options runes={true} />

<script lang="ts">
  import type { LayoutProps } from './$types';
  import type { SeoData } from '$lib/seo/types';
  import { page } from '$app/state';
  import '../app.css';
  import SiteHeader from '$components/layout/SiteHeader.svelte';
  import SiteFooter from '$components/layout/SiteFooter.svelte';

  let { data, children }: LayoutProps = $props();

  const layoutSeo = $derived((data.seo as SeoData | undefined) ?? undefined);
  const pageSeo = $derived((page.data.seo as SeoData | undefined) ?? undefined);

  const seo = $derived({
    title: pageSeo?.title ?? layoutSeo?.title ?? 'BetterSEQTA+',
    description:
      pageSeo?.description ??
      layoutSeo?.description ??
      'BetterSEQTA+ and DesQTA enhance SEQTA Learn with themes, wallpapers, analytics, and a full desktop experience.',
    canonical: pageSeo?.canonical ?? layoutSeo?.canonical ?? `https://betterseqta.org${page.url.pathname}`,
    image: pageSeo?.image ?? layoutSeo?.image ?? 'https://betterseqta.org/favicon-96x96.png',
    noindex: pageSeo?.noindex ?? layoutSeo?.noindex ?? false
  });
  const jsonLd = $derived(pageSeo?.jsonLd ?? layoutSeo?.jsonLd ?? null);
</script>

<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <link rel="canonical" href={seo.canonical} />
  <meta name="robots" content={seo.noindex ? 'noindex, nofollow' : 'index, follow'} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={seo.canonical} />
  <meta property="og:image" content={seo.image} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="BetterSEQTA+" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content={seo.image} />
  {#if jsonLd}
    <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
  {/if}
</svelte:head>

<div class="page-shell">
  <SiteHeader user={data.user} />
  <main class="layout-container-wide px-4 py-8 md:py-12">
    {@render children()}
  </main>
  <SiteFooter />
</div>
