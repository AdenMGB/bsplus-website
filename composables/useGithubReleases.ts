export function useGithubReleases() {
  const BSPlusRelease = ref<Record<string, unknown> | null>(null);
  const desqtaRelease = ref<Record<string, unknown> | null>(null);

  const BSPlusVersion = computed(() => {
    const tag = BSPlusRelease.value?.tag_name;
    if (typeof tag !== "string") return null;
    return tag.replace("betterseqtaplus@", "v");
  });

  const desqtaVersion = computed(() => {
    const tag = desqtaRelease.value?.tag_name;
    return typeof tag === "string" ? tag : null;
  });

  async function fetchReleases() {
    try {
      const r = await fetch(
        "https://api.github.com/repos/betterseqta/betterseqta-plus/releases?per_page=1"
      );
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) {
        BSPlusRelease.value = data[0];
      }
    } catch (e) {
      console.error("Error fetching BetterSEQTA+ release:", e);
    }

    try {
      const r = await fetch(
        "https://api.github.com/repos/betterseqta/desqta/releases?per_page=1"
      );
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) {
        desqtaRelease.value = data[0];
      }
    } catch (e) {
      console.error("Error fetching DesQTA release:", e);
    }
  }

  return {
    BSPlusRelease,
    desqtaRelease,
    BSPlusVersion,
    desqtaVersion,
    fetchReleases,
  };
}
