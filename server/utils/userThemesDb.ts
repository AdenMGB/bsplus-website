export const getUserThemesDB = (event: any): any => {
  if (event?.context?.cloudflare?.env?.USER_THEMES_DB) {
    return event.context.cloudflare.env.USER_THEMES_DB;
  }

  if (event?.cloudflare?.env?.USER_THEMES_DB) {
    return event.cloudflare.env.USER_THEMES_DB;
  }

  if (event?.USER_THEMES_DB) {
    return event.USER_THEMES_DB;
  }

  const globalEnv = (globalThis as any).__env__;
  if (globalEnv?.USER_THEMES_DB) {
    return globalEnv.USER_THEMES_DB;
  }

  throw new Error(
    'USER_THEMES_DB binding not found. Ensure you are running with Wrangler or have the binding configured.'
  );
};
