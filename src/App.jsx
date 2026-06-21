import { useState, useEffect } from 'react'
import './App.css'
import TactLogo from './components/TactLogo'
import TactIcon from './components/TactIcon'
import { categories as defaultCategories, STATUS } from './apps'

const STORAGE_KEY = 'tact-apps-v1'

// Bump this whenever src/apps.js changes, so every browser drops its cached
// localStorage copy and re-seeds from the new defaults (otherwise old saved
// data shadows the update — e.g. hides newly added logos).
const DEFAULTS_VERSION = 2

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.v === DEFAULTS_VERSION && Array.isArray(parsed.data)) {
        return parsed.data
      }
    }
  } catch (e) { /* ignore corrupt storage */ }
  return JSON.parse(JSON.stringify(defaultCategories))
}

/* ---------- icon chip: real logo if present, else line icon ---------- */
function AppIcon({ app }) {
  if (app.logo) {
    return (
      <span className="tact-card-ico has-logo">
        <img
          src={app.logo}
          alt=""
          onError={(e) => { e.currentTarget.parentElement.classList.add('logo-failed') }}
        />
        <span className="ico-fallback"><TactIcon name={app.icon} size={20} /></span>
      </span>
    )
  }
  return <span className="tact-card-ico"><TactIcon name={app.icon} size={20} /></span>
}

/* ---------- view card (read-only) ---------- */
function AppCard({ app }) {
  const st = STATUS[app.status] || STATUS.soon
  const Tag = app.url ? 'a' : 'div'
  const linkProps = app.url
    ? { href: app.url, target: '_blank', rel: 'noreferrer' }
    : {}
  return (
    <Tag className={`tact-card home-card tone-${app.tone}${app.url ? '' : ' is-soon'}`} {...linkProps}>
      <div className="tact-card-cap">
        <AppIcon app={app} />
        <span className={`tact-badge ${st.cls}`}>{st.label}</span>
      </div>
      <div className="tact-card-body">
        <h3 className="home-card-name">{app.name}</h3>
        <p className="home-card-desc">{app.desc}</p>
        <span className="home-card-go">
          {app.url ? 'כניסה למערכת' : 'בפיתוח'}
          <TactIcon name={app.url ? 'link' : 'clock'} size={16} />
        </span>
      </div>
    </Tag>
  )
}

/* ---------- editable card ---------- */
function EditCard({ app, ci, ai, catCount, allTitles, actions }) {
  return (
    <div className={`tact-card home-card tone-${app.tone} is-editing`}>
      <div className="tact-card-cap">
        <AppIcon app={app} />
        <select
          className="home-edit-status"
          value={app.status}
          onChange={(e) => actions.update(ci, ai, { status: e.target.value })}
        >
          <option value="live">חי</option>
          <option value="local">מקומי</option>
          <option value="soon">בקרוב</option>
        </select>
      </div>
      <div className="tact-card-body">
        <input
          className="home-edit-field home-edit-name"
          value={app.name}
          placeholder="שם האפליקציה"
          onChange={(e) => actions.update(ci, ai, { name: e.target.value })}
        />
        <textarea
          className="home-edit-field home-edit-desc"
          value={app.desc}
          rows={2}
          placeholder="תיאור קצר"
          onChange={(e) => actions.update(ci, ai, { desc: e.target.value })}
        />
        <input
          className="home-edit-field home-edit-url"
          value={app.url}
          placeholder="כתובת (https://… או ריק)"
          dir="ltr"
          onChange={(e) => actions.update(ci, ai, { url: e.target.value })}
        />

        <div className="home-edit-toolbar">
          <button title="הזז למעלה" onClick={() => actions.move(ci, ai, -1)} disabled={ai === 0}>↑</button>
          <button title="הזז למטה" onClick={() => actions.move(ci, ai, +1)} disabled={ai === catCount - 1}>↓</button>
          <select
            className="home-edit-movecat"
            value=""
            onChange={(e) => { if (e.target.value !== '') actions.moveCat(ci, ai, Number(e.target.value)) }}
          >
            <option value="">העבר לקטגוריה…</option>
            {allTitles.map((t, i) => i !== ci && (
              <option key={i} value={i}>{t}</option>
            ))}
          </select>
          <button className="home-edit-del" title="מחק" onClick={() => actions.remove(ci, ai)}>🗑</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: DEFAULTS_VERSION, data }))
  }, [data])

  const allTitles = data.map((c) => c.title)

  const actions = {
    update(ci, ai, patch) {
      setData((prev) => prev.map((c, i) =>
        i !== ci ? c : { ...c, apps: c.apps.map((a, j) => (j !== ai ? a : { ...a, ...patch })) }))
    },
    catTitle(ci, title) {
      setData((prev) => prev.map((c, i) => (i !== ci ? c : { ...c, title })))
    },
    move(ci, ai, dir) {
      setData((prev) => {
        const next = prev.map((c) => ({ ...c, apps: [...c.apps] }))
        const apps = next[ci].apps
        const ni = ai + dir
        if (ni < 0 || ni >= apps.length) return prev
        ;[apps[ai], apps[ni]] = [apps[ni], apps[ai]]
        return next
      })
    },
    moveCat(ci, ai, target) {
      setData((prev) => {
        if (target === ci) return prev
        const next = prev.map((c) => ({ ...c, apps: [...c.apps] }))
        const [app] = next[ci].apps.splice(ai, 1)
        next[target].apps.push(app)
        return next
      })
    },
    remove(ci, ai) {
      setData((prev) => prev.map((c, i) =>
        i !== ci ? c : { ...c, apps: c.apps.filter((_, j) => j !== ai) }))
    },
    add(ci) {
      setData((prev) => prev.map((c, i) =>
        i !== ci ? c : { ...c, apps: [...c.apps, { name: 'אפליקציה חדשה', desc: '', url: '', icon: 'package', tone: 'steel', status: 'soon' }] }))
    },
    addCategory() {
      setData((prev) => [...prev, { title: 'קטגוריה חדשה', apps: [] }])
    },
    removeCategory(ci) {
      setData((prev) => {
        const cat = prev[ci]
        if (cat.apps.length > 0 && !confirm(`למחוק את הקטגוריה "${cat.title}" ואת ${cat.apps.length} האפליקציות שבה?`)) return prev
        return prev.filter((_, i) => i !== ci)
      })
    },
    reset() {
      if (confirm('לאפס את כל השינויים ולחזור לברירת המחדל?')) {
        setData(JSON.parse(JSON.stringify(defaultCategories)))
      }
    },
  }

  return (
    <div className="tact-aurora home-page">
      <header className="tact-bar">
        <TactLogo word="group" size={1.15} />
        <span className="home-bar-tag">מרכז האפליקציות</span>
        <div className="home-bar-actions">
          {editMode && (
            <button className="tact-btn tact-btn-ghost home-btn-sm" onClick={actions.reset}>אפס</button>
          )}
          <button
            className={`tact-btn home-btn-sm ${editMode ? 'tact-btn-primary' : 'tact-btn-ghost'}`}
            onClick={() => setEditMode((v) => !v)}
          >
            <TactIcon name={editMode ? 'target' : 'document'} size={16} />
            {editMode ? 'סיום עריכה' : 'ערוך'}
          </button>
        </div>
      </header>

      <main className="container home-main">
        <section className="home-hero">
          <span className="tact-badge tact-badge-new home-hero-kicker">כל המערכות במקום אחד</span>
          <h1 className="home-hero-title">האפליקציות של TACT</h1>
          <p className="home-hero-sub">שער הכניסה למערכות הקבוצה — בחרו אפליקציה כדי לעבור אליה.</p>
          {editMode && <p className="home-edit-note">מצב עריכה — השינויים נשמרים אוטומטית במכשיר זה</p>}
        </section>

        {data.map((cat, ci) => (
          <section key={ci} className="home-cat">
            {editMode ? (
              <div className="home-cat-head">
                <input
                  className="home-edit-field home-cat-title-edit"
                  value={cat.title}
                  onChange={(e) => actions.catTitle(ci, e.target.value)}
                />
                <button className="home-cat-del" title="מחק קטגוריה" onClick={() => actions.removeCategory(ci)}>
                  🗑 מחק קטגוריה
                </button>
              </div>
            ) : (
              <h2 className="home-cat-title">{cat.title}</h2>
            )}
            <div className="home-grid">
              {cat.apps.map((app, ai) =>
                editMode ? (
                  <EditCard
                    key={ai}
                    app={app}
                    ci={ci}
                    ai={ai}
                    catCount={cat.apps.length}
                    allTitles={allTitles}
                    actions={actions}
                  />
                ) : (
                  <AppCard key={ai} app={app} />
                )
              )}
              {editMode && (
                <button className="home-add-card" onClick={() => actions.add(ci)}>
                  <TactIcon name="plus" size={22} />
                  הוסף אפליקציה
                </button>
              )}
            </div>
          </section>
        ))}

        {editMode && (
          <button className="home-add-cat" onClick={actions.addCategory}>
            <TactIcon name="plus" size={20} />
            הוסף קטגוריה
          </button>
        )}
      </main>

      <footer className="tact-footer">
        <TactLogo tone="dark" word="group" size={0.85} />
        <span className="home-foot-text">© {new Date().getFullYear()} TACT · יזמות טכנולוגית</span>
      </footer>
    </div>
  )
}
