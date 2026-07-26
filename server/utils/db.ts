export const getDB = (event: any): any => {
  if (event?.context?.cloudflare?.env?.DB) {
    return event.context.cloudflare.env.DB;
  }

  // Nitro scheduled tasks pass cloudflare env on the task context.
  if (event?.cloudflare?.env?.DB) {
    return event.cloudflare.env.DB;
  }

  if (event?.DB) {
    return event.DB;
  }

  const globalEnv = (globalThis as any).__env__;
  if (globalEnv?.DB) {
    return globalEnv.DB;
  }

  throw new Error('Database binding not found. Ensure you are running with Wrangler or have the binding configured.');
};
