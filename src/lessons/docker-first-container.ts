import type { Lesson } from './types';

export const dockerFirstContainer: Lesson = {
  id: 'docker-first-container',
  tag: 'Docker',
  title: { en: 'Your first Docker container', ar: 'أول حاوية Docker لك' },
  summary: {
    en: 'Write a Dockerfile in the right order, build an image, run it with a published port and keep its data in a volume.',
    ar: 'اكتب Dockerfile بالترتيب الصحيح، وابنِ صورة، وشغّلها بمنفذ منشور، واحفظ بياناتها في volume.',
  },
  minutes: 10,
  roadmapSteps: ['docker'],
  steps: [
    {
      kind: 'explain',
      text: {
        en: '"It works on my machine" happens because machines differ: another Node version, a missing library. Docker packs the app **with** everything it needs.\n\n- A **Dockerfile** is the recipe.\n- `docker build` turns it into an **image**: a read-only package.\n- `docker run` starts a **container**: a running, isolated copy of the image.\n\nOne image can start many containers, the way one class creates many objects.',
        ar: 'عبارة «يعمل على جهازي» سببها اختلاف الأجهزة: إصدار آخر من Node أو مكتبة ناقصة. Docker يحزم التطبيق **مع** كل ما يحتاجه.\n\n- الـ **Dockerfile** هو الوصفة.\n- `docker build` يحوّله إلى **صورة** (image): حزمة للقراءة فقط.\n- `docker run` يشغّل **حاوية** (container): نسخة عاملة ومعزولة من الصورة.\n\nوالصورة الواحدة تشغّل حاويات كثيرة، كما ينشئ الصنف الواحد كائنات كثيرة.',
      },
      code: 'Dockerfile --(docker build)--> image --(docker run)--> container\n                                  |\n                                  +--(docker push)--> registry',
    },
    {
      kind: 'order',
      text: {
        en: 'Arrange the Dockerfile for a Node.js app so that dependencies are not reinstalled every time a source file changes.',
        ar: 'رتّب Dockerfile لتطبيق Node.js بحيث لا تُعاد تثبيت الاعتماديات كلما تغيّر ملف من الشيفرة.',
      },
      lines: ['FROM node:22-alpine', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci', 'COPY . .', 'CMD ["node", "server.js"]'],
      hint: {
        en: 'Start from a base image and choose a folder. Copy only what the install needs, install, then copy the rest.',
        ar: 'ابدأ من صورة أساسية واختر مجلداً. انسخ ما يحتاجه التثبيت فقط، ثم ثبّت، ثم انسخ الباقي.',
      },
      explain: {
        en: 'Each instruction creates a cached **layer**. When a file changes, that layer and all the layers after it are rebuilt. Copying `package*.json` and installing first means editing `server.js` only redoes the last `COPY`. `CMD` runs later, when a container starts, not during the build.',
        ar: 'كل تعليمة تنشئ **طبقة** مخزّنة. وعند تغيّر ملف يُعاد بناء طبقته وكل ما بعدها. فنسخ `package*.json` والتثبيت أولاً يجعل تعديل `server.js` يعيد آخر `COPY` فقط. أما `CMD` فتعمل لاحقاً عند بدء الحاوية لا أثناء البناء.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Build the image and name it `myapp`, then run it in the background so that the app (port 3000 in the container) answers on port 8080 of your machine.',
        ar: 'ابنِ الصورة وسمِّها `myapp`، ثم شغّلها في الخلفية بحيث يجيب التطبيق (المنفذ 3000 داخل الحاوية) على المنفذ 8080 في جهازك.',
      },
      template: 'docker build ___ myapp .\ndocker run -d -p ___:___ myapp',
      answers: ['-t', '8080', '3000'],
      distractors: ['-f', '80'],
      hint: {
        en: 'One flag tags (names) the image. The port pair is written host first, container second.',
        ar: 'خيار واحد يسم الصورة (يسمّيها). وزوج المنافذ يُكتب: المضيف أولاً ثم الحاوية.',
      },
      explain: {
        en: '`-t` gives the image a name and the final `.` is the build context, the folder sent to Docker. `-p host:container` publishes a port, so `http://localhost:8080` reaches port 3000 inside. `-d` detaches, leaving the container running in the background.',
        ar: '`-t` يسمّي الصورة، والنقطة `.` في الآخر هي سياق البناء، أي المجلد المُرسَل إلى Docker. و`-p host:container` ينشر منفذاً، فيصل `http://localhost:8080` إلى المنفذ 3000 في الداخل. و`-d` يفصل الحاوية فتبقى تعمل في الخلفية.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'The container stopped right after starting. Which command shows what the app printed before it died?',
        ar: 'توقفت الحاوية فور بدئها. أي أمر يُظهر ما طبعه التطبيق قبل توقفه؟',
      },
      code: 'docker ps -a\n\nCONTAINER ID   IMAGE   STATUS                     NAMES\n3f2a9c1b7d10   myapp   Exited (1) 5 seconds ago   web',
      options: ['docker logs web', 'docker images web', 'docker pull web', 'docker port web'],
      answer: 0,
      hint: {
        en: 'You want the output of the process, not information about images or ports.',
        ar: 'تريد مخرجات العملية، لا معلومات عن الصور أو المنافذ.',
      },
      explain: {
        en: 'A container lives exactly as long as its main process. `docker ps -a` shows stopped containers with their exit code, and `docker logs <name>` prints the output, where the real error usually is: a missing environment variable or a wrong start command.',
        ar: 'الحاوية تعيش ما دامت عمليتها الرئيسية تعمل. `docker ps -a` يعرض الحاويات المتوقفة مع رمز الخروج، و`docker logs <name>` يطبع المخرجات، وفيها الخطأ الحقيقي غالباً: متغيّر بيئة ناقص أو أمر بدء خاطئ.',
      },
    },
    {
      kind: 'choice',
      text: {
        en: 'You run PostgreSQL in a container, remove the container and start a new one. The tables are gone. Why?',
        ar: 'شغّلت PostgreSQL في حاوية ثم حذفتها وشغّلت أخرى جديدة. اختفت الجداول. لماذا؟',
      },
      options: [
        {
          en: 'The data was in the container\'s own writable layer, which is deleted with the container.',
          ar: 'لأن البيانات كانت في طبقة الكتابة الخاصة بالحاوية، وهي تُحذف مع الحاوية.',
        },
        {
          en: 'The image was pulled again, and a new image always resets its data.',
          ar: 'لأن الصورة سُحبت من جديد، والصورة الجديدة تصفّر بياناتها دائماً.',
        },
        {
          en: 'The port was not published, so the data could not be saved.',
          ar: 'لأن المنفذ لم يُنشر، فتعذّر حفظ البيانات.',
        },
      ],
      answer: 0,
      hint: {
        en: 'Images are read-only. Where do the files a container writes go?',
        ar: 'الصور للقراءة فقط. فأين تذهب الملفات التي تكتبها الحاوية؟',
      },
      explain: {
        en: 'Containers are disposable by design. Anything that must survive goes in a **volume**, which lives outside the container: `docker run -v pgdata:/var/lib/postgresql/data postgres`. The next container that mounts `pgdata` finds the data again.',
        ar: 'الحاويات قابلة للاستبدال بطبيعتها. وكل ما يجب أن يبقى يوضع في **volume** يعيش خارج الحاوية: `docker run -v pgdata:/var/lib/postgresql/data postgres`. والحاوية التالية التي تربط `pgdata` تجد البيانات من جديد.',
      },
    },
    {
      kind: 'blank',
      text: {
        en: 'Real apps need several containers. Complete this Compose file so the web app can reach the database.',
        ar: 'التطبيقات الحقيقية تحتاج عدة حاويات. أكمل ملف Compose هذا ليصل تطبيق الويب إلى قاعدة البيانات.',
      },
      template:
        'services:\n  web:\n    build: .\n    ports:\n      - "8080:3000"\n    environment:\n      DATABASE_URL: postgres://app:secret@___:5432/app\n  db:\n    image: postgres:17\n    ___:\n      - pgdata:/var/lib/postgresql/data\n\nvolumes:\n  pgdata:',
      answers: ['db', 'volumes'],
      distractors: ['localhost', 'ports', '127.0.0.1'],
      hint: {
        en: 'Inside a container, `localhost` is that container itself. How do Compose services find each other?',
        ar: 'داخل الحاوية، `localhost` هو الحاوية نفسها. فكيف تجد خدمات Compose بعضها؟',
      },
      explain: {
        en: 'Compose puts the services on one network with built-in DNS, so `web` reaches the database at the host name `db`, the service name. The named volume keeps the data when the containers are recreated. `docker compose up` starts everything with one command.',
        ar: 'Compose يضع الخدمات على شبكة واحدة فيها DNS مدمج، فتصل `web` إلى قاعدة البيانات باسم المضيف `db` وهو اسم الخدمة. والـ volume المسمّى يحفظ البيانات عند إعادة إنشاء الحاويات. و`docker compose up` يشغّل كل شيء بأمر واحد.',
      },
    },
  ],
};
