import type { Lesson } from './types';

export const pythonWithAiAssistant: Lesson = {
  id: 'python-with-ai-assistant',
  tag: 'Python + AI',
  title: { en: 'Python with an AI assistant in your IDE', ar: 'Python مع مساعد ذكاء اصطناعي في بيئة التطوير' },
  summary: {
    en: 'Prompt the assistant in VS Code or PyCharm with a good comment, then review, fix and test what it suggests before you accept it.',
    ar: 'وجّه المساعد في VS Code أو PyCharm بتعليق جيد، ثم راجع ما يقترحه وأصلحه واختبره قبل أن تقبله.',
  },
  minutes: 12,
  roadmapSteps: ['ai_python'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'An AI assistant in your editor (GitHub Copilot, Claude Code, Cursor, JetBrains AI Assistant) predicts code from what is around your cursor. You write a comment or a function header, it shows a grey suggestion, and `Tab` accepts it.\n\nThe suggestion is a **draft from a fast colleague who never ran the code**. Your job is the loop: **describe, read, test, then accept**. This lesson practises each part.',
        ar: 'مساعد الذكاء الاصطناعي في محرّرك (GitHub Copilot أو Claude Code أو Cursor أو JetBrains AI Assistant) يتوقّع الشيفرة ممّا حول المؤشّر. تكتب تعليقاً أو ترويسة دالة، فيعرض اقتراحاً رمادياً، و`Tab` يقبله.\n\nالاقتراح **مسودة من زميل سريع لم يشغّل الشيفرة قط**. ومهمتك هي الحلقة: **صِف، اقرأ، اختبر، ثم اقبل**. وهذا الدرس يمرّنك على كل جزء منها.',
      },
      code: '# Return the average of a list of numbers\ndef average(numbers):\n    return sum(numbers) / len(numbers)   # <- suggested by the assistant',
    },
    {
      kind: 'choice',
      text: {
        en: 'The suggestion above crashes on an empty list, because nobody told the assistant about that case. Which comment is the best prompt?',
        ar: 'الاقتراح السابق ينهار مع القائمة الفارغة، لأن أحداً لم يخبر المساعد بهذه الحالة. أي تعليق هو أفضل prompt؟',
      },
      options: [
        '# Return the average of a list of numbers; return 0.0 if the list is empty',
        '# average',
        '# make a good function for the numbers',
        '# TODO: fix later',
      ],
      answer: 0,
      hint: {
        en: 'The assistant only knows what is written. Which comment names the input, the output and the edge case?',
        ar: 'المساعد لا يعرف إلا المكتوب. أي تعليق يذكر المدخل والمخرج والحالة الطرفية؟',
      },
      explain: {
        en: 'A comment is a prompt. Naming the input, the result and the edge case removes the guessing. Type hints do the same job: `def average(numbers: list[float]) -> float:` tells the assistant, and the next reader, exactly what is expected.',
        ar: 'التعليق prompt. وذكر المدخل والنتيجة والحالة الطرفية يزيل التخمين. وتلميحات الأنواع تؤدّي الدور نفسه: `def average(numbers: list[float]) -> float:` تخبر المساعد، والقارئ التالي، بالمطلوب تماماً.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'Arrange the corrected function: it returns `0.0` for an empty list, and the average otherwise.',
        ar: 'رتّب الدالة المصحَّحة: تعيد `0.0` للقائمة الفارغة، والمتوسط في غير ذلك.',
      },
      lines: [
        'def average(numbers: list[float]) -> float:',
        '    if not numbers:',
        '        return 0.0',
        '    return sum(numbers) / len(numbers)',
      ],
      hint: {
        en: 'The check for the empty list has to come before the division.',
        ar: 'فحص القائمة الفارغة يجب أن يسبق القسمة.',
      },
      explain: {
        en: '`if not numbers` is true for an empty list, so the function returns before it can divide by zero. Reading a suggestion line by line like this is the review step. It takes seconds and it is where most AI mistakes are caught.',
        ar: '`if not numbers` صحيحة للقائمة الفارغة، فتعود الدالة قبل أن تقسم على صفر. وقراءة الاقتراح سطراً سطراً هكذا هي خطوة المراجعة. تأخذ ثواني، وفيها يُكشف معظم أخطاء الذكاء الاصطناعي.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Now review this suggestion. It looks fine. What does the program print?',
        ar: 'راجع الآن هذا الاقتراح. يبدو سليماً. ماذا يطبع البرنامج؟',
      },
      code: 'def add_task(task, tasks=[]):\n    tasks.append(task)\n    return tasks\n\nprint(add_task("study"))\nprint(add_task("sleep"))',
      options: ["['study'] then ['study', 'sleep']", "['study'] then ['sleep']", "['study', 'sleep'] twice", 'Error'],
      answer: 0,
      hint: {
        en: 'When is the default value `[]` created: on every call, or once?',
        ar: 'متى تُنشأ القيمة الافتراضية `[]`: عند كل استدعاء أم مرة واحدة؟',
      },
      explain: {
        en: 'The default list is created once, when the function is defined, and every call shares it. The second call still sees "study". Assistants repeat this bug because it is common in the code they learned from, and it passes a quick look.',
        ar: 'القائمة الافتراضية تُنشأ مرة واحدة عند تعريف الدالة، وكل الاستدعاءات تتشاركها. فالاستدعاء الثاني ما زال يرى "study". والمساعدات تكرّر هذا الخطأ لأنه شائع في الشيفرة التي تعلّمت منها، وهو يمرّ من النظرة السريعة.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Fix the suggestion so that every call without `tasks` starts with its own new list.',
        ar: 'أصلح الاقتراح ليبدأ كل استدعاء دون `tasks` بقائمة جديدة خاصة به.',
      },
      template: 'def add_task(task, tasks=___):\n    if tasks is None:\n        tasks = ___\n    tasks.append(task)\n    return tasks',
      answers: ['None', '[]'],
      distractors: ['{}', '0', 'False'],
      hint: {
        en: 'Use a default that cannot be changed, and build the list inside the function.',
        ar: 'استخدم قيمة افتراضية لا تتغيّر، وأنشئ القائمة داخل الدالة.',
      },
      explain: {
        en: '`None` is the usual default for "nothing was passed". The list is then created inside the function, on each call. You can also ask the assistant: "this default is shared between calls, fix it". Knowing the bug is what lets you ask.',
        ar: '`None` هي القيمة الافتراضية المعتادة لمعنى «لم يُمرَّر شيء». ثم تُنشأ القائمة داخل الدالة عند كل استدعاء. ويمكنك أيضاً أن تطلب من المساعد: «هذه القيمة الافتراضية مشتركة بين الاستدعاءات، أصلحها». ومعرفتك بالخطأ هي ما يمكّنك من الطلب.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'You ask the assistant for tests with `pytest`. Which test would have caught the first bug in `average`?',
        ar: 'تطلب من المساعد اختبارات بـ `pytest`. أي اختبار كان سيكشف الخطأ الأول في `average`؟',
      },
      options: [
        'assert average([]) == 0.0',
        'assert average([2, 4]) == 3.0',
        'assert average([5]) == 5.0',
        'assert average([1, 2, 3]) == 2.0',
      ],
      answer: 0,
      hint: {
        en: 'Three of these tests use a normal list. Which one uses the edge case?',
        ar: 'ثلاثة من هذه الاختبارات تستخدم قائمة عادية. أيها يستخدم الحالة الطرفية؟',
      },
      explain: {
        en: 'Generated tests tend to cover the easy cases. Ask for the edge cases by name (empty input, one item, negative numbers, wrong types) and decide the expected values yourself, so the tests check what you want and not what the code happens to do.',
        ar: 'الاختبارات المولَّدة تميل إلى تغطية الحالات السهلة. اطلب الحالات الطرفية بالاسم (مدخل فارغ، عنصر واحد، أعداد سالبة، أنواع خاطئة)، وحدّد القيم المتوقّعة بنفسك، لتفحص الاختبارات ما تريده أنت لا ما تفعله الشيفرة مصادفةً.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Security review. The assistant offers four ways to look up a user. Which one is safe?',
        ar: 'مراجعة أمنية. يعرض المساعد أربع طرق للبحث عن مستخدم. أيها الآمنة؟',
      },
      options: [
        'cursor.execute("SELECT * FROM users WHERE name = ?", (name,))',
        'cursor.execute(f"SELECT * FROM users WHERE name = \'{name}\'")',
        'cursor.execute("SELECT * FROM users WHERE name = \'" + name + "\'")',
        'cursor.execute("SELECT * FROM users WHERE name = \'%s\'" % name)',
      ],
      answer: 0,
      hint: {
        en: 'In three of them the user\'s text becomes part of the SQL itself.',
        ar: 'في ثلاث منها يصبح نصّ المستخدم جزءاً من SQL نفسها.',
      },
      explain: {
        en: 'Only the parameterized query sends the value separately from the SQL, so text such as `\' OR \'1\'=\'1` stays data. The other three build the query from user input, which is **SQL injection**. Check generated code for this, for `eval` and for keys written into the file.',
        ar: 'الاستعلام ذو المعاملات وحده يرسل القيمة منفصلة عن SQL، فيبقى نص مثل `\' OR \'1\'=\'1` بيانات. أما الثلاثة الأخرى فتبني الاستعلام من مدخل المستخدم، وهذا **حقن SQL**. وافحص الشيفرة المولَّدة بحثاً عنه وعن `eval` وعن المفاتيح المكتوبة في الملف.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Last one. You are learning, and the assistant can write the whole exercise for you. What helps you most?',
        ar: 'السؤال الأخير. أنت تتعلّم، والمساعد يستطيع كتابة التمرين كله عنك. ما الأنفع لك؟',
      },
      options: [
        {
          en: 'Try it yourself first, then ask for a hint or an explanation of what you got wrong.',
          ar: 'حاول بنفسك أولاً، ثم اطلب تلميحاً أو شرحاً لما أخطأت فيه.',
        },
        {
          en: 'Accept the full answer and move to the next exercise as fast as possible.',
          ar: 'اقبل الإجابة كاملة وانتقل إلى التمرين التالي بأسرع ما يمكن.',
        },
        {
          en: 'Ask for the answer in three different styles and keep the shortest.',
          ar: 'اطلب الإجابة بثلاثة أساليب مختلفة واحتفظ بأقصرها.',
        },
      ],
      answer: 0,
      hint: {
        en: 'In an interview there is no `Tab` key to accept the answer.',
        ar: 'في المقابلة لا يوجد مفتاح `Tab` لقبول الإجابة.',
      },
      explain: {
        en: 'Use the assistant as a tutor: "give me a hint, not the answer", "explain this line", "quiz me on dictionaries". You keep the speed and you still build the skill. The rule for every suggestion stays the same: **you accept it, so you own it**.',
        ar: 'استخدم المساعد معلّماً: «أعطني تلميحاً لا الإجابة»، «اشرح هذا السطر»، «اختبرني في القواميس». فتحتفظ بالسرعة وتبني المهارة معاً. وقاعدة كل اقتراح تبقى واحدة: **أنت قبلته، فأنت المسؤول عنه**.',
      },
    },
  ],
};
