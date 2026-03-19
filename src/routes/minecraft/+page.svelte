<script lang="ts">
  import Card from '$components/ui/Card.svelte';
  import Button from '$components/ui/Button.svelte';
</script>

<section class="space-y-10 pb-14 pt-6">
  <Card className="relative overflow-hidden p-0">
    <video
      class="h-[32rem] w-full object-cover opacity-45"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
    >
      <source src="https://github.com/AdenMGB/bsplus-website/raw/refs/heads/main/public/images/2025_06_06_12_32_38.mp4" type="video/mp4" />
    </video>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>
    <div class="absolute inset-x-0 bottom-0 p-8 md:p-10">
      <div class="section-subtitle">Community server</div>
      <h1 class="section-title max-w-3xl">BetterSEQTA Plus Minecraft Server</h1>
      <p class="mt-4 max-w-2xl text-lg text-muted">Join the community in Minecraft at <span class="font-semibold text-white">mc.betterseqta.org</span>.</p>
    </div>
  </Card>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card className="space-y-4">
      <h2 class="text-2xl font-semibold text-white">Server features</h2>
      <ul class="space-y-3 text-muted">
        <li>SMP survival multiplayer as the first release mode.</li>
        <li>Community events, competitions, and custom world generation.</li>
        <li>Regular updates and live events as the world expands.</li>
        <li>The End dimension is planned for a future live event unlock.</li>
      </ul>
    </Card>

    <Card className="space-y-4">
      <h2 class="text-2xl font-semibold text-white">Join now</h2>
      <p class="text-muted">
        The Minecraft server is tied into the BetterSEQTA community, so Discord is the best place to track events and announcements.
      </p>
      <div class="flex flex-wrap gap-3">
        <Button href="https://discord.gg/nv6YSjpEM4">Join Discord</Button>
      </div>
    </Card>
  </div>

  <Card className="space-y-5">
    <h2 class="text-2xl font-semibold text-white">Quickshop Hikari quick guide</h2>
    <p class="text-muted">A short video guide for the server shop system.</p>
    <video class="w-full rounded-2xl border border-white/8" controls preload="metadata">
      <source src="https://raw.githubusercontent.com/AdenMGB/bsplus-website/refs/heads/main/public/images/2025-06-09%2009-51-43.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </Card>
</section>
