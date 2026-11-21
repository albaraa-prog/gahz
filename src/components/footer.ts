/** Footer actions: the analytics consent banner and "Delete my account". */

import { analyticsAvailable, getAnalyticsConsent, setAnalyticsConsent, type AnalyticsConsent } from '../services/analytics';
import { RecentLoginRequiredError, deleteAccount } from '../services/auth';
import { byId } from '../utils/dom';
import { reportError } from '../utils/errors';
import { t } from '../utils/i18n';
import { CONTACT_EMAIL, legalHtml } from '../utils/legalLinks';
import { state, store } from '../utils/state';
import { showDialog } from './modal';
import { toast } from './toast';

function initConsentBanner(): void {
  const banner = byId('consentBanner');
  const choiceButton = byId('analyticsChoiceBtn');
  if (!analyticsAvailable) return; // nothing to consent to on this build

  const renderText = (): void => {
    byId('consentText').innerHTML = legalHtml('consent.text');
  };
  const answer = (consent: AnalyticsConsent): void => {
    setAnalyticsConsent(consent);
    banner.hidden = true;
    toast(t('consent.saved'), 'info');
  };

  renderText();
  store.subscribe(renderText, ['locale']);
  byId('consentAcceptBtn').addEventListener('click', () => answer('granted'));
  byId('consentDeclineBtn').addEventListener('click', () => answer('denied'));

  // The footer link reopens the question, so the answer can be changed or withdrawn later.
  choiceButton.hidden = false;
  choiceButton.addEventListener('click', () => {
    banner.hidden = false;
    byId('consentDeclineBtn').focus();
  });

  banner.hidden = getAnalyticsConsent() !== null;
}

async function confirmDeleteAccount(): Promise<void> {
  if (!state.online) {
    toast(t('deleteAccount.offline'), 'warning');
    return;
  }
  const confirmed = await showDialog({
    title: t('deleteAccount.title'),
    body: t('deleteAccount.body'),
    confirmLabel: t('deleteAccount.confirm'),
    cancelLabel: t('deleteAccount.cancel'),
    danger: true,
  });
  if (!confirmed) return;

  try {
    await deleteAccount();
    toast(t('deleteAccount.done'), 'success', 8000);
  } catch (error) {
    if (error instanceof RecentLoginRequiredError) {
      await showDialog({ title: t('deleteAccount.title'), body: t('deleteAccount.reauth'), cancelLabel: null });
      return;
    }
    reportError(error, t('deleteAccount.failed', { email: CONTACT_EMAIL }));
  }
}

function initDeleteAccount(): void {
  const button = byId('deleteAccountBtn');
  const render = (): void => {
    button.hidden = !state.user;
  };
  render();
  store.subscribe(render, ['user']);
  button.addEventListener('click', () => void confirmDeleteAccount());
}

export function initFooter(): void {
  initConsentBanner();
  initDeleteAccount();
}
