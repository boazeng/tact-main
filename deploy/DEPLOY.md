# פריסה — TACT מרכז האפליקציות, Mac mini

אתר **סטטי** (Vite SPA, ללא backend וללא סודות) שמוגש מ-nginx בתוך container
(OrbStack), חשוף דרך ה-**Cloudflare Tunnel** המשותף. TLS בקצה של Cloudflare.
תואם ל-`~/server/readme_load_server.md` / `MAC-MINI-APP-INSTALL.md`.

## הקצאה

| פרמטר | ערך |
|-------|-----|
| Repo | github.com/boazeng/tact-main |
| תיקייה | `~/server/tact-main` |
| **פורט** | **8096** (ה-container מאזין על 80) |
| תת-דומיין | `tact-main.newavera.co.il` |
| Container | `tact-main` |
| סודות | **אין** — אתר סטטי ציבורי |

## פריסה (להריץ על ה-Mac)

```bash
cd ~/server
git clone https://github.com/boazeng/tact-main.git tact-main
cd tact-main

~/.orbstack/bin/docker compose up -d --build
curl -s -o /dev/null -w "local=%{http_code}\n" http://127.0.0.1:8096/healthz   # 200
```

## Cloudflare Tunnel + DNS

1. `~/.cloudflared/config.yml` — הוסף **מעל** ה-catch-all 404:
   ```yaml
     - hostname: tact-main.newavera.co.il
       service: http://localhost:8096
   ```
   ולדציה:
   ```bash
   /opt/homebrew/bin/cloudflared tunnel ingress validate
   ```
2. restart ל-tunnel:
   ```bash
   sudo launchctl stop com.cloudflare.cloudflared && sudo launchctl start com.cloudflare.cloudflared
   ```
3. לוח הבקרה של Cloudflare → אזור `newavera.co.il` → **DNS**: מחק רשומה ישנה
   ל-`tact-main` אם קיימת, ואז **Add record**:
   - Type = `CNAME`
   - Name = `tact-main`
   - Target = `ae8d8404-c382-475e-a31d-ad5ee34387e1.cfargotunnel.com`
   - Proxy = 🟠 **Proxied**

## אימות

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://tact-main.newavera.co.il/healthz   # 200
~/.orbstack/bin/docker logs tact-main --since 30s
```
פתח בדפדפן: https://tact-main.newavera.co.il

## עדכון אחרי שינוי קוד

```bash
cd ~/server/tact-main && git pull --ff-only && ~/.orbstack/bin/docker compose up -d --build
```

## הערות

- **עריכת רשימת האפליקציות** היא ב-`src/apps.js` (ברירת המחדל לכולם). לחצן
  "ערוך" באתר שומר שינויים ב-localStorage של הדפדפן בלבד (פר-מכשיר) — לא משפיע
  על מה שאחרים רואים. לשינוי קבוע לכולם — ערוך את `src/apps.js`, commit, push, ובנה מחדש.
- שקול להפוך את הריפו ל-**Private** (פורטל פנימי), אם כי אין בו סודות.
- ל-**auto-deploy** (git push → פרודקשן): הוסף ב-`~/server/deployer/deploy.sh`
  מיפוי `tact-main` → `~/server/tact-main`, והוסף webhook ב-GitHub
  (Payload URL `https://deploy.newavera.co.il`, push event).
