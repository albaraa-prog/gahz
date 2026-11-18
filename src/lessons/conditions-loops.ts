import type { Lesson } from './types';

export const conditionsLoops: Lesson = {
  id: 'conditions-loops',
  tag: 'Basics',
  title: { en: 'Conditions and loops', ar: 'الشروط والحلقات' },
  summary: {
    en: 'Make decisions with `if`, repeat work with `for` and `while`, and solve FizzBuzz, the most famous warm-up question.',
    ar: 'اتخذ القرارات بـ if، وكرّر العمل بـ for و while، وحلّ FizzBuzz أشهر أسئلة الإحماء في المقابلات.',
  },
  minutes: 12,
  roadmapSteps: ['basics', 'fundamentals'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'Programs do two things all the time: **decide** and **repeat**.\n\n`if` runs a block only when a condition is true; `else if` and `else` cover the other cases, and only the **first** matching branch runs. A `for` loop repeats a block a known number of times.',
        ar: 'تقوم البرامج بأمرين طوال الوقت: **اتخاذ القرار** و**التكرار**.\n\nتنفّذ `if` مقطعاً فقط عندما يتحقّق الشرط، وتغطّي `else if` و`else` الحالات الأخرى، ولا يُنفَّذ إلا **أول** فرع يتحقّق شرطه. أما حلقة `for` فتكرّر مقطعاً عدداً معلوماً من المرات.',
      },
      code: 'const age = 20;\n\nif (age >= 18) {\n  console.log("adult");\n} else {\n  console.log("minor");\n}\n\nfor (let i = 1; i <= 3; i++) {\n  console.log("round", i);   // round 1, round 2, round 3\n}',
    },
    {
      kind: 'choice',
      text: { en: 'What does this print?', ar: 'ماذا تطبع هذه الشيفرة؟' },
      code: 'const score = 85;\n\nif (score >= 50) {\n  console.log("pass");\n} else if (score >= 80) {\n  console.log("excellent");\n} else {\n  console.log("fail");\n}',
      options: ['pass', 'excellent', 'pass excellent', 'fail'],
      answer: 0,
      hint: {
        en: 'Check the conditions from top to bottom and stop at the first one that is true.',
        ar: 'افحص الشروط من الأعلى إلى الأسفل وتوقّف عند أول شرط يتحقّق.',
      },
      explain: {
        en: '85 passes the first test, so the chain stops there and "excellent" can never be reached. Put the most specific condition first: `score >= 80` before `score >= 50`.',
        ar: 'القيمة 85 تحقّق الشرط الأول فتتوقّف السلسلة عنده، ولا يمكن الوصول إلى "excellent" أبداً. ضع الشرط الأكثر تحديداً أولاً: `score >= 80` قبل `score >= 50`.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the loop so it prints 0, 1, 2, 3, 4.',
        ar: 'أكمل الحلقة لتطبع 0 و1 و2 و3 و4.',
      },
      template: 'for (let i = 0; i ___ 5; i___) {\n  console.log(i);\n}',
      answers: ['<', '++'],
      distractors: ['<=', '--', '>'],
      hint: {
        en: 'The loop continues while the condition is true. 5 itself must not be printed.',
        ar: 'تستمرّ الحلقة ما دام الشرط متحقّقاً. الرقم 5 نفسه يجب ألا يُطبع.',
      },
      explain: {
        en: 'A `for` loop has three parts: start (`let i = 0`), condition (`i < 5`) and step (`i++`). Using `<=` here would print one number too many, the classic off-by-one bug.',
        ar: 'لحلقة `for` ثلاثة أجزاء: البداية (`let i = 0`) والشرط (`i < 5`) والخطوة (`i++`). استخدام `<=` هنا يطبع رقماً زائداً، وهو الخطأ الشهير المعروف بـ off-by-one.',
      },
    },
    {
      kind: 'choice',
      text: { en: 'What does this print?', ar: 'ماذا تطبع هذه الشيفرة؟' },
      code: 'let total = 0;\nfor (let i = 1; i <= 4; i++) {\n  if (i % 2 === 0) continue;\n  total += i;\n}\nconsole.log(total);',
      options: ['4', '10', '6', '1'],
      answer: 0,
      hint: {
        en: '`continue` skips the rest of the current round. Which values of `i` are skipped?',
        ar: '`continue` تتخطّى ما بقي من الدورة الحالية. ما قيم `i` التي يجري تخطّيها؟',
      },
      explain: {
        en: 'The even numbers 2 and 4 are skipped, so only 1 and 3 are added: 1 + 3 = 4. `continue` jumps to the next round, while `break` would leave the loop completely.',
        ar: 'يجري تخطّي العددين الزوجيين 2 و4، فيُجمع 1 و3 فقط: 1 + 3 = 4. `continue` تنتقل إلى الدورة التالية، أما `break` فتخرج من الحلقة كلياً.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'Arrange a countdown that prints 3, 2, 1 and then `Go!`.',
        ar: 'رتّب عدّاً تنازلياً يطبع 3 ثم 2 ثم 1 ثم `Go!`.',
      },
      lines: ['let n = 3;', 'while (n > 0) {', '  console.log(n);', '  n--;', '}', 'console.log("Go!");'],
      hint: {
        en: 'Print the number before decreasing it, and keep both inside the loop braces.',
        ar: 'اطبع الرقم قبل إنقاصه، وأبقِ العبارتين داخل قوسَي الحلقة.',
      },
      explain: {
        en: 'A `while` loop repeats as long as its condition holds. Something inside must move it towards the end (`n--`), otherwise it never stops.',
        ar: 'تتكرّر حلقة `while` ما دام شرطها متحقّقاً. ولا بدّ أن يقرّبها شيء في داخلها من النهاية (`n--`)، وإلا فلن تتوقّف أبداً.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'The classic: write `fizzbuzz(n)`. Return `"FizzBuzz"` when `n` divides by both 3 and 5, `"Fizz"` when it divides by 3, `"Buzz"` when it divides by 5, and otherwise the number as text (for example `"7"`).',
        ar: 'السؤال الكلاسيكي: اكتب الدالة `fizzbuzz(n)`. أرجع `"FizzBuzz"` عندما يقبل `n` القسمة على 3 و5 معاً، و`"Fizz"` عندما يقبل القسمة على 3، و`"Buzz"` عندما يقبل القسمة على 5، وفي غير ذلك أرجع الرقم كنص (مثلاً `"7"`).',
      },
      starter: 'function fizzbuzz(n) {\n  \n}\n\nfor (let i = 1; i <= 15; i++) {\n  console.log(fizzbuzz(i));\n}',
      solution: 'function fizzbuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}\n\nfor (let i = 1; i <= 15; i++) {\n  console.log(fizzbuzz(i));\n}',
      tests: [
        { call: 'fizzbuzz(3)', expect: 'Fizz' },
        { call: 'fizzbuzz(10)', expect: 'Buzz' },
        { call: 'fizzbuzz(30)', expect: 'FizzBuzz' },
        { call: 'fizzbuzz(7)', expect: '7' },
      ],
      hint: {
        en: 'Remember the lesson from the grades example: test the most specific case (both 3 and 5) first. `String(n)` turns a number into text.',
        ar: 'تذكّر درس مثال الدرجات: افحص الحالة الأكثر تحديداً (3 و5 معاً) أولاً. و`String(n)` تحوّل الرقم إلى نص.',
      },
      explain: {
        en: 'Order matters: 30 divides by 3, so checking "Fizz" first would never reach "FizzBuzz". Interviewers use this question to see whether you think about the order of conditions.',
        ar: 'الترتيب مهم: 30 يقبل القسمة على 3، ففحص "Fizz" أولاً يمنع الوصول إلى "FizzBuzz". يستخدم المحاورون هذا السؤال ليروا هل تنتبه لترتيب الشروط.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'Write `countVowels(text)` that returns how many of the letters a, e, i, o, u a text contains. Count capital letters too.',
        ar: 'اكتب الدالة `countVowels(text)` التي تُرجع عدد الأحرف a و e و i و o و u في النص. احسب الأحرف الكبيرة أيضاً.',
      },
      starter: 'function countVowels(text) {\n  let count = 0;\n  \n  return count;\n}\n\nconsole.log(countVowels("Interview"));',
      solution: 'function countVowels(text) {\n  let count = 0;\n  for (const letter of text.toLowerCase()) {\n    if ("aeiou".includes(letter)) count++;\n  }\n  return count;\n}\n\nconsole.log(countVowels("Interview"));',
      tests: [
        { call: 'countVowels("Interview")', expect: 4 },
        { call: 'countVowels("GAHZ")', expect: 1 },
        { call: 'countVowels("rhythm")', expect: 0 },
      ],
      hint: {
        en: 'Loop over `text.toLowerCase()` with `for...of`, and test each letter with `"aeiou".includes(letter)`.',
        ar: 'مرّ على `text.toLowerCase()` بحلقة `for...of`، وافحص كل حرف بـ `"aeiou".includes(letter)`.',
      },
      explain: {
        en: 'A loop plus a condition plus a counter: you combined everything in this lesson. Lowercasing first is a simple way to treat `A` and `a` the same.',
        ar: 'حلقة وشرط وعدّاد: لقد جمعت كل ما في هذا الدرس. تحويل النص إلى أحرف صغيرة أولاً طريقة بسيطة لمعاملة `A` و`a` بالطريقة نفسها.',
      },
    },
  ],
};
