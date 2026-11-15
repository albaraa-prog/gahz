/**
 * Modal helpers and the shared confirmation dialog. Replaces the browser's
 * blocking confirm() and alert() used by the original app.
 */

import { byId } from '../utils/dom';

let lastFocused: Element | null = null;

export function openModal(modal: HTMLElement, focusTarget?: HTMLElement): void {
  lastFocused = document.activeElement;
  modal.inert = false;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  (focusTarget ?? modal.querySelector<HTMLElement>('button, input'))?.focus();
}

export function closeModal(modal: HTMLElement): void {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modal.inert = true;
  if (lastFocused instanceof HTMLElement) lastFocused.focus();
  lastFocused = null;
}

/** Closes on Escape and on a click outside the dialog box. */
export function bindDismiss(modal: HTMLElement, onDismiss: () => void): void {
  modal.inert = true;
  modal.addEventListener('click', (event) => {
    if (event.target === modal) onDismiss();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) onDismiss();
  });
}

export interface DialogOptions {
  title: string;
  /** Plain text, or trusted HTML built by the caller. */
  body: string | { html: string };
  confirmLabel?: string;
  /** Pass null for a notice with a single button. */
  cancelLabel?: string | null;
  danger?: boolean;
}

let resolveCurrent: ((confirmed: boolean) => void) | null = null;

function settle(confirmed: boolean): void {
  const resolve = resolveCurrent;
  resolveCurrent = null;
  closeModal(byId('appDialog'));
  resolve?.(confirmed);
}

export function initDialog(): void {
  const modal = byId('appDialog');
  bindDismiss(modal, () => settle(false));
  byId('appDialogCancel').addEventListener('click', () => settle(false));
  byId('appDialogConfirm').addEventListener('click', () => settle(true));
}

/** Resolves true when confirmed, false when cancelled or dismissed. */
export function showDialog(options: DialogOptions): Promise<boolean> {
  resolveCurrent?.(false); // a newer dialog replaces any open one

  byId('appDialogTitle').textContent = options.title;
  const body = byId('appDialogBody');
  if (typeof options.body === 'string') body.textContent = options.body;
  else body.innerHTML = options.body.html;

  const confirm = byId<HTMLButtonElement>('appDialogConfirm');
  confirm.textContent = options.confirmLabel ?? 'OK';
  confirm.className = options.danger ? 'btn btn-danger' : 'btn';

  const cancel = byId<HTMLButtonElement>('appDialogCancel');
  cancel.hidden = options.cancelLabel === null;
  cancel.textContent = options.cancelLabel ?? 'Go Back';

  return new Promise<boolean>((resolve) => {
    resolveCurrent = resolve;
    openModal(byId('appDialog'), confirm);
  });
}
