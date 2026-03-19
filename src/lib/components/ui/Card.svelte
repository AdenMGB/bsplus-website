<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    className?: string;
    hover?: boolean;
    children?: Snippet;
  }

  let { className = '', hover = true, children }: Props = $props();
  const classes = $derived(`glass-card p-6 md:p-8 ${hover ? 'hover:-translate-y-1 hover:scale-[1.015]' : ''} transition-all duration-200 ${className}`.trim());
</script>

<div class={classes}>
  {@render children?.()}
</div>
