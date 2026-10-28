import { getPrivacyApiPayload } from '../../../lib/legal/legal-api-payload';
import { handleLegalApiRequest } from '../../utils/legal-api-handler';

/** @deprecated Prefer GET /api/privacy. */
export default defineEventHandler((event) =>
  handleLegalApiRequest(event, getPrivacyApiPayload()),
);
