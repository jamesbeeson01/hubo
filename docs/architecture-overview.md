# Architecture Overview

This document captures the **code-level** architecture required to implement the interaction model found in `docs/hubo-ui-ux-spec.md`.  It intentionally omits visual and motion details—see the UX spec for those.

---

## 1. Purpose & Scope
Hubo is a **local-only Electron desktop app** (Phase 1).  
Objectives:
• Deliver all UI flows defined in the UX spec.  
• Keep code modular and extensible so new apps / providers can be added without touching core logic.  
• Defer any networked backend to later phases.

---

## 2. Runtime & Deployment
• Runs as a packaged Electron desktop application (Chromium renderer + Node/Electron main process).  
• Launched by the user; global keyboard hook `Ctrl + Alt + H` toggles visibility.  
• No server process or installer prerequisites.  
• Optionally, a future **local helper service** may be spawned for heavy indexing or chat proxying—out of Phase 1 scope.
• Window is **frameless and transparent**; its bounds are intentionally a few pixels larger than the visible card to enable “outside-of-card” hover affordances and gradient fades.  
• Users **cannot drag-resize** the window; instead, Hubo adjusts size programmatically in response to interaction (drawer open/close, full app grid, help sheet) while respecting the overall max-height constraint.

---

## 3. High-Level Architecture

| Layer | Responsibility |
|-------|----------------|
| **App Shell** | Overlay window manager; handles keyboard shortcuts, focus/visibility, open/close lifecycle. |
| **UI Surfaces** | Home + Omnibox, Bottom Affordance & Small Drawer, Full App Window, Help Sheet, Chat Thread container. |
| **State Store** | Central reactive store (observable pattern) holding UI state, search results, pins/recents, prefs. |
| **Event Bus** | Lightweight pub/sub (`EventEmitter`) for cross-module events (`ui:open`, `search:query`, …). |
| **App Registry** | Single JS/JSON file listing available apps with placement metadata and order hints. |
| **App Modules** | One JS file per app exporting `meta`, `render()`, and optional `launch()`; lazy-imported on demand. |
| **Search Providers** | Pluggable providers (local apps, shortcuts; stubs for system apps/files) feeding the Ranking Layer. |
| **Integration Layer** | Adapter contracts for future third-party or system integrations. |
| **Persistence** | IndexedDB (fallback localStorage) for prefs, pins, recents; in-memory cache for search. |

---

## 4. Core Data Flows  (behavioural timing lives in UX spec)

### 4.1 Open / Close
`Ctrl+Alt+H` ➝ `shell.toggle()` ➝ publishes `ui:open` / `ui:close` ➝ surfaces subscribe and render.  
`Esc` cascades: detail pane → panel/drawer → home → window.

### 4.2 Omnibox Search
input → debounce (100-150 ms) → `search:query` event  
  ➝ providers run in parallel  
  ➝ aggregate results → rank → store.results  
  ➝ UI list renders; `Enter`/arrows/right/left dispatch actions.

### 4.3 Drawer / App Window
pointer hover bottom edge → `drawer:affordanceHover`  
click → `drawer:toggle(small)`  
hover “More…” → `drawer:expand(full)`  
pointer leave → `drawer:collapse`.

### 4.4 Help Sheet
`Ctrl+K` toggles help via `ui:helpToggle`.
  
Transparent margin below the card forms the hover-affordance area; pointer-leave logic evaluates the cursor against these oversized window bounds.

---

## 5. Module Boundaries
• UI components **never** call providers directly; they read/write state via the Store and broadcast intents on the Event Bus.  
• Search providers conform to a typed interface (`SearchProvider`) and are registered at startup.  
• Apps are loaded dynamically from separate modules; the Registry is the single source of truth for grouping/placement.  
• Integration adapters (future) implement capability flags and request permissions through a sandbox API.

---

## 6. Extensibility & Adaptivity
• Adding an app = drop a JS file + registry entry; UI surfaces recalc layouts (drawer grid, full grid) at runtime.  
• Providers can be registered/unregistered without changing UI code.  
• Virtualization kicks in when app or result lists exceed thresholds (e.g., > 30 items).  
• Feature flags enable experimental providers or surfaces without rebuild.

---

## 7. Non-Goals (Phase 1)
× No remote backend or cloud sync.  
× No OS-wide indexing—system apps/files providers remain stubs.  
× Security hardening beyond default sandbox & keychain storage is postponed.

---

## 8. References
• Interaction, motion, and visual rules: `docs/hubo-ui-ux-spec.md`  
• Detailed specs: `frontend-architecture.md`, `search-architecture.md`, `api-spec.md`, `integrations-and-adapters.md`  
• Decision log: `DECISIONS.md`  
