import type { Lesson } from './types';

export const jsFunctionsArrays: Lesson = {
  id: 'js-functions-arrays',
  tag: 'JavaScript',
  title: { en: 'Functions and arrays', ar: 'الدوال والمصفوفات' },
  summary: {
    en: 'Arrow functions, `map`, `filter` and `reduce`: the tools behind most front-end interview questions.',
    ar: 'الدوال السهمية و map و filter و reduce: الأدوات التي تدور حولها معظم أسئلة مقابلات الواجهات الأمامية.',
  },
  minutes: 12,
  roadmapSteps: ['javascript', 'fullstack'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'An **array** is an ordered list. An **arrow function** is a short way to write a function: `n => n * 2` takes `n` and returns `n * 2`.\n\nArrays have methods that take a function and apply it to every item: `map` transforms each item, `filter` keeps some of them. Both return a **new** array.',
        ar: '**المصفوفة** قائمة مرتّبة. و**الدالة السهمية** طريقة مختصرة لكتابة دالة: `n => n * 2` تستقبل `n` وتُرجع `n * 2`.\n\nللمصفوفات دوال تستقبل دالة وتطبّقها على كل عنصر: `map` تحوّل كل عنصر، و`filter` تُبقي بعض العناصر. وكلتاهما تُرجع مصفوفة **جديدة**.',
      },
      code: 'const prices = [10, 25, 40];\n\nconst doubled = prices.map(p => p * 2);      // [20, 50, 80]\nconst cheap = prices.filter(p => p < 30);    // [10, 25]\n\nconsole.log(prices.length, prices[0]);       // 3 10',
    },
    {
      kind: 'choice',
      text: { en: 'What does this print?', ar: 'ماذا تطبع هذه الشيفرة؟' },
      code: 'const nums = [1, 2, 3];\nconst result = nums.map(n => n * n);\nconsole.log(result, nums.length);',
      options: ['[1, 4, 9] 3', '[2, 4, 6] 3', '[1, 4, 9] 6', '14 3'],
      answer: 0,
      hint: {
        en: '`n * n` is the square of each item. Does `map` change the original array?',
        ar: '`n * n` هو مربّع كل عنصر. هل تغيّر `map` المصفوفة الأصلية؟',
      },
      explain: {
        en: '`map` returns a new array of the same length with each item transformed. The original `nums` is untouched.',
        ar: 'تُرجع `map` مصفوفة جديدة بالطول نفسه بعد تحويل كل عنصر، وتبقى `nums` الأصلية كما هي.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the code so `evens` holds only the even numbers.',
        ar: 'أكمل الشيفرة لتحتوي `evens` على الأعداد الزوجية فقط.',
      },
      template: 'const nums = [1, 2, 3, 4, 5, 6];\nconst evens = nums.___(n => n % 2 ___ 0);\nconsole.log(evens); // [2, 4, 6]',
      answers: ['filter', '==='],
      distractors: ['map', '!==', 'find'],
      hint: {
        en: 'You are keeping some items, not transforming them. `n % 2` is the remainder after dividing by 2.',
        ar: 'أنت تُبقي بعض العناصر ولا تحوّلها. `n % 2` هو باقي القسمة على 2.',
      },
      explain: {
        en: '`filter` keeps the items for which the function returns `true`. An even number leaves a remainder of 0, and `===` compares without converting types.',
        ar: 'تُبقي `filter` العناصر التي تُرجع الدالة لها `true`. العدد الزوجي باقي قسمته 0، و`===` تقارن دون تحويل الأنواع.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'Write `sum(numbers)` that returns the total of an array of numbers. An empty array gives 0.',
        ar: 'اكتب الدالة `sum(numbers)` التي تُرجع مجموع مصفوفة من الأرقام. المصفوفة الفارغة تعطي 0.',
      },
      starter: 'function sum(numbers) {\n  let total = 0;\n  // add every number to total\n  return total;\n}\n\nconsole.log(sum([1, 2, 3]));',
      solution: 'function sum(numbers) {\n  let total = 0;\n  for (const n of numbers) {\n    total += n;\n  }\n  return total;\n}\n\nconsole.log(sum([1, 2, 3]));',
      tests: [
        { call: 'sum([1, 2, 3])', expect: 6 },
        { call: 'sum([10, -4])', expect: 6 },
        { call: 'sum([])', expect: 0 },
      ],
      hint: {
        en: 'Loop with `for (const n of numbers) { ... }` and add each `n` to `total`.',
        ar: 'استخدم الحلقة `for (const n of numbers) { ... }` وأضف كل `n` إلى `total`.',
      },
      explain: {
        en: 'This "running total" pattern is so common that arrays have a method for it: `numbers.reduce((total, n) => total + n, 0)` does the same job in one line.',
        ar: 'نمط «المجموع التراكمي» شائع إلى درجة أن للمصفوفات دالة خاصة به: `numbers.reduce((total, n) => total + n, 0)` تؤدّي العمل نفسه في سطر واحد.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'A function can return another function. What does this print?',
        ar: 'يمكن للدالة أن تُرجع دالة أخرى. ماذا تطبع هذه الشيفرة؟',
      },
      code: 'const add = a => b => a + b;\nconst addFive = add(5);\nconsole.log(addFive(3), addFive(10));',
      options: ['8 15', '5 5', '3 10', '8 18'],
      answer: 0,
      hint: {
        en: '`add(5)` returns the inner function `b => a + b`, which still remembers that `a` is 5.',
        ar: '`add(5)` تُرجع الدالة الداخلية `b => a + b` التي ما زالت تتذكّر أن `a` تساوي 5.',
      },
      explain: {
        en: 'The inner function keeps access to `a` after `add` has finished. That is a **closure**, one of the most asked JavaScript interview topics. Each call starts from the same 5, so the results are 8 and 15.',
        ar: 'تحتفظ الدالة الداخلية بإمكانية الوصول إلى `a` حتى بعد انتهاء `add`. هذا ما يسمّى **closure**، وهو من أكثر مواضيع JavaScript طرحاً في المقابلات. كل استدعاء يبدأ من القيمة 5 نفسها، فالناتجان 8 و15.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'Build a function that counts the words longer than three letters.',
        ar: 'ركّب دالة تعدّ الكلمات التي يزيد طولها على ثلاثة أحرف.',
      },
      lines: [
        'function countLong(words) {',
        '  let count = 0;',
        '  for (const word of words) {',
        '    if (word.length > 3) count++;',
        '  }',
        '  return count;',
        '}',
      ],
      hint: {
        en: 'The indentation shows what is inside what. The counter must exist before the loop and be returned after it.',
        ar: 'المسافات البادئة تبيّن ما يقع داخل ماذا. يجب أن يُعرَّف العدّاد قبل الحلقة وأن يُرجَع بعدها.',
      },
      explain: {
        en: 'Start a counter, visit every item, update the counter when the condition holds, return it at the end. You will reuse this shape constantly.',
        ar: 'ابدأ بعدّاد، ومرّ على كل عنصر، وحدّث العدّاد عند تحقّق الشرط، ثم أرجعه في النهاية. ستستخدم هذا النمط كثيراً.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'Write `longest(words)` that returns the longest word in an array. If two words are equally long, return the first one. An empty array returns an empty string `""`.',
        ar: 'اكتب الدالة `longest(words)` التي تُرجع أطول كلمة في المصفوفة. إذا تساوت كلمتان في الطول فأرجع الأولى. المصفوفة الفارغة تُرجع نصاً فارغاً `""`.',
      },
      starter: 'function longest(words) {\n  let best = "";\n  \n  return best;\n}\n\nconsole.log(longest(["go", "python", "java"]));',
      solution: 'function longest(words) {\n  let best = "";\n  for (const word of words) {\n    if (word.length > best.length) best = word;\n  }\n  return best;\n}\n\nconsole.log(longest(["go", "python", "java"]));',
      tests: [
        { call: 'longest(["go", "python", "java"])', expect: 'python' },
        { call: 'longest(["dart", "java", "c"])', expect: 'dart' },
        { call: 'longest([])', expect: '' },
      ],
      hint: {
        en: 'Keep the best word so far. Replace it only when the current word is strictly longer (`>`), so the first of two equal words wins.',
        ar: 'احتفظ بأفضل كلمة حتى الآن، واستبدلها فقط عندما تكون الكلمة الحالية أطول تماماً (`>`)، فتفوز الأولى عند التساوي.',
      },
      explain: {
        en: 'Using `>` instead of `>=` is what keeps the first of two equally long words. Small comparison choices like this are exactly what interviewers look at.',
        ar: 'استخدام `>` بدلاً من `>=` هو ما يُبقي الكلمة الأولى عند تساوي الطول. مثل هذه التفاصيل الصغيرة في المقارنة هي ما ينتبه له المحاورون.',
      },
    },
  ],
};
