import type { Lesson } from './types';

export const pythonListsDicts: Lesson = {
  id: 'python-lists-dicts',
  tag: 'Python',
  title: { en: 'Lists and dictionaries', ar: 'القوائم والقواميس' },
  summary: {
    en: 'The two data structures you will use in almost every Python interview answer, including the aliasing trap.',
    ar: 'بنيتا البيانات اللتان ستستخدمهما في معظم إجابات مقابلات Python، مع فخّ الإشارة إلى القائمة نفسها.',
  },
  minutes: 10,
  roadmapSteps: ['backend_language'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'A **list** keeps items in order and you reach them by position, starting at 0. A **dictionary** maps keys to values and you reach them by key.\n\nBoth can grow and change after they are created.',
        ar: 'تحفظ **القائمة** العناصر بالترتيب وتصل إليها بالموقع ابتداءً من 0. أما **القاموس** فيربط المفاتيح بالقيم وتصل إليها بالمفتاح.\n\nكلاهما قابل للزيادة والتعديل بعد إنشائه.',
      },
      code: 'langs = ["python", "java"]\nlangs.append("dart")\nprint(langs[0], len(langs))      # python 3\n\nuser = {"name": "Sara", "level": 2}\nuser["level"] = 3\nprint(user["name"], user["level"])  # Sara 3',
    },
    {
      kind: 'choice',
      text: { en: 'What does this print?', ar: 'ماذا تطبع هذه الشيفرة؟' },
      code: 'word = "gahz"\nnums = [10, 20, 30, 40]\nprint(word[1:3], nums[-1])',
      options: ['ah 40', 'ga 40', 'ahz 30', 'ah 30'],
      answer: 0,
      hint: {
        en: 'A slice `[start:end]` includes `start` but stops before `end`. A negative index counts from the end.',
        ar: 'المقطع `[start:end]` يشمل `start` ويتوقّف قبل `end`. والفهرس السالب يعدّ من النهاية.',
      },
      explain: {
        en: '`word[1:3]` takes positions 1 and 2 ("a" and "h"); position 3 is not included. `nums[-1]` is the last item.',
        ar: '`word[1:3]` تأخذ الموقعين 1 و2 ("a" و"h")، والموقع 3 غير مشمول. و`nums[-1]` هو العنصر الأخير.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the list comprehension so it builds the squares of 0 to 3.',
        ar: 'أكمل صيغة بناء القائمة (list comprehension) لتنشئ مربّعات الأعداد من 0 إلى 3.',
      },
      template: 'squares = [n ___ 2 for n ___ range(4)]\nprint(squares)  # [0, 1, 4, 9]',
      answers: ['**', 'in'],
      distractors: ['*', 'of', '^'],
      hint: {
        en: 'Python has a dedicated power operator, and its loops read "for item ... collection".',
        ar: 'في Python عامل خاص للأُسّ، وحلقاتها تُقرأ هكذا: "for item ... collection".',
      },
      explain: {
        en: '`**` is the power operator (`*` would only double the number, and `^` is bitwise XOR). A comprehension is a loop that builds a list in one line.',
        ar: '`**` هو عامل الأُسّ (أما `*` فتضاعف الرقم فقط، و`^` هي XOR على مستوى البتات). وصيغة بناء القائمة حلقة تنشئ قائمة في سطر واحد.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'A favourite interview trap. What does this print?',
        ar: 'فخّ مفضّل في المقابلات. ماذا تطبع هذه الشيفرة؟',
      },
      code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)',
      options: ['[1, 2, 3]', '[1, 2]', '[3]', 'Error'],
      answer: 0,
      hint: {
        en: 'Does `b = a` create a second list, or a second name?',
        ar: 'هل تنشئ `b = a` قائمة ثانية أم اسماً ثانياً؟',
      },
      explain: {
        en: '`b = a` does not copy the list: both names point to the same list, so a change through `b` shows through `a`. Use `b = a.copy()` or `b = a[:]` when you need an independent copy.',
        ar: '`b = a` لا تنسخ القائمة: الاسمان يشيران إلى القائمة نفسها، فأي تغيير عبر `b` يظهر عبر `a`. استخدم `b = a.copy()` أو `b = a[:]` عندما تحتاج نسخة مستقلة.',
      },
    },
    {
      kind: 'order',
      text: {
        en: 'Arrange a program that counts how many times each word appears, then prints the most common one.',
        ar: 'رتّب برنامجاً يعدّ مرات ظهور كل كلمة ثم يطبع أكثرها تكراراً.',
      },
      lines: [
        'counts = {}',
        'for word in ["go", "java", "go"]:',
        '    counts[word] = counts.get(word, 0) + 1',
        'top = max(counts, key=counts.get)',
        'print(top, counts[top])  # go 2',
      ],
      hint: {
        en: 'The dictionary must exist before the loop fills it. In Python the indented line belongs to the loop above it.',
        ar: 'يجب أن يوجد القاموس قبل أن تملأه الحلقة. وفي Python السطر المُزاح يتبع الحلقة التي فوقه.',
      },
      explain: {
        en: '`counts.get(word, 0)` returns the current count, or 0 the first time a word is seen. Counting with a dictionary is one of the most reused interview patterns.',
        ar: '`counts.get(word, 0)` تُرجع العدد الحالي، أو 0 عند رؤية الكلمة أول مرة. العدّ باستخدام القاموس من أكثر الأنماط تكراراً في المقابلات.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the code so it reads a key safely and then loops over every key and value.',
        ar: 'أكمل الشيفرة لتقرأ مفتاحاً بأمان ثم تمرّ على كل مفتاح وقيمته.',
      },
      template:
        'user = {"name": "Sara", "city": "Muscat"}\n\nage = user.___("age", 0)   # no error when the key is missing\n\nfor key, value in user.___():\n    print(key, value)',
      answers: ['get', 'items'],
      distractors: ['keys', 'find', 'values'],
      hint: {
        en: 'One method returns a default instead of raising `KeyError`. The other returns pairs.',
        ar: 'إحدى الدالّتين تُرجع قيمة افتراضية بدلاً من إثارة `KeyError`، والأخرى تُرجع أزواجاً.',
      },
      explain: {
        en: '`user["age"]` would raise `KeyError`; `user.get("age", 0)` returns 0 instead. `.items()` yields (key, value) pairs, which the loop unpacks into two names.',
        ar: '`user["age"]` تثير الخطأ `KeyError`، أما `user.get("age", 0)` فتُرجع 0. و`.items()` تعطي أزواجاً (مفتاح، قيمة) تفكّها الحلقة إلى اسمين.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Which statement about looking things up is correct?',
        ar: 'أي عبارة صحيحة بخصوص البحث عن العناصر؟',
      },
      code: 'names_list = ["sara", "omar", "lina"]   # could hold a million names\nnames_set = {"sara", "omar", "lina"}\n\n"lina" in names_list\n"lina" in names_set',
      options: [
        {
          en: 'The list is checked item by item; the set and the dictionary find the item directly, however many there are.',
          ar: 'تُفحص القائمة عنصراً عنصراً، أما المجموعة والقاموس فيجدان العنصر مباشرة مهما كثرت العناصر.',
        },
        {
          en: 'Both take the same time, because `in` works the same way everywhere.',
          ar: 'كلاهما يستغرق الوقت نفسه لأن `in` تعمل بالطريقة نفسها في كل مكان.',
        },
        {
          en: 'The list is faster because it keeps its items in order.',
          ar: 'القائمة أسرع لأنها تحفظ عناصرها بالترتيب.',
        },
      ],
      answer: 0,
      hint: {
        en: 'Sets and dictionaries are built on hash tables.',
        ar: 'المجموعات والقواميس مبنيّة على جداول التجزئة (hash tables).',
      },
      explain: {
        en: 'Membership in a list is O(n): it may scan every item. In a set or dictionary it is O(1) on average thanks to hashing. Choosing the right structure is often the whole answer to an optimisation question.',
        ar: 'فحص الانتماء في القائمة تعقيده O(n) لأنه قد يمرّ على كل العناصر، أما في المجموعة أو القاموس فهو O(1) في المتوسط بفضل التجزئة. واختيار البنية المناسبة هو في الغالب الجواب الكامل عن سؤال تحسين الأداء.',
      },
    },
  ],
};
