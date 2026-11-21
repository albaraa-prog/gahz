import type { Lesson } from './types';

const EMPLOYEES = `employees
| id | name  | dept  | salary |
|----|-------|-------|--------|
| 1  | Sara  | IT    | 900    |
| 2  | Omar  | IT    | 700    |
| 3  | Lina  | Sales | 600    |
| 4  | Yusuf | Sales | NULL   |`;

export const sqlFirstQueries: Lesson = {
  id: 'sql-first-queries',
  tag: 'SQL',
  title: { en: 'Your first SQL queries', ar: 'أولى استعلاماتك في SQL' },
  summary: {
    en: 'Read, filter, group and join data, and avoid the NULL mistake that catches most candidates.',
    ar: 'اقرأ البيانات وصفِّها وجمّعها واربط الجداول، وتجنّب خطأ NULL الذي يقع فيه معظم المتقدّمين.',
  },
  minutes: 12,
  roadmapSteps: ['sql'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: 'SQL asks a database for rows. A query says **which columns** you want (`SELECT`), **from which table** (`FROM`) and **which rows** (`WHERE`).\n\nThis lesson uses the small table below. Keep it in mind for the next steps.',
        ar: 'تطلب SQL صفوفاً من قاعدة البيانات. يحدّد الاستعلام **الأعمدة** المطلوبة (`SELECT`)، و**الجدول** المصدر (`FROM`)، و**الصفوف** المطلوبة (`WHERE`).\n\nيستخدم هذا الدرس الجدول الصغير في الأسفل، فتذكّره في الخطوات التالية.',
      },
      code: `${EMPLOYEES}\n\nSELECT name, salary\nFROM employees\nWHERE dept = 'IT';\n\n-- Sara 900\n-- Omar 700`,
    },
    {
      kind: 'order',
      text: {
        en: 'Clauses must come in a fixed order. Arrange a query that returns the two highest-paid employees who earn more than 500.',
        ar: 'للبنود ترتيب ثابت. رتّب استعلاماً يُرجع أعلى موظّفَين راتباً ممّن يتقاضون أكثر من 500.',
      },
      lines: ['SELECT name, salary', 'FROM employees', 'WHERE salary > 500', 'ORDER BY salary DESC', 'LIMIT 2;'],
      hint: {
        en: 'Choose the columns, name the table, filter the rows, sort them, and only then cut the list.',
        ar: 'اختر الأعمدة، ثم سمِّ الجدول، ثم صفِّ الصفوف، ثم رتّبها، وبعد ذلك فقط اقتطع القائمة.',
      },
      explain: {
        en: 'The written order is always SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. Sorting has to happen before LIMIT, otherwise you would cut random rows.',
        ar: 'ترتيب الكتابة دائماً: SELECT ثم FROM ثم WHERE ثم GROUP BY ثم HAVING ثم ORDER BY ثم LIMIT. ويجب أن يسبق الترتيبُ LIMIT، وإلا اقتُطعت صفوف عشوائية.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Complete the query so it returns the number of employees in each department.',
        ar: 'أكمل الاستعلام ليُرجع عدد الموظفين في كل قسم.',
      },
      code: EMPLOYEES,
      template: 'SELECT dept, ___(*) AS people\nFROM employees\n___ BY dept;\n\n-- IT    2\n-- Sales 2',
      answers: ['COUNT', 'GROUP'],
      distractors: ['SUM', 'ORDER', 'TOTAL'],
      hint: {
        en: 'You are counting rows, and you want one result row per department.',
        ar: 'أنت تعدّ الصفوف، وتريد صفاً واحداً في النتيجة لكل قسم.',
      },
      explain: {
        en: '`GROUP BY dept` folds the rows into one group per department, and `COUNT(*)` counts the rows of each group. `SUM` would add up a column instead of counting rows.',
        ar: '`GROUP BY dept` تجمع الصفوف في مجموعة واحدة لكل قسم، و`COUNT(*)` تعدّ صفوف كل مجموعة. أما `SUM` فتجمع قيم عمود بدلاً من عدّ الصفوف.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Yusuf has no salary yet (NULL). How many rows does this query return?',
        ar: 'ليس ليوسف راتب بعد (NULL). كم صفاً يُرجع هذا الاستعلام؟',
      },
      code: `${EMPLOYEES}\n\nSELECT name\nFROM employees\nWHERE salary = NULL;`,
      options: ['0', '1', '4', '3'],
      answer: 0,
      hint: {
        en: 'NULL means "unknown". Is an unknown value equal to another unknown value?',
        ar: 'NULL تعني «غير معروف». هل تساوي قيمةٌ غير معروفة قيمةً أخرى غير معروفة؟',
      },
      explain: {
        en: 'Any comparison with NULL using `=` gives "unknown", never true, so no row matches. To find missing values write `WHERE salary IS NULL`. This is one of the most common SQL interview questions.',
        ar: 'أي مقارنة مع NULL باستخدام `=` تعطي «غير معروف» ولا تكون صحيحة أبداً، فلا يطابق أي صف. للبحث عن القيم المفقودة اكتب `WHERE salary IS NULL`. هذا من أكثر أسئلة SQL شيوعاً في المقابلات.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'You want only the departments whose **average** salary is above 650. Where does that condition go?',
        ar: 'تريد فقط الأقسام التي يزيد **متوسط** رواتبها على 650. أين تضع هذا الشرط؟',
      },
      code: 'SELECT dept, AVG(salary)\nFROM employees\nGROUP BY dept\n-- condition on AVG(salary) goes here',
      options: [
        { en: 'In `HAVING`, which filters groups after they are formed.', ar: 'في `HAVING` التي تصفّي المجموعات بعد تكوينها.' },
        { en: 'In `WHERE`, which filters every kind of condition.', ar: 'في `WHERE` التي تصفّي كل أنواع الشروط.' },
        { en: 'In `ORDER BY`, because averages need sorting.', ar: 'في `ORDER BY` لأن المتوسطات تحتاج إلى ترتيب.' },
      ],
      answer: 0,
      hint: {
        en: 'When `WHERE` runs, the groups and their averages do not exist yet.',
        ar: 'عند تنفيذ `WHERE` لا تكون المجموعات ومتوسطاتها قد وُجدت بعد.',
      },
      explain: {
        en: '`WHERE` filters single rows before grouping; `HAVING` filters whole groups after it, so it is the only place where `AVG`, `COUNT` or `SUM` can be used in a condition: `HAVING AVG(salary) > 650`.',
        ar: '`WHERE` تصفّي الصفوف المفردة قبل التجميع، و`HAVING` تصفّي المجموعات كاملةً بعده، فهي المكان الوحيد الذي يصحّ فيه استخدام `AVG` أو `COUNT` أو `SUM` في شرط: `HAVING AVG(salary) > 650`.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Orders live in their own table and point to a customer by id. Complete the query that shows each order with its customer name.',
        ar: 'الطلبات محفوظة في جدول خاص وتشير إلى العميل برقمه. أكمل الاستعلام الذي يعرض كل طلب مع اسم عميله.',
      },
      template: 'SELECT o.id, c.name\nFROM orders o\n___ customers c\n  ___ o.customer_id = c.id;',
      answers: ['JOIN', 'ON'],
      distractors: ['WHERE', 'WITH', 'UNION'],
      hint: {
        en: 'One keyword brings in the second table, the other states how the rows match.',
        ar: 'كلمة مفتاحية تجلب الجدول الثاني، والأخرى تحدّد كيف تتطابق الصفوف.',
      },
      explain: {
        en: '`JOIN ... ON` combines rows from two tables where the condition holds. A plain `JOIN` is an inner join: orders without a matching customer are left out, while `LEFT JOIN` would keep them.',
        ar: '`JOIN ... ON` تدمج صفوف جدولين حيث يتحقّق الشرط. و`JOIN` وحدها تعني inner join: تُستبعد الطلبات التي لا عميل مطابقاً لها، أما `LEFT JOIN` فتُبقيها.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'Last one. What does this query return for the table?',
        ar: 'السؤال الأخير. ماذا يُرجع هذا الاستعلام للجدول؟',
      },
      code: `${EMPLOYEES}\n\nSELECT COUNT(*), COUNT(salary)\nFROM employees;`,
      options: ['4 3', '4 4', '3 3', '3 4'],
      answer: 0,
      hint: {
        en: '`COUNT(*)` counts rows. `COUNT(column)` counts values. Is NULL a value?',
        ar: '`COUNT(*)` تعدّ الصفوف، و`COUNT(column)` تعدّ القيم. هل NULL قيمة؟',
      },
      explain: {
        en: '`COUNT(*)` counts all 4 rows, while `COUNT(salary)` skips NULLs and returns 3. `AVG` and `SUM` ignore NULLs in the same way.',
        ar: '`COUNT(*)` تعدّ الصفوف الأربعة كلها، أما `COUNT(salary)` فتتجاهل قيم NULL وتُرجع 3. و`AVG` و`SUM` تتجاهلان NULL بالطريقة نفسها.',
      },
    },
  ],
};
