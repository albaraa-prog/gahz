# DevQuiz Studio

[![Live demo](https://img.shields.io/badge/demo-live-04AA6D)](https://gahz-4e276.web.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/albaraa-prog/gahz/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/albaraa-prog/gahz/actions/workflows/firebase-hosting-merge.yml)

An open-source practice platform for learning programming and getting ready for technical interviews.
320 multiple-choice questions across 28 topics, timed exams, a study mode with instant explanations, and a
dedicated **Oman & GCC enterprise interview track**.


## Features

- **Timed exams** with a countdown, a question map, flag-for-review and an auto-submit when time runs out.
- **Study mode**: see whether you were right, plus the explanation, as soon as you answer.
- **Presets**: mixed exam, Oman Enterprise & Banking Tech, Senior Flutter & Fintech, APIs & Networking,
  CS Fundamentals, Logic & IQ, and Arabic (right-to-left).
- **Custom quiz builder**: pick the categories, question count and time limit.
- **Results**: score, verdict, per-topic breakdown and a filterable review of every question.
- **History and streaks**, saved in the browser. An unfinished quiz can be resumed after closing the tab.
- **Optional cloud sync**: sign in with Email/Password or Google to back up history, settings and stats to
  Firestore and use them on other devices. Without sign-in the app is a fully working guest mode.
- **Dark and light themes**.

## Tech stack

Vite, TypeScript (strict), vanilla DOM components, a small Proxy-based reactive store, Firebase
(Auth, Firestore, Hosting), Vitest, Ajv for question validation. No UI framework.

## Architecture

```
.
├── src/
│   ├── index.html            Lightweight shell: static markup for the three screens
│   ├── app.ts                Entry point and screen router
│   ├── types.ts              Shared data models (Question, Attempt, ScoreReport, AppState, ...)
│   ├── assets/               Styles and icons
│   ├── components/           UI modules: navbar, home, custom config, question card, question map,
│   │                         timer, results, history table, modals, toasts
│   ├── data/                 Question banks, one JSON file per topic, plus schema/question.schema.json
│   ├── services/             questionLoader, quizEngine, scoring, presets, history, preferences,
│   │                         storage (safe localStorage), firebase, auth, sync, analytics
│   └── utils/                store (reactive state), state (the app store), theme, errors, helpers, dom
├── scripts/
│   ├── validate-questions.mjs        Schema and cross-file validation (runs before every build)
│   └── extract-legacy-questions.mjs  One-off migration from the original single-file app
├── tests/                    Vitest unit tests
├── legacy/index.html         The original single-file app, kept for reference
├── firebase.json             Hosting config: caching and security headers (CSP, X-Frame-Options, ...)
├── firestore.rules           Security rules
└── .github/workflows/        CI: build and deploy to Firebase Hosting on merge to main
```

How the pieces fit together:

1. **State** lives in one store (`utils/state.ts`). Components never talk to each other; they subscribe to
   the store keys they render and re-render when those change.
2. **Actions** go through services. For example a click on an answer calls `quizEngine.selectOption`, which
   updates the store and saves progress.
3. **Question banks** are loaded asynchronously, one chunk per JSON file, and validated at runtime. A bank
   that fails to load is reported and skipped; the rest of the app keeps working.
4. **Persistence** is local first. Attempts, settings and the in-progress quiz are written to localStorage
   through `services/storage.ts`, which survives a full quota, disabled storage and corrupted data.
5. **Cloud sync** (`services/sync.ts`) mirrors history and settings to Firestore when a user is signed in.
   The Firebase SDK is loaded lazily, so guests never download it.

### Firestore data model

| Path | Contents |
| --- | --- |
| `/users/{uid}` | `displayName`, `email`, `settings` (theme, study mode, custom quiz config), `stats` (attempts, best and average score, streaks), `updatedAt` |
| `/users/{uid}/attempts/{attemptId}` | One finished quiz: mode, score, duration, per-category stats, the answer given to each question, timestamps |

`firestore.rules` allows a signed-in user to read and write only their own subtree, validates the shape of
every write and makes attempts append-only.

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

The app runs in guest mode until Firebase is configured. Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Validates the question banks, type-checks and builds to `dist/` |
| `npm run preview` | Serves the production build at http://localhost:4173 |
| `npm run check` | Question validation, type-check and unit tests (what CI runs) |
| `npm run validate:data` | Validates every file in `src/data` (add `-- --verbose` for counts per category) |
| `npm test` | Unit tests |

## Firebase setup

Cloud sync is optional. To enable it:

1. Create a project in the [Firebase console](https://console.firebase.google.com) and add a **Web app**.
2. **Authentication > Sign-in method**: enable *Email/Password* and *Google*.
3. **Firestore Database**: create a database in production mode.
4. Copy `.env.example` to `.env.local` and fill in the web app config values from
   *Project settings > General > Your apps*.
5. Put your project ID in `.firebaserc` (already set to `gahz-4e276`).

Test sign-in locally with `npm run dev`. `localhost` is an authorized domain by default.

## Deploying

```bash
npm install -g firebase-tools   # once
firebase login                  # once
npm run build
firebase deploy --only hosting,firestore:rules
```

`npm run deploy` runs the last two steps together. The site is served at
`https://<project-id>.web.app`.

To preview exactly what will be deployed, including the security headers:

```bash
npm run build
firebase emulators:start --only hosting
```

### Continuous deployment

`.github/workflows/firebase-hosting-merge.yml` validates, tests, builds and deploys on every push to `main`.
In the GitHub repository settings (Secrets and variables > Actions) add:

- Secret `FIREBASE_SERVICE_ACCOUNT`: a service account key that can deploy Hosting
  (`firebase init hosting:github` creates and uploads it for you).
- Variable `FIREBASE_PROJECT_ID`.
- Variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` and, optionally,
  `VITE_FIREBASE_MEASUREMENT_ID`.

The workflow deploys Hosting only. After changing `firestore.rules`, run
`firebase deploy --only firestore:rules`.

## Adding questions

Questions live in `src/data/*.json`. Each file is an array of objects like this:

```json
{
  "id": 321,
  "category": "Databases",
  "difficulty": "medium",
  "question": "Which isolation level prevents dirty reads but allows non-repeatable reads?",
  "codeSnippet": "optional code shown under the question",
  "options": ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
  "correctAnswer": 1,
  "explanation": "READ COMMITTED only returns committed data, but a row can change between two reads."
}
```

- `id` must be unique across all files (use the next free number).
- `options` has exactly four entries and `correctAnswer` is the zero-based index of the right one.
- `difficulty` is `easy`, `medium` or `hard`.
- `**bold**` and `` `code` `` are supported in questions, options and explanations.
- A new file is picked up automatically; a new `category` appears in the custom quiz builder with no code change.

Run `npm run validate:data` before opening a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
full guide, including how to add a preset.

## Privacy

Guests: everything stays in the browser. Signed-in users: attempt history, settings and stats are stored in
the user's own Firestore record, readable only by them. Signing out removes the history from the device; it
returns on the next sign-in. Analytics events are sent only if a measurement ID is configured, and never
include question content or answers.

## License

[MIT](LICENSE)
