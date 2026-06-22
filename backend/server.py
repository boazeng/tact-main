"""TACT App Portal — FastAPI backend.

Jobs:
1. Serve the built React SPA (dist/).
2. A shared config store (config.json) so the app list is the SAME for everyone,
   edited from the browser and persisted on the server.
3. Google sign-in (shared-auth): VIEWING is public; only an admin (boazen@gmail.com)
   may SAVE the config.

Auth model: install_auth adds a middleware that would normally force login on
every path. We pass public_prefixes=("/",) so nothing is force-gated (the whole
site is publicly viewable), and gate ONLY the save endpoint with
require_role("admin"). The middleware still parses the session cookie, so the
admin check works for logged-in users.
"""
import os
import json
from pathlib import Path

from dotenv import load_dotenv

# ── env resolution (mirrors the flow / bank-discrepancies pattern) ──
PROJECT_ROOT = Path(__file__).resolve().parent.parent
_override = os.getenv("TACT_MAIN_ENV_FILE")
_shared = PROJECT_ROOT.parent / "env" / ".env"
_local = PROJECT_ROOT / ".env"
if _override and Path(_override).exists():
    _env_path = Path(_override)
elif _shared.exists():
    _env_path = _shared
else:
    _env_path = _local
load_dotenv(_env_path, override=True)

from fastapi import FastAPI, Request, Depends, HTTPException  # noqa: E402
from fastapi.responses import FileResponse  # noqa: E402

from shared_auth import install_auth, require_role  # noqa: E402

DIST_DIR = PROJECT_ROOT / "dist"
DATA_DIR = Path(os.getenv("TACT_MAIN_DATA_DIR", str(PROJECT_ROOT / "database")))
DATA_DIR.mkdir(parents=True, exist_ok=True)
CONFIG_FILE = DATA_DIR / "config.json"

app = FastAPI(title="TACT App Portal", docs_url=None, redoc_url=None)

# Google sign-in + roles. public_prefixes=("/",) → no path is force-gated
# (everyone can view); saving is gated per-route below.
install_auth(
    app,
    db_path=str(DATA_DIR / "auth.db"),
    redirect_uri=os.getenv("AUTH_REDIRECT_URI", "https://tact-main.newavera.co.il/auth/callback"),
    initial_users=[{"email": "boazen@gmail.com", "role": "admin"}],
    public_prefixes=("/",),
)


# ───────────────── shared config store ─────────────────
@app.get("/api/config")
def get_config():
    """The shared app list. null if never saved → the SPA uses its bundled defaults."""
    if CONFIG_FILE.exists():
        try:
            return {"config": json.loads(CONFIG_FILE.read_text(encoding="utf-8"))}
        except Exception:  # noqa: BLE001
            pass
    return {"config": None}


@app.put("/api/config")
async def put_config(request: Request, _admin=Depends(require_role("admin"))):
    """Save the shared app list — admin only. Body: {"config": [ ...categories... ]}."""
    body = await request.json()
    config = body.get("config")
    if not isinstance(config, list):
        raise HTTPException(400, "config חייב להיות מערך קטגוריות")
    CONFIG_FILE.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"ok": True}


# ───────────────── serve the built SPA (publicly) ─────────────────
def _serve(path: Path, *, immutable: bool) -> FileResponse:
    resp = FileResponse(str(path))
    if immutable:
        resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    else:
        # index.html / icons must always revalidate, or browsers pin an old build
        resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return resp


@app.get("/{full_path:path}", include_in_schema=False)
def spa(full_path: str):
    """Serve a real file if it exists, else index.html (client-side routing)."""
    candidate = DIST_DIR / full_path
    if full_path and candidate.is_file():
        return _serve(candidate, immutable=full_path.startswith("assets/"))
    return _serve(DIST_DIR / "index.html", immutable=False)
