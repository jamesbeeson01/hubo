# Developer Quick-Start Guide

Welcome to Hubo!  
Follow the steps below to get a local build running in minutes.

---

## 1  Prerequisites
| Tool | Version | Notes |
|------|---------|-------|
| Node.js | Current LTS (≥ 18) | Used for scripts & bundling |
| npm / pnpm / yarn | Latest | Any package manager is fine; examples use `npm` |
| Git | Latest | Clone & contribute |
| OS Keyboard Permissions | macOS “Accessibility” / Windows “Input Monitoring” | Required for global shortcuts (`Ctrl + Alt + H`, etc.) |

Tip: On macOS you’ll be prompted the first time Hubo listens for global keys. Grant access in **System Settings → Privacy & Security → Accessibility**.

---

## 2  Install & Run

```bash
# 1. Clone
git clone https://github.com/jamesbeeson01/hubo.git
cd hubo

# 2. Install dependencies
npm install          # or pnpm install / yarn install

# 3. Start in dev mode
npm start            # launches local Electron shell + hot reload
# Alternative:
npm run dev          # same as above, explicit alias
```

The first run will build the UI, launch an Electron desktop shell, and open DevTools.

---

## 3  Project Layout (high-level)

```
.
├── src/
│   ├── core/            ← window mgmt, keyboard hooks, logging
│   ├── ui/              ← shared UI primitives (buttons, drawers, motion helpers)
│   ├── apps/            ← one folder per integrated app (calendar, tasks, …)
│   ├── registry/        ← app-registry.js (single map of apps → placement)
│   ├── search/          ← providers, ranker, cache
│   └── index.js         ← bootstrap / render root
├── docs/                ← architecture & spec docs
└── package.json
```

Key docs you may want:
* `docs/hubo-ui-ux-spec.md` – interaction & motion spec  
* `docs/architecture-overview.md` – system boundaries

---

## 4  Debugging

* **Reduced Motion** – set env `HUBO_REDUCE_MOTION=1` before `npm start` to disable complex animations.  
* **Verbose Logging** – open DevTools console and run:  
  `localStorage.setItem('hubo:logLevel','debug')` then reload.  
* **Debug Overlay** – press `Ctrl + Shift + D` in the running app to toggle a real-time state panel (enabled in dev only).  
* **Inspect Components** – use the React DevTools extension shipped with the Electron shell.

---

## 5  Common Issues & Fixes

| Symptom | Fix |
|---------|-----|
| Global shortcuts don’t work | Ensure the app has accessibility/input-monitoring permission; restart after granting. |
| UI too large / blurry | Check OS display scaling; toggle “Use device pixel ratio” in app settings. |
| Hot-reload fails after pulling | Delete `node_modules`, run `npm install` again. |
| Stale cache / weird state | Quit app, remove `%APPDATA%/Hubo` (Windows) or `~/Library/Application Support/Hubo` (macOS). |
| Proxy / firewall blocking API calls | Set `HTTP_PROXY`/`HTTPS_PROXY` env vars or disable corporate VPN inspection for localhost. |

Happy hacking! If you hit a snag, open an issue or reach out in project chat.  
