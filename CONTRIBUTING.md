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

## Adding an interactive lesson

Lessons are short, hands-on walkthroughs ("Learn by doing" on the home screen). Each one is a TypeScript file in
`src/lessons/` that exports a `Lesson`; the shapes are documented in `src/lessons/types.ts`.

1. Copy an existing lesson, give it a new kebab-case `id`, and add it to the list in `src/lessons/index.ts`.
2. Write every piece of prose in both languages (`{ en: '…', ar: '…' }`). Code and program output are written once.
3. Start with an `explain` step, then mix the exercise kinds:
   - `choice`: pick one option, for example "what does this print?"
   - `blank`: fill the `___` gaps in a code template from a bank of tokens
   - `order`: put shuffled lines back in order (make sure only one order is correct)
   - `code`: write JavaScript, or Python with `language: 'python'`, that runs in the browser and must pass `tests`
4. Give every exercise a `hint` that nudges without giving the answer away and an `explain` that says why.
5. List the roadmap steps the lesson belongs to in `roadmapSteps`; it is then offered on those steps.
6. Run `npm test`. It checks both languages and runs each code exercise's `solution` against its `tests`.

Code exercises run JavaScript or Python. In a Python exercise the test calls are Python expressions and only
the standard library is available: no `input()`, no files, no packages such as NumPy. Expected values are
written as JSON: a tuple counts as a list, a set as a sorted list, and the order of dictionary keys does not
matter. For other languages use `choice`, `blank` and `order`.

## Adding a free course or certificate

Each roadmap step lists free courses in `src/services/resources.ts`. To add one:

1. Open the link yourself and make sure the course can be studied for free, without a trial or a card.
2. Use `certificate(...)` only when the provider also gives a certificate or badge at no cost; otherwise use
   `course(...)`. If only the exam is paid, say so in the description.
3. Link to the provider's own page over https, with no tracking parameters.
4. Keep the provider's own course name as the title and describe it in one line in English and Arabic.

`npm test` checks that every step has at least one entry and that each entry is complete.

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
