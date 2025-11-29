export const getBucket = (event: any): any => {
  if (event.context.cloudflare && event.context.cloudflare.env) {
    return event.context.cloudflare.env.BUCKET;
  }
  throw new Error('R2 Bucket binding not found. Ensure you are running with Wrangler or have the binding configured.');
};
