/** Sign-in / create-account dialog (Email + Password, Google). */

import { describeAuthError, registerWithEmail, sendPasswordReset, signInWithEmail, signInWithGoogle } from '../services/auth';
import { byId, closestFrom } from '../utils/dom';
import { t } from '../utils/i18n';
import { legalHtml } from '../utils/legalLinks';
import { state, store } from '../utils/state';
import { bindDismiss, closeModal, openModal } from './modal';
import { toast } from './toast';

type Tab = 'signin' | 'register';
let activeTab: Tab = 'signin';
let busy = false;

function setMessage(text: string, info = false): void {
  const message = byId('authMessage');
  message.textContent = text;
  message.classList.toggle('form-message--info', info);
}

function setBusy(value: boolean): void {
  busy = value;
  byId<HTMLButtonElement>('authSubmitBtn').disabled = value;
  byId<HTMLButtonElement>('googleSignInBtn').disabled = value;
}

function renderTab(clearMessage = true): void {
  const registering = activeTab === 'register';
  document.querySelectorAll<HTMLButtonElement>('[data-auth-tab]').forEach((button) => {
    const selected = button.dataset.authTab === activeTab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  byId('authNameField').hidden = !registering;
  byId('authSubmitBtn').textContent = registering ? t('auth.tabRegister') : t('auth.tabSignIn');
  byId<HTMLInputElement>('authPassword').autocomplete = registering ? 'new-password' : 'current-password';
  byId('authResetBtn').hidden = registering;
  // Creating an account needs an explicit tick; signing in to an existing one shows the notice.
  byId('authConsentField').hidden = !registering;
  byId('authLegalNote').hidden = registering;
  byId('authConsentText').innerHTML = legalHtml('auth.consent');
  byId('authLegalNote').innerHTML = legalHtml('auth.legalNote');
  if (clearMessage) setMessage('');
}

async function run(action: () => Promise<void>): Promise<void> {
  if (busy) return;
  setBusy(true);
  setMessage('');
  try {
    await action();
  } catch (error) {
    const description = describeAuthError(error);
    if (description) setMessage(description);
    console.warn('[auth]', error);
  } finally {
    setBusy(false);
  }
}

function readCredentials(): { name: string; email: string; password: string } | null {
  const email = byId<HTMLInputElement>('authEmail').value.trim();
  const password = byId<HTMLInputElement>('authPassword').value;
  const name = byId<HTMLInputElement>('authName').value;
  if (!email) {
    setMessage(t('auth.needEmail'));
    return null;
  }
  if (password.length < 6) {
    setMessage(t('auth.shortPassword'));
    return null;
  }
  return { name, email, password };
}

/** On the "Create account" tab nothing proceeds, by email or Google, until the box is ticked. */
function hasConsent(): boolean {
  if (activeTab !== 'register' || byId<HTMLInputElement>('authConsent').checked) return true;
  setMessage(t('auth.needConsent'));
  return false;
}

export function openAuthModal(): void {
  activeTab = 'signin';
  renderTab();
  openModal(byId('authModal'), byId('authEmail'));
}

function close(): void {
  closeModal(byId('authModal'));
  byId<HTMLInputElement>('authPassword').value = '';
  byId<HTMLInputElement>('authConsent').checked = false;
  setMessage('');
}

export function initAuthModal(): void {
  const modal = byId('authModal');
  bindDismiss(modal, close);
  byId('authCloseBtn').addEventListener('click', close);

  modal.addEventListener('click', (event) => {
    const tab = closestFrom<HTMLButtonElement>(event, '[data-auth-tab]');
    if (!tab) return;
    activeTab = tab.dataset.authTab === 'register' ? 'register' : 'signin';
    renderTab();
  });

  byId<HTMLFormElement>('authForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const credentials = readCredentials();
    if (!credentials || !hasConsent()) return;
    void run(() =>
      activeTab === 'register'
        ? registerWithEmail(credentials.name, credentials.email, credentials.password)
        : signInWithEmail(credentials.email, credentials.password),
    );
  });

  byId('googleSignInBtn').addEventListener('click', () => {
    if (hasConsent()) void run(signInWithGoogle);
  });

  byId('authResetBtn').addEventListener('click', () => {
    const email = byId<HTMLInputElement>('authEmail').value.trim();
    if (!email) {
      setMessage(t('auth.resetNeedEmail'));
      return;
    }
    void run(async () => {
      await sendPasswordReset(email);
      setMessage(t('auth.resetSent'), true);
    });
  });

  renderTab();
  store.subscribe(() => renderTab(false), ['locale']);

  // Close the dialog as soon as sign-in succeeds, whichever method was used.
  store.subscribe(() => {
    if (state.user && modal.classList.contains('active')) {
      close();
      toast(t('auth.signedIn', { name: state.user.displayName || state.user.email || t('auth.yourAccount') }), 'success');
    }
  }, ['user']);
}
