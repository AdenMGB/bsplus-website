<svelte:options runes={true} />

<script lang="ts">
  import type { LayoutProps } from './$types';
  import { page } from '$app/state';

  let { children }: LayoutProps = $props();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/themes', label: 'Themes' },
    { href: '/admin/collections', label: 'Collections' },
    { href: '/admin/questionnaire', label: 'Questionnaire' },
    { href: '/admin/news', label: 'News' }
  ];

  const active = (href: string) => (href === '/admin' ? page.url.pathname === href : page.url.pathname.startsWith(href));
</script>

<div class="admin-shell">
  <aside class="admin-sidebar">
    <div class="glass-card h-fit p-5 md:p-6">
      <div class="space-y-4">
        <div class="eyebrow-badge">Admin</div>
        <div>
          <div class="text-2xl font-semibold tracking-tight text-white">Control center</div>
          <p class="mt-2 text-sm leading-7 text-muted">
            Manage analytics, marketplace items, questionnaires, and content from one place.
          </p>
        </div>
      </div>

      <nav class="mt-6 space-y-2">
        {#each links as link (link.href)}
          <a
            class={`block rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
              active(link.href)
                ? 'border-white/10 bg-white/8 text-white accent-ring'
                : 'border-transparent text-muted hover:border-white/8 hover:bg-white/5 hover:text-white'
            }`}
            href={link.href}
          >
            {link.label}
          </a>
        {/each}
      </nav>
    </div>
  </aside>

  <section class="min-w-0">
    {@render children()}
  </section>
</div>
