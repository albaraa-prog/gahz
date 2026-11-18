import type { Lesson } from './types';

export const jsVariables: Lesson = {
  id: 'js-variables',
  tag: 'JavaScript',
  title: { en: 'Variables and values', ar: 'المتغيّرات والقيم' },
  summary: {
    en: 'Store values with `let` and `const`, see how types behave, and write your first two functions.',
    ar: 'خزّن القيم باستخدام let و const، وتعرّف على سلوك الأنواع، واكتب أول دالّتين لك.',
  },
  minutes: 10,
  roadmapSteps: ['javascript', 'basics'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'A **variable** is a name for a value. Use `const` for a value that will not be reassigned, and `let` for one that will.\n\nRead the code below, then continue: the next steps ask you to predict, complete and write code yourself.',
        ar: '**المتغيّر** اسم يشير إلى قيمة. استخدم `const` للقيمة التي لن يُعاد إسنادها، و`let` للقيمة التي ستتغيّر.\n\nاقرأ الشيفرة في الأسفل ثم تابع: في الخطوات التالية ستتوقّع النتائج وتكمل الشيفرة وتكتبها بنفسك.',
      },
      code: 'const siteName = "Gahz";   // never reassigned\nlet score = 0;             // will change\n\nscore = score + 10;\nconsole.log(siteName, score); // Gahz 10',
    },
    {
      kind: 'choice',
      text: { en: 'What does this code print?', ar: 'ماذا تطبع هذه الشيفرة؟' },
      code: 'let a = 5;\nlet b = a;\na = a + 2;\nconsole.log(a, b);',
      options: ['7 5', '7 7', '5 5', '5 7'],
      answer: 0,
      hint: {
        en: '`b = a` copies the value that `a` holds at that moment.',
        ar: 'العبارة `b = a` تنسخ القيمة الموجودة في `a` في تلك اللحظة.',
      },
      explain: {
        en: 'Numbers are copied by value. `b` received a copy of 5, so changing `a` afterwards does not touch `b`.',
        ar: 'الأرقام تُنسخ بالقيمة. حصلت `b` على نسخة من 5، لذلك تغيير `a` بعد ذلك لا يؤثّر في `b`.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the code: the tax rate never changes, the total does.',
        ar: 'أكمل الشيفرة: نسبة الضريبة لا تتغيّر أبداً، أما المجموع فيتغيّر.',
      },
      template: '___ TAX_RATE = 0.05;\n___ total = 200;\ntotal ___ total * TAX_RATE;\nconsole.log(total); // 210',
      answers: ['const', 'let', '+='],
      distractors: ['var', '==', '=>'],
      hint: {
        en: 'A value that is reassigned later cannot be declared with `const`. The last gap adds to the variable and stores the result in one step.',
        ar: 'القيمة التي يُعاد إسنادها لاحقاً لا يمكن تعريفها بـ `const`. الفراغ الأخير يجمع إلى المتغيّر ويخزّن الناتج في خطوة واحدة.',
      },
      explain: {
        en: '`const` protects a value from reassignment, `let` allows it, and `total += x` is short for `total = total + x`.',
        ar: '`const` تمنع إعادة إسناد القيمة، و`let` تسمح بها، و`total += x` اختصار لـ `total = total + x`.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Every value has a type. What does this print?',
        ar: 'لكل قيمة نوع. ماذا تطبع هذه الشيفرة؟',
      },
      code: 'const input = "5";\nconsole.log(input + 2, typeof input);',
      options: ['52 string', '7 number', '7 string', '52 number'],
      answer: 0,
      hint: {
        en: 'The quotes make `input` text, not a number. What does `+` do with text?',
        ar: 'علامتا التنصيص تجعلان `input` نصاً لا رقماً. ماذا تفعل `+` مع النصوص؟',
      },
      explain: {
        en: 'With a string on either side, `+` joins text: `"5" + 2` is `"52"`. Convert first with `Number(input)` when you want arithmetic. This is a classic interview question.',
        ar: 'عند وجود نص في أحد الطرفين تقوم `+` بدمج النصوص: `"5" + 2` تعطي `"52"`. حوّل القيمة أولاً بـ `Number(input)` عندما تريد عملية حسابية. هذا سؤال مقابلات شائع.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'Your turn. Write a function `greet(name)` that returns the text `Hello, NAME!`. For example, `greet("Sara")` returns `"Hello, Sara!"`.',
        ar: 'دورك الآن. اكتب دالة `greet(name)` تُرجع النص `Hello, NAME!`. مثلاً `greet("Sara")` تُرجع `"Hello, Sara!"`.',
      },
      starter: 'function greet(name) {\n  // return the greeting here\n}\n\nconsole.log(greet("Sara"));',
      solution: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Sara"));',
      tests: [
        { call: 'greet("Sara")', expect: 'Hello, Sara!' },
        { call: 'greet("Omar")', expect: 'Hello, Omar!' },
      ],
      hint: {
        en: 'Join the pieces with `+`, or use a template string with backticks: `Hello, ${name}!`. Remember to `return` it.',
        ar: 'ادمج الأجزاء باستخدام `+`، أو استخدم قالباً نصياً بين علامتي backtick هكذا: `Hello, ${name}!`. ولا تنسَ `return`.',
      },
      explain: {
        en: 'A function takes input through its parameters and hands a result back with `return`. Template strings (backticks) let you place values inside text with `${...}`.',
        ar: 'تستقبل الدالة مدخلاتها عبر المعاملات وتعيد النتيجة بـ `return`. القوالب النصية (backticks) تتيح وضع القيم داخل النص باستخدام `${...}`.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'Put the lines in order so the program swaps the two values and prints `2 1`.',
        ar: 'رتّب الأسطر ليبدّل البرنامج بين القيمتين ويطبع `2 1`.',
      },
      lines: ['let a = 1, b = 2;', 'const temp = a;', 'a = b;', 'b = temp;', 'console.log(a, b);'],
      hint: {
        en: 'Once `a = b` runs, the old value of `a` is gone, unless it was saved somewhere first.',
        ar: 'بعد تنفيذ `a = b` تضيع القيمة القديمة لـ `a`، إلا إذا حُفظت في مكان آخر قبل ذلك.',
      },
      explain: {
        en: 'A statement runs only after the ones above it. The temporary variable keeps the old value of `a` alive long enough to give it to `b`.',
        ar: 'تُنفَّذ كل عبارة بعد العبارات التي فوقها. المتغيّر المؤقت يحتفظ بالقيمة القديمة لـ `a` إلى أن تُعطى لـ `b`.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'Write `toCelsius(fahrenheit)`. The formula is `(F - 32) * 5 / 9`. Use a `const` for the result and return it.',
        ar: 'اكتب الدالة `toCelsius(fahrenheit)`. المعادلة هي `(F - 32) * 5 / 9`. خزّن الناتج في `const` ثم أرجعه.',
      },
      starter: 'function toCelsius(fahrenheit) {\n  \n}\n\nconsole.log(toCelsius(212));',
      solution: 'function toCelsius(fahrenheit) {\n  const celsius = (fahrenheit - 32) * 5 / 9;\n  return celsius;\n}\n\nconsole.log(toCelsius(212));',
      tests: [
        { call: 'toCelsius(212)', expect: 100 },
        { call: 'toCelsius(32)', expect: 0 },
        { call: 'toCelsius(-40)', expect: -40 },
      ],
      hint: {
        en: 'Keep the brackets around `fahrenheit - 32`: multiplication and division happen before subtraction.',
        ar: 'أبقِ القوسين حول `fahrenheit - 32`: الضرب والقسمة يُنفَّذان قبل الطرح.',
      },
      explain: {
        en: 'You declared a value, computed with it and returned it. That is the core of most functions you will ever write.',
        ar: 'عرّفت قيمة، وأجريت عليها حساباً، ثم أرجعتها. هذا جوهر معظم الدوال التي ستكتبها.',
      },
    },
  ],
};
