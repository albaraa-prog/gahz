import type { Lesson } from './types';

const QUESTION = `{
  "id": 1184,
  "category": "Docker",
  "difficulty": "easy",
  "question": "Which command lists the running containers?",
  "options": ["docker ps", "docker images", "docker logs", "docker pull"],
  "correctAnswer": 0,
  "explanation": "\`docker ps\` lists running containers; add \`-a\` to include stopped ones."
}`;

export const gitContributeToGahz: Lesson = {
  id: 'git-contribute-to-gahz',
  tag: 'Git',
  title: { en: 'Your first pull request: add a question to Gahz', ar: 'أول pull request لك: أضف سؤالاً إلى Gahz' },
  summary: {
    en: 'Walk through a real open-source contribution: fork, branch, add a question in English and Arabic, run the checks and open a pull request.',
    ar: 'عِش مساهمة حقيقية في مشروع مفتوح المصدر: fork ثم فرع، ثم سؤال بالإنجليزية والعربية، ثم تشغيل الفحوص وفتح pull request.',
  },
  minutes: 12,
  roadmapSteps: ['git_github'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'Gahz is open source: every question you practise lives in a public GitHub repository, **albaraa-prog/gahz**, and anyone can propose a new one.\n\nYou cannot push to someone else\'s repository, so the route is always the same:\n\n**1.** **Fork** the repository (your own copy on GitHub).\n**2.** **Clone** your fork and create a **branch**.\n**3.** Make the change and **commit** it.\n**4.** **Push** the branch to your fork.\n**5.** Open a **pull request**. Automatic checks run, a maintainer reviews, and the change is merged.\n\nThe same five steps work for almost every open-source project.',
        ar: 'Gahz مشروع مفتوح المصدر: كل سؤال تتدرّب عليه محفوظ في مستودع عام على GitHub هو **albaraa-prog/gahz**، ولأي شخص أن يقترح سؤالاً جديداً.\n\nلا تستطيع الدفع إلى مستودع غيرك، فالطريق واحد دائماً:\n\n**1.** أنشئ **fork** للمستودع (نسختك الخاصة على GitHub).\n**2.** انسخ الـ fork إلى جهازك (**clone**) وأنشئ **فرعاً**.\n**3.** نفّذ التعديل واحفظه في **commit**.\n**4.** ادفع الفرع إلى الـ fork (**push**).\n**5.** افتح **pull request**. تعمل الفحوص الآلية، ثم يراجع المشرف التعديل ويدمجه.\n\nالخطوات الخمس نفسها تصلح لمعظم المشاريع المفتوحة المصدر.',
      },
      code: 'https://github.com/albaraa-prog/gahz   (the original, "upstream")\n        |  Fork\n        v\nhttps://github.com/YOU/gahz            (your fork, "origin")\n        |  git clone\n        v\nyour computer                          (branch, commit, push)',
    },
    {
      kind: 'order',
      text: {
        en: 'You have forked the repository on GitHub. Put the commands in the order you would run them to send a new question.',
        ar: 'أنشأت fork للمستودع على GitHub. رتّب الأوامر بالترتيب الذي تنفّذها به لإرسال سؤال جديد.',
      },
      lines: [
        'git clone https://github.com/YOU/gahz.git',
        'cd gahz',
        'git switch -c add-docker-question',
        'git add src/data',
        'git commit -m "Add a Docker question"',
        'git push -u origin add-docker-question',
      ],
      hint: {
        en: 'Get the code, enter the folder, create the branch before you change anything, then stage, commit and push.',
        ar: 'احصل على الشيفرة، ادخل المجلد، أنشئ الفرع قبل أي تعديل، ثم جهّز التعديل واحفظه وادفعه.',
      },
      explain: {
        en: 'Create the branch **before** editing so your `main` stays identical to the original. `git add` stages the files, `git commit` records them locally, and `git push -u origin <branch>` uploads the branch to your fork and remembers where it goes.',
        ar: 'أنشئ الفرع **قبل** التعديل ليبقى `main` عندك مطابقاً للأصل. `git add` يجهّز الملفات، و`git commit` يسجّلها محلياً، و`git push -u origin <branch>` يرفع الفرع إلى الـ fork ويتذكّر وجهته.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Questions are stored as "banks": one JSON file per topic. Where does a new Docker question go?',
        ar: 'تُحفظ الأسئلة في «بنوك»: ملف JSON لكل موضوع. أين يوضع سؤال جديد عن Docker؟',
      },
      options: ['src/data/docker.json', 'src/app.ts', 'public/questions.html', '.github/workflows/ci.yml'],
      answer: 0,
      hint: {
        en: 'Look for the folder that holds data, and the file named after the topic.',
        ar: 'ابحث عن المجلد الذي يحفظ البيانات، وعن الملف المسمّى باسم الموضوع.',
      },
      explain: {
        en: 'Every file in `src/data/` is a bank, and the app loads all of them automatically. For a brand-new topic you create a new `kebab-case.json` file there; no code change is needed for the question to appear in custom quizzes.',
        ar: 'كل ملف في `src/data/` بنك، والتطبيق يحمّلها كلها تلقائياً. ولموضوع جديد تماماً تنشئ هناك ملفاً جديداً باسم `kebab-case.json`؛ ولا يلزم تعديل الشيفرة ليظهر السؤال في الاختبارات المخصّصة.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'A question is one JSON object added at the end of the array. Complete the missing field names.',
        ar: 'السؤال كائن JSON واحد يُضاف في آخر المصفوفة. أكمل أسماء الحقول الناقصة.',
      },
      template:
        '{\n  "___": 1184,\n  "category": "Docker",\n  "difficulty": "easy",\n  "question": "Which command lists the running containers?",\n  "___": ["docker ps", "docker images", "docker logs", "docker pull"],\n  "___": 0,\n  "explanation": "`docker ps` lists running containers."\n}',
      answers: ['id', 'options', 'correctAnswer'],
      distractors: ['answers', 'key', 'correct'],
      hint: {
        en: 'A unique number, the four choices, and the zero-based position of the right one.',
        ar: 'رقم فريد، ثم الخيارات الأربعة، ثم موضع الخيار الصحيح بدءاً من الصفر.',
      },
      explain: {
        en: '`id` must be unique across **all** banks, so use the next free number. `options` always has exactly four entries and `correctAnswer` is the index of the right one, counted from 0. `difficulty` is `easy`, `medium` or `hard`.',
        ar: '`id` يجب أن يكون فريداً عبر **كل** البنوك، فاستخدم الرقم الحرّ التالي. و`options` فيها أربعة عناصر بالضبط، و`correctAnswer` فهرس الخيار الصحيح بدءاً من 0. و`difficulty` تكون `easy` أو `medium` أو `hard`.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Gahz is bilingual. Where does the Arabic version of question 1184 go?',
        ar: 'Gahz ثنائي اللغة. أين توضع النسخة العربية من السؤال 1184؟',
      },
      code: QUESTION,
      options: [
        {
          en: 'In `src/data/ar/docker.json`, under the key `"1184"`, with the options in the same order.',
          ar: 'في `src/data/ar/docker.json` تحت المفتاح `"1184"`، مع الخيارات بالترتيب نفسه.',
        },
        {
          en: 'In `src/data/docker.json`, as a second question with a new id and Arabic text.',
          ar: 'في `src/data/docker.json` كسؤال ثانٍ بمعرّف جديد ونص عربي.',
        },
        {
          en: 'Nowhere: the app translates questions automatically when the language changes.',
          ar: 'لا مكان لها: فالتطبيق يترجم الأسئلة تلقائياً عند تغيير اللغة.',
        },
      ],
      answer: 0,
      hint: {
        en: 'The translation is tied to the same question, so it must share its id.',
        ar: 'الترجمة مرتبطة بالسؤال نفسه، فلا بد أن تشاركه المعرّف.',
      },
      explain: {
        en: 'The Arabic file maps a question id to its translated `question`, `options` and `explanation`. The options must stay in the same order as the English bank, because `correctAnswer` is shared. Keep code, commands and product names in English.',
        ar: 'الملف العربي يربط معرّف السؤال بترجمة `question` و`options` و`explanation`. ويجب أن تبقى الخيارات بترتيب البنك الإنجليزي نفسه لأن `correctAnswer` مشترك. وأبقِ الشيفرة والأوامر وأسماء المنتجات بالإنجليزية.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Before you commit, run the same checks that GitHub will run on your pull request.',
        ar: 'قبل الـ commit، شغّل الفحوص نفسها التي سيشغّلها GitHub على الـ pull request.',
      },
      template: 'npm ___            # once, after cloning\nnpm run ___        # validates the banks, type-checks, runs the tests\nnpm run ___          # try your question in the browser',
      answers: ['install', 'check', 'dev'],
      distractors: ['deploy', 'publish', 'start'],
      hint: {
        en: 'First get the dependencies, then verify, then look at the result locally. Contributors never deploy.',
        ar: 'أولاً ثبّت الاعتماديات، ثم تحقّق، ثم شاهد النتيجة محلياً. والمساهمون لا ينشرون أبداً.',
      },
      explain: {
        en: '`npm run check` reports a duplicate id, a missing field, a translation with the wrong number of options and more. If it passes on your machine, the pull request check will almost certainly pass too. Deployment happens automatically when a maintainer merges.',
        ar: '`npm run check` يبلّغ عن معرّف مكرّر أو حقل ناقص أو ترجمة بعدد خيارات خاطئ وغير ذلك. إن نجح على جهازك فسينجح فحص الـ pull request في الغالب. أما النشر فيجري تلقائياً حين يدمج المشرف التعديل.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'You opened the pull request and the check named `check` turned red. What do you do?',
        ar: 'فتحت الـ pull request فأصبح الفحص المسمّى `check` أحمر. ماذا تفعل؟',
      },
      options: [
        {
          en: 'Open the failed run, read the error, fix it locally and push another commit to the same branch.',
          ar: 'تفتح التشغيل الفاشل وتقرأ الخطأ، ثم تصلحه محلياً وتدفع commit آخر إلى الفرع نفسه.',
        },
        {
          en: 'Close the pull request and open a new one with the same commits.',
          ar: 'تغلق الـ pull request وتفتح آخر بالـ commits نفسها.',
        },
        {
          en: 'Ask the maintainer to merge anyway, since it is only a question.',
          ar: 'تطلب من المشرف الدمج على أي حال، فهو مجرد سؤال.',
        },
      ],
      answer: 0,
      hint: {
        en: 'A pull request follows its branch. What happens when the branch gets a new commit?',
        ar: 'الـ pull request يتبع فرعه. ماذا يحدث حين يصل commit جديد إلى الفرع؟',
      },
      explain: {
        en: 'Pushing to the branch updates the pull request and re-runs the checks; there is no need to open a new one. The `main` branch is protected: it accepts changes only through a pull request whose checks pass, so nobody, including the maintainer, can merge a red one by accident.',
        ar: 'الدفع إلى الفرع يحدّث الـ pull request ويعيد تشغيل الفحوص، فلا حاجة إلى فتح آخر. والفرع `main` محمي: لا يقبل التعديلات إلا عبر pull request نجحت فحوصه، فلا يستطيع أحد، حتى المشرف، دمج فحص أحمر سهواً.',
      },
    },
  ],
};
