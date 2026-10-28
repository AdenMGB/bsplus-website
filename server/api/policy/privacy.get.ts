import { handlePrivacyApiRequest } from '../../utils/privacy-api-handler';

/** @deprecated Prefer GET /api/privacy (extension contract). */
export default defineEventHandler((event) => handlePrivacyApiRequest(event));
