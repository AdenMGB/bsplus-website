export const getDB = (event: any): any => {
  if (event.context.cloudflare && event.context.cloudflare.env) {
    return event.context.cloudflare.env.DB;
  }
  
  throw new Error('Database binding not found. Ensure you are running with Wrangler or have the binding configured.');
};
