// Validates every question bank in src/data against the JSON schema and a few
// cross-file rules the schema cannot express. Runs before every build and in CI.
//   npm run validate:data
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const schema = JSON.parse(readFileSync(join(dataDir, 'schema', 'question.schema.json'), 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);

const errors = [];
const seenIds = new Map(); // id -> file
const seenText = new Map(); // normalized question text -> "file#id"
const perCategory = new Map();
let total = 0;

const files = readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) errors.push('No question banks found in src/data');

for (const file of files) {
  let bank;
  try {
    bank = JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
  } catch (err) {
    errors.push(`${file}: invalid JSON (${err.message})`);
    continue;
  }

  if (!validate(bank)) {
    for (const e of validate.errors) {
      const index = Number(e.instancePath.split('/')[1]);
      const id = Array.isArray(bank) && bank[index] ? ` (id ${bank[index].id})` : '';
      errors.push(`${file}${e.instancePath || ''}${id}: ${e.message}`);
    }
    continue;
  }

  for (const q of bank) {
    total += 1;
    const where = `${file} id ${q.id}`;

    if (seenIds.has(q.id)) errors.push(`${where}: duplicate id (also in ${seenIds.get(q.id)})`);
    seenIds.set(q.id, file);

    const text = q.question.trim().toLowerCase().replace(/\s+/g, ' ');
    if (seenText.has(text)) errors.push(`${where}: duplicate question text (same as ${seenText.get(text)})`);
    seenText.set(text, where);

    const uniqueOptions = new Set(q.options.map((o) => o.trim().toLowerCase()));
    if (uniqueOptions.size !== q.options.length) errors.push(`${where}: options must be distinct`);

    for (const field of ['category', 'question', 'explanation']) {
      if (q[field] !== q[field].trim()) errors.push(`${where}: "${field}" has leading or trailing whitespace`);
    }

    perCategory.set(q.category, (perCategory.get(q.category) ?? 0) + 1);
  }
}

// Arabic translations: src/data/ar/<bank>.json maps a question id to its
// translated question, options (same order as the English bank) and explanation.
const arDir = join(dataDir, 'ar');
const arFiles = existsSync(arDir) ? readdirSync(arDir).filter((f) => f.endsWith('.json')).sort() : [];
const ARABIC = /[؀-ۿ]/;
let translated = 0;

for (const file of arFiles) {
  const where = `ar/${file}`;
  if (!files.includes(file)) {
    errors.push(`${where}: no English bank with this name in src/data`);
    continue;
  }
  let entries;
  let bank;
  try {
    entries = JSON.parse(readFileSync(join(arDir, file), 'utf8'));
    bank = JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
  } catch (err) {
    errors.push(`${where}: invalid JSON (${err.message})`);
    continue;
  }
  if (typeof entries !== 'object' || entries === null || Array.isArray(entries)) {
    errors.push(`${where}: must be an object keyed by question id`);
    continue;
  }
  const byId = new Map(Array.isArray(bank) ? bank.map((q) => [String(q.id), q]) : []);

  for (const [id, entry] of Object.entries(entries)) {
    const at = `${where} id ${id}`;
    const original = byId.get(id);
    if (!original) {
      errors.push(`${at}: no question with this id in ${file}`);
      continue;
    }
    const keys = Object.keys(entry ?? {}).sort().join(',');
    if (keys !== 'explanation,options,question') {
      errors.push(`${at}: must have exactly "question", "options" and "explanation"`);
      continue;
    }
    if (typeof entry.question !== 'string' || !ARABIC.test(entry.question)) errors.push(`${at}: "question" must be Arabic text`);
    if (typeof entry.explanation !== 'string' || !ARABIC.test(entry.explanation)) errors.push(`${at}: "explanation" must be Arabic text`);
    const options = entry.options;
    if (!Array.isArray(options) || options.length !== 4 || !options.every((o) => typeof o === 'string' && o.trim().length > 0)) {
      errors.push(`${at}: "options" must be four non-empty strings, in the same order as the English bank`);
    } else if (new Set(options.map((o) => o.trim())).size !== 4) {
      errors.push(`${at}: options must be distinct`);
    }
    for (const field of ['question', 'explanation']) {
      if (typeof entry[field] !== 'string') continue;
      if (entry[field] !== entry[field].trim()) errors.push(`${at}: "${field}" has leading or trailing whitespace`);
      if ((entry[field].split('`').length - 1) % 2 !== 0) errors.push(`${at}: "${field}" has an unclosed \` code mark`);
    }
    translated += 1;
  }
}

if (errors.length > 0) {
  console.error(`\nQuestion bank validation failed with ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}

console.log(`Validated ${total} questions in ${files.length} banks across ${perCategory.size} categories.`);
if (arFiles.length > 0) {
  // Questions written in Arabic already (the "Arabic" bank) need no translation.
  const needed = [...perCategory].filter(([category]) => !category.includes('Arabic')).reduce((sum, [, count]) => sum + count, 0);
  const missing = needed - translated;
  console.log(`Validated ${translated} Arabic translations in ${arFiles.length} files.`);
  if (missing > 0) console.log(`Note: ${missing} question(s) have no Arabic translation yet and will be shown in English.`);
}
if (process.argv.includes('--verbose')) {
  for (const [category, count] of [...perCategory].sort()) console.log(`  ${String(count).padStart(3)}  ${category}`);
}
