import type { Handle } from '@sveltejs/kit';
import { getUserFromRequest } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = await getUserFromRequest(event);
  return resolve(event);
};
