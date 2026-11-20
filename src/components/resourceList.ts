/** The list of free courses and certificates, shared by the roadmap steps and the quiz cards. */

import { localized } from '../services/lessons';
import type { Resource } from '../services/resources';
import { escapeHtml } from '../utils/helpers';
import { t } from '../utils/i18n';
import { state } from '../utils/state';

export function resourceListHtml(resources: readonly Resource[]): string {
  const items = resources.map((resource) => {
    const kind = t(resource.kind === 'certificate' ? 'resources.certificate' : 'resources.course');
    return `
      <li class="resource">
        <a class="resource-link" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer" dir="ltr">${escapeHtml(resource.title)}</a>
        <span class="resource-meta">
          <span class="resource-kind resource-kind--${resource.kind}">${escapeHtml(kind)}</span>
          <span dir="ltr">${escapeHtml(resource.provider)}</span>
        </span>
        <span class="resource-about">${escapeHtml(localized(resource.about, state.locale))}</span>
      </li>`;
  });
  return `
    <ul class="resource-list">${items.join('')}</ul>
    <p class="resources-note">${escapeHtml(t('resources.note'))}</p>`;
}
