/**
 * Free courses and certificates for each roadmap step, shown under the step
 * on the roadmap screen.
 *
 * Rules for this list:
 *   - Free to study without a trial or a card. `certificate` means the provider
 *     also gives a certificate, badge or other proof of completion at no cost;
 *     everything else is a `course`.
 *   - Only the provider's own page, over https. Open the link before adding it.
 *   - `title` is the provider's own name for the course and is not translated;
 *     `about` says what it covers, in both languages.
 *
 * Every step must have at least one entry: TypeScript reports a missing step
 * and `npm test` checks the entries.
 */

import type { Localized } from '../lessons/types';
import { ROADMAP_STEPS, type StepId } from './roadmap';

export type ResourceKind = 'certificate' | 'course';

export interface Resource {
  title: string;
  provider: string;
  url: string;
  kind: ResourceKind;
  about: Localized;
}

const certificate = (title: string, provider: string, url: string, en: string, ar: string): Resource => ({
  title,
  provider,
  url,
  kind: 'certificate',
  about: { en, ar },
});

const course = (title: string, provider: string, url: string, en: string, ar: string): Resource => ({
  title,
  provider,
  url,
  kind: 'course',
  about: { en, ar },
});

// Used by more than one step.
const CS50X = certificate(
  'CS50x: Introduction to Computer Science',
  'Harvard University',
  'https://cs50.harvard.edu/x/',
  'The best-known introduction to computer science: C, Python, SQL, algorithms and the web.',
  'أشهر مقدّمة في علوم الحاسوب: C و Python و SQL والخوارزميات والويب.',
);
const FCC_JS = certificate(
  'JavaScript Algorithms and Data Structures',
  'freeCodeCamp',
  'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
  'JavaScript from the first variable to algorithms, built project by project.',
  'JavaScript من أول متغيّر إلى الخوارزميات، مشروعاً بعد مشروع.',
);
const FCC_SQL = certificate(
  'Relational Database',
  'freeCodeCamp',
  'https://www.freecodecamp.org/learn/relational-database/',
  'SQL and PostgreSQL, with Bash and Git, practised in a real terminal.',
  'SQL و PostgreSQL مع Bash و Git، بالتطبيق في طرفية حقيقية.',
);
const FCC_BACKEND = certificate(
  'Back End Development and APIs',
  'freeCodeCamp',
  'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
  'Node.js, Express and MongoDB, ending with five API projects.',
  'Node.js و Express و MongoDB، وتنتهي بخمسة مشاريع API.',
);
const FCC_CSHARP = certificate(
  'Foundational C# with Microsoft',
  'freeCodeCamp and Microsoft',
  'https://www.freecodecamp.org/learn/foundational-c-sharp-with-microsoft/',
  'Microsoft Learn lessons on C#, followed by a free certification exam.',
  'دروس Microsoft Learn في C#، يتبعها اختبار شهادة مجاني.',
);
const CS50P = certificate(
  'CS50’s Introduction to Programming with Python',
  'Harvard University',
  'https://cs50.harvard.edu/python/',
  'Python from functions and loops to testing, files and classes.',
  'Python من الدوال والحلقات إلى الاختبار والملفات والأصناف.',
);
const ANTHROPIC_COURSES = certificate(
  'Anthropic Courses',
  'Anthropic',
  'https://anthropic.skilljar.com/',
  'Free courses on working with Claude and building with AI, with certificates of completion.',
  'دورات مجانية في العمل مع Claude والبناء بالذكاء الاصطناعي، مع شهادات إتمام.',
);
const POSTMAN = certificate(
  'Postman Academy',
  'Postman',
  'https://academy.postman.com/',
  'Hands-on API courses with free badges, starting with API fundamentals.',
  'دورات عملية في الـ API بشارات مجانية، تبدأ بأساسيات الـ API.',
);
const NETACAD_NETWORKING = certificate(
  'Networking Basics',
  'Cisco Networking Academy',
  'https://www.netacad.com/courses/networking-basics',
  'How networks work: devices, addressing, protocols and home network setup.',
  'كيف تعمل الشبكات: الأجهزة والعنونة والبروتوكولات وإعداد شبكة منزلية.',
);
const NETACAD_SECURITY = certificate(
  'Introduction to Cybersecurity',
  'Cisco Networking Academy',
  'https://www.netacad.com/courses/introduction-to-cybersecurity',
  'Threats, attacks and how people and organizations protect themselves.',
  'التهديدات والهجمات وكيف يحمي الأفراد والمؤسسات أنفسهم.',
);
const KHAN_ALGORITHMS = course(
  'Algorithms',
  'Khan Academy',
  'https://www.khanacademy.org/computing/computer-science/algorithms',
  'Binary search, sorting, recursion and graphs, explained with visual exercises.',
  'البحث الثنائي والترتيب والاستدعاء الذاتي والرسوم البيانية بتمارين مرئية.',
);
const LOGIC = course(
  'Introduction to Logic',
  'Stanford University on Coursera',
  'https://www.coursera.org/learn/logic-introduction',
  'Formal reasoning from the ground up. Free to audit; the certificate is paid.',
  'الاستدلال المنطقي من أساسه. الحضور مجاني، أما الشهادة فمدفوعة.',
);
const AZURE_FUNDAMENTALS = course(
  'Introduction to Cloud Infrastructure: Describe Cloud Concepts',
  'Microsoft Learn',
  'https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/',
  'Cloud models and services, the first part of the AZ-900 material. The exam itself is paid.',
  'نماذج السحابة وخدماتها، وهو الجزء الأول من مادة AZ-900. أما الاختبار نفسه فمدفوع.',
);
const DOTNET_BACKEND = course(
  'Back-end web development with ASP.NET Core',
  'Microsoft .NET',
  'https://dotnet.microsoft.com/en-us/learn/back-end-web-dev',
  'Official videos and tutorials for building web APIs with ASP.NET Core.',
  'فيديوهات ودروس رسمية لبناء واجهات API بـ ASP.NET Core.',
);

const SAYLOR_LOGIC = certificate(
  'PHIL102: Introduction to Critical Thinking and Logic',
  'Saylor Academy',
  'https://learn.saylor.org/course/phil102',
  'Arguments, fallacies and formal logic, with a free certificate after the final exam.',
  'الحُجج والمغالطات والمنطق الصوري، مع شهادة مجانية بعد الاختبار النهائي.',
);
const HACKERRANK_PROBLEM_SOLVING = certificate(
  'Problem Solving (Basic) certification',
  'HackerRank',
  'https://www.hackerrank.com/skills-verification/problem_solving_basic',
  'A free 90-minute test on algorithms and data structures that awards a certificate. It is a test, not a course.',
  'اختبار مجاني مدته 90 دقيقة في الخوارزميات وهياكل البيانات يمنح شهادة. وهو اختبار لا دورة.',
);
const SIMPLILEARN_FLUTTER = certificate(
  'Flutter for Beginners',
  'Simplilearn SkillUp',
  'https://www.simplilearn.com/free-flutter-foundation-course-skillup',
  'A free video course on Flutter basics with a completion certificate. Needs a free account.',
  'دورة فيديو مجانية في أساسيات Flutter مع شهادة إتمام. تتطلب حساباً مجانياً.',
);

export const STEP_RESOURCES: Record<StepId, readonly Resource[]> = {
  basics: [
    CS50X,
    FCC_JS,
    certificate(
      'Python Essentials 1',
      'Cisco Networking Academy',
      'https://www.netacad.com/courses/python-essentials-1',
      'Programming from zero with Python: variables, loops, functions and lists.',
      'البرمجة من الصفر بـ Python: المتغيّرات والحلقات والدوال والقوائم.',
    ),
  ],
  fundamentals: [
    CS50X,
    certificate(
      'Scientific Computing with Python',
      'freeCodeCamp',
      'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
      'Python fundamentals, data structures and object-oriented programming through projects.',
      'أساسيات Python وهياكل البيانات والبرمجة الكائنية عبر مشاريع.',
    ),
  ],
  logic: [SAYLOR_LOGIC, HACKERRANK_PROBLEM_SOLVING, LOGIC],
  systems: [
    CS50X,
    course(
      'Operating Systems: Three Easy Pieces',
      'University of Wisconsin',
      'https://pages.cs.wisc.edu/~remzi/OSTEP/',
      'A free textbook on processes, memory, concurrency and file systems.',
      'كتاب مجاني عن العمليات والذاكرة والتزامن وأنظمة الملفات.',
    ),
  ],
  javascript: [
    FCC_JS,
    certificate(
      'JavaScript Essentials 1',
      'Cisco Networking Academy',
      'https://www.netacad.com/courses/javascript-essentials-1',
      'JavaScript syntax, types, functions and errors for beginners.',
      'صياغة JavaScript وأنواعها ودوالها وأخطاؤها للمبتدئين.',
    ),
    course(
      'The Modern JavaScript Tutorial',
      'javascript.info',
      'https://javascript.info/',
      'A deep, well-ordered reference from the basics to closures and promises.',
      'مرجع عميق ومرتّب من الأساسيات إلى الـ closures والـ promises.',
    ),
  ],
  fullstack: [
    certificate(
      'Responsive Web Design',
      'freeCodeCamp',
      'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
      'HTML and CSS, including accessibility, flexbox and grid.',
      'HTML و CSS، ومنها إتاحة الوصول و flexbox و grid.',
    ),
    FCC_BACKEND,
    certificate(
      'CS50’s Web Programming with Python and JavaScript',
      'Harvard University',
      'https://cs50.harvard.edu/web/',
      'Full-stack web apps with Django, SQL, JavaScript, testing and CI/CD.',
      'تطبيقات ويب متكاملة بـ Django و SQL و JavaScript مع الاختبار و CI/CD.',
    ),
    course(
      'Learn web development',
      'MDN Web Docs',
      'https://developer.mozilla.org/en-US/docs/Learn_web_development',
      'Mozilla’s structured path through HTML, CSS, JavaScript and web standards.',
      'مسار Mozilla المنظَّم في HTML و CSS و JavaScript ومعايير الويب.',
    ),
  ],
  backend_language: [
    certificate(
      'Java Programming',
      'University of Helsinki (MOOC.fi)',
      'https://java-programming.mooc.fi/',
      'A full university course in Java and object-oriented programming.',
      'مقرّر جامعي كامل في Java والبرمجة الكائنية.',
    ),
    CS50P,
    FCC_CSHARP,
    course(
      'PHP: The Right Way',
      'phptherightway.com',
      'https://www.phptherightway.com/',
      'Modern PHP practices: standards, dependencies, security and testing.',
      'ممارسات PHP الحديثة: المعايير والاعتماديات والأمان والاختبار.',
    ),
  ],
  databases: [
    FCC_SQL,
    certificate(
      'MongoDB University',
      'MongoDB',
      'https://learn.mongodb.com/',
      'Free courses and skill badges on document databases, indexes and data modelling.',
      'دورات وشارات مهارة مجانية في قواعد البيانات المستندية والفهارس وتصميم البيانات.',
    ),
    course(
      'PostgreSQL Tutorial',
      'PostgreSQL documentation',
      'https://www.postgresql.org/docs/current/tutorial.html',
      'The official tutorial: tables, joins, transactions, views and window functions.',
      'الدرس الرسمي: الجداول والربط والمعاملات والـ views ودوال النوافذ.',
    ),
  ],
  plsql: [
    certificate(
      'Oracle Dev Gym',
      'Oracle',
      'https://devgym.oracle.com/',
      'Free classes, workouts and quizzes on SQL and PL/SQL, with certificates of completion.',
      'دروس وتمارين واختبارات مجانية في SQL و PL/SQL مع شهادات إتمام.',
    ),
  ],
  rest: [POSTMAN, FCC_BACKEND],
  apis: [
    POSTMAN,
    course(
      'Learn GraphQL',
      'GraphQL Foundation',
      'https://graphql.org/learn/',
      'The official introduction to GraphQL queries, schemas and best practices.',
      'المقدّمة الرسمية لاستعلامات GraphQL ومخططاتها وأفضل ممارساتها.',
    ),
  ],
  networking: [
    NETACAD_NETWORKING,
    certificate(
      'Networking Devices and Initial Configuration',
      'Cisco Networking Academy',
      'https://www.netacad.com/courses/networking-devices-and-initial-configuration',
      'Switches, routers, addressing schemes and basic device configuration.',
      'المبدّلات والموجّهات وخطط العنونة والإعداد الأساسي للأجهزة.',
    ),
  ],
  flutter_basics: [
    SIMPLILEARN_FLUTTER,
    course(
      'Learn Flutter',
      'Flutter documentation',
      'https://docs.flutter.dev/learn',
      'The official guided path from the first widget to a working app.',
      'المسار الرسمي من أول widget إلى تطبيق يعمل.',
    ),
    course(
      'Learn Dart',
      'Dart documentation',
      'https://dart.dev/learn',
      'Official Dart tutorials on the language, async code and packages.',
      'دروس Dart الرسمية في اللغة والشيفرة غير المتزامنة والحزم.',
    ),
  ],
  flutter_core: [
    SIMPLILEARN_FLUTTER,
    course(
      'Learn Dart',
      'Dart documentation',
      'https://dart.dev/learn',
      'Official Dart tutorials on the language, async code and packages.',
      'دروس Dart الرسمية في اللغة والشيفرة غير المتزامنة والحزم.',
    ),
    course(
      'Flutter learning resources',
      'Flutter documentation',
      'https://docs.flutter.dev/reference/learning-resources',
      'Official codelabs, cookbooks and samples collected in one place.',
      'الـ codelabs والأدلّة العملية والأمثلة الرسمية في مكان واحد.',
    ),
  ],
  flutter_architecture: [
    SIMPLILEARN_FLUTTER,
    course(
      'Flutter learning resources',
      'Flutter documentation',
      'https://docs.flutter.dev/reference/learning-resources',
      'Official codelabs, cookbooks and samples, including state management and testing.',
      'الـ codelabs والأدلّة والأمثلة الرسمية، ومنها إدارة الحالة والاختبار.',
    ),
  ],
  flutter_performance: [
    SIMPLILEARN_FLUTTER,
    course(
      'Flutter learning resources',
      'Flutter documentation',
      'https://docs.flutter.dev/reference/learning-resources',
      'Official codelabs, cookbooks and samples, including persistence and platform code.',
      'الـ codelabs والأدلّة والأمثلة الرسمية، ومنها التخزين وشيفرة المنصّة.',
    ),
  ],
  fintech_security: [
    course(
      'OWASP Mobile Application Security',
      'OWASP',
      'https://mas.owasp.org/',
      'The industry standard and testing guide for secure mobile apps (MASVS and MASTG).',
      'المعيار المعتمد ودليل الاختبار لتطبيقات الجوّال الآمنة (MASVS و MASTG).',
    ),
    NETACAD_SECURITY,
  ],
  enterprise_backend: [
    AZURE_FUNDAMENTALS,
    certificate(
      'IBM SkillsBuild',
      'IBM',
      'https://skillsbuild.org/',
      'Free courses with digital credentials in cloud, data, security and AI.',
      'دورات مجانية بشهادات رقمية في السحابة والبيانات والأمن والذكاء الاصطناعي.',
    ),
  ],
  enterprise_operations: [
    NETACAD_SECURITY,
    certificate(
      'DevOps Basics',
      'Simplilearn SkillUp',
      'https://www.simplilearn.com/learn-devops-basics-free-skillup',
      'A free introduction to DevOps practices with a completion certificate. Needs a free account.',
      'مقدّمة مجانية في ممارسات DevOps مع شهادة إتمام. تتطلب حساباً مجانياً.',
    ),
    course(
      'Google SRE books',
      'Google',
      'https://sre.google/books/',
      'Free books on running reliable systems: incidents, monitoring and postmortems.',
      'كتب مجانية عن تشغيل أنظمة موثوقة: الحوادث والمراقبة وتحليل ما بعد الحادثة.',
    ),
    course(
      'OWASP Top 10',
      'OWASP',
      'https://owasp.org/www-project-top-ten/',
      'The most critical web application security risks and how to prevent them.',
      'أخطر المخاطر الأمنية في تطبيقات الويب وكيفية الوقاية منها.',
    ),
  ],
  enterprise_communication: [
    certificate(
      'BUS210: Business Communication',
      'Saylor Academy',
      'https://learn.saylor.org/course/bus210',
      'Writing, presenting and communicating at work, with a free certificate after the final exam.',
      'الكتابة والعرض والتواصل في العمل، مع شهادة مجانية بعد الاختبار النهائي.',
    ),
    course(
      'Technical Writing',
      'Google for Developers',
      'https://developers.google.com/tech-writing',
      'Short courses on writing clear technical documents for any audience.',
      'دورات قصيرة في كتابة مستندات تقنية واضحة لأي جمهور.',
    ),
  ],
  dsa: [FCC_JS, HACKERRANK_PROBLEM_SOLVING, KHAN_ALGORITHMS, CS50X],
  sql: [
    FCC_SQL,
    certificate(
      'CS50’s Introduction to Databases with SQL',
      'Harvard University',
      'https://cs50.harvard.edu/sql/',
      'Querying, relating, designing and optimizing databases with SQL.',
      'الاستعلام وربط الجداول وتصميم قواعد البيانات وتحسينها بـ SQL.',
    ),
    certificate(
      'Intro to SQL',
      'Kaggle Learn',
      'https://www.kaggle.com/learn/intro-to-sql',
      'A short hands-on course: select, filter, group, order and join.',
      'دورة عملية قصيرة: الاختيار والترشيح والتجميع والترتيب والربط.',
    ),
    course(
      'SQLBolt',
      'sqlbolt.com',
      'https://sqlbolt.com/',
      'Interactive SQL lessons that run in the browser, one idea at a time.',
      'دروس SQL تفاعلية تعمل في المتصفح، فكرة في كل درس.',
    ),
  ],
  ai_fundamentals: [
    certificate(
      'Elements of AI',
      'University of Helsinki and MinnaLearn',
      'https://www.elementsofai.com/',
      'What AI is and is not, with no programming required.',
      'ما هو الذكاء الاصطناعي وما ليس هو، دون حاجة إلى البرمجة.',
    ),
    certificate(
      'CS50’s Introduction to Artificial Intelligence with Python',
      'Harvard University',
      'https://cs50.harvard.edu/ai/',
      'Search, knowledge, uncertainty, optimization, machine learning and neural networks.',
      'البحث والمعرفة وعدم اليقين والتحسين وتعلّم الآلة والشبكات العصبية.',
    ),
    certificate(
      'Intro to Machine Learning',
      'Kaggle Learn',
      'https://www.kaggle.com/learn/intro-to-machine-learning',
      'Train and validate your first models in a few hours.',
      'درّب أول نماذجك وتحقّق منها في ساعات قليلة.',
    ),
    certificate(
      'Machine Learning with Python',
      'freeCodeCamp',
      'https://www.freecodecamp.org/learn/machine-learning-with-python/',
      'TensorFlow, neural networks and five machine-learning projects.',
      'TensorFlow والشبكات العصبية وخمسة مشاريع في تعلّم الآلة.',
    ),
  ],
  llms: [
    certificate(
      'Introduction to Generative AI',
      'Google Skills',
      'https://www.skills.google/course_templates/536',
      'A short course on what generative AI is and how it is used, with a completion badge.',
      'دورة قصيرة عن ماهية الذكاء الاصطناعي التوليدي واستخداماته، مع شارة إتمام.',
    ),
    course(
      'LLM Course',
      'Hugging Face',
      'https://huggingface.co/learn/llm-course/chapter1/1',
      'How transformers and large language models work, with open-source tools.',
      'كيف تعمل الـ transformers والنماذج اللغوية الكبيرة، بأدوات مفتوحة المصدر.',
    ),
  ],
  prompt_engineering: [
    ANTHROPIC_COURSES,
    course(
      'ChatGPT Prompt Engineering for Developers',
      'DeepLearning.AI',
      'https://www.deeplearning.ai/courses/chatgpt-prompt-eng',
      'A short course on writing prompts for summarizing, extracting and transforming text.',
      'دورة قصيرة في كتابة الـ prompts للتلخيص والاستخراج وتحويل النصوص.',
    ),
    course(
      'Prompt Engineering Guide',
      'Learn Prompting',
      'https://learnprompting.org/docs/introduction',
      'An open guide from basic prompts to advanced techniques and prompt injection.',
      'دليل مفتوح من الـ prompts الأساسية إلى التقنيات المتقدمة وحقن الـ prompt.',
    ),
  ],
  csharp: [
    FCC_CSHARP,
    course(
      'Write your first code using C#',
      'Microsoft Learn',
      'https://learn.microsoft.com/en-us/training/paths/get-started-c-sharp-part-1/',
      'The first learning path of the C# series, with exercises in the browser.',
      'أول مسار تعليمي في سلسلة C#، بتمارين في المتصفح.',
    ),
    course(
      'A tour of C#',
      'Microsoft Learn',
      'https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/',
      'The official overview of the language and its main features.',
      'النظرة الرسمية العامة على اللغة وأهم خصائصها.',
    ),
  ],
  unity: [
    certificate(
      'Unity Essentials',
      'Unity Learn',
      'https://learn.unity.com/pathway/unity-essentials',
      'The official first pathway: the editor, scenes, objects and publishing. Finishing it earns a Unity badge.',
      'المسار الرسمي الأول: المحرّر والمشاهد والكائنات والنشر. وإتمامه يمنح شارة من Unity.',
    ),
    course(
      'Junior Programmer',
      'Unity Learn',
      'https://learn.unity.com/pathway/junior-programmer',
      'The official pathway for scripting games in C#, from input to object pooling.',
      'المسار الرسمي لبرمجة الألعاب بـ C#، من الإدخال إلى تجميع الكائنات.',
    ),
  ],
  backend_frameworks: [
    FCC_CSHARP,
    course(
      'Spring Academy',
      'Spring',
      'https://spring.academy/courses',
      'Official Spring and Spring Boot courses with hands-on labs.',
      'دورات Spring و Spring Boot الرسمية مع مختبرات عملية.',
    ),
    DOTNET_BACKEND,
    course(
      'Learn Laravel',
      'Laravel',
      'https://laravel.com/learn',
      'The official starting point for learning PHP and Laravel step by step.',
      'نقطة البداية الرسمية لتعلّم PHP و Laravel خطوة خطوة.',
    ),
  ],
  networking_fundamentals: [NETACAD_NETWORKING, NETACAD_SECURITY],
  job_aptitude: [
    certificate(
      'MA006: Foundations of Real World Math',
      'Saylor Academy',
      'https://learn.saylor.org/course/ma006',
      'Fractions, ratios, percentages and word problems, with a free certificate after the final exam.',
      'الكسور والنسب والنسب المئوية والمسائل الكلامية، مع شهادة مجانية بعد الاختبار النهائي.',
    ),
    SAYLOR_LOGIC,
    course(
      'Pre-algebra',
      'Khan Academy',
      'https://www.khanacademy.org/math/pre-algebra',
      'Ratios, percentages, equations and word problems, with practice exercises.',
      'النسب والنسب المئوية والمعادلات والمسائل الكلامية، مع تمارين.',
    ),
  ],
  job_it: [
    NETACAD_SECURITY,
    AZURE_FUNDAMENTALS,
    certificate(
      'IBM SkillsBuild',
      'IBM',
      'https://skillsbuild.org/',
      'Free courses with digital credentials in IT support, cloud, data and security.',
      'دورات مجانية بشهادات رقمية في الدعم التقني والسحابة والبيانات والأمن.',
    ),
  ],
  git_github: [
    certificate(
      'Git Training',
      'Simplilearn SkillUp',
      'https://www.simplilearn.com/learn-git-basics-skillup',
      'A free video course on Git commands and workflows with a completion certificate. Needs a free account.',
      'دورة فيديو مجانية في أوامر Git ومسارات العمل مع شهادة إتمام. تتطلب حساباً مجانياً.',
    ),
    certificate(
      'GitHub Basics',
      'Simplilearn SkillUp',
      'https://www.simplilearn.com/free-github-course-skillup',
      'A free beginner course on repositories, branches and pull requests with a completion certificate.',
      'دورة مجانية للمبتدئين في المستودعات والفروع وطلبات السحب مع شهادة إتمام.',
    ),
    course(
      'Introduction to GitHub',
      'GitHub Skills',
      'https://github.com/skills/introduction-to-github',
      'A hands-on course inside your own repository: branch, commit, pull request, merge.',
      'دورة عملية داخل مستودعك: فرع ثم commit ثم pull request ثم دمج.',
    ),
    course(
      'Review pull requests',
      'GitHub Skills',
      'https://github.com/skills/review-pull-requests',
      'Practise commenting on, suggesting changes to and approving a pull request.',
      'تدرّب على التعليق على pull request واقتراح التعديلات والموافقة عليه.',
    ),
    course(
      'GitHub Foundations',
      'Microsoft Learn',
      'https://learn.microsoft.com/en-us/training/paths/github-foundations/',
      'The study path for the GitHub Foundations certification. The exam itself is paid.',
      'مسار التحضير لشهادة GitHub Foundations. أما الاختبار نفسه فمدفوع.',
    ),
    course(
      'Learn Git Branching',
      'learngitbranching.js.org',
      'https://learngitbranching.js.org/',
      'A visual game for branching, merging, rebasing and working with remotes.',
      'لعبة مرئية للتفريع والدمج والـ rebase والتعامل مع المستودعات البعيدة.',
    ),
    course(
      'Pro Git',
      'git-scm.com',
      'https://git-scm.com/book/en/v2',
      'The complete Git book, free to read online.',
      'كتاب Git الكامل، قراءته مجانية على الإنترنت.',
    ),
    course(
      'Contributing to a project',
      'GitHub Docs',
      'https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project',
      'The official fork, branch and pull request walkthrough for open source.',
      'الشرح الرسمي لمسار الـ fork والفرع و pull request في المشاريع المفتوحة.',
    ),
  ],
  cicd: [
    certificate(
      'CI/CD Pipeline',
      'Simplilearn SkillUp',
      'https://www.simplilearn.com/free-ci-cd-online-training-course-skillup',
      'A free course on continuous integration and delivery pipelines with a completion certificate.',
      'دورة مجانية في خطوط التكامل والتسليم المستمرَّين مع شهادة إتمام.',
    ),
    course(
      'Hello GitHub Actions',
      'GitHub Skills',
      'https://github.com/skills/hello-github-actions',
      'Create and run your first workflow in your own repository.',
      'أنشئ أول workflow وشغّله في مستودعك.',
    ),
    course(
      'Test with Actions',
      'GitHub Skills',
      'https://github.com/skills/test-with-actions',
      'Build a continuous integration workflow that tests every pull request.',
      'ابنِ workflow للتكامل المستمر يختبر كل pull request.',
    ),
    course(
      'Automate your workflow with GitHub Actions',
      'Microsoft Learn',
      'https://learn.microsoft.com/en-us/training/paths/github-actions/',
      'A learning path on workflows, CI, deployment and managing Actions.',
      'مسار تعليمي في الـ workflows والتكامل المستمر والنشر وإدارة Actions.',
    ),
    course(
      'GitHub Actions documentation',
      'GitHub Docs',
      'https://docs.github.com/en/actions',
      'The reference for workflow syntax, triggers, secrets and security hardening.',
      'المرجع لصياغة الـ workflow والمشغّلات والأسرار وتقوية الأمان.',
    ),
  ],
  docker: [
    certificate(
      'Docker Essentials: A Developer Introduction',
      'IBM (Cognitive Class)',
      'https://cognitiveclass.ai/courses/docker-essentials',
      'Run containers, build images and understand orchestration, with a completion badge.',
      'شغّل الحاويات وابنِ الصور وافهم التنسيق، مع شارة إتمام.',
    ),
    course(
      'Get started with Docker containers',
      'Docker Docs',
      'https://docs.docker.com/learn/paths/get-started-with-docker-containers/',
      'The official path: containerize an app, add a database, use Compose.',
      'المسار الرسمي: ضع تطبيقاً في حاوية، أضف قاعدة بيانات، استخدم Compose.',
    ),
    course(
      'Play with Docker Classroom',
      'Docker',
      'https://training.play-with-docker.com/',
      'Guided labs that run in the browser, with nothing to install.',
      'مختبرات موجَّهة تعمل في المتصفح دون تثبيت أي شيء.',
    ),
  ],
  firebase: [
    course(
      'Learning pathways',
      'Firebase',
      'https://firebase.google.com/community/learn',
      'Official guided pathways and videos for each Firebase product.',
      'مسارات تعليمية وفيديوهات رسمية لكل منتج من منتجات Firebase.',
    ),
    course(
      'Firebase web codelab',
      'Firebase Codelabs',
      'https://firebase.google.com/codelabs/firebase-web',
      'Build a chat app step by step with Authentication, Firestore and Hosting.',
      'ابنِ تطبيق محادثة خطوة خطوة بالمصادقة و Firestore والاستضافة.',
    ),
    course(
      'Add Firebase to your JavaScript project',
      'Firebase documentation',
      'https://firebase.google.com/docs/web/setup',
      'The official setup guide for web apps, including the config object.',
      'دليل الإعداد الرسمي لتطبيقات الويب، ومنه كائن الإعدادات.',
    ),
  ],
  supabase: [
    course(
      'Getting Started',
      'Supabase Docs',
      'https://supabase.com/docs/guides/getting-started',
      'Official quickstarts and tutorials for every major framework.',
      'بدايات سريعة ودروس رسمية لكل إطار عمل رئيسي.',
    ),
    FCC_SQL,
  ],
  netlify: [
    course(
      'Get started with Netlify',
      'Netlify Docs',
      'https://docs.netlify.com/start/choose-your-path/',
      'The official start: deploy from Git, then add functions, forms and redirects.',
      'البداية الرسمية: انشر من Git ثم أضف الدوال والنماذج والتحويلات.',
    ),
    course(
      'Learn web development',
      'MDN Web Docs',
      'https://developer.mozilla.org/en-US/docs/Learn_web_development',
      'Mozilla’s path through the web platform that static hosts publish.',
      'مسار Mozilla في منصّة الويب التي تنشرها الاستضافة الثابتة.',
    ),
  ],
  ai_python: [
    CS50P,
    course(
      'AI Python for Beginners',
      'DeepLearning.AI',
      'https://www.deeplearning.ai/courses/ai-python-for-beginners',
      'Python from zero, taught by Andrew Ng with an AI chatbot that explains, debugs and helps you write code.',
      'Python من الصفر، يدرّسها Andrew Ng مع مساعد ذكاء اصطناعي يشرح ويصحّح ويعينك على كتابة الشيفرة.',
    ),
    course(
      'Using GitHub Copilot with Python',
      'Microsoft Learn',
      'https://learn.microsoft.com/en-us/training/modules/introduction-copilot-python/',
      'A hands-on module: set up Copilot in VS Code and build a small Python web API with it.',
      'وحدة عملية: جهّز Copilot في VS Code وابنِ به واجهة API صغيرة بـ Python.',
    ),
    course(
      'GitHub Copilot Fundamentals Part 1 of 2',
      'Microsoft Learn',
      'https://learn.microsoft.com/en-us/training/paths/copilot/',
      'How an AI pair programmer works, prompt writing for code and responsible use.',
      'كيف يعمل مساعد البرمجة بالذكاء الاصطناعي، وكتابة الـ prompts للشيفرة، والاستخدام المسؤول.',
    ),
  ],
  claude_code: [
    ANTHROPIC_COURSES,
    course(
      'Claude Code: A Highly Agentic Coding Assistant',
      'DeepLearning.AI and Anthropic',
      'https://www.deeplearning.ai/short-courses/claude-code-a-highly-agentic-coding-assistant/',
      'A short video course: explore a codebase, add features, write tests and refactor with Claude Code.',
      'دورة فيديو قصيرة: استكشف شيفرة مشروع وأضف ميزات واكتب اختبارات وأعد الهيكلة بـ Claude Code.',
    ),
    course(
      'Claude Code quickstart',
      'Claude Code Docs',
      'https://code.claude.com/docs/en/quickstart',
      'The official first steps: install it, ask about your code, make a change and commit it.',
      'الخطوات الأولى الرسمية: ثبّته واسأله عن شيفرتك ونفّذ تغييراً وأودِعه.',
    ),
  ],
  vibe_coding: [
    ANTHROPIC_COURSES,
    course(
      'Vibe Coding 101 with Replit',
      'DeepLearning.AI and Replit',
      'https://www.deeplearning.ai/short-courses/vibe-coding-101-with-replit/',
      'Build and deploy two apps with an AI agent while learning how to plan, prompt and debug.',
      'ابنِ تطبيقين وانشرهما مع وكيل ذكاء اصطناعي، وتعلّم التخطيط وكتابة الـ prompts وتصحيح الأخطاء.',
    ),
    course(
      'OWASP Top Ten',
      'OWASP Foundation',
      'https://owasp.org/www-project-top-ten/',
      'The most common web security risks, to check an AI-built app against before it goes live.',
      'أشيع المخاطر الأمنية في تطبيقات الويب، لتفحص عليها التطبيق المبني بالذكاء الاصطناعي قبل إطلاقه.',
    ),
  ],
};

export function resourcesForStep(stepId: StepId): readonly Resource[] {
  return STEP_RESOURCES[stepId];
}

/**
 * The resources of every step that covers one of these question categories,
 * without repeats and with the ones that give a certificate first. Used by the
 * quiz cards on the home screen.
 */
export function resourcesForCategories(categories: Iterable<string>): Resource[] {
  const wanted = new Set(categories);
  const byUrl = new Map<string, Resource>();
  for (const [stepId, stepCategories] of Object.entries(ROADMAP_STEPS) as [StepId, readonly string[]][]) {
    if (!stepCategories.some((category) => wanted.has(category))) continue;
    for (const resource of STEP_RESOURCES[stepId]) if (!byUrl.has(resource.url)) byUrl.set(resource.url, resource);
  }
  const all = [...byUrl.values()];
  return [...all.filter((resource) => resource.kind === 'certificate'), ...all.filter((resource) => resource.kind === 'course')];
}
