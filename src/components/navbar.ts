/** Header: language switch, theme toggle, account button and cloud-sync status. */

import type { SyncStatus } from '../types';
import { signOutUser } from '../services/auth';
import { setLocale } from '../services/preferences';
import { retrySync } from '../services/sync';
import { byId } from '../utils/dom';
import { guarded } from '../utils/errors';
import { escapeHtml, initialOf, shortName } from '../utils/helpers';
import { t, type TranslationKey } from '../utils/i18n';
import { state, store } from '../utils/state';
import { toggleTheme } from '../utils/theme';
import { openAuthModal } from './authModal';
import { showDialog } from './modal';
import { toast } from './toast';

const STATUS_LABEL: Record<SyncStatus, TranslationKey> = {
  disabled: 'status.guest',
  guest: 'status.guest',
  syncing: 'status.syncing',
  synced: 'status.synced',
  offline: 'status.offline',
  error: 'status.error',
};

const STATUS_HINT: Record<SyncStatus, TranslationKey> = {
  disabled: 'statusHint.disabled',
  guest: 'statusHint.guest',
  syncing: 'statusHint.syncing',
  synced: 'statusHint.synced',
  offline: 'statusHint.offline',
  error: 'statusHint.error',
};

function renderControls(): void {
  const theme = byId('themeToggleBtn');
  const dark = state.theme === 'dark';
  theme.textContent = dark ? t('nav.themeLight') : t('nav.themeDark');
  theme.title = dark ? t('nav.themeToLight') : t('nav.themeToDark');

  // The button names the language you would switch to, written in that language.
  const language = byId('languageToggleBtn');
  const other = state.locale === 'ar' ? 'en' : 'ar';
  language.textContent = t('nav.otherLanguage');
  language.title = t('nav.otherLanguageHint');
  language.lang = other;
}

function renderStatus(): void {
  const chip = byId('syncStatusChip');
  // Offline matters to guests too: tell them their work is still being saved.
  const status: SyncStatus = !state.online && !state.user ? 'offline' : state.syncStatus;
  chip.hidden = false;
  chip.dataset.status = status;
  chip.textContent = t(STATUS_LABEL[status]);
  chip.title = t(STATUS_HINT[status]);
  chip.classList.toggle('is-action', status === 'error');
  chip.setAttribute('role', status === 'error' ? 'button' : 'status');
  chip.tabIndex = status === 'error' ? 0 : -1;
}

function renderAccount(): void {
  const slot = byId('accountSlot');
  const user = state.user;

  if (state.syncStatus === 'disabled') {
    slot.innerHTML = '';
    return;
  }
  if (!user) {
    slot.innerHTML = `<button class="btn btn-outline btn-sm" type="button" data-account="signin">${escapeHtml(t('nav.signIn'))}</button>`;
    return;
  }
  const fullName = user.displayName?.trim() || user.email || t('nav.account');
  const name = shortName(user.displayName, user.email) || t('nav.account');
  const initial = escapeHtml(initialOf(user.displayName, user.email));
  // The initial sits underneath; the photo covers it once it has loaded and is removed if it fails.
  const photo = user.photoURL
    ? `<img class="user-photo" src="${escapeHtml(user.photoURL)}" alt="" referrerpolicy="no-referrer" decoding="async">`
    : '';
  slot.innerHTML = `
    <span class="user-badge" title="${escapeHtml(user.email ? `${fullName} · ${user.email}` : fullName)}">
      <span class="user-avatar" aria-hidden="true"><span class="user-initial">${initial}</span>${photo}</span>
      <bdi class="user-name">${escapeHtml(name)}</bdi>
      <button class="btn btn-outline btn-sm" type="button" data-account="signout">${escapeHtml(t('nav.signOut'))}</button>
    </span>`;
}

async function confirmSignOut(): Promise<void> {
  const confirmed = await showDialog({
    title: t('signOut.title'),
    body: t('signOut.body'),
    confirmLabel: t('signOut.confirm'),
    cancelLabel: t('signOut.cancel'),
  });
  if (!confirmed) return;
  await signOutUser();
  toast(t('signOut.done'), 'info');
}

export function initNavbar(): void {
  byId('themeToggleBtn').addEventListener('click', toggleTheme);

  // Image errors do not bubble, so listen in the capture phase. A broken or blocked
  // profile photo is removed and the initial underneath shows instead.
  byId('accountSlot').addEventListener(
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) event.target.remove();
    },
    true,
  );
  byId('languageToggleBtn').addEventListener('click', () => setLocale(state.locale === 'ar' ? 'en' : 'ar'));

  byId('accountSlot').addEventListener('click', (event) => {
    const action = event.target instanceof HTMLElement ? event.target.dataset.account : undefined;
    if (action === 'signin') openAuthModal();
    if (action === 'signout') guarded(confirmSignOut, t('error.signOut'))();
  });

  const chip = byId('syncStatusChip');
  const retry = (): void => {
    if (chip.dataset.status === 'error') retrySync();
  };
  chip.addEventListener('click', retry);
  chip.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') retry();
  });

  renderControls();
  renderStatus();
  renderAccount();
  store.subscribe(renderControls, ['theme', 'locale']);
  store.subscribe(renderStatus, ['syncStatus', 'online', 'user', 'locale']);
  store.subscribe(renderAccount, ['user', 'syncStatus', 'locale']);
}
