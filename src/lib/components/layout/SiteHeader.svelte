<svelte:options runes={true} />

<script lang="ts">
  import { page } from '$app/state';
  import { Icon, Bars3, XMark, ArrowLeftOnRectangle, ArrowRightOnRectangle } from 'svelte-hero-icons';
  import Button from '$components/ui/Button.svelte';
  import type { UserInfo } from '$lib/server/auth';

  interface Props {
    user?: UserInfo | null;
  }

  let { user = null }: Props = $props();
  let mobileOpen = $state(false);

  const routes = [
    { href: '/', label: 'Home' },
    { href: '/desqta', label: 'DesQTA' },
    { href: '/comparison', label: 'Comparison' },
    { href: '/download', label: 'Download' },
    { href: '/news', label: 'News' },
    { href: '/changelogs', label: 'Changelogs' },
    { href: '/privacy', label: 'Privacy' }
  ];

  const isActive = (href: string) => {
    if (href === '/') return page.url.pathname === href;
    return page.url.pathname.startsWith(href);
  };
</script>

<header class="sticky top-0 z-50 px-3 pt-3 md:px-4">
  <div class="layout-container-wide glass-panel rounded-[1.35rem] border-white/8">
    <div class="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
      <a class="flex items-center gap-3 text-white" href="/">
        <div class="relative">
          <div class="absolute inset-0 rounded-2xl bg-(--accent-soft) blur-lg"></div>
          <img alt="BetterSEQTA" class="relative h-11 w-11 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5 shadow-2xl" src="https://raw.githubusercontent.com/BetterSEQTA/DesQTA/refs/heads/develop/static/32x32.png" />
        </div>
        <div>
          <div class="text-[0.95rem] font-semibold tracking-tight text-white">BetterSEQTA+</div>
          <div class="text-xs text-soft">Themes, downloads, news, and desktop tools</div>
        </div>
      </a>

      <nav class="hidden items-center gap-1 lg:flex">
        {#each routes as route (route.href)}
          <a
            class="nav-link nav-pill"
            href={route.href}
            aria-current={isActive(route.href) ? 'page' : undefined}
          >
            {route.label}
          </a>
        {/each}
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        {#if user}
          <a class="nav-link inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/3 px-3 py-2 text-sm" href="https://accounts.betterseqta.org" rel="noreferrer" target="_blank">
            <img alt={user.username} class="h-8 w-8 rounded-full border border-white/10 object-cover shadow-lg" src={user.pfpUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? user.username)}`} />
            <span class="max-w-40 truncate">{user.displayName ?? user.username}</span>
          </a>
          {#if user.admin_level && user.admin_level >= 1}
            <Button href="/admin" variant="ghost" className="text-sm">Admin</Button>
          {/if}
          <form action="/api/auth/logout" method="POST">
            <button class="btn-ghost text-sm" type="submit">
              <Icon class="h-5 w-5" src={ArrowLeftOnRectangle} />
              Logout
            </button>
          </form>
        {:else}
          <Button href="/api/auth/login" className="text-sm">
            <Icon class="h-5 w-5" src={ArrowRightOnRectangle} />
            Login
          </Button>
        {/if}
      </div>

      <button
        class="btn-ghost lg:hidden"
        type="button"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onclick={() => (mobileOpen = !mobileOpen)}
      >
        {#if mobileOpen}
          <Icon class="h-5 w-5" src={XMark} />
        {:else}
          <Icon class="h-5 w-5" src={Bars3} />
        {/if}
      </button>
    </div>

    {#if mobileOpen}
      <div class="border-t border-white/8 px-4 py-4 lg:hidden md:px-5">
        <div class="flex flex-col gap-3">
          {#each routes as route (route.href)}
            <a
              class="nav-link rounded-2xl border border-transparent px-4 py-3 text-base hover:border-white/8 hover:bg-white/5"
              href={route.href}
              aria-current={isActive(route.href) ? 'page' : undefined}
            >
              {route.label}
            </a>
          {/each}

          {#if user?.admin_level && user.admin_level >= 1}
            <a class="nav-link rounded-2xl px-4 py-3 text-base hover:bg-white/5" href="/admin">Admin</a>
          {/if}

          <div class="mt-2 flex flex-wrap gap-3">
            {#if user}
              <a class="btn-ghost" href="https://accounts.betterseqta.org" rel="noreferrer" target="_blank">Account</a>
              <form action="/api/auth/logout" method="POST">
                <button class="btn-ghost" type="submit">Logout</button>
              </form>
            {:else}
              <a class="btn-accent" href="/api/auth/login">Login</a>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</header>
