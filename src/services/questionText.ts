/**
 * Question content in the interface language.
 *
 * The banks in /src/data are written in English. Arabic translations live in
 * /src/data/ar/<bank>.json, keyed by question id, and are downloaded only when
 * the interface is switched to Arabic. Code snippets, ids, the correct answer
 * and the stored category stay as they are in the English bank; only the
 * text shown to the user changes.
 *
 * Options are matched to their translation by their English text, not by
 * position, so the result stays correct when a quiz shows its options in a
 * different order from the bank.
 */

import type { Question } from '../types';
import { containsArabic, isRecord } from '../utils/helpers';
import { state } from '../utils/state';

export interface QuestionText {
  question: string;
  options: string[];
  explanation: string;
}

type TranslationModule = { default: unknown };

const arabicImporters = import.meta.glob<TranslationModule>('../data/ar/*.json');

const arabic = new Map<number, QuestionText>();
let loading: Promise<void> | null = null;

/** Validates one translated entry. Anything malformed is ignored and the English text is shown. */
export function parseQuestionText(value: unknown): QuestionText | null {
  if (!isRecord(value)) return null;
  const { question, options, explanation } = value;
  if (typeof question !== 'string' || question.length === 0) return null;
  if (typeof explanation !== 'string') return null;
  if (!Array.isArray(options) || options.length !== 4) return null;
  if (!options.every((option): option is string => typeof option === 'string' && option.length > 0)) return null;
  return { question, options, explanation };
}

async function loadArabic(): Promise<void> {
  const settled = await Promise.allSettled(Object.values(arabicImporters).map((importer) => importer()));
  let failed = 0;
  for (const result of settled) {
    if (result.status === 'rejected' || !isRecord(result.value.default)) {
      failed += 1;
      continue;
    }
    for (const [id, entry] of Object.entries(result.value.default)) {
      const text = parseQuestionText(entry);
      if (text) arabic.set(Number(id), text);
    }
  }
  if (failed > 0) console.error(`[questions] ${failed} Arabic translation file(s) failed to load`);
  if (failed === settled.length && settled.length > 0) throw new Error('Arabic translations could not be loaded.');
}

/**
 * Downloads the Arabic question text once. Safe to call repeatedly; a failed
 * download is not cached, so switching language again retries it.
 */
export function ensureQuestionTranslations(): Promise<void> {
  if (state.locale !== 'ar' || state.translationsReady) return Promise.resolve();
  if (!loading) {
    loading = loadArabic()
      .then(() => {
        state.translationsReady = true;
      })
      .catch((error) => {
        console.error('[questions] Arabic translations unavailable, showing English', error);
      })
      .finally(() => {
        loading = null;
      });
  }
  return loading;
}

/** Test hook: registers translations without going through the network. */
export function registerTranslations(entries: Record<number, QuestionText>): void {
  for (const [id, text] of Object.entries(entries)) arabic.set(Number(id), text);
}

let originalsSource: readonly Question[] | null = null;
let originals = new Map<number, readonly string[]>();

/** English options in bank order, used to line translated options up with the ones on screen. */
function originalOptions(id: number): readonly string[] | undefined {
  if (originalsSource !== state.allQuestions) {
    originalsSource = state.allQuestions;
    originals = new Map(state.allQuestions.map((question) => [question.id, question.options]));
  }
  return originals.get(id);
}

/** The question's text, options and explanation in the active interface language. */
export function questionText(question: Question): QuestionText {
  const translated = state.locale === 'ar' ? arabic.get(question.id) : undefined;
  if (!translated) return question;

  const bankOrder = originalOptions(question.id) ?? question.options;
  const options = question.options.map((option, index) => {
    const position = bankOrder.indexOf(option);
    return translated.options[position >= 0 ? position : index] ?? option;
  });
  return { question: translated.question, options, explanation: translated.explanation };
}

/** Reading direction of the text returned by `questionText`. */
export function questionDirection(question: Question): 'rtl' | 'ltr' {
  return question.category.includes('Arabic') || containsArabic(questionText(question).question) ? 'rtl' : 'ltr';
}

/**
 * Category names are stored in English (they are keys in saved attempts and
 * in the custom quiz settings) and translated only for display.
 */
const ARABIC_CATEGORIES: Readonly<Record<string, string>> = {
  '.NET & ASP.NET Core': '.NET و ASP.NET Core',
  'AI Fundamentals': 'أساسيات الذكاء الاصطناعي',
  'APIs & Data Integration (REST, GraphQL, WebSockets)': 'واجهات API وتكامل البيانات (REST وGraphQL وWebSockets)',
  'Arabic (الأساسيات والبرمجة)': 'الأساسيات والبرمجة',
  'Computer Networking & Protocols': 'شبكات الحاسوب والبروتوكولات',
  'CS & Networks': 'علوم الحاسوب والشبكات',
  'CS & Programming Fundamentals': 'أساسيات علوم الحاسوب والبرمجة',
  'Data Structures & Algorithms': 'هياكل البيانات والخوارزميات',
  Databases: 'قواعد البيانات',
  'Fintech Mobile Security, QR & Payments': 'أمان تطبيقات التقنية المالية ورموز QR والمدفوعات',
  'Flutter Clean Architecture & Provider': 'Flutter: المعمارية النظيفة وProvider',
  'Flutter & Dart Core Mastery': 'إتقان أساسيات Flutter وDart',
  'Flutter & Dart Fundamentals (Junior to Mid)': 'أساسيات Flutter وDart (من المبتدئ إلى المتوسط)',
  'Flutter Performance, Storage & Native Integrations': 'Flutter: الأداء والتخزين والتكامل مع المنصة',
  'Fullstack Web Dev': 'تطوير الويب المتكامل',
  Fullstack: 'التطوير المتكامل (Fullstack)',
  'General Computer Science & Advanced Systems': 'علوم الحاسوب العامة والأنظمة المتقدمة',
  'Laravel & Modern PHP': 'Laravel و PHP الحديثة',
  'LLMs & Generative AI': 'النماذج اللغوية الكبيرة والذكاء الاصطناعي التوليدي',
  'Logic & IQ': 'المنطق والذكاء',
  'Networking Fundamentals': 'أساسيات الشبكات',
  'Git & GitHub': 'Git و GitHub',
  'CI/CD with GitHub Actions': 'CI/CD بـ GitHub Actions',
  Docker: 'Docker والحاويات',
  'Job Test: Aptitude & Reasoning': 'اختبارات التوظيف: القدرات والاستدلال',
  'Job Test: IT & Information Systems': 'اختبارات التوظيف: تقنية المعلومات ونظم المعلومات',
  'Oman Enterprise: Backend & ERP Integration': 'مؤسسات عُمان: الخوادم وتكامل ERP',
  'Oman Enterprise: Oracle & PostgreSQL': 'مؤسسات عُمان: Oracle وPostgreSQL',
  'Oman Enterprise: Incidents & Security Judgment': 'مؤسسات عُمان: الحوادث والحكم الأمني',
  'Oman Enterprise: Resilience & Scalability': 'مؤسسات عُمان: المتانة وقابلية التوسعة',
  'Oman Enterprise: Stakeholder Communication': 'مؤسسات عُمان: التواصل مع أصحاب المصلحة',
  'Programming Basics': 'أساسيات البرمجة',
  'Prompt Engineering': 'هندسة الأوامر (Prompt Engineering)',
  'REST & SOAP': 'REST وSOAP',
  'Unity & C# Game Development': 'تطوير الألعاب بـUnity و C#',
};

export function categoryLabel(category: string): string {
  return state.locale === 'ar' ? (ARABIC_CATEGORIES[category] ?? category) : category;
}
