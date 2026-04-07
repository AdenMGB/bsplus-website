import { defineEventHandler, getMethod, setResponseStatus } from 'h3';
import { isApiRequestPath, setApiCorsHeaders } from '../utils/cors';

export default defineEventHandler((event) => {
  if (!isApiRequestPath(event)) {
    return;
  }

  if (getMethod(event) === 'OPTIONS') {
    setApiCorsHeaders(event, { preflight: true });
    setResponseStatus(event, 204);
    return '';
  }

  setApiCorsHeaders(event, { preflight: false });
});
