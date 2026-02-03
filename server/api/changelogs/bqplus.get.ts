export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const perPage = Number(query.per_page) || 10;

  try {
    const response = await fetch(
      `https://api.github.com/repos/betterseqta/betterseqta-plus/releases?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BetterSEQTA-Website'
        }
      }
    );

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `GitHub API error: ${response.statusText}`
      });
    }

    const releases = await response.json();
    
    // Transform releases to include formatted data
    return releases.map((release: any) => ({
      id: release.id,
      tag_name: release.tag_name,
      name: release.name,
      body: release.body,
      published_at: release.published_at,
      html_url: release.html_url,
      author: release.author?.login || 'Unknown',
      draft: release.draft,
      prerelease: release.prerelease
    }));
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch releases'
    });
  }
});
