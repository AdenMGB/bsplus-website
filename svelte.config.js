import adapter from '@sveltejs/adapter-cloudflare';

const config = {
  kit: {
    adapter: adapter({
      config: 'wrangler.toml'
    }),
    files: {
      assets: 'public'
    },
    alias: {
      $components: 'src/lib/components',
      $lib: 'src/lib'
    }
  }
};

export default config;
