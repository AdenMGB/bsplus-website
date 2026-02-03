import { getBucket } from '../utils/r2';

export default defineEventHandler(async (event) => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' });
  }

  const file = formData[0];
  if (!file.filename || !file.type?.startsWith('image/')) {
    throw createError({ statusCode: 400, message: 'Invalid file type' });
  }

  const bucket = getBucket(event);
  const key = `${Date.now()}-${file.filename}`;

  await bucket.put(key, file.data, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // Construct URL (Assuming R2 is connected to a custom domain or public bucket)
  // For Cloudflare Pages, you might need to proxy this or use a public URL if configured
  // Here we assume a public access domain is set up or we return a relative path if proxied
  // If you don't have a custom domain, you might need an endpoint to serve the image.
  // For now, let's assume a custom domain is mapped to the bucket or we return the key to be served via a proxy.
  
  // NOTE: You must configure a public domain for your R2 bucket in Cloudflare dashboard
  // Or implement a GET endpoint to serve files.
  // We'll return a hypothetical public URL. Replace 'YOUR_R2_PUBLIC_DOMAIN' in production env.
  
  // If using local dev, this won't work without a proxy. 
  // Let's assume we serve via an API endpoint for simplicity without custom domains first.
  
  return { 
    url: `/api/images/${key}`,
    key: key 
  };
});

