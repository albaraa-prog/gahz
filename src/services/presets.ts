/**
 * Exam presets. To add one, append an entry here: the home screen renders a
 * card for every preset with `card` set, and the quiz engine uses `pick` to
 * build the question pool.
 */

import type { Question } from '../types';

export interface Preset {
  id: string;
  /** Shown in the history table. */
  modeLabel: string;
  count: number;
  minutes: number;
  pick: (all: readonly Question[]) => Question[];
  /** Presets without a card are started from elsewhere (the main button). */
  card?: {
    title: string;
    description: string;
    extraChip?: string;
    accent?: 'blue' | 'violet' | 'oman';
    rtl?: boolean;
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
    card: {
      title: '🇴🇲 Oman Enterprise & Banking Tech',
      description:
        'Scenario-based interview questions modelled on what banks, telecom operators, consulting firms and government entities in Oman and the GCC look for: enterprise backends and ERP integration, Oracle and PostgreSQL, production incidents and security judgment, resilience, and stakeholder communication.',
      extraChip: 'GCC Interview Track',
      accent: 'oman',
    },
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
    card: {
      title: '💙 Senior Flutter Engineer (Thawani Fintech)',
      description:
        'Complete mastery pack: Junior-to-Senior Flutter/Dart, Clean Architecture, Provider, Mobile Security (SSL Pinning, Biometrics, JWT), Hive/SQLite, QR/NFC Payments, Deep Links, Flavors, and Performance.',
      extraChip: 'Fintech Special',
      accent: 'blue',
    },
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
    card: {
      title: '🌐 APIs, REST & Networking Protocols',
      description:
        'Master RESTful design, HTTP/2 & HTTP/3, WebSockets, gRPC, TLS 1.3, TCP/IP, DNS, Caching, CORS, Rate Limiting, and Webhooks.',
      accent: 'violet',
    },
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
    card: {
      title: '📚 CS Fundamentals & Systems',
      description:
        'Core foundations: algorithms, data structures (Trees, Graphs, HashTables), memory allocation, concurrency, and OOP principles.',
    },
  },
  {
    id: 'iq',
    modeLabel: 'Logic & IQ Drill',
    count: 15,
    minutes: 15,
    pick: inCategories(['Logic & IQ']),
    card: {
      title: '🧠 Logic & IQ Drill',
      description: 'Test your problem-solving speed with 15 logical reasoning and puzzle questions.',
    },
  },
  {
    id: 'arabic',
    modeLabel: 'الأسئلة باللغة العربية',
    count: 10,
    minutes: 10,
    pick: (all) => all.filter((q) => q.category.includes('Arabic')),
    card: {
      title: '🇸🇦 الأسئلة باللغة العربية',
      description: 'أسئلة تدريبية ممزوجة باللغة العربية تختبر أساسيات البرمجة وعلم الحاسوب.',
      rtl: true,
    },
  },
];

export function findPreset(id: string): Preset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}
