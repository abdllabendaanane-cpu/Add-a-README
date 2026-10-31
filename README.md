# Al_3asr|TV — هوية بصرية

صورة البروفايل وغلاف فيسبوك وبانر يوتيوب لصفحة **Al_3asr|TV**، مصمّمة بالكود عبر [Remotion](https://www.remotion.dev).

Profile picture, Facebook cover and YouTube banner for **Al_3asr|TV**, built as Remotion stills.

## الصور الجاهزة / Ready-to-upload images

| الملف | الاستخدام | المقاس |
|---|---|---|
| [`designs/al3asr-tv-profile-1080x1080.png`](designs/al3asr-tv-profile-1080x1080.png) | صورة البروفايل (فيسبوك + يوتيوب) | 1080×1080 |
| [`designs/al3asr-tv-facebook-cover-1640x624.png`](designs/al3asr-tv-facebook-cover-1640x624.png) | غلاف صفحة فيسبوك | 1640×624 |
| [`designs/al3asr-tv-youtube-banner-2560x1440.png`](designs/al3asr-tv-youtube-banner-2560x1440.png) | بانر قناة يوتيوب | 2560×1440 |

- صورة البروفايل مصمّمة لتُعرض داخل دائرة، فكل العناصر داخل الإطار الدائري.
- بانر يوتيوب: الشعار والاسم داخل المنطقة الآمنة 1546×423 في الوسط، فيظهران كاملين على الهاتف والحاسوب والتلفاز.
- غلاف فيسبوك: الشعار في الوسط حتى لا يُقص على الهاتف، والزاوية السفلى اليسرى فارغة لأن صورة البروفايل تغطيها على الحاسوب.

## الفكرة / Concept

- **الألوان:** الكحلي الليلي مع الذهبي والكريمي من الشعار القديم «أدبيات العصر».
- **الأيقونة:** الكتاب المفتوح والجبال والهلال أعيد رسمها كـ SVG بجودة عالية.
- **صورة البروفايل:** حلقة على شكل ساعة، وقوس ذهبي من الساعة 12 إلى الساعة 4 تقريباً، أي وقت العصر.
- **الأغلفة:** سماء ليلية بنجوم ونقش هندسي إسلامي خفيف وسلاسل جبال ذهبية تشبه جبال الأيقونة.

## التعديل وإعادة التصدير / Editing and re-rendering

```bash
npm install
npm run studio   # معاينة وتعديل مباشر في المتصفح
npm run render   # تصدير الصور الثلاث إلى designs/
```

- `src/theme.ts` — الألوان والخطوط
- `src/Wordmark.tsx` — كتابة الاسم `Al_3asr|TV` و«العصر»
- `src/Emblem.tsx` — الأيقونة
- `src/Profile.tsx` و `src/Covers.tsx` — التصاميم الثلاثة

لعرض حدود القص لكل منصة أضف `--props='{"guides":true}'` إلى أمر التصدير.

الخطوط: Montserrat و Reem Kufi (رخصة SIL Open Font License) موجودة في `public/fonts/`.
