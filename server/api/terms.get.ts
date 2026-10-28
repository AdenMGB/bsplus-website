import { getTermsApiPayload } from '../../lib/legal/legal-api-payload';
import { handleLegalApiRequest } from '../utils/legal-api-handler';

export default defineEventHandler((event) =>
  handleLegalApiRequest(event, getTermsApiPayload()),
);
