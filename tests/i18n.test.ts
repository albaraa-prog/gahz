import { afterEach, describe, expect, it } from 'vitest';
import { PRESETS, customModeLabel, displayMode, presetText } from '../src/services/presets';
import { LOCALES, countNoun, detectLocale, isRtl, parseLocale, setActiveLocale, t, type TranslationKey } from '../src/utils/i18n';

afterEach(() => setActiveLocale('en'));

const SAMPLE_KEYS: TranslationKey[] = [
  'home.lead',
  'chip.questions',
  'chip.minutes',
  'bank.partial',
  'mode.custom',
  'history.streak',
  'map.question',
  'submit.unanswered',
  'results.counts',
  'review.question',
  'filter.all',
  'filter.correct',
  'filter.incorrect',
  'filter.flagged',
  'auth.signedIn',
  'footer.count',
];

const placeholders = (text: string): string[] => [...text.matchAll(/\{(\w+)(?::\w+)?\}/g)].map((m) => m[1] ?? '').sort();

describe('translations', () => {
  it('uses the same placeholders in every language', () => {
    for (const key of SAMPLE_KEYS) {
      setActiveLocale('en');
      const expected = placeholders(t(key));
      expect(expected.length, key).toBeGreaterThan(0);
      for (const locale of LOCALES) {
        setActiveLocale(locale);
        expect(placeholders(t(key)), `${key} (${locale})`).toEqual(expected);
      }
    }
  });

  it('fills in parameters and switches language', () => {
    expect(t('results.counts', { correct: 3, total: 5 })).toBe('3 of 5 correct');
    setActiveLocale('ar');
    expect(t('results.counts', { correct: 3, total: 5 })).toBe('3 صحيحة من 5');
    expect(t('quiz.next')).toBe('التالي');
    expect(isRtl()).toBe(true);
  });

  it('picks a supported language from the browser list', () => {
    expect(detectLocale(['ar-OM', 'en-US'])).toBe('ar');
    expect(detectLocale(['fr-FR', 'en-GB'])).toBe('en');
    expect(detectLocale(['de'])).toBe('en');
    expect(parseLocale('ar')).toBe('ar');
    expect(parseLocale('xx')).toBeNull();
  });
});

describe('preset text and stored modes', () => {
  it('has a translated title and description for every card', () => {
    for (const locale of LOCALES) {
      setActiveLocale(locale);
      for (const preset of PRESETS.filter((p) => p.card)) {
        const text = presetText(preset);
        expect(text.title.length, `${preset.id} title (${locale})`).toBeGreaterThan(3);
        expect(text.description.length, `${preset.id} description (${locale})`).toBeGreaterThan(10);
      }
    }
  });

  it('translates stored mode labels for display, including ones from older versions', () => {
    expect(displayMode('Oman Enterprise & Banking Tech')).toBe('Oman Enterprise & Banking Tech');
    expect(displayMode(customModeLabel(6))).toBe('Custom (6 questions)');
    expect(displayMode('standard')).toBe('Mixed exam');
    expect(displayMode('Something unknown')).toBe('Something unknown');

    setActiveLocale('ar');
    expect(displayMode('Oman Enterprise & Banking Tech')).toBe('تقنيات المؤسسات والبنوك في عُمان');
    expect(displayMode('Standard Mixed Exam')).toBe('اختبار منوّع');
    expect(displayMode(customModeLabel(6))).toBe('مخصص (6 أسئلة)');
  });
});

describe('countNoun', () => {
  it('follows the Arabic number rules', () => {
    expect(countNoun('question', 1, 'ar')).toBe('سؤال واحد');
    expect(countNoun('question', 2, 'ar')).toBe('سؤالان');
    expect(countNoun('question', 3, 'ar')).toBe('3 أسئلة');
    expect(countNoun('question', 10, 'ar')).toBe('10 أسئلة');
    expect(countNoun('question', 11, 'ar')).toBe('11 سؤالاً');
    expect(countNoun('question', 99, 'ar')).toBe('99 سؤالاً');
    expect(countNoun('question', 100, 'ar')).toBe('100 سؤال');
    expect(countNoun('question', 103, 'ar')).toBe('103 أسئلة');
    expect(countNoun('question', 320, 'ar')).toBe('320 سؤالاً');
    expect(countNoun('minute', 10, 'ar')).toBe('10 دقائق');
    expect(countNoun('minute', 25, 'ar')).toBe('25 دقيقة');
    expect(countNoun('day', 5, 'ar')).toBe('5 أيام');
  });

  it('handles English singular and plural', () => {
    expect(countNoun('question', 1, 'en')).toBe('1 question');
    expect(countNoun('category', 28, 'en')).toBe('28 categories');
  });

  it('is used by templates through {name:noun}', () => {
    setActiveLocale('ar');
    expect(t('chip.questions', { n: 10 })).toBe('10 أسئلة');
    expect(t('chip.minutes', { n: 10 })).toBe('10 دقائق');
    expect(t('footer.count', { count: 320, topics: 28 })).toBe('320 سؤالاً في 28 فئة');
    setActiveLocale('en');
    expect(t('chip.questions', { n: 20 })).toBe('20 questions');
    expect(t('chip.minutes', { n: 25 })).toBe('25 min');
  });
});
