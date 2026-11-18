/**
 * Interface translations (English and Arabic).
 *
 * - `t('key', { n: 3 })` returns the string for the active language.
 * - Static markup in index.html is translated through `data-i18n` attributes,
 *   see `applyStaticTranslations`.
 * - To add a language: add a dictionary with the same keys, add it to
 *   `DICTIONARIES` and `LOCALES`, and list it in `RTL_LOCALES` if needed.
 *
 * This module has no imports on purpose, so services can use it for error
 * messages without creating import cycles. Question content is not translated
 * here; it lives in the JSON banks (Arabic text in /src/data/ar, see
 * services/questionText.ts).
 */

export type Locale = 'en' | 'ar';

export const LOCALES: readonly Locale[] = ['en', 'ar'];
const RTL_LOCALES: readonly Locale[] = ['ar'];

const en = {
  'app.title': 'Gahz جاهز · Programming and interview practice',

  // Header
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.themeLight': 'Light',
  'nav.themeDark': 'Dark',
  'nav.themeToLight': 'Switch to the light theme',
  'nav.themeToDark': 'Switch to the dark theme',
  'nav.otherLanguage': 'العربية',
  'nav.otherLanguageHint': 'عرض الواجهة باللغة العربية',
  'nav.account': 'Account',
  'status.guest': 'Guest mode',
  'status.syncing': 'Syncing…',
  'status.synced': 'Synced',
  'status.offline': 'Offline',
  'status.error': 'Sync error · Retry',
  'statusHint.disabled': 'Your progress is saved in this browser. Cloud sync is not configured for this build.',
  'statusHint.guest': 'Your progress is saved in this browser. Sign in to back it up and use it on other devices.',
  'statusHint.syncing': 'Saving your progress to the cloud.',
  'statusHint.synced': 'Your progress is backed up to your account.',
  'statusHint.offline': 'You are offline. Progress is saved on this device and will sync when you reconnect.',
  'statusHint.error': 'Cloud sync failed. Click to retry. Your progress is still saved on this device.',
  'signOut.title': 'Sign out?',
  'signOut.body':
    'Your history is backed up to your account. It will be removed from this device and will come back when you sign in again.',
  'signOut.confirm': 'Sign out',
  'signOut.cancel': 'Stay signed in',
  'signOut.done': 'Signed out. You are now in guest mode.',

  // Home
  'home.eyebrow': 'Open-source interview practice',
  'home.headline': 'Be ready before you walk in.',
  'home.loading': 'Loading the question bank…',
  'home.lead':
    '{count} questions across {topics} topics: Flutter and fintech, APIs and networking, databases, CS fundamentals, logic, Arabic, and an Oman and GCC enterprise track. Timed, randomized every session, with an explanation for every answer.',
  'home.studyLabel': 'Study mode.',
  'home.studyText': 'Show whether you were right, and why, as soon as you answer.',
  'home.start': 'Start mixed exam · 25 min',
  'home.custom': 'Build a custom quiz',
  'home.focused': 'Focused practice',
  'chip.questions': '{n} questions',
  'chip.minutes': '{n} min',
  'bank.error': 'The question bank could not be loaded. Check your connection and try again.',
  'bank.partial': 'Some topics could not be loaded ({list}). The rest of the question bank is available.',
  'bank.retry': 'Retry',

  // Presets
  'preset.standard.mode': 'Mixed exam',
  'preset.oman_enterprise.title': 'Oman Enterprise & Banking Tech',
  'preset.oman_enterprise.desc':
    'Scenario-based interview questions modelled on what banks, telecom operators, consulting firms and government entities in Oman and the GCC look for: enterprise backends and ERP integration, Oracle and PostgreSQL, production incidents and security judgment, resilience, and stakeholder communication.',
  'preset.oman_enterprise.chip': 'GCC interview track',
  'preset.flutter_fintech.title': 'Senior Flutter Engineer (Thawani Fintech)',
  'preset.flutter_fintech.desc':
    'Complete mastery pack: junior-to-senior Flutter and Dart, Clean Architecture, Provider, mobile security (SSL pinning, biometrics, JWT), Hive and SQLite, QR and NFC payments, deep links, flavors and performance.',
  'preset.flutter_fintech.chip': 'Fintech special',
  'preset.networking_apis.title': 'APIs, REST & Networking Protocols',
  'preset.networking_apis.desc':
    'RESTful design, HTTP/2 and HTTP/3, WebSockets, gRPC, TLS 1.3, TCP/IP, DNS, caching, CORS, rate limiting and webhooks.',
  'preset.cs_basics.title': 'CS Fundamentals & Systems',
  'preset.cs_basics.desc':
    'Core foundations: algorithms, data structures (trees, graphs, hash tables), memory allocation, concurrency and OOP principles.',
  'preset.iq.title': 'Logic & IQ Drill',
  'preset.iq.desc': 'Test your problem-solving speed with 15 logical reasoning and puzzle questions.',
  'preset.arabic.title': 'الأسئلة باللغة العربية',
  'preset.arabic.desc': 'أسئلة تدريبية باللغة العربية تختبر أساسيات البرمجة وعلم الحاسوب.',
  'mode.custom': 'Custom ({n} questions)',

  // Practice my mistakes
  'mistakes.title': 'Practice my mistakes',
  'mistakes.desc': 'A quiz made only of the questions you last answered wrong. Get one right in any quiz and it leaves the list.',
  'mistakes.empty': 'Nothing to review yet. Questions you answer wrong will be collected here.',
  'mistakes.chip': 'From your history',
  'mistakes.count': '{n} to review',
  'mistakes.again': 'Practice my mistakes ({n})',

  // Custom quiz
  'custom.title': 'Build a custom quiz',
  'custom.count': 'Number of questions',
  'custom.minutes': 'Time limit (minutes)',
  'custom.selectAll': 'Select all categories',
  'custom.include': 'Include categories',
  'custom.cancel': 'Cancel',
  'custom.start': 'Start custom quiz',

  // History
  'history.title': 'Your history',
  'history.clear': 'Clear history',
  'history.empty': 'No attempts yet. Your results will appear here.',
  'history.date': 'Date',
  'history.mode': 'Mode',
  'history.questions': 'Questions',
  'history.score': 'Score',
  'history.correct': 'Correct',
  'history.result': 'Result',
  'history.pass': 'Pass',
  'history.fail': 'Fail',
  'history.streak': '{n}-day streak',
  'history.clearTitle': 'Clear history?',
  'history.clearLocal': 'Are you sure you want to clear the history saved on this device? This cannot be undone.',
  'history.clearCloud': 'This permanently deletes your attempt history from this device and from your cloud account.',
  'history.cleared': 'History cleared.',

  // Quiz
  'quiz.prev': 'Previous',
  'quiz.next': 'Next',
  'quiz.reviewFinish': 'Review and finish',
  'quiz.flag': 'Flag for review',
  'quiz.map': 'Question map',
  'quiz.finish': 'Finish and submit',
  'quiz.studySidebar': 'Study mode (instant feedback)',
  'quiz.explanation': 'Explanation',
  'quiz.timeRemaining': 'Time remaining',
  'legend.unanswered': 'Unanswered',
  'legend.answered': 'Answered',
  'legend.flagged': 'Flagged',
  'difficulty.easy': 'Easy',
  'difficulty.medium': 'Medium',
  'difficulty.hard': 'Hard',
  'map.question': 'Question {n}',
  'map.correct': 'correct',
  'map.incorrect': 'incorrect',
  'map.answered': 'answered',
  'map.unanswered': 'unanswered',
  'map.flagged': 'flagged',
  'submit.title': 'Submit exam?',
  'submit.unanswered': 'You have <strong>{n} unanswered</strong> question(s). Are you sure you want to finish and submit?',
  'submit.allAnswered': 'All questions have been answered. Would you like to submit and grade your exam now?',
  'submit.confirm': 'Submit and finish',
  'dialog.back': 'Go back',
  'dialog.ok': 'OK',
  'resume.title': 'Resume your quiz?',
  'resume.body': 'You have an unfinished quiz. Would you like to pick up where you left off?',
  'resume.confirm': 'Resume',
  'resume.discard': 'Discard',
  'timeUp.title': "Time's up!",
  'timeUp.body': 'Your exam was submitted automatically.',

  // Results
  'verdict.pass': 'Pass. Solid mid-level developer.',
  'verdict.junior': 'Passed. Associate or junior level.',
  'verdict.fail': 'Review required. Keep practicing.',
  'results.counts': '{correct} of {total} correct',
  'results.again': 'Try another exam',
  'results.byTopic': 'By topic',
  'results.intro': 'See which topics are solid and which ones need another pass.',
  'review.title': 'Review',
  'review.subtitle': 'Every question with the correct answer and its explanation',
  'review.question': 'Question {n}',
  'review.correct': '✓ Correct',
  'review.incorrect': '✗ Incorrect',
  'review.skipped': 'Skipped',
  'review.flagged': 'Flagged',
  'review.correctAnswer': 'Correct answer',
  'review.yourAnswer': 'Your answer',
  'filter.all': 'All ({n})',
  'filter.correct': 'Correct ({n})',
  'filter.incorrect': 'Incorrect or skipped ({n})',
  'filter.flagged': 'Flagged ({n})',

  // Sign-in
  'auth.title': 'Sign in to sync your progress',
  'auth.tabSignIn': 'Sign in',
  'auth.tabRegister': 'Create account',
  'auth.name': 'Name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.or': 'or',
  'auth.google': 'Continue with Google',
  'auth.forgot': 'Forgot password?',
  'auth.guest': 'Continue as guest',
  'auth.needEmail': 'Please enter your email address.',
  'auth.shortPassword': 'Please enter a password with at least 6 characters.',
  'auth.resetNeedEmail': 'Enter your email address above first, then choose "Forgot password?".',
  'auth.resetSent': 'If an account exists for that address, a password reset email is on its way.',
  'auth.signedIn': 'Signed in as {name}. Syncing your history…',
  'auth.yourAccount': 'your account',
  'authError.invalidEmail': 'That email address does not look right.',
  'authError.missingPassword': 'Please enter your password.',
  'authError.invalidCredential': 'Email or password is incorrect.',
  'authError.userDisabled': 'This account has been disabled.',
  'authError.emailInUse': 'An account with this email already exists. Try signing in.',
  'authError.weakPassword': 'Please choose a password with at least 6 characters.',
  'authError.tooManyRequests': 'Too many attempts. Please wait a few minutes and try again.',
  'authError.network': 'No connection. Check your internet and try again.',
  'authError.popupBlocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'authError.notAllowed': 'This sign-in method is not enabled for this project yet.',
  'authError.unauthorizedDomain': 'This domain is not authorized for sign-in in the Firebase console.',
  'authError.generic': 'Sign-in failed. Please try again.',
  'authError.status': 'Could not check your sign-in status.',

  // Errors and notices
  'error.generic': 'Something went wrong. Your progress is still saved.',
  'error.view': 'A part of the page failed to update.',
  'error.storageFull': 'Browser storage is full. New progress may not be saved on this device.',
  'error.storageWrite': 'Could not save to browser storage.',
  'error.storageUnavailable': 'Browser storage is unavailable, so progress will not be kept after you close this tab.',
  'error.sync': 'Cloud sync failed. Your progress is still saved on this device.',
  'error.signOut': 'Could not sign out. Please try again.',
  'error.clearCloud': 'Could not clear your cloud history. Please try again.',
  'error.startQuiz': 'Could not start the quiz. Please try again.',
  'start.title': 'Cannot start this quiz',
  'start.loading': 'The question bank is still loading. Please try again in a moment.',
  'start.presetEmpty': 'The questions for this exam could not be loaded.',
  'start.noCategory': 'Please select at least one category.',
  'start.noQuestions': 'No questions found in the selected categories.',
  'start.noMistakes': 'You have no mistakes to practice right now.',

  // Footer
  'footer.license': '© 2026 Gahz جاهز. Open source under the MIT License.',
  'footer.count': '{count} questions in {topics} categories',
  'footer.privacy': 'Privacy',
  'privacy.title': 'Privacy',
  'privacy.body':
    'As a guest, your attempts and settings are saved only in this browser. If you sign in, your attempt history, settings and stats are also stored in your own private cloud record so you can use them on other devices. Nobody else can read them.',
} as const;

export type TranslationKey = keyof typeof en;

const ar: Record<TranslationKey, string> = {
  'app.title': 'جاهز Gahz · تدرّب على البرمجة والمقابلات التقنية',

  'nav.signIn': 'تسجيل الدخول',
  'nav.signOut': 'تسجيل الخروج',
  'nav.themeLight': 'فاتح',
  'nav.themeDark': 'داكن',
  'nav.themeToLight': 'التبديل إلى المظهر الفاتح',
  'nav.themeToDark': 'التبديل إلى المظهر الداكن',
  'nav.otherLanguage': 'English',
  'nav.otherLanguageHint': 'Show the interface in English',
  'nav.account': 'الحساب',
  'status.guest': 'وضع الضيف',
  'status.syncing': 'جارٍ المزامنة…',
  'status.synced': 'تمت المزامنة',
  'status.offline': 'غير متصل',
  'status.error': 'خطأ في المزامنة · أعد المحاولة',
  'statusHint.disabled': 'يُحفظ تقدّمك في هذا المتصفح. المزامنة السحابية غير مفعّلة في هذه النسخة.',
  'statusHint.guest': 'يُحفظ تقدّمك في هذا المتصفح. سجّل الدخول لحفظه احتياطياً واستخدامه على أجهزة أخرى.',
  'statusHint.syncing': 'جارٍ حفظ تقدّمك في السحابة.',
  'statusHint.synced': 'تقدّمك محفوظ احتياطياً في حسابك.',
  'statusHint.offline': 'أنت غير متصل بالإنترنت. يُحفظ تقدّمك على هذا الجهاز وستتم المزامنة عند عودة الاتصال.',
  'statusHint.error': 'تعذّرت المزامنة السحابية. انقر لإعادة المحاولة. تقدّمك ما زال محفوظاً على هذا الجهاز.',
  'signOut.title': 'تسجيل الخروج؟',
  'signOut.body': 'سجلّك محفوظ احتياطياً في حسابك. سيُزال من هذا الجهاز ويعود عند تسجيل الدخول مرة أخرى.',
  'signOut.confirm': 'تسجيل الخروج',
  'signOut.cancel': 'البقاء مسجّلاً',
  'signOut.done': 'تم تسجيل الخروج. أنت الآن في وضع الضيف.',

  'home.eyebrow': 'منصة مفتوحة المصدر للتحضير للمقابلات',
  'home.headline': 'كن جاهزاً قبل أن تدخل المقابلة.',
  'home.loading': 'جارٍ تحميل بنك الأسئلة…',
  'home.lead':
    '{count} سؤالاً في {topics} موضوعاً: Flutter والتقنية المالية، واجهات البرمجة والشبكات، قواعد البيانات، أساسيات علوم الحاسوب، المنطق، أسئلة بالعربية، ومسار خاص بمؤسسات عُمان والخليج. اختبارات مؤقتة وعشوائية في كل مرة، مع شرح لكل إجابة.',
  'home.studyLabel': 'وضع الدراسة.',
  'home.studyText': 'اعرف إن كانت إجابتك صحيحة، ولماذا، فور اختيارها.',
  'home.start': 'ابدأ اختباراً منوّعاً · 25 دقيقة',
  'home.custom': 'أنشئ اختباراً مخصصاً',
  'home.focused': 'تدريب مركّز',
  'chip.questions': '{n} سؤالاً',
  'chip.minutes': '{n} دقيقة',
  'bank.error': 'تعذّر تحميل بنك الأسئلة. تحقّق من اتصالك ثم أعد المحاولة.',
  'bank.partial': 'تعذّر تحميل بعض المواضيع ({list}). بقية بنك الأسئلة متاحة.',
  'bank.retry': 'إعادة المحاولة',

  'preset.standard.mode': 'اختبار منوّع',
  'preset.oman_enterprise.title': 'تقنيات المؤسسات والبنوك في عُمان',
  'preset.oman_enterprise.desc':
    'أسئلة مقابلات مبنية على مواقف واقعية، على غرار ما تبحث عنه البنوك وشركات الاتصالات والشركات الاستشارية والجهات الحكومية في عُمان والخليج: أنظمة المؤسسات والتكامل مع ERP، Oracle و PostgreSQL، حوادث الإنتاج والحسّ الأمني، مرونة الأنظمة، والتواصل مع أصحاب المصلحة.',
  'preset.oman_enterprise.chip': 'مسار مقابلات الخليج',
  'preset.flutter_fintech.title': 'مهندس Flutter أول (التقنية المالية · ثواني)',
  'preset.flutter_fintech.desc':
    'حزمة إتقان كاملة: Flutter و Dart من المبتدئ إلى الخبير، Clean Architecture، Provider، أمن تطبيقات الجوال (SSL Pinning والقياسات الحيوية و JWT)، Hive و SQLite، مدفوعات QR و NFC، الروابط العميقة، Flavors والأداء.',
  'preset.flutter_fintech.chip': 'خاص بالتقنية المالية',
  'preset.networking_apis.title': 'واجهات البرمجة و REST وبروتوكولات الشبكات',
  'preset.networking_apis.desc':
    'تصميم REST، HTTP/2 و HTTP/3، WebSockets، gRPC، TLS 1.3، TCP/IP، DNS، التخزين المؤقت، CORS، تحديد المعدّل و Webhooks.',
  'preset.cs_basics.title': 'أساسيات علوم الحاسوب والأنظمة',
  'preset.cs_basics.desc':
    'الأسس الجوهرية: الخوارزميات، هياكل البيانات (الأشجار والرسوم البيانية وجداول التجزئة)، إدارة الذاكرة، التزامن ومبادئ البرمجة الكائنية.',
  'preset.iq.title': 'تمرين المنطق والذكاء',
  'preset.iq.desc': 'اختبر سرعتك في حل المشكلات عبر 15 سؤالاً في الاستدلال المنطقي والألغاز.',
  'preset.arabic.title': 'الأسئلة باللغة العربية',
  'preset.arabic.desc': 'أسئلة تدريبية باللغة العربية تختبر أساسيات البرمجة وعلم الحاسوب.',
  'mode.custom': 'مخصص ({n} سؤالاً)',

  'mistakes.title': 'تدرّب على أخطائي',
  'mistakes.desc': 'اختبار من الأسئلة التي أخطأت فيها في آخر إجابة لك فقط. أجب عن السؤال إجابة صحيحة في أي اختبار فيخرج من القائمة.',
  'mistakes.empty': 'لا شيء للمراجعة بعد. الأسئلة التي تخطئ فيها ستُجمع هنا.',
  'mistakes.chip': 'من سجلّك',
  'mistakes.count': '{n} للمراجعة',
  'mistakes.again': 'تدرّب على أخطائي ({n})',

  'custom.title': 'أنشئ اختباراً مخصصاً',
  'custom.count': 'عدد الأسئلة',
  'custom.minutes': 'المدة (بالدقائق)',
  'custom.selectAll': 'تحديد كل الفئات',
  'custom.include': 'الفئات المشمولة',
  'custom.cancel': 'إلغاء',
  'custom.start': 'ابدأ الاختبار المخصص',

  'history.title': 'سجلّك',
  'history.clear': 'مسح السجل',
  'history.empty': 'لا توجد محاولات بعد. ستظهر نتائجك هنا.',
  'history.date': 'التاريخ',
  'history.mode': 'النوع',
  'history.questions': 'الأسئلة',
  'history.score': 'النتيجة',
  'history.correct': 'الصحيحة',
  'history.result': 'الحالة',
  'history.pass': 'ناجح',
  'history.fail': 'لم ينجح',
  'history.streak': 'سلسلة {n} يوم',
  'history.clearTitle': 'مسح السجل؟',
  'history.clearLocal': 'هل أنت متأكد من مسح السجل المحفوظ على هذا الجهاز؟ لا يمكن التراجع عن ذلك.',
  'history.clearCloud': 'سيُحذف سجل محاولاتك نهائياً من هذا الجهاز ومن حسابك السحابي.',
  'history.cleared': 'تم مسح السجل.',

  'quiz.prev': 'السابق',
  'quiz.next': 'التالي',
  'quiz.reviewFinish': 'راجع وأنهِ',
  'quiz.flag': 'علّم للمراجعة',
  'quiz.map': 'خريطة الأسئلة',
  'quiz.finish': 'إنهاء وتسليم',
  'quiz.studySidebar': 'وضع الدراسة (تصحيح فوري)',
  'quiz.explanation': 'الشرح',
  'quiz.timeRemaining': 'الوقت المتبقي',
  'legend.unanswered': 'بلا إجابة',
  'legend.answered': 'تمت الإجابة',
  'legend.flagged': 'معلَّم',
  'difficulty.easy': 'سهل',
  'difficulty.medium': 'متوسط',
  'difficulty.hard': 'صعب',
  'map.question': 'السؤال {n}',
  'map.correct': 'صحيح',
  'map.incorrect': 'خاطئ',
  'map.answered': 'تمت الإجابة',
  'map.unanswered': 'بلا إجابة',
  'map.flagged': 'معلَّم',
  'submit.title': 'تسليم الاختبار؟',
  'submit.unanswered': 'لديك <strong>{n}</strong> من الأسئلة بلا إجابة. هل أنت متأكد من الإنهاء والتسليم؟',
  'submit.allAnswered': 'أجبت عن جميع الأسئلة. هل تريد تسليم الاختبار وتصحيحه الآن؟',
  'submit.confirm': 'تسليم وإنهاء',
  'dialog.back': 'رجوع',
  'dialog.ok': 'حسناً',
  'resume.title': 'متابعة الاختبار؟',
  'resume.body': 'لديك اختبار لم يكتمل. هل تريد المتابعة من حيث توقفت؟',
  'resume.confirm': 'متابعة',
  'resume.discard': 'تجاهل',
  'timeUp.title': 'انتهى الوقت!',
  'timeUp.body': 'تم تسليم اختبارك تلقائياً.',

  'verdict.pass': 'ناجح. مستوى مطوّر متوسط متمكّن.',
  'verdict.junior': 'ناجح. مستوى مبتدئ أو مساعد.',
  'verdict.fail': 'تحتاج إلى مراجعة. واصل التدريب.',
  'results.counts': '{correct} صحيحة من {total}',
  'results.again': 'جرّب اختباراً آخر',
  'results.byTopic': 'حسب الموضوع',
  'results.intro': 'اعرف المواضيع التي أتقنتها والمواضيع التي تحتاج إلى مراجعة أخرى.',
  'review.title': 'المراجعة',
  'review.subtitle': 'كل سؤال مع إجابته الصحيحة وشرحها',
  'review.question': 'السؤال {n}',
  'review.correct': '✓ صحيحة',
  'review.incorrect': '✗ خاطئة',
  'review.skipped': 'لم تُجب',
  'review.flagged': 'معلَّم',
  'review.correctAnswer': 'الإجابة الصحيحة',
  'review.yourAnswer': 'إجابتك',
  'filter.all': 'الكل ({n})',
  'filter.correct': 'الصحيحة ({n})',
  'filter.incorrect': 'الخاطئة أو المتروكة ({n})',
  'filter.flagged': 'المعلَّمة ({n})',

  'auth.title': 'سجّل الدخول لمزامنة تقدّمك',
  'auth.tabSignIn': 'تسجيل الدخول',
  'auth.tabRegister': 'إنشاء حساب',
  'auth.name': 'الاسم',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.or': 'أو',
  'auth.google': 'المتابعة باستخدام Google',
  'auth.forgot': 'نسيت كلمة المرور؟',
  'auth.guest': 'المتابعة كضيف',
  'auth.needEmail': 'يرجى إدخال بريدك الإلكتروني.',
  'auth.shortPassword': 'يرجى إدخال كلمة مرور من 6 أحرف على الأقل.',
  'auth.resetNeedEmail': 'أدخل بريدك الإلكتروني في الأعلى أولاً، ثم اختر «نسيت كلمة المرور؟».',
  'auth.resetSent': 'إذا كان هناك حساب بهذا البريد، فستصلك رسالة لإعادة تعيين كلمة المرور.',
  'auth.signedIn': 'تم تسجيل الدخول باسم {name}. جارٍ مزامنة سجلّك…',
  'auth.yourAccount': 'حسابك',
  'authError.invalidEmail': 'عنوان البريد الإلكتروني غير صحيح.',
  'authError.missingPassword': 'يرجى إدخال كلمة المرور.',
  'authError.invalidCredential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'authError.userDisabled': 'تم تعطيل هذا الحساب.',
  'authError.emailInUse': 'يوجد حساب بهذا البريد الإلكتروني. جرّب تسجيل الدخول.',
  'authError.weakPassword': 'يرجى اختيار كلمة مرور من 6 أحرف على الأقل.',
  'authError.tooManyRequests': 'محاولات كثيرة. انتظر بضع دقائق ثم أعد المحاولة.',
  'authError.network': 'لا يوجد اتصال. تحقّق من الإنترنت ثم أعد المحاولة.',
  'authError.popupBlocked': 'حظر متصفحك نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة لهذا الموقع ثم أعد المحاولة.',
  'authError.notAllowed': 'طريقة تسجيل الدخول هذه غير مفعّلة لهذا المشروع بعد.',
  'authError.unauthorizedDomain': 'هذا النطاق غير مصرّح له بتسجيل الدخول في لوحة Firebase.',
  'authError.generic': 'تعذّر تسجيل الدخول. يرجى المحاولة مرة أخرى.',
  'authError.status': 'تعذّر التحقق من حالة تسجيل الدخول.',

  'error.generic': 'حدث خطأ ما. تقدّمك ما زال محفوظاً.',
  'error.view': 'تعذّر تحديث جزء من الصفحة.',
  'error.storageFull': 'مساحة التخزين في المتصفح ممتلئة. قد لا يُحفظ التقدّم الجديد على هذا الجهاز.',
  'error.storageWrite': 'تعذّر الحفظ في مساحة تخزين المتصفح.',
  'error.storageUnavailable': 'مساحة تخزين المتصفح غير متاحة، لذلك لن يُحفظ التقدّم بعد إغلاق هذه الصفحة.',
  'error.sync': 'تعذّرت المزامنة السحابية. تقدّمك ما زال محفوظاً على هذا الجهاز.',
  'error.signOut': 'تعذّر تسجيل الخروج. يرجى المحاولة مرة أخرى.',
  'error.clearCloud': 'تعذّر مسح سجلّك السحابي. يرجى المحاولة مرة أخرى.',
  'error.startQuiz': 'تعذّر بدء الاختبار. يرجى المحاولة مرة أخرى.',
  'start.title': 'تعذّر بدء هذا الاختبار',
  'start.loading': 'بنك الأسئلة ما زال قيد التحميل. حاول مرة أخرى بعد لحظات.',
  'start.presetEmpty': 'تعذّر تحميل أسئلة هذا الاختبار.',
  'start.noCategory': 'يرجى اختيار فئة واحدة على الأقل.',
  'start.noQuestions': 'لا توجد أسئلة في الفئات المحددة.',
  'start.noMistakes': 'لا توجد أخطاء للتدرّب عليها الآن.',

  'footer.license': '© 2026 جاهز Gahz. مفتوح المصدر برخصة MIT.',
  'footer.count': '{count} سؤالاً في {topics} فئة',
  'footer.privacy': 'الخصوصية',
  'privacy.title': 'الخصوصية',
  'privacy.body':
    'في وضع الضيف تُحفظ محاولاتك وإعداداتك في هذا المتصفح فقط. عند تسجيل الدخول يُحفظ سجل محاولاتك وإعداداتك وإحصاءاتك أيضاً في سجل سحابي خاص بك لتستخدمها على أجهزة أخرى. لا أحد غيرك يستطيع قراءتها.',
};

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, ar };

let active: Locale = 'en';

export function getLocale(): Locale {
  return active;
}

export function isRtl(locale: Locale = active): boolean {
  return RTL_LOCALES.includes(locale);
}

export function parseLocale(value: unknown): Locale | null {
  return LOCALES.find((locale) => locale === value) ?? null;
}

/** The browser's language if we support it, otherwise English. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const match = parseLocale(language.toLowerCase().split('-')[0]);
    if (match) return match;
  }
  return 'en';
}

/** Sets the language used by `t`. Call through preferences.setLocale so the UI re-renders. */
export function setActiveLocale(locale: Locale): void {
  active = locale;
}

export function hasKey(key: string): key is TranslationKey {
  return key in en;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template = DICTIONARIES[active][key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/**
 * Translates the static shell. Elements opt in with:
 *   data-i18n="key"             sets textContent
 *   data-i18n-aria-label="key"  sets aria-label
 * Also sets <html lang dir> and the document title.
 */
export function applyStaticTranslations(root: Document = document): void {
  root.documentElement.lang = active;
  root.documentElement.dir = isRtl() ? 'rtl' : 'ltr';
  root.title = t('app.title');

  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n ?? '';
    if (hasKey(key)) element.textContent = t(key);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((element) => {
    const key = element.dataset.i18nAriaLabel ?? '';
    if (hasKey(key)) element.setAttribute('aria-label', t(key));
  });
}
