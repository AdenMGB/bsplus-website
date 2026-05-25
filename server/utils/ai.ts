export const getAI = (event: any): Ai => {
  if (event.context.cloudflare?.env) {
    const ai = event.context.cloudflare.env['bs-ai'];
    if (ai) return ai;
  }

  throw new Error('Workers AI binding not found. Ensure the bs-ai binding is configured in wrangler.toml.');
};
