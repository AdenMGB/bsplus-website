<script lang="ts">
  const links = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/download', label: 'Download' },
    { href: '/news', label: 'News' },
    { href: '/changelogs', label: 'Changelogs' }
  ];

  const social = [
    { href: 'https://github.com/BetterSEQTA/BetterSEQTA-Plus', label: 'GitHub' },
    { href: 'https://discord.gg/nv6YSjpEM4', label: 'Discord' }
  ];
</script>

<footer class="mt-12 px-4 pb-6 pt-10 md:mt-18">
  <div class="layout-container-wide">
    <div class="glass-card rounded-[1.75rem] px-6 py-8 md:px-8 md:py-10">
      <div class="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-5">
          <div class="eyebrow-badge">BetterSEQTA Ecosystem</div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="absolute inset-0 rounded-2xl bg-(--accent-soft) blur-lg"></div>
              <img alt="BetterSEQTA" class="relative h-12 w-12 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5" src="https://raw.githubusercontent.com/BetterSEQTA/DesQTA/refs/heads/develop/static/32x32.png" />
            </div>
            <div>
              <div class="text-xl font-semibold tracking-tight text-white">BetterSEQTA+</div>
              <div class="text-sm text-soft">SEQTA Learn, redesigned across browser and desktop</div>
            </div>
          </div>
          <p class="max-w-3xl text-sm leading-7 text-muted">
            BetterSEQTA+ and DesQTA make SEQTA Learn faster, clearer, and more customizable with stronger dark mode styling, polished downloads, curated themes, and a more capable desktop experience.
          </p>
        </div>

        <div class="grid gap-8 sm:grid-cols-2">
          <div class="space-y-4">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Navigation</div>
            <div class="flex flex-col gap-3 text-sm">
              {#each links as link}
                <a class="nav-link" href={link.href}>{link.label}</a>
              {/each}
            </div>
          </div>
          <div class="space-y-4">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Community</div>
            <div class="flex flex-col gap-3 text-sm">
              {#each social as link}
                <a class="nav-link" href={link.href} rel="noreferrer" target="_blank">{link.label}</a>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3 border-t border-white/8 pt-5 text-xs text-soft md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} BetterSEQTA+. Licensed under MIT.</p>
        <p>Built for Cloudflare Workers with SvelteKit.</p>
      </div>
    </div>
  </div>
</footer>
