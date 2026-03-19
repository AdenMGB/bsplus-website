<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'accent' | 'ghost';
    className?: string;
    disabled?: boolean;
    children?: Snippet;
  }

  let {
    href,
    type = 'button',
    variant = 'accent',
    className = '',
    disabled = false,
    children
  }: Props = $props();

  const classes = $derived(`${variant === 'accent' ? 'btn-accent' : 'btn-ghost'} ${className}`.trim());
</script>

{#if href}
  <a class={classes} href={href} aria-disabled={disabled}>
    {@render children?.()}
  </a>
{:else}
  <button class={classes} {type} {disabled}>
    {@render children?.()}
  </button>
{/if}
