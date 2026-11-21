/** Builds consent sentences whose {privacy} and {terms} placeholders become links to the legal pages. */

import { escapeHtml } from './helpers';
import { t, type TranslationKey } from './i18n';

export const CONTACT_EMAIL = 'albaraaharthi@gmail.com';

const PRIVACY_TOKEN = '@@privacy@@';
const TERMS_TOKEN = '@@terms@@';

function link(href: string, label: string): string {
  return `<a href="${href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
}

/** Trusted HTML: the sentence is escaped, then only the two links are inserted. */
export function legalHtml(key: TranslationKey): string {
  return escapeHtml(t(key, { privacy: PRIVACY_TOKEN, terms: TERMS_TOKEN }))
    .replace(PRIVACY_TOKEN, link('./privacy.html', t('legal.privacyLink')))
    .replace(TERMS_TOKEN, link('./terms.html', t('legal.termsLink')));
}
