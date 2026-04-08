/**
 * Reactive prefers-reduced-motion for client-side animation gating.
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(
    import.meta.client && typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  onMounted(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.value = mql.matches;
    const handler = () => {
      prefersReducedMotion.value = mql.matches;
    };
    mql.addEventListener("change", handler);
    onUnmounted(() => mql.removeEventListener("change", handler));
  });

  return { prefersReducedMotion };
}
