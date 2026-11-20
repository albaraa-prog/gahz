import type { Lesson } from './types';

const SKILL_FILE = `---
name: status-report
description: Write the weekly status report in the team format. Use when the user asks for a status report or a weekly update.
---

# Weekly status report
1. Ask which project the report is for.
2. List what was finished, what is in progress and what is blocked.
3. Keep it under 150 words. No tables.`;

export const aiSkillsTools: Lesson = {
  id: 'ai-skills-tools',
  tag: 'AI',
  title: { en: 'Skills, tools and plugins for AI assistants', ar: 'المهارات والأدوات والإضافات لمساعدات الذكاء الاصطناعي' },
  summary: {
    en: 'Go beyond the prompt: give an assistant tools to act with, write your first SKILL.md, and learn what MCP servers and plugins add.',
    ar: 'تجاوز حدود الـ prompt: أعطِ المساعد أدوات يعمل بها، واكتب أول ملف SKILL.md لك، وتعرّف على ما تضيفه خوادم MCP والـ plugins.',
  },
  minutes: 12,
  roadmapSteps: ['ai_skills_plugins', 'prompt_engineering'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'A prompt tells a model what you want **this time**. Three more building blocks make an assistant useful every time:\n\n**Tools** let it act: search, read a file, call an API.\n**Skills** teach it how your kind of task is done: written instructions it loads when they are needed.\n**Plugins** package skills, commands and tool connections so a whole team can install them in one step.\n\nA model that uses tools in a loop until the task is done is called an **agent**.',
        ar: 'الـ prompt يخبر النموذج بما تريده **هذه المرة**. وهناك ثلاث لبنات أخرى تجعل المساعد مفيداً في كل مرة:\n\n**الأدوات (tools)** تتيح له أن يعمل: يبحث، يقرأ ملفاً، يستدعي API.\n**المهارات (skills)** تعلّمه كيف يُنجَز نوع مهامك: تعليمات مكتوبة يحمّلها عند الحاجة.\n**الإضافات (plugins)** تجمع المهارات والأوامر واتصالات الأدوات في حزمة يثبّتها الفريق كله بخطوة واحدة.\n\nوالنموذج الذي يستخدم الأدوات في حلقة حتى تنتهي المهمة يسمّى **agent**.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'This is how a tool is described to a model. The model never sees the code behind it. What does it use to decide **when** to call this tool?',
        ar: 'هكذا تُوصَف الأداة للنموذج، وهو لا يرى الكود الذي خلفها أبداً. علامَ يعتمد ليقرّر **متى** يستدعي هذه الأداة؟',
      },
      code: `{
  "name": "get_order_status",
  "description": "Look up one order by its number and return its status and delivery date. Use when the user asks where an order is.",
  "input_schema": {
    "type": "object",
    "properties": { "order_number": { "type": "string" } },
    "required": ["order_number"]
  }
}`,
      options: [
        { en: 'The name and the description', ar: 'الاسم والوصف' },
        { en: 'The source code of the function', ar: 'الكود المصدري للدالة' },
        { en: 'The number of times the tool was used before', ar: 'عدد مرات استخدام الأداة سابقاً' },
      ],
      answer: 0,
      hint: {
        en: 'Which parts of the definition are written in plain language for a reader?',
        ar: 'أي أجزاء التعريف مكتوبة بلغة عادية موجّهة إلى قارئ؟',
      },
      explain: {
        en: 'The description is a small prompt. Say what the tool does, what it returns and when to use it. The schema then tells the model which arguments to send. Vague descriptions are the usual reason a model picks the wrong tool.',
        ar: 'الوصف prompt صغير. اذكر ما تفعله الأداة، وما تُرجعه، ومتى تُستخدم. ثم يبيّن المخطط (schema) للنموذج أيّ المعاملات يرسل. والأوصاف الغامضة هي السبب المعتاد لاختيار النموذج الأداة الخطأ.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'The model cannot run anything itself. Put the steps of one tool call in order, written here as comments.',
        ar: 'النموذج لا يستطيع تشغيل أي شيء بنفسه. رتّب خطوات استدعاء أداة واحدة، وهي مكتوبة هنا كتعليقات.',
      },
      lines: [
        '// app: send the user message and the tool list to the model',
        '// model: reply with a call, get_order_status("A-1042")',
        '// app: validate the arguments and run the real function',
        '// app: send the result back to the model as a new message',
        '// model: write the final answer for the user',
      ],
      hint: {
        en: 'The model asks, your code does. The model can only answer once it has seen the result.',
        ar: 'النموذج يطلب والكود ينفّذ. ولا يستطيع النموذج الإجابة إلا بعد أن يرى النتيجة.',
      },
      explain: {
        en: 'The model only writes a structured request. Your application runs it and returns the result, and the model continues. Because your code sits in the middle, that is where you validate arguments and ask the user to confirm risky actions.',
        ar: 'النموذج يكتب طلباً منظَّماً فقط. تطبيقك ينفّذه ويعيد النتيجة، ثم يتابع النموذج. ولأن الكود يقع في الوسط، فهناك تتحقق من المعاملات وتطلب من المستخدم تأكيد الإجراءات الخطرة.',
      },
    },
    {
      kind: 'explain',
      text: {
        en: 'A **skill** is a folder with a `SKILL.md` file. The file has a short header between `---` lines, then instructions in plain Markdown. It can also ship scripts and reference files next to it.\n\nThe assistant keeps only the **name and description** of every skill in mind. It reads the rest only when a request matches. That is how you can install many skills without filling the context window.',
        ar: 'الـ **skill** مجلد فيه ملف `SKILL.md`. في الملف ترويسة قصيرة بين سطرَي `---`، ثم تعليمات مكتوبة بـ Markdown عادي. ويمكن أن ترافقه سكربتات وملفات مرجعية.\n\nلا يُبقي المساعد في ذهنه إلا **اسم كل skill ووصفها**، ولا يقرأ الباقي إلا عندما يطابق الطلب. وبهذا تستطيع تثبيت مهارات كثيرة من غير أن تملأ نافذة السياق.',
      },
      code: SKILL_FILE,
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the header of a skill that reviews pull requests.',
        ar: 'أكمل ترويسة skill تراجع طلبات الدمج (pull requests).',
      },
      template:
        '---\n___: pr-review\n___: Review a pull request with the team checklist. Use when the user asks for a code review.\n---\n\n# Reviewing a pull request\n1. Read the diff before the description.',
      answers: ['name', 'description'],
      distractors: ['title', 'prompt', 'model'],
      hint: {
        en: 'One field identifies the skill. The other tells the assistant what it does and when to use it.',
        ar: 'حقل يعرّف المهارة، والآخر يخبر المساعد بما تفعله ومتى يستخدمها.',
      },
      explain: {
        en: '`name` is a short identifier and `description` is what the assistant matches requests against. A description that names the triggers ("use when the user asks for a code review") is found far more reliably than a vague one.',
        ar: '`name` معرّف قصير، و`description` هو ما يطابق المساعد الطلبات معه. والوصف الذي يسمّي مواضع الاستخدام ("use when the user asks for a code review") يُعثر عليه بثقة أكبر كثيراً من الوصف الغامض.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Your team wants the assistant to open tickets in your issue tracker, and to follow your rules for writing a good bug report. What do you need?',
        ar: 'يريد فريقك أن يفتح المساعد تذاكر في نظام تتبّع المهام، وأن يلتزم بقواعدكم في كتابة بلاغ خلل جيد. ما الذي تحتاجه؟',
      },
      options: [
        {
          en: 'A tool connection to the tracker for the action, and a skill for the bug-report rules',
          ar: 'اتصال أداة بنظام التتبّع من أجل الإجراء، و skill لقواعد بلاغ الخلل',
        },
        { en: 'Only a skill: instructions are enough to reach the tracker', ar: 'skill فقط: التعليمات تكفي للوصول إلى نظام التتبّع' },
        { en: 'Only a tool: the model already knows your rules', ar: 'أداة فقط: النموذج يعرف قواعدكم مسبقاً' },
        { en: 'A bigger context window', ar: 'نافذة سياق أكبر' },
      ],
      answer: 0,
      hint: {
        en: 'One part is about being able to act. The other is about knowing how.',
        ar: 'جزء يتعلق بالقدرة على التنفيذ، والآخر بمعرفة الطريقة.',
      },
      explain: {
        en: 'Tools give ability and skills give know-how. The connection is usually an **MCP server**: MCP (Model Context Protocol) is the open standard for plugging tools and data into AI applications, so one tracker server works in every app that supports it.',
        ar: 'الأدوات تعطي القدرة والمهارات تعطي المعرفة بالطريقة. والاتصال يكون غالباً عبر **خادم MCP**: فـ MCP (Model Context Protocol) هو المعيار المفتوح لربط الأدوات والبيانات بتطبيقات الذكاء الاصطناعي، فيعمل خادم واحد لنظام التتبّع في كل تطبيق يدعمه.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'You now have three skills, a deploy command and the tracker connection. Ten colleagues need the same setup, and it will keep changing. How do you share it?',
        ar: 'صار لديك ثلاث skills وأمر للنشر واتصال بنظام التتبّع. عشرة زملاء يحتاجون الإعداد نفسه، وسيتغيّر باستمرار. كيف تشاركه؟',
      },
      options: [
        { en: 'Bundle everything into one plugin that they install and update', ar: 'تجمع كل شيء في plugin واحد يثبّتونه ويحدّثونه' },
        { en: 'Send the files in a chat message every time something changes', ar: 'ترسل الملفات في رسالة محادثة كلما تغيّر شيء' },
        { en: 'Paste all of it into the system prompt', ar: 'تلصق كل ذلك في الـ system prompt' },
      ],
      answer: 0,
      hint: {
        en: 'Think of how you share code: one versioned package, not copied files.',
        ar: 'فكّر في طريقة مشاركة الكود: حزمة واحدة لها إصدارات، لا ملفات منسوخة.',
      },
      explain: {
        en: 'A plugin is the unit of sharing: one package, one version, one place to update. Copied files drift apart and nobody knows which copy is current.',
        ar: 'الـ plugin هو وحدة المشاركة: حزمة واحدة وإصدار واحد ومكان واحد للتحديث. أما الملفات المنسوخة فتتباعد نسخها ولا يعرف أحد أيها الأحدث.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Last one. A plugin you found online asks for access to your files and your email. What is the right habit?',
        ar: 'السؤال الأخير. plugin وجدته على الإنترنت يطلب الوصول إلى ملفاتك وبريدك. ما العادة الصحيحة؟',
      },
      options: [
        {
          en: 'Check who published it, read what it contains, and give it only the access it needs',
          ar: 'تتحقق ممن نشره، وتقرأ ما يحتويه، وتمنحه فقط الصلاحيات التي يحتاجها',
        },
        { en: 'Install it: plugins cannot do harm because they are only text', ar: 'تثبّته: الـ plugins لا تضرّ لأنها مجرد نص' },
        { en: 'Install it, but only on your work computer', ar: 'تثبّته، لكن على حاسوب العمل فقط' },
      ],
      answer: 0,
      hint: {
        en: 'A skill or plugin acts with your assistant\'s access to your accounts.',
        ar: 'الـ skill أو الـ plugin يعمل بصلاحيات مساعدك على حساباتك.',
      },
      explain: {
        en: 'Skills and plugins are instructions and code that run with your permissions, so treat them like any software you install. The same care applies to what tools return: a web page or an email is **data**, never instructions for the assistant to follow.',
        ar: 'الـ skills والـ plugins تعليمات وكود تعمل بصلاحياتك، فعاملها كأي برنامج تثبّته. والحذر نفسه ينطبق على ما تُرجعه الأدوات: صفحة الويب أو رسالة البريد **بيانات**، وليست أبداً تعليمات يتّبعها المساعد.',
      },
    },
  ],
};
