/** Small non-blocking notifications in the corner of the screen. */

import { byId } from '../utils/dom';
import { setErrorNotifier } from '../utils/errors';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

const MAX_VISIBLE = 4;

export function toast(message: string, kind: ToastKind = 'info', durationMs = 6000): void {
  const region = byId('toastRegion');
  const item = document.createElement('div');
  item.className = `toast toast--${kind}`;
  item.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  item.textContent = message;
  region.appendChild(item);
  while (region.children.length > MAX_VISIBLE) region.firstElementChild?.remove();
  setTimeout(() => item.remove(), durationMs);
}

export function initToasts(): void {
  setErrorNotifier((message, kind) => toast(message, kind));
}
