import type { Theme } from '../types';
import { state, store } from './state';

/** Keeps <html data-theme> in step with the store. Persistence lives in services/preferences. */
export function initTheme(): void {
  const apply = (): void => {
    document.documentElement.setAttribute('data-theme', state.theme);
  };
  apply();
  store.subscribe(apply, ['theme']);
}

export function toggleTheme(): void {
  const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
  state.theme = next;
}
