import type { Lesson } from './types';

export const vibeCodingSafely: Lesson = {
  id: 'vibe-coding-safely',
  tag: 'Claude · AI tools',
  title: { en: 'Build with Claude and vibe coding tools, safely', ar: 'ابنِ مع Claude وأدوات الـ vibe coding بأمان' },
  summary: {
    en: 'A working routine for Claude Code, Cursor, Lovable, Bolt and v0: a clear first prompt, small steps, project rules, and the security checks that AI-built apps most often miss.',
    ar: 'أسلوب عمل لـ Claude Code و Cursor و Lovable و Bolt و v0: prompt أول واضح، وخطوات صغيرة، وقواعد للمشروع، والفحوص الأمنية التي تغفل عنها التطبيقات المبنية بالذكاء الاصطناعي غالباً.',
  },
  minutes: 12,
  roadmapSteps: ['claude_code', 'vibe_coding'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: '**Vibe coding** means describing what you want and letting an AI write the code. The tools come in three kinds:\n\n**Chat**: Claude or ChatGPT in the browser, good for questions, plans and small prototypes.\n**Agents in your project**: Claude Code, Cursor and Windsurf read your files, edit them and run commands.\n**App builders**: Lovable, Bolt, v0 and Replit build and host a whole app from a prompt.\n\nThey all work best with the same routine: **say clearly what you want, take one small step, run it, read the change, save a checkpoint**.',
        ar: '**الـ vibe coding** هو أن تصف ما تريده وتترك الذكاء الاصطناعي يكتب الشيفرة. والأدوات ثلاثة أنواع:\n\n**المحادثة**: Claude أو ChatGPT في المتصفح، وتناسب الأسئلة والخطط والنماذج الصغيرة.\n**وكلاء داخل مشروعك**: Claude Code و Cursor و Windsurf تقرأ ملفاتك وتعدّلها وتشغّل الأوامر.\n**أدوات بناء التطبيقات**: Lovable و Bolt و v0 و Replit تبني تطبيقاً كاملاً من prompt وتستضيفه.\n\nوكلها تعمل أفضل بالأسلوب نفسه: **قل بوضوح ما تريد، خذ خطوة صغيرة واحدة، شغّلها، اقرأ التغيير، احفظ نقطة عودة**.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'You want a small app for study notes. Which first prompt gives the best start?',
        ar: 'تريد تطبيقاً صغيراً لملاحظات المذاكرة. أي prompt أول يعطي أفضل بداية؟',
      },
      options: [
        {
          en: 'A notes app for students. Users sign in, create notes with a title and text, and search them. Start with the notes list page only.',
          ar: 'تطبيق ملاحظات للطلاب. يسجّل المستخدمون الدخول وينشئون ملاحظات بعنوان ونص ويبحثون فيها. ابدأ بصفحة قائمة الملاحظات فقط.',
        },
        { en: 'Build me the best notes app in the world.', ar: 'ابنِ لي أفضل تطبيق ملاحظات في العالم.' },
        {
          en: 'Make an app with notes, chat, payments, AI, a blog and an admin panel.',
          ar: 'اصنع تطبيقاً فيه ملاحظات ومحادثة ومدفوعات وذكاء اصطناعي ومدوّنة ولوحة إدارة.',
        },
      ],
      answer: 0,
      hint: {
        en: 'Which prompt says who uses the app, what it stores, and where to start?',
        ar: 'أي prompt يذكر من يستخدم التطبيق، وماذا يخزّن، ومن أين يبدأ؟',
      },
      explain: {
        en: 'The tool fills every gap with a guess. A short specification (users, core features, data) removes the guessing, and "start with one page" keeps the first step small enough to check. Add the next feature only when this one works.',
        ar: 'الأداة تملأ كل فراغ بتخمين. والمواصفات القصيرة (المستخدمون والميزات الأساسية والبيانات) تزيل التخمين، وعبارة «ابدأ بصفحة واحدة» تُبقي الخطوة الأولى صغيرة بما يكفي لفحصها. ولا تضف الميزة التالية إلا بعد أن تعمل هذه.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Agents forget everything between sessions. A rules file fixes that: `CLAUDE.md` for Claude Code, project rules in Cursor. Complete this one.',
        ar: 'الوكلاء ينسون كل شيء بين الجلسات. وملف القواعد يعالج ذلك: `CLAUDE.md` في Claude Code، وقواعد المشروع في Cursor. أكمل هذا الملف.',
      },
      template:
        '# Notes app\n\n## Commands\n- Run the tests with: npm ___\n\n## Rules\n- Never commit the ___ file\n- Ask before adding a new ___',
      answers: ['test', '.env', 'dependency'],
      distractors: ['publish', 'README', 'comment'],
      hint: {
        en: 'Think of the command that checks the work, the file that holds secrets, and the thing an agent likes to install.',
        ar: 'فكّر في الأمر الذي يفحص العمل، والملف الذي يحمل الأسرار، والشيء الذي يحبّ الوكيل تثبيته.',
      },
      explain: {
        en: 'Good rules are short and specific: how to verify the work, and what must never happen. In Claude Code, `/init` writes a first `CLAUDE.md` for you. Keep secrets out of it, because the file is committed with the code.',
        ar: 'القواعد الجيدة قصيرة ومحدّدة: كيف يُتحقَّق من العمل، وما الذي يجب ألا يحدث أبداً. وفي Claude Code يكتب `/init` أول `CLAUDE.md` عنك. وأبعِد الأسرار عنه، لأن الملف يودَع مع الشيفرة.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'Arrange a safe session with an agent: a branch first, then the task, then your review, then the checkpoint.',
        ar: 'رتّب جلسة آمنة مع وكيل: الفرع أولاً، ثم المهمة، ثم مراجعتك، ثم نقطة العودة.',
      },
      lines: [
        'git checkout -b add-search',
        'claude "Add search to the notes page, then run the tests"',
        'git diff',
        'git commit -am "Add search to the notes page"',
      ],
      hint: {
        en: 'You cannot review a change before it exists, and you should not save it before you have read it.',
        ar: 'لا يمكنك مراجعة تغيير قبل وجوده، ولا ينبغي أن تحفظه قبل أن تقرأه.',
      },
      explain: {
        en: 'The branch keeps `main` working. The prompt includes a way to verify ("run the tests"). `git diff` is your review: look for edits you did not ask for, deleted tests and new packages. The commit is the checkpoint you return to when the next step goes wrong.',
        ar: 'الفرع يُبقي `main` يعمل. والـ prompt يتضمّن وسيلة تحقّق («شغّل الاختبارات»). و`git diff` هو مراجعتك: ابحث عن تعديلات لم تطلبها واختبارات محذوفة وحزم جديدة. والإيداع هو نقطة العودة حين تسوء الخطوة التالية.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'An app builder generated this code for the page that runs in the visitor\'s browser. What must change before you publish?',
        ar: 'ولّدت أداة بناء هذه الشيفرة للصفحة التي تعمل في متصفح الزائر. ما الذي يجب تغييره قبل النشر؟',
      },
      code: 'const AI_KEY = "sk-proj-4f9a...";\n\nasync function summarize(note) {\n  return fetch("https://api.example-ai.com/v1/chat", {\n    method: "POST",\n    headers: { Authorization: "Bearer " + AI_KEY },\n    body: JSON.stringify({ prompt: note }),\n  });\n}',
      options: [
        {
          en: 'The secret key: move the call to a server function that reads the key from an environment variable.',
          ar: 'المفتاح السري: انقل الاستدعاء إلى دالة في الخادم تقرأ المفتاح من متغيّر بيئة.',
        },
        {
          en: 'The function name: `summarize` is too short for a production app.',
          ar: 'اسم الدالة: `summarize` أقصر من أن يصلح لتطبيق إنتاجي.',
        },
        {
          en: 'The method: `POST` should be `GET` so that the request is faster.',
          ar: 'الطريقة: يجب أن تكون `POST` هي `GET` ليصبح الطلب أسرع.',
        },
      ],
      answer: 0,
      hint: {
        en: 'Anyone can open the developer tools and read everything the browser receives.',
        ar: 'أي شخص يستطيع فتح أدوات المطوّر وقراءة كل ما يستلمه المتصفح.',
      },
      explain: {
        en: 'Code in the browser is public, so the key is public, and someone else can spend your credit with it. Secrets live on the server. Tell the tool: "never put secret keys in client code; call the AI from a server function". If a key was ever published, revoke it.',
        ar: 'الشيفرة في المتصفح علنية، فالمفتاح علني، وقد ينفق غيرك رصيدك به. الأسرار مكانها الخادم. قل للأداة: «لا تضع مفاتيح سرية في شيفرة العميل أبداً، واستدعِ الذكاء الاصطناعي من دالة في الخادم». وإن نُشر مفتاح يوماً فأبطِله.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'The app stores notes in a hosted database such as Supabase. How do you check that users cannot read each other\'s notes?',
        ar: 'يخزّن التطبيق الملاحظات في قاعدة بيانات مستضافة مثل Supabase. كيف تتحقّق أن المستخدمين لا يقرؤون ملاحظات بعضهم؟',
      },
      options: [
        {
          en: 'Sign in as a second user and try to open the first user\'s notes, in the page and through the API.',
          ar: 'سجّل الدخول بمستخدم ثانٍ وحاول فتح ملاحظات الأول، من الصفحة وعبر الـ API.',
        },
        {
          en: 'Ask the AI whether the app is secure and continue if it says yes.',
          ar: 'اسأل الذكاء الاصطناعي هل التطبيق آمن وواصل إن قال نعم.',
        },
        {
          en: 'Check that the notes page does not show a link to other users.',
          ar: 'تأكّد أن صفحة الملاحظات لا تعرض رابطاً إلى مستخدمين آخرين.',
        },
      ],
      answer: 0,
      hint: {
        en: 'Hiding a button is not access control. Who enforces the rule when the page is bypassed?',
        ar: 'إخفاء الزر ليس تحكّماً في الوصول. من يفرض القاعدة حين يُتجاوَز استخدام الصفحة؟',
      },
      explain: {
        en: 'Access must be enforced where the data lives: Row Level Security policies in Supabase, security rules in Firebase, or checks in your server code. AI-built apps often ship without them, because the demo works either way. Testing as a second user is the proof.',
        ar: 'يجب فرض الوصول حيث تعيش البيانات: سياسات Row Level Security في Supabase، أو قواعد الأمان في Firebase، أو فحوص في شيفرة خادمك. والتطبيقات المبنية بالذكاء الاصطناعي تُنشر كثيراً دونها، لأن العرض التجريبي يعمل في الحالتين. والاختبار بمستخدم ثانٍ هو البرهان.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'The AI has tried to fix the same error four times and each attempt breaks something else. What now?',
        ar: 'حاول الذكاء الاصطناعي إصلاح الخطأ نفسه أربع مرات، وكل محاولة تعطّل شيئاً آخر. ماذا الآن؟',
      },
      options: [
        {
          en: 'Return to the last commit, open a fresh chat and give the exact error message.',
          ar: 'عُد إلى آخر إيداع، وافتح محادثة جديدة، وأعطِ رسالة الخطأ بنصّها.',
        },
        { en: 'Repeat "it still does not work" until it does.', ar: 'كرّر «ما زال لا يعمل» حتى يعمل.' },
        { en: 'Ask it to rewrite the whole app from zero.', ar: 'اطلب منه إعادة كتابة التطبيق كله من الصفر.' },
      ],
      answer: 0,
      hint: {
        en: 'A long conversation full of failed attempts confuses the model. What did the commits give you?',
        ar: 'المحادثة الطويلة المليئة بالمحاولات الفاشلة تربك النموذج. ماذا منحتك الإيداعات؟',
      },
      explain: {
        en: 'Go back to a version that works, clear the context (`/clear` in Claude Code, a new chat elsewhere) and describe the problem precisely. Ask for the cause before the fix. And read the failing code yourself: understanding your own app is what keeps you from getting stuck.',
        ar: 'عُد إلى نسخة تعمل، وامسح السياق (`/clear` في Claude Code، أو محادثة جديدة في غيره)، وصِف المشكلة بدقّة. واطلب السبب قبل الإصلاح. واقرأ الشيفرة الفاشلة بنفسك: ففهمك لتطبيقك هو ما يحميك من التعثّر.',
      },
    },
    {
      kind: 'explain',
      text: {
        en: 'Before real users arrive, go through this list:\n\n**1.** No secret keys in the browser code or in Git.\n**2.** Each user reaches only their own data (test it as a second user).\n**3.** Input is validated on the server, not only in the page.\n**4.** Sign-in uses a proven service, not home-made password code.\n**5.** You have read the dependencies the AI added.\n**6.** The code is in Git and you can explain what it does.\n\nVibe coding is a fast way to start. Reviewing, testing and understanding are what make the result yours.',
        ar: 'قبل وصول المستخدمين الحقيقيين، راجع هذه القائمة:\n\n**1.** لا مفاتيح سرية في شيفرة المتصفح ولا في Git.\n**2.** كل مستخدم يصل إلى بياناته فقط (اختبر ذلك بمستخدم ثانٍ).\n**3.** المدخلات تُفحص في الخادم، لا في الصفحة فقط.\n**4.** تسجيل الدخول عبر خدمة مجرَّبة، لا بشيفرة كلمات مرور من صنعك.\n**5.** قرأت الاعتماديات التي أضافها الذكاء الاصطناعي.\n**6.** الشيفرة في Git وتستطيع شرح ما تفعله.\n\nالـ vibe coding طريقة سريعة للبدء. أما المراجعة والاختبار والفهم فهي ما يجعل النتيجة لك.',
      },
    },
  ],
};
