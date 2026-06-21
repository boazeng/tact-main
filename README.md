# TACT — מרכז האפליקציות

עמוד בית (Portal) לקישורים לכל האפליקציות של קבוצת TACT, מחולק לקטגוריות.
React + Vite, RTL/עברית, שפת העיצוב של TACT.

חי בכתובת: **https://tact-main.newavera.co.il**

## פיתוח מקומי

```bash
npm install
npm run dev          # http://localhost:5180
```

## בנייה

```bash
npm run build        # מפיק dist/
npm run preview      # תצוגה מקדימה של ה-build
```

## עריכת האפליקציות

- **דרך הממשק:** לחצן "ערוך" בעמוד מאפשר לערוך טקסט, סטטוס, להעביר בין
  קטגוריות ולהוסיף/למחוק — נשמר ב-localStorage של הדפדפן (פר-מכשיר).
- **דרך הקוד (קבוע לכולם):** [`src/apps.js`](src/apps.js) — מערך הקטגוריות
  והאפליקציות. שינוי כאן הוא ברירת המחדל לכל מי שנכנס.

## פריסה ל-Mac mini

ראה [`deploy/DEPLOY.md`](deploy/DEPLOY.md) — אתר סטטי שמוגש ע"י nginx תחת
תת-הדומיין `tact-main.newavera.co.il`.
