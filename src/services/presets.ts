/**
 * Exam presets. To add one:
 *   1. append an entry here,
 *   2. add `preset.<id>.title` and `preset.<id>.desc` (and optionally
 *      `preset.<id>.chip`) to both dictionaries in utils/i18n.ts.
 * The home screen renders a card for every preset with `card` set, and the
 * quiz engine uses `pick` to build the question pool.
 */

import type { Question } from '../types';
import { hasKey, t } from '../utils/i18n';
import { MISTAKES_MODE } from './mistakes';
import { parseRoadmapMode } from './roadmap';

export interface Preset {
  id: string;
  /**
   * Stored with each attempt. Kept in English so history stays comparable
   * across languages; `displayMode` translates it for the screen.
   */
  modeLabel: string;
  count: number;
  minutes: number;
  pick: (all: readonly Question[]) => Question[];
  /** Presets without a card are started from elsewhere (the main button). */
  card?: {
    /** The card's own text is Arabic in every interface language. */
    alwaysArabic?: boolean;
  };
}

const inCategories = (categories: readonly string[]) => (all: readonly Question[]) =>
  all.filter((q) => categories.includes(q.category));

const inBank = (bank: string) => (all: readonly Question[]) => all.filter((q) => q.bank === bank);

export const PRESETS: readonly Preset[] = [
  {
    id: 'standard',
    modeLabel: 'Standard Mixed Exam',
    count: 25,
    minutes: 25,
    pick: (all) => all.slice(),
  },
  {
    id: 'oman_enterprise',
    modeLabel: 'Oman Enterprise & Banking Tech',
    count: 20,
    minutes: 25,
    pick: inBank('oman-enterprise'),
    card: {},
  },
  {
    id: 'flutter_fintech',
    modeLabel: 'Senior Flutter & Fintech SWE',
    count: 30,
    minutes: 30,
    pick: inCategories([
      'Flutter & Dart Fundamentals (Junior to Mid)',
      'Flutter & Dart Core Mastery',
      'Flutter Clean Architecture & Provider',
      'Fintech Mobile Security, QR & Payments',
      'Flutter Performance, Storage & Native Integrations',
      'APIs & Data Integration (REST, GraphQL, WebSockets)',
    ]),
    card: {},
  },
  {
    id: 'networking_apis',
    modeLabel: 'APIs & Networking Protocols',
    count: 25,
    minutes: 25,
    pick: inCategories([
      'APIs & Data Integration (REST, GraphQL, WebSockets)',
      'Computer Networking & Protocols',
      'REST & SOAP',
      'CS & Networks',
    ]),
    card: {},
  },
  {
    id: 'cs_basics',
    modeLabel: 'CS Fundamentals & Systems',
    count: 25,
    minutes: 25,
    pick: inCategories([
      'General Computer Science & Advanced Systems',
      'CS & Programming Fundamentals',
      'Programming Basics',
      'Databases',
    ]),
    card: {},
  },
  {
    id: 'dsa',
    modeLabel: 'Data Structures & Algorithms',
    count: 20,
    minutes: 20,
    pick: inCategories(['Data Structures & Algorithms']),
    card: {},
  },
  {
    id: 'sql',
    modeLabel: 'SQL & Databases',
    count: 20,
    minutes: 20,
    pick: inCategories(['SQL', 'Databases']),
    card: {},
  },
  {
    id: 'ai',
    modeLabel: 'AI & LLM Fundamentals',
    count: 20,
    minutes: 20,
    pick: inCategories(['AI Fundamentals', 'LLMs & Generative AI']),
    card: {},
  },
  {
    id: 'prompt_engineering',
    modeLabel: 'Prompt Engineering',
    count: 15,
    minutes: 15,
    pick: inCategories(['Prompt Engineering']),
    card: {},
  },
  {
    id: 'game_dev',
    modeLabel: 'Unity & C# Game Development',
    count: 20,
    minutes: 20,
    pick: inCategories(['Unity & C# Game Development', 'C#']),
    card: {},
  },
  {
    id: 'spring_boot',
    modeLabel: 'Java & Spring Boot',
    count: 20,
    minutes: 20,
    pick: inCategories(['Spring Boot', 'Java']),
    card: {},
  },
  {
    id: 'dotnet',
    modeLabel: 'C# & .NET',
    count: 20,
    minutes: 20,
    pick: inCategories(['.NET & ASP.NET Core', 'C#']),
    card: {},
  },
  {
    id: 'php_laravel',
    modeLabel: 'PHP & Laravel',
    count: 20,
    minutes: 20,
    pick: inCategories(['Laravel & Modern PHP', 'PHP']),
    card: {},
  },
  {
    id: 'networks',
    modeLabel: 'Computer Networks',
    count: 20,
    minutes: 20,
    pick: inCategories(['Networking Fundamentals', 'CS & Networks', 'Computer Networking & Protocols']),
    card: {},
  },
  {
    id: 'iq',
    modeLabel: 'Logic & IQ Drill',
    count: 15,
    minutes: 15,
    pick: inCategories(['Logic & IQ']),
    card: {},
  },
  {
    id: 'job_test',
    modeLabel: 'Job Test Practice',
    count: 20,
    minutes: 25,
    pick: inCategories(['Job Test: Aptitude & Reasoning', 'Job Test: IT & Information Systems']),
    card: {},
  },
  {
    id: 'arabic',
    modeLabel: 'Arabic Questions',
    count: 10,
    minutes: 10,
    pick: (all) => all.filter((q) => q.category.includes('Arabic')),
    card: { alwaysArabic: true },
  },
];

export function findPreset(id: string): Preset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}

/** Text for a preset card in the active language. */
export function presetText(preset: Preset): { title: string; description: string; chip: string | null } {
  const key = (suffix: string): string => `preset.${preset.id}.${suffix}`;
  const read = (suffix: string): string | null => {
    const k = key(suffix);
    return hasKey(k) ? t(k) : null;
  };
  return {
    title: read('title') ?? preset.modeLabel,
    description: read('desc') ?? '',
    chip: read('chip'),
  };
}

const CUSTOM_MODE = /^Custom \((\d+) Qs\)$/;

export function customModeLabel(count: number): string {
  return `Custom (${count} Qs)`;
}

/** Translates the mode stored with an attempt for display. Unknown values are shown as they are. */
export function displayMode(mode: string): string {
  const custom = CUSTOM_MODE.exec(mode);
  if (custom) return t('mode.custom', { n: Number(custom[1]) });
  if (mode === MISTAKES_MODE) return t('mistakes.title');
  const step = parseRoadmapMode(mode);
  if (step) return t('roadmap.mode', { step: t(`step.${step}.title`) });

  // "standard" is what the original single-file app stored for the mixed exam.
  const preset = PRESETS.find((p) => p.modeLabel === mode) ?? (mode === 'standard' ? findPreset('standard') : undefined);
  if (!preset) return mode;
  if (preset.id === 'standard') return t('preset.standard.mode');
  return presetText(preset).title;
}
