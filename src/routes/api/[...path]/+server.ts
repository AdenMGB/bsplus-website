import type { RequestHandler } from './$types';
import { handleCompatApi } from '$lib/server/nitro-compat';

const handler: RequestHandler = async (event) => handleCompatApi(event);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
