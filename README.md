# Status Now v0.2

אפליקציית mobile-first בעברית לשיתוף ובקשת מידע בזמן אמת ממקומות פיזיים.

## Stack
- Next.js 15 + React 19 + TypeScript
- Supabase Postgres + Auth + Realtime + Storage
- Responsive RTL CSS
- Browser Geolocation + Notification APIs

## מה כלול ב-v0.2
- Feed בזמן אמת
- פרסום סטטוס ובקשת סטטוס בטקסט חופשי
- תמונות/וידאו
- GPS ושמירת קואורדינטות אופציונלית
- סינון "עד 5 ק״מ ממני"
- מסך "סביבי" עם מפת רדאר יחסית ורשימת מרחקים
- ניווט למיקום דרך Google Maps
- התחברות Magic Link באימייל + כפתורי Google/Apple (דורשים הפעלת providers ב-Supabase)
- לייקים ותגובות עם persistence ב-Supabase
- Realtime ל-posts / likes / comments
- התראות דפדפן לבקשות חדשות בטווח 3 ק״מ כאשר האפליקציה פתוחה
- Trending בסיסי שלומד מילים שחוזרות בפוסטים
- תפוגת תוכן 1/3/6/12/24 שעות
- Demo mode ללא Supabase

## הפעלה
1. `npm install`
2. העתק `.env.example` ל-`.env.local`
3. הוסף `NEXT_PUBLIC_SUPABASE_URL` ו-`NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. הרץ את `supabase/schema.sql` ב-Supabase SQL Editor
5. `npm run dev`

## Supabase Auth
Magic Link עובד דרך Email provider. ל-Google/Apple יש להפעיל את ה-provider המתאים ב-Supabase Dashboard ולהגדיר Redirect URL של האתר.

## הערה לגבי התראות
v0.2 תומכת בהתראות Browser בזמן שהאפליקציה פתוחה. Push אמיתי ברקע (גם כשהאפליקציה סגורה) דורש Web Push service worker + VAPID/Push provider, ומתאים לשלב production הבא.
