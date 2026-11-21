/**
 * Script for the standalone legal pages (privacy.html, terms.html).
 *
 * Both languages are in the markup. This shows the one matching the reader's
 * saved choice (the same storage keys the app uses), falling back to the
 * browser language, and applies the saved theme.
 */

import { detectLocale, parseLocale, type Locale } from './utils/i18n';

const LOCALE_KEY = 'devquiz-lang';
const THEME_KEY = 'devquiz-theme';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function apply(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll<HTMLElement>('[data-legal-lang]').forEach((article) => {
    article.hidden = article.dataset.legalLang !== locale;
  });
  const button = document.getElementById('legalLanguageBtn');
  if (button) {
    // Like the app's header: the button names the other language, in that language.
    button.textContent = locale === 'ar' ? 'English' : 'العربية';
    button.lang = locale === 'ar' ? 'en' : 'ar';
  }
}

let locale: Locale = parseLocale(read(LOCALE_KEY)) ?? detectLocale(navigator.languages ?? [navigator.language]);
if (read(THEME_KEY) === 'light') document.documentElement.setAttribute('data-theme', 'light');
apply(locale);

document.getElementById('legalLanguageBtn')?.addEventListener('click', () => {
  locale = locale === 'ar' ? 'en' : 'ar';
  apply(locale);
  try {
    window.localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
});
