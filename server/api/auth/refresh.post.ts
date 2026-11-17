import { refreshSession } from '../../utils/refreshSession';

export default defineEventHandler(async (event): Promise<{ access_token: string; expires_in?: number; token_type?: string }> => {
  const { access_token, expires_in, token_type } = await refreshSession(event);
  return { access_token, expires_in, token_type };
});
