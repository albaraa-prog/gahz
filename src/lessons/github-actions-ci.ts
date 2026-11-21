import type { Lesson } from './types';

const CI = `name: CI

on:
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check`;

export const githubActionsCi: Lesson = {
  id: 'github-actions-ci',
  tag: 'CI/CD',
  title: { en: 'Turn on CI/CD with GitHub Actions', ar: 'فعّل CI/CD بـ GitHub Actions' },
  summary: {
    en: 'Write a workflow that tests every pull request, make it a required check, and deploy automatically when a change is merged.',
    ar: 'اكتب workflow يختبر كل pull request، واجعله فحصاً إلزامياً، وانشر تلقائياً عند دمج أي تعديل.',
  },
  minutes: 12,
  roadmapSteps: ['cicd'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: '**CI** (continuous integration) means a machine builds and tests every change. **CD** (continuous deployment) means a change that passed is released automatically.\n\nOn GitHub you turn both on by adding YAML files to `.github/workflows/`. Nothing else has to be installed. The file below is the real CI of Gahz:\n\n- `on` says **when** it runs (every pull request).\n- `jobs` lists the work; each job runs on a fresh machine, the **runner**.\n- `steps` run in order. `uses` calls a ready-made action, `run` executes a shell command.',
        ar: '**CI** (التكامل المستمر) يعني أن آلة تبني كل تعديل وتختبره. و**CD** (النشر المستمر) يعني أن التعديل الناجح يُنشر تلقائياً.\n\nعلى GitHub تفعّل الاثنين بإضافة ملفات YAML إلى `.github/workflows/`، ولا يلزم تثبيت شيء آخر. الملف في الأسفل هو الـ CI الفعلي لـ Gahz:\n\n- `on` تحدّد **متى** يعمل (مع كل pull request).\n- `jobs` تسرد العمل؛ كل مهمة تعمل على آلة جديدة هي الـ **runner**.\n- `steps` تُنفَّذ بالترتيب. `uses` تستدعي action جاهزاً، و`run` تنفّذ أمر shell.',
      },
      code: CI,
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the workflow so it runs on every pull request, on a Linux runner.',
        ar: 'أكمل الـ workflow ليعمل مع كل pull request على runner بنظام Linux.',
      },
      template: 'name: CI\n\n___:\n  pull_request:\n\njobs:\n  check:\n    ___: ubuntu-latest\n    ___:\n      - uses: actions/checkout@v4\n      - run: npm ci',
      answers: ['on', 'runs-on', 'steps'],
      distractors: ['when', 'machine', 'tasks'],
      hint: {
        en: 'One key names the trigger, one the machine, one the list of things to do.',
        ar: 'مفتاح يسمّي المشغّل، وآخر يسمّي الآلة، وثالث يسرد ما يجب تنفيذه.',
      },
      explain: {
        en: '`on` holds the triggers, `runs-on` picks the runner and `steps` is the ordered list of actions and commands. Save the file as `.github/workflows/ci.yml`, push it, and the workflow appears under the repository\'s **Actions** tab.',
        ar: '`on` تحمل المشغّلات، و`runs-on` تختار الـ runner، و`steps` قائمة مرتّبة من الـ actions والأوامر. احفظ الملف باسم `.github/workflows/ci.yml` وادفعه، فيظهر الـ workflow في تبويب **Actions** في المستودع.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'A runner starts empty: no code, no dependencies. Put the job in a working order.',
        ar: 'الـ runner يبدأ فارغاً: بلا شيفرة ولا اعتماديات. رتّب المهمة ترتيباً يعمل.',
      },
      lines: ['jobs:', '  check:', '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@v4', '      - run: npm ci', '      - run: npm run check'],
      hint: {
        en: 'YAML nests by indentation. Inside the steps: get the code, install, then test.',
        ar: 'YAML تتداخل بالإزاحة. وداخل الخطوات: اجلب الشيفرة، ثم ثبّت، ثم اختبر.',
      },
      explain: {
        en: '`actions/checkout` downloads your repository onto the runner; without it there is no `package.json` to install from. `npm ci` installs exactly what the lock file lists, and only then can the tests run. If any step fails, the job stops and the check turns red.',
        ar: '`actions/checkout` ينزّل مستودعك إلى الـ runner؛ وبدونه لا يوجد `package.json` للتثبيت منه. و`npm ci` يثبّت ما في ملف القفل بالضبط، وبعدها فقط تعمل الاختبارات. وإذا فشلت أي خطوة توقفت المهمة وصار الفحص أحمر.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'The workflow runs, but people can still merge a pull request whose check failed. How do you make the check mandatory?',
        ar: 'الـ workflow يعمل، لكن ما زال ممكناً دمج pull request فشل فحصه. كيف تجعل الفحص إلزامياً؟',
      },
      options: [
        {
          en: 'In Settings > Rules, add a ruleset for `main` that requires a pull request and the status check `check`.',
          ar: 'في Settings > Rules تضيف ruleset للفرع `main` يشترط pull request وفحص الحالة `check`.',
        },
        {
          en: 'In the workflow file, add `required: true` under the job name.',
          ar: 'في ملف الـ workflow تضيف `required: true` تحت اسم المهمة.',
        },
        {
          en: 'In `package.json`, add a `premerge` script that runs the tests.',
          ar: 'في `package.json` تضيف سكربتاً باسم `premerge` يشغّل الاختبارات.',
        },
      ],
      answer: 0,
      hint: {
        en: 'A workflow only reports a result. Something else decides what may enter the branch.',
        ar: 'الـ workflow يبلّغ بالنتيجة فقط. وشيء آخر يقرّر ما يدخل الفرع.',
      },
      explain: {
        en: 'Branch protection is a repository setting, not part of the workflow. A ruleset (or a classic branch protection rule) can require pull requests, passing status checks and reviews, and block force pushes. The check is named after the **job**, here `check`.',
        ar: 'حماية الفرع إعداد في المستودع لا جزء من الـ workflow. الـ ruleset (أو قاعدة حماية الفرع التقليدية) يشترط طلبات السحب ونجاح فحوص الحالة والمراجعات، ويمنع الدفع القسري. ويحمل الفحص اسم **المهمة**، وهو هنا `check`.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Now the CD half. This second workflow deploys the site every time a change lands on `main`. Complete it.',
        ar: 'والآن نصف الـ CD. هذا الـ workflow الثاني ينشر الموقع كلما وصل تعديل إلى `main`. أكمله.',
      },
      template:
        'name: Deploy\n\non:\n  ___:\n    branches: [main]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm run build\n      - run: npx firebase-tools deploy --only hosting\n        env:\n          GOOGLE_APPLICATION_CREDENTIALS: ${{ ___.GCP_KEY_FILE }}',
      answers: ['push', 'secrets'],
      distractors: ['pull_request', 'vars', 'merge'],
      hint: {
        en: 'Merging a pull request adds commits to `main`. And a key that grants deploy access must not be readable.',
        ar: 'دمج الـ pull request يضيف commits إلى `main`. والمفتاح الذي يمنح صلاحية النشر يجب ألا يكون مقروءاً.',
      },
      explain: {
        en: 'A merge is a `push` to `main`, so that trigger means "deploy what was reviewed". Credentials go in **Settings > Secrets and variables > Actions**: secrets are encrypted, hidden in logs and not given to pull requests from forks. Plain configuration that is not sensitive can live in `vars`.',
        ar: 'الدمج هو `push` إلى `main`، فهذا المشغّل يعني «انشر ما روجع». وبيانات الاعتماد توضع في **Settings > Secrets and variables > Actions**: الأسرار مشفّرة ومحجوبة في السجلات ولا تُعطى لطلبات السحب القادمة من الـ forks. أما الإعدادات غير الحساسة فمكانها `vars`.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Why does Gahz keep CI and deployment in two separate workflows instead of one?',
        ar: 'لماذا يفصل Gahz الـ CI عن النشر في workflowين بدلاً من واحد؟',
      },
      options: [
        {
          en: 'So code from pull requests, which is not trusted yet, never runs in a job that holds the deploy key.',
          ar: 'كي لا تعمل شيفرة طلبات السحب، وهي غير موثوقة بعد، في مهمة تحمل مفتاح النشر.',
        },
        {
          en: 'Because GitHub allows only one job in each workflow file.',
          ar: 'لأن GitHub يسمح بمهمة واحدة فقط في كل ملف workflow.',
        },
        {
          en: 'Because two short files run faster than one long file.',
          ar: 'لأن ملفين قصيرين يعملان أسرع من ملف واحد طويل.',
        },
      ],
      answer: 0,
      hint: {
        en: 'Think about who can change the test scripts in a pull request, and what those scripts could read.',
        ar: 'فكّر فيمن يستطيع تغيير سكربتات الاختبار في pull request، وفيما قد تقرؤه تلك السكربتات.',
      },
      explain: {
        en: 'A pull request can modify any script the CI runs. The CI workflow therefore has read-only permissions and no secrets, which makes it safe for forks. Only the deploy workflow, triggered by pushes to the protected `main` branch, can see the key. This separation is the core of CI/CD security.',
        ar: 'الـ pull request قد يعدّل أي سكربت يشغّله الـ CI. ولذلك لـ workflow الـ CI صلاحية قراءة فقط وبلا أسرار، فيكون آمناً مع الـ forks. ولا يرى المفتاح إلا workflow النشر الذي تشغّله عمليات الدفع إلى الفرع المحمي `main`. وهذا الفصل هو لبّ أمان CI/CD.',
      },
    },
  ],
};
