
const urls = [
  'https://desqta.betterseqta.org/',
  'https://desqta.betterseqta.org/comparison',
  'https://desqta.betterseqta.org/download'
];

async function fetchUrls() {
  for (const url of urls) {
    try {
      console.log(`\n--- START ${url} ---`);
      const res = await fetch(url);
      const text = await res.text();
      // Print first 5000 chars to get the gist without spamming
      console.log(text); 
      console.log(`--- END ${url} ---\n`);
    } catch (e) {
      console.error(`Failed to fetch ${url}:`, e.message);
    }
  }
}

fetchUrls();

