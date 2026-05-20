# BetterSEQTA+ Website

We have a website. It's at https://betterseqta.org. Feel free to re-use this website, as long as you follow the license.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_GROQ_API_KEY` | For TOTM AI copy | Groq API key for Theme of the Month title/description generation in admin (`GROQ_API_KEY` also accepted) |
| `NUXT_GROQ_MODEL` | No | Groq vision model (default: `meta-llama/llama-4-scout-17b-16e-instruct`) |
| `NUXT_GROQ_TOTM_MAX_IMAGES` | No | Max preview images sent per generation (default: `5`) |

On Cloudflare: `npx wrangler secret put NUXT_GROQ_API_KEY`
