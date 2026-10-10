# Social App

تطبيق تواصل اجتماعي باستخدام React وTypeScript وVite والمكتبات الموجودة في المشروع.

## التشغيل

```bash
npm ci
npm run dev
```

للبناء وفحص الكود:

```bash
npm run build
npm run lint
npm run preview
```

## ترتيب الملفات

كل كود التطبيق داخل `src`. كل صفحة في المجلد الخاص بها، مثل `Home/Home.tsx` و`Profile/Profile.tsx` و`Settings/Settings.tsx`. صفحة `Auth/Auth.tsx` تعرض التسجيل أو الدخول حسب المسار، والمكونات المشتركة داخل `components`.

طلبات الخادم كلها في `src/API/API.ts` كدوال عادية بأسماء مباشرة: `signIn`، `signUp`، `getPosts`، `createPost`، `getComments` وهكذا. رابط الخادم مكتوب في نفس الملف، ولتغييره عدّل `API_URL` مباشرة.

التوكن محفوظ في `localStorage` بمفتاح `social-app-token`. الدخول يحفظه، وكل طلب محمي يقرأه من هناك ويرسله في `Authorization`. الخروج أو انتهاء الجلسة يمسحه.

التحقق من النماذج في `src/services/validation.ts`، وتنسيق الوقت والبيانات في `src/services/format.ts`، وتعريف البيانات في `src/types/index.ts`.

الصور بتترفع باستخدام `FormData`، والمتصفح بيحدد `Content-Type` المناسب تلقائياً.

## الوظائف

التسجيل والدخول، المنشورات والصور، الإعجاب والحفظ والمشاركة، التعليقات والردود، متابعة المستخدمين، الملف الشخصي، الإشعارات، وتغيير الصورة وكلمة السر.

[شرح الكود](docs/شرح-المشروع.md) · [مسارات الخادم](docs/api-map.md)

للنشر استخدم ناتج `dist` على استضافة تدعم إعادة المسارات إلى `index.html`.
