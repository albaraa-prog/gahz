# Contributing to Gahz جاهز

Thanks for helping people learn programming and prepare for interviews. The most valuable contribution is
a good question, and you do not need to touch any code to add one.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting set up

```bash
git clone <your fork>
cd gahz
npm install
npm run dev
```

Before you open a pull request:

```bash
npm run check    # validates question banks, type-checks, runs unit tests
```

## Adding or fixing questions

Question banks are JSON files in `src/data/`, one per topic. The format is described in the
[README](README.md#adding-questions) and enforced by `src/data/schema/question.schema.json`.

1. Open the file for the topic, or create a new `kebab-case.json` file for a new topic.
2. Add your question at the end with the next free `id` (`npm run validate:data` tells you if it clashes).
3. Run `npm run validate:data`.
4. Try it: `npm run dev`, open *Custom Categories Drill*, select only your category.

What makes a good question:

- **One clearly correct answer.** If two options are defensible, rewrite the question.
- **Plausible wrong answers.** Each distractor should be a mistake a real candidate might make.
- **Scenario over trivia.** "Requests fail with 504 at peak time; what do you check first?" teaches more than
  "What does 504 mean?".
- **An explanation that teaches.** Say why the right answer is right and why the tempting ones are wrong.
- **Your own words.** Do not copy questions from books, courses, paid question banks or real exams.
- **Accurate.** If the answer depends on a version, say which one.

Options are shuffled every time a quiz starts, so the position of the correct answer does not matter. Keep
all four options about the same length and level of detail: when the right answer is the only long, specific
one, it can be picked without knowing the topic. An option such as "None of these" stays where you put it.

## Adding a preset

Presets are defined in `src/services/presets.ts`. Add an entry with an `id`, a `modeLabel`, the number of
questions, the time limit, a `pick` function that selects the pool (by category or by bank file), and a `card`
with the title and description shown on the home screen. No other change is needed.

## Code changes

- TypeScript is strict. Avoid `any`; add types to `src/types.ts` when they are shared.
- Components render from the store and call services; they do not call each other or touch `localStorage`.
- All browser storage goes through `src/services/storage.ts`.
- No inline `style="..."` attributes or inline scripts: the site ships a strict Content-Security-Policy.
  Use a class in `src/assets/styles/main.css`.
- Escape anything that did not come from our own templates with `escapeHtml` or `formatRichText`.
- Add or update a unit test in `tests/` for logic changes.

## Pull requests

- Keep each pull request to one topic (for example "10 new PostgreSQL questions" or "fix timer on resume").
- Describe what changed and how you tested it.
- CI must pass.

## Reporting bugs and security issues

Open an issue with the steps to reproduce, what you expected, what happened, and your browser. For a
security problem, please do not open a public issue; use GitHub's private vulnerability reporting on the
repository instead.
