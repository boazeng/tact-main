# פריסה — TACT מרכז האפליקציות, Mac mini

אפליקציית **FastAPI** שמגישה את ה-SPA (Vite), שומרת את רשימת האפליקציות
**מרכזית בשרת** (`config.json`), ומריצה **כניסת Google** (shared-auth):
**הצפייה ציבורית לכולם**, אבל רק **admin** (boazen@gmail.com) יכול לשמור שינויים.
container ב-OrbStack, חשוף דרך ה-Cloudflare Tunnel המשותף.

## הקצאה

| פרמטר | ערך |
|-------|-----|
| Repo | github.com/boazeng/tact-main |
| תיקייה | `~/server/tact-main` |
| **פורט** | **8099** (ה-container מאזין על 8000) |
| תת-דומיין | `tact-main.newavera.co.il` |
| Container | `tact-main` |
| נתונים | `~/server/tact-main/database/` → `config.json` (הרשימה) + `auth.db` (משתמשים) |
| סודות | `~/server/tact-main/.env` (Google OAuth + session secret, chmod 600) |

## סודות — `.env` (לעולם לא ב-git)

| מפתח | מה |
|------|-----|
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` | אותו OAuth client משותף (מ-`~/server/flow/.env`) |
| `AUTH_SESSION_SECRET` | אקראי — `openssl rand -hex 32` |
| `AUTH_EMERGENCY_TOKEN` | טוקן כניסת חירום (`/emergency-login?token=…`) — עוקף Google |
| `AUTH_SUPER_ADMIN_EMAIL` | `boazen@gmail.com` |
| `AUTH_REDIRECT_URI` | `https://tact-main.newavera.co.il/auth/callback` |

⚠️ **חד-פעמי ב-Google Cloud Console:** הוסף ל-OAuth client ב-**Authorized redirect URIs**:
`https://tact-main.newavera.co.il/auth/callback` — אחרת כניסת Google תיכשל
(`redirect_uri_mismatch`). עד אז אפשר להתחבר דרך `/emergency-login?token=<AUTH_EMERGENCY_TOKEN>`.

## פריסה (להריץ על ה-Mac)

```bash
cd ~/server/tact-main
git pull --ff-only        # (או git clone בפעם הראשונה)

# .env — פעם ראשונה: העתק את מפתחות Google מ-flow, צור סוד session
grep -E '^GOOGLE_OAUTH_(CLIENT_ID|CLIENT_SECRET)=' ~/server/flow/.env  > .env
{
  echo "AUTH_SESSION_SECRET=$(openssl rand -hex 32)"
  echo "AUTH_EMERGENCY_TOKEN=$(openssl rand -hex 16)"
  echo "AUTH_SUPER_ADMIN_EMAIL=boazen@gmail.com"
  echo "AUTH_REDIRECT_URI=https://tact-main.newavera.co.il/auth/callback"
} >> .env
chmod 600 .env

~/.orbstack/bin/docker compose up -d --build
curl -s -o /dev/null -w "local=%{http_code}\n" http://127.0.0.1:8099/api/config   # 200
```

## Cloudflare Tunnel + DNS

כבר מוגדר (פורט 8099). אם צריך מחדש: ב-`~/.cloudflared/config.yml` מעל ה-catch-all:
```yaml
  - hostname: tact-main.newavera.co.il
    service: http://localhost:8099
```
ואז `cloudflared tunnel ingress validate` + restart ל-tunnel, ו-CNAME
`tact-main` → `ae8d8404-c382-475e-a31d-ad5ee34387e1.cfargotunnel.com` (Proxied 🟠).

## איך עורכים את הרשימה (קבוע לכולם)

1. נכנסים ל-https://tact-main.newavera.co.il, **"כניסת מנהל"** בתחתית → Google.
2. כפתור **"ערוך"** מופיע למנהל בלבד → עורכים → **"שמור לכולם"**.
3. השינוי נשמר ל-`config.json` בשרת — כל מי שנכנס מעכשיו רואה אותו.

`src/apps.js` הוא רק רשימת ברירת-המחדל (לפני שמירה ראשונה). אחרי שמירה, השרת מנצח.

## עדכון קוד

```bash
cd ~/server/tact-main && git pull --ff-only && ~/.orbstack/bin/docker compose up -d --build
```
(תיקיית `database/` — הרשימה והמשתמשים — שורדת rebuild.)
