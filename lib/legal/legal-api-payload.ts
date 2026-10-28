import {
  PRIVACY_LAST_UPDATED,
  PRIVACY_MARKDOWN,
} from './privacy-document';
import {
  TERMS_LAST_UPDATED,
  TERMS_MARKDOWN,
} from './terms-document';
import { renderLegalHtmlForApi } from './render-legal-html';

export type LegalApiPayload = {
  last_updated: string;
  whatsnew_html: string;
};

export function getPrivacyApiPayload(): LegalApiPayload {
  return {
    last_updated: PRIVACY_LAST_UPDATED,
    whatsnew_html: renderLegalHtmlForApi(PRIVACY_MARKDOWN),
  };
}

export function getTermsApiPayload(): LegalApiPayload {
  return {
    last_updated: TERMS_LAST_UPDATED,
    whatsnew_html: renderLegalHtmlForApi(TERMS_MARKDOWN),
  };
}
