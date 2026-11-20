import { describe, expect, it } from 'vitest';
import { STEP_RESOURCES, resourcesForStep } from '../src/services/resources';
import { ROADMAP_STEPS, isStepId } from '../src/services/roadmap';
import { LOCALES } from '../src/utils/i18n';

const ARABIC = /[؀-ۿ]/;

describe('free courses and certificates', () => {
  it('lists at least one for every roadmap step', () => {
    for (const stepId of Object.keys(ROADMAP_STEPS)) {
      if (!isStepId(stepId)) continue;
      expect(resourcesForStep(stepId).length, stepId).toBeGreaterThan(0);
    }
    expect(Object.keys(STEP_RESOURCES).sort()).toEqual(Object.keys(ROADMAP_STEPS).sort());
  });

  it('has a secure link, a provider and a description in both languages for each one', () => {
    for (const [stepId, resources] of Object.entries(STEP_RESOURCES)) {
      const urls = resources.map((resource) => resource.url);
      expect(new Set(urls).size, `${stepId} repeats a link`).toBe(urls.length);

      for (const resource of resources) {
        const where = `${stepId}: ${resource.title}`;
        const url = new URL(resource.url);
        expect(url.protocol, where).toBe('https:');
        expect(url.username + url.password + url.search + url.hash, `${where} has tracking or credentials`).toBe('');
        expect(resource.title.trim().length, where).toBeGreaterThan(2);
        expect(resource.provider.trim().length, where).toBeGreaterThan(1);
        expect(['certificate', 'course'], where).toContain(resource.kind);
        for (const locale of LOCALES) expect(resource.about[locale].trim().length, `${where} (${locale})`).toBeGreaterThan(10);
        expect(ARABIC.test(resource.about.ar), `${where}: Arabic description`).toBe(true);
      }
    }
  });
});
