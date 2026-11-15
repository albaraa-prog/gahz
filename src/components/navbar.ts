/** Header: theme toggle, account button and cloud-sync status. */

import type { SyncStatus } from '../types';
import { signOutUser } from '../services/auth';
import { retrySync } from '../services/sync';
import { byId } from '../utils/dom';
import { guarded } from '../utils/errors';
import { escapeHtml } from '../utils/helpers';
import { state, store } from '../utils/state';
import { toggleTheme } from '../utils/theme';
import { openAuthModal } from './authModal';
import { showDialog } from './modal';
import { toast } from './toast';

const STATUS_LABEL: Record<SyncStatus, string> = {
  disabled: 'Guest mode',
  guest: 'Guest mode',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline',
  error: 'Sync error · Retry',
};

const STATUS_HINT: Record<SyncStatus, string> = {
  disabled: 'Your progress is saved in this browser. Cloud sync is not configured for this build.',
  guest: 'Your progress is saved in this browser. Sign in to back it up and use it on other devices.',
  syncing: 'Saving your progress to the cloud.',
  synced: 'Your progress is backed up to your account.',
  offline: 'You are offline. Progress is saved on this device and will sync when you reconnect.',
  error: 'Cloud sync failed. Click to retry. Your progress is still saved on this device.',
};

function renderTheme(): void {
  const button = byId('themeToggleBtn');
  const dark = state.theme === 'dark';
  button.textContent = dark ? 'Light' : 'Dark';
  button.title = dark ? 'Switch to the light theme' : 'Switch to the dark theme';
}

function renderStatus(): void {
  const chip = byId('syncStatusChip');
  // Offline matters to guests too: tell them their work is still being saved.
  const status: SyncStatus = !state.online && !state.user ? 'offline' : state.syncStatus;
  chip.hidden = false;
  chip.dataset.status = status;
  chip.textContent = STATUS_LABEL[status];
  chip.title = STATUS_HINT[status];
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
    slot.innerHTML = '<button class="btn btn-outline btn-sm" type="button" data-account="signin">Sign in</button>';
    return;
  }
  const name = user.displayName || user.email || 'Account';
  slot.innerHTML = `
    <span class="user-badge">
      <span class="user-avatar" aria-hidden="true">${escapeHtml(name.charAt(0).toUpperCase())}</span>
      <span class="user-name" title="${escapeHtml(user.email ?? name)}">${escapeHtml(name)}</span>
      <button class="btn btn-outline btn-sm" type="button" data-account="signout">Sign out</button>
    </span>`;
}

async function confirmSignOut(): Promise<void> {
  const confirmed = await showDialog({
    title: 'Sign out?',
    body: 'Your history is backed up to your account. It will be removed from this device and will come back when you sign in again.',
    confirmLabel: 'Sign out',
    cancelLabel: 'Stay signed in',
  });
  if (!confirmed) return;
  await signOutUser();
  toast('Signed out. You are now in guest mode.', 'info');
}

export function initNavbar(): void {
  byId('themeToggleBtn').addEventListener('click', toggleTheme);

  byId('accountSlot').addEventListener(
    'click',
    guarded(async (event: Event) => {
      const action = event.target instanceof HTMLElement ? event.target.dataset.account : undefined;
      if (action === 'signin') openAuthModal();
      if (action === 'signout') await confirmSignOut();
    }, 'Could not sign out. Please try again.'),
  );

  const chip = byId('syncStatusChip');
  const retry = (): void => {
    if (chip.dataset.status === 'error') retrySync();
  };
  chip.addEventListener('click', retry);
  chip.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') retry();
  });

  renderTheme();
  renderStatus();
  renderAccount();
  store.subscribe(renderTheme, ['theme']);
  store.subscribe(renderStatus, ['syncStatus', 'online', 'user']);
  store.subscribe(renderAccount, ['user', 'syncStatus']);
}
