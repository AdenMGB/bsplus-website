export function getCloudflareBinding(event: any, bindingName: string): any {
  if (event?.context?.cloudflare?.env?.[bindingName]) {
    return event.context.cloudflare.env[bindingName];
  }

  if (event?.cloudflare?.env?.[bindingName]) {
    return event.cloudflare.env[bindingName];
  }

  if (event?.[bindingName]) {
    return event[bindingName];
  }

  const globalEnv = (globalThis as any).__env__;
  if (globalEnv?.[bindingName]) {
    return globalEnv[bindingName];
  }

  throw new Error(
    `Database binding "${bindingName}" not found. Ensure you are running with Wrangler or have the binding configured.`
  );
}

export const getDB = (event: any): any => getCloudflareBinding(event, 'DB');
