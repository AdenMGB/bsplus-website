export interface GithubReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface GithubRelease {
  tag_name: string;
  body?: string;
  html_url?: string;
  prerelease?: boolean;
  published_at?: string;
  assets?: GithubReleaseAsset[];
}

export async function fetchLatestRelease(repo: string) {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=1`, {
    headers: {
      'User-Agent': 'betterseqta-sveltekit'
    }
  });

  if (!response.ok) {
    return null;
  }

  const releases = (await response.json()) as GithubRelease[];
  return releases[0] ?? null;
}
