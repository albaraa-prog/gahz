import type { Lesson } from './types';

export const bigOBinarySearch: Lesson = {
  id: 'big-o-binary-search',
  tag: 'Algorithms',
  title: { en: 'Big-O and binary search', ar: 'تعقيد Big-O والبحث الثنائي' },
  summary: {
    en: 'Learn to say how fast code is, then write binary search yourself and run it against tests.',
    ar: 'تعلّم كيف تصف سرعة الشيفرة، ثم اكتب البحث الثنائي بنفسك وشغّله أمام الاختبارات.',
  },
  minutes: 15,
  roadmapSteps: ['dsa', 'fundamentals'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: '**Big-O** describes how the work grows as the input grows. It ignores constants and keeps the dominant term.\n\n`O(1)`: the same work for any size. `O(log n)`: the input is halved at each step. `O(n)`: every item is visited once. `O(n²)`: every item is paired with every other item.',
        ar: 'يصف **Big-O** كيف يزداد العمل مع زيادة حجم المدخلات، متجاهلاً الثوابت ومكتفياً بالحدّ الأكبر تأثيراً.\n\n`O(1)`: العمل نفسه مهما كان الحجم. `O(log n)`: يُنصَّف حجم المدخلات في كل خطوة. `O(n)`: يُزار كل عنصر مرة واحدة. `O(n²)`: يُقرَن كل عنصر بكل عنصر آخر.',
      },
      code: 'items[0];                          // O(1)\n\nfor (const item of items) { }      // O(n)\n\nfor (const a of items) {           // O(n²)\n  for (const b of items) { }\n}',
    },
    {
      kind: 'choice',
      text: {
        en: 'What is the time complexity of this function for an array of `n` items?',
        ar: 'ما التعقيد الزمني لهذه الدالة عندما تحتوي المصفوفة على `n` عنصراً؟',
      },
      code: 'function hasPairWithSum(items, target) {\n  for (let i = 0; i < items.length; i++) {\n    for (let j = i + 1; j < items.length; j++) {\n      if (items[i] + items[j] === target) return true;\n    }\n  }\n  return false;\n}',
      options: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'],
      answer: 0,
      hint: {
        en: 'For each item, the inner loop walks over (almost) all the remaining items.',
        ar: 'لكل عنصر تمرّ الحلقة الداخلية على (معظم) العناصر الباقية.',
      },
      explain: {
        en: 'The loops check about n × n / 2 pairs. Big-O drops the constant ½, leaving O(n²). With a `Set` of the numbers seen so far, the same problem can be solved in O(n).',
        ar: 'تفحص الحلقتان نحو n × n / 2 زوجاً. يُسقط Big-O الثابت ½ فيبقى O(n²). وباستخدام `Set` للأرقام التي مرّت يمكن حلّ المسألة نفسها في O(n).',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Binary search works on a **sorted** list: look at the middle item and throw away the half that cannot contain the target. About how many looks does it need, at most, for 1,000 sorted items?',
        ar: 'يعمل البحث الثنائي على قائمة **مرتّبة**: انظر إلى العنصر الأوسط واستبعد النصف الذي لا يمكن أن يحتوي على الهدف. كم نظرة يحتاج على الأكثر تقريباً لـ 1000 عنصر مرتّب؟',
      },
      options: ['10', '100', '500', '1000'],
      answer: 0,
      hint: {
        en: 'Halve 1,000 again and again: 500, 250, 125... How many halvings until one item is left?',
        ar: 'نصّف 1000 مرة بعد مرة: 500 ثم 250 ثم 125... كم تنصيفاً حتى يبقى عنصر واحد؟',
      },
      explain: {
        en: '2¹⁰ = 1024, so ten halvings are enough. That is O(log n): a million items need only about 20 looks, while a plain scan could need a million.',
        ar: '2¹⁰ = 1024، فعشرة تنصيفات تكفي. هذا هو O(log n): مليون عنصر يحتاج نحو 20 نظرة فقط، في حين قد يحتاج المسح العادي إلى مليون.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'Arrange the body of binary search. `low` and `high` mark the part of the array that is still possible.',
        ar: 'رتّب جسم البحث الثنائي. يحدّد `low` و`high` الجزء الذي ما زال محتملاً من المصفوفة.',
      },
      lines: [
        'let low = 0, high = items.length - 1;',
        'while (low <= high) {',
        '  const mid = Math.floor((low + high) / 2);',
        '  if (items[mid] === target) return mid;',
        '  else if (items[mid] < target) low = mid + 1;',
        '  else high = mid - 1;',
        '}',
        'return -1;',
      ],
      hint: {
        en: 'Inside the loop: find the middle, test for a match, then move one boundary. Each `else` must directly follow an `if`. Return -1 only after the loop ends.',
        ar: 'داخل الحلقة: جد المنتصف، ثم افحص التطابق، ثم حرّك أحد الحدّين. يجب أن تأتي `else` مباشرة بعد `if` الخاصة بها. وأرجع -1 بعد انتهاء الحلقة فقط.',
      },
      explain: {
        en: 'Each round either finds the target or shrinks the range past `mid`. When `low` passes `high` nothing is left, so the target is not there.',
        ar: 'في كل دورة إما أن يُعثر على الهدف وإما أن يتقلّص النطاق متجاوزاً `mid`. وعندما يتجاوز `low` قيمة `high` لا يبقى شيء، فالهدف غير موجود.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the two lines that most people get wrong.',
        ar: 'أكمل السطرين اللذين يخطئ فيهما معظم الناس.',
      },
      template: 'while (low ___ high) {\n  const mid = Math.floor((low + high) / 2);\n  if (items[mid] === target) return mid;\n  if (items[mid] < target) low = mid ___ 1;\n  else high = mid - 1;\n}',
      answers: ['<=', '+'],
      distractors: ['<', '-', '>='],
      hint: {
        en: 'When `low` equals `high` there is still one item left to check. And `mid` itself has already been checked.',
        ar: 'عندما يتساوى `low` و`high` يبقى عنصر واحد لم يُفحص. أما `mid` نفسه فقد فُحص بالفعل.',
      },
      explain: {
        en: 'With `<` the last remaining item is never checked. With `low = mid` instead of `mid + 1` the range can stop shrinking and the loop never ends. These two details are what interviewers watch for.',
        ar: 'باستخدام `<` لا يُفحص العنصر الأخير المتبقّي أبداً. وباستخدام `low = mid` بدلاً من `mid + 1` قد يتوقّف النطاق عن التقلّص فلا تنتهي الحلقة. هاتان هما التفصيلتان اللتان يراقبهما المحاورون.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'Now write it from memory: `binarySearch(items, target)` returns the index of `target` in the sorted array `items`, or `-1` when it is not there.',
        ar: 'اكتبه الآن من الذاكرة: `binarySearch(items, target)` تُرجع فهرس `target` في المصفوفة المرتّبة `items`، أو `-1` إذا لم يكن موجوداً.',
      },
      starter: 'function binarySearch(items, target) {\n  let low = 0;\n  let high = items.length - 1;\n\n  \n  return -1;\n}\n\nconsole.log(binarySearch([2, 5, 8, 12, 16], 12));',
      solution:
        'function binarySearch(items, target) {\n  let low = 0;\n  let high = items.length - 1;\n\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (items[mid] === target) return mid;\n    if (items[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}\n\nconsole.log(binarySearch([2, 5, 8, 12, 16], 12));',
      tests: [
        { call: 'binarySearch([2, 5, 8, 12, 16], 12)', expect: 3 },
        { call: 'binarySearch([2, 5, 8, 12, 16], 2)', expect: 0 },
        { call: 'binarySearch([2, 5, 8, 12, 16], 16)', expect: 4 },
        { call: 'binarySearch([2, 5, 8, 12, 16], 7)', expect: -1 },
        { call: 'binarySearch([], 1)', expect: -1 },
      ],
      hint: {
        en: 'Loop `while (low <= high)`. Compute `mid`, return it on a match, otherwise move `low` to `mid + 1` or `high` to `mid - 1`.',
        ar: 'كرّر بـ `while (low <= high)`. احسب `mid` وأرجعه عند التطابق، وإلا فانقل `low` إلى `mid + 1` أو `high` إلى `mid - 1`.',
      },
      explain: {
        en: 'You wrote one of the most asked interview algorithms and it passed the edge cases: first item, last item, missing item and an empty array. Always test those four.',
        ar: 'كتبت واحدة من أكثر الخوارزميات طرحاً في المقابلات ونجحت في الحالات الحدّية: العنصر الأول، والأخير، والعنصر المفقود، والمصفوفة الفارغة. اختبر هذه الحالات الأربع دائماً.',
      },
    },
    {
      kind: 'code',
      text: {
        en: 'Write `hasDuplicate(items)` that returns `true` when any value appears more than once. Aim for O(n): one pass, remembering what you have seen in a `Set`.',
        ar: 'اكتب الدالة `hasDuplicate(items)` التي تُرجع `true` عندما تتكرّر أي قيمة أكثر من مرة. استهدف O(n): مرور واحد مع تذكّر ما رأيته في `Set`.',
      },
      starter: 'function hasDuplicate(items) {\n  const seen = new Set();\n  \n  return false;\n}\n\nconsole.log(hasDuplicate([3, 1, 3]));',
      solution:
        'function hasDuplicate(items) {\n  const seen = new Set();\n  for (const item of items) {\n    if (seen.has(item)) return true;\n    seen.add(item);\n  }\n  return false;\n}\n\nconsole.log(hasDuplicate([3, 1, 3]));',
      tests: [
        { call: 'hasDuplicate([3, 1, 3])', expect: true },
        { call: 'hasDuplicate([1, 2, 3])', expect: false },
        { call: 'hasDuplicate(["a", "b", "a"])', expect: true },
        { call: 'hasDuplicate([])', expect: false },
      ],
      hint: {
        en: 'For each item: if `seen.has(item)` return `true`, otherwise `seen.add(item)`.',
        ar: 'لكل عنصر: إذا تحقّق `seen.has(item)` فأرجع `true`، وإلا نفّذ `seen.add(item)`.',
      },
      explain: {
        en: '`Set.has` is O(1) on average, so the whole function is O(n) instead of the O(n²) of comparing every pair. Trading a little memory for a lot of speed is the idea behind most optimisation answers.',
        ar: '`Set.has` تعقيدها O(1) في المتوسط، فتصبح الدالة كلها O(n) بدلاً من O(n²) الناتجة عن مقارنة كل زوج. مقايضة قليل من الذاكرة بكثير من السرعة هي الفكرة وراء معظم إجابات تحسين الأداء.',
      },
    },
  ],
};
