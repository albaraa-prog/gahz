// Validates every question bank in src/data against the JSON schema and a few
// cross-file rules the schema cannot express. Runs before every build and in CI.
//   npm run validate:data
import { readFileSync, readdirSync } from 'node:fs';
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

if (errors.length > 0) {
  console.error(`\nQuestion bank validation failed with ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}

console.log(`Validated ${total} questions in ${files.length} banks across ${perCategory.size} categories.`);
if (process.argv.includes('--verbose')) {
  for (const [category, count] of [...perCategory].sort()) console.log(`  ${String(count).padStart(3)}  ${category}`);
}
