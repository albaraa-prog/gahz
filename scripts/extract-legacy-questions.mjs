// One-off migration: pulls the QUESTIONS_DATABASE array out of the original
// single-file app (legacy/index.html) and writes one JSON bank per category
// into src/data/. Kept for provenance; safe to re-run (it overwrites the
// generated banks but never touches oman-enterprise.json).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'legacy', 'index.html'), 'utf8');

const start = html.indexOf('const QUESTIONS_DATABASE = [');
const end = html.indexOf('// ==================== APP ENGINE LOGIC');
if (start < 0 || end < 0) throw new Error('Could not locate QUESTIONS_DATABASE in legacy/index.html');
const source = html.slice(start, end).replace('const QUESTIONS_DATABASE', 'QUESTIONS_DATABASE');

const sandbox = {};
vm.runInNewContext(source, sandbox);
const legacy = sandbox.QUESTIONS_DATABASE;

/** category -> output file slug */
const FILES = {
  'Python': 'python',
  'Java': 'java',
  'C#': 'csharp',
  'JavaScript': 'javascript',
  'PHP': 'php',
  'PL/SQL': 'plsql',
};

/** Heuristic difficulty by category; contributors can refine per question. */
function difficultyFor(category) {
  if (/Basics|Junior|Arabic/i.test(category)) return 'easy';
  if (/Advanced|Mastery|Architecture|Security|Performance/i.test(category)) return 'hard';
  return 'medium';
}

function slugify(category) {
  return (
    FILES[category] ??
    category
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/&/g, ' ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}

const byFile = new Map();
for (const q of legacy) {
  const question = {
    id: q.id,
    category: q.category,
    difficulty: difficultyFor(q.category),
    question: q.q,
    ...(q.code && q.code.trim() ? { codeSnippet: q.code } : {}),
    options: q.options,
    correctAnswer: q.correct,
    explanation: q.explanation,
  };
  const slug = slugify(q.category);
  if (!byFile.has(slug)) byFile.set(slug, []);
  byFile.get(slug).push(question);
}

const outDir = join(root, 'src', 'data');
mkdirSync(outDir, { recursive: true });
for (const [slug, questions] of byFile) {
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(questions, null, 2) + '\n');
  console.log(`${slug}.json`.padEnd(60), String(questions.length).padStart(3), '|', questions[0].category);
}
console.log(`\nExtracted ${legacy.length} questions into ${byFile.size} files.`);

// Sanity report used during the migration.
const iq = legacy.filter((q) => q.isIq);
console.log('isIq questions:', iq.length, '| categories:', [...new Set(iq.map((q) => q.category))].join(', '));
console.log('non-IQ in those categories:', legacy.filter((q) => !q.isIq && iq.some((i) => i.category === q.category)).length);
console.log('option counts:', [...new Set(legacy.map((q) => q.options.length))].join(','));
console.log('duplicate ids:', legacy.length - new Set(legacy.map((q) => q.id)).size);
console.log('bad correct idx:', legacy.filter((q) => !(q.correct >= 0 && q.correct < q.options.length)).length);
console.log('keys:', [...new Set(legacy.flatMap((q) => Object.keys(q)))].join(','));
