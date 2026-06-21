/* האפליקציות של TACT, מחולקות לקטגוריות.
   כל קטגוריה = { title, apps: [...] }.
   כל אפליקציה:
     name   — שם (עברית)
     desc   — תיאור קצר בשורה
     url    — כתובת מלאה (https / http://localhost:PORT). ריק ('') = "בקרוב", לא לחיץ.
     icon   — אייקון מתוך TactIcon (clients, database, briefcase, chat, trending,
              workflow, package, document, dashboard, server, globe ...)
     logo   — (אופציונלי) נתיב ללוגו/favicon אמיתי של האפליקציה (למשל
              '/icons/customer.svg'). אם מוגדר — מוצג במקום ה-icon. הקבצים ב-public/icons.
     tone   — גוון הכרטיס: 'steel' | 'blue' | 'green'
     status — 'live' (חי) | 'local' (מקומי) | 'soon' (בקרוב)
*/
export const categories = [
  {
    title: 'הנהלת חשבונות',
    apps: [
      {
        name: 'BankAccount',
        desc: 'ניהול חשבונות בנק וייבוא תנועות (לאומי + דיסקונט)',
        url: 'http://localhost:3030',
        icon: 'database',
        tone: 'blue',
        status: 'local',
      },
      {
        name: 'קליטת חשבוניות ספק',
        desc: 'קליטה ועיבוד של חשבוניות ספקים',
        url: 'https://bookkeeping.newavera.co.il/',
        icon: 'invoices',
        logo: '/icons/bookkeeping.ico',
        tone: 'steel',
        status: 'live',
      },
      {
        name: 'ניהול תזרים ופרויקטים',
        desc: 'מעקב תזרים מזומנים וניהול פרויקטים',
        url: 'https://flow.newavera.co.il/',
        icon: 'trending',
        logo: '/icons/flow.svg',
        tone: 'blue',
        status: 'live',
      },
    ],
  },
  {
    title: 'קשרי לקוחות',
    apps: [
      {
        name: 'פורטל לקוחות',
        desc: 'חשבוניות וכרטסת ללקוחות מתוך Priority',
        url: 'https://customer.newavera.co.il',
        icon: 'clients',
        logo: '/icons/customer.svg',
        tone: 'steel',
        status: 'live',
      },
    ],
  },
  {
    title: 'מערכות משולבות',
    apps: [
      {
        name: 'קבוצה אורבנית',
        desc: 'ניהול תזרים מזומנים ופרויקטים',
        url: 'https://d1imdunndmflnu.cloudfront.net/ariel/hr',
        icon: 'trending',
        logo: '/icons/urban.svg',
        tone: 'steel',
        status: 'live',
      },
    ],
  },
  {
    title: 'הזמנות ברזל',
    apps: [
      {
        name: 'הזמנות ברזל',
        desc: 'הזמנת ברזל וחישוב משקלים מתוך קטלוג צורות',
        url: 'https://irondraw.newavera.co.il/',
        icon: 'package',
        logo: '/icons/irondraw.png',
        tone: 'blue',
        status: 'live',
      },
    ],
  },
  {
    title: 'בדק',
    apps: [
      {
        name: 'CMM — ליקויי בנייה',
        desc: 'ניהול ליקויי בנייה בתקופת הבדק',
        url: '',
        icon: 'document',
        tone: 'green',
        status: 'soon',
      },
      {
        name: 'קריאות שירות',
        desc: 'ניהול קריאות שירות וסנכרון עם Priority',
        url: 'http://localhost:5300',
        icon: 'chat',
        tone: 'steel',
        status: 'local',
      },
      {
        name: 'TACT-CRM',
        desc: 'מערכת CRM רב-דיירית לניהול לקוחות הקבוצה',
        url: 'https://crm-db.newavera.co.il',
        icon: 'briefcase',
        logo: '/icons/crm.svg',
        tone: 'green',
        status: 'live',
      },
    ],
  },
]

export const STATUS = {
  live:  { label: 'חי',    cls: 'tact-badge-pos' },
  local: { label: 'מקומי', cls: 'tact-badge-on' },
  soon:  { label: 'בקרוב', cls: 'tact-badge-soon' },
}
