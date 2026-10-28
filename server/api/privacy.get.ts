import { handlePrivacyApiRequest } from '../utils/privacy-api-handler';

export default defineEventHandler((event) => handlePrivacyApiRequest(event));
