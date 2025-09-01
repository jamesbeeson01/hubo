# Frontend Architecture

_This document explains **how** the Electron renderer frontend realizes the interaction model in `docs/hubo-ui-ux-spec.md`.  Timing values, visual tokens, and micro-interaction copy live in that spec and are **referenced, not repeated** here._

---

## 1. App Shell & Overlay Window
• A single **frameless, transparent Electron BrowserWindow** renders the overlay UI. All UI mounts under a root `<div id="hubo-root">` in the renderer process.  
• Shell component (`OverlayWindow`) centers itself with CSS flex; width `clamp(640px, 60vw, 800px)`, `max-height:70vh`; rounded corners from design tokens.  
• Internal content scrolls; outer window resizes with spring animation—durations read from `MotionTokens.resizeSpring`.  
• Visibility toggled by `ui.visible`; show/hide use fade + scale transitions—token `MotionTokens.showWindow` (see §7).
• The BrowserWindow’s **bounds are intentionally larger than the visible card** (“oversized hit area”). The visible UI lives inside an inner container while an outer **transparent margin** surrounds it; this enables pointer-hover targets that appear to float “outside” the card and supports vertical gradient fades below the window.  
• **Explicit user resizing is disabled.** Instead, the window grows or shrinks **programmatically** in response to UI state changes (drawer open, full-app grid, help sheet, detail pane). The resize animation uses the same spring timing tokens as other size transitions.  
• Pointer-leave detection for drawers and panels relies on this transparent margin: when the cursor exits the oversized bounds, a `drawer:collapse` or `panel:close` event is fired.  

---

## 2. Keyboard & Focus Handling
A singleton **Keybinds** module registers global listeners on boot:

| Combo | Action | Notes |
|-------|--------|-------|
| `Ctrl + Alt + H` | Toggle overlay | Prevent default OS conflicts |
| `Esc` | Cascade close | Detail → panel/drawer → home → overlay |
| `Ctrl + K` | Toggle HelpSheet |
| `↑/↓` | Cycle result selection |
| `→ / ←` | Open / close ResultDetailPane |
| `Enter` | Launch highlighted result |
| `Shift + Enter` | Newline in Omnibox |
| `Ctrl + Enter` | Force chat send |

`Keybinds` publishes `{type:'key', action}` events to the EventBus; surfaces decide whether to act.  
`FocusManager` tracks a stack of focusable elements, restoring focus on close.

---

## 3. State Management
Lightweight observable store (`state/store.ts`) with slices:

| Slice | Keys |
|-------|------|
| `ui` | `visible`, `surface`, `focusPath` |
| `search` | `query`, `results[]`, `selectedIndex` |
| `apps` | `registry`, `pinned[]`, `recents[]` |
| `chat` | `thread[]`, `isStreaming` |
| `prefs` | theme, flags, reducedMotion |

Each slice exposes `useSlice(selector)` for reactive access.

---

## 4. Component / Module Structure
```
src/
 ├ shell/
 │   ├ OverlayWindow.ts
 │   ├ SurfaceRouter.ts
 │   └ keybinds.ts
 ├ ui/
 │   ├ Home/
 │   │   ├ Header.ts
 │   │   ├ Omnibox.ts
 │   │   ├ ResultsList.ts
 │   │   └ PinnedRecentPanel.ts
 │   ├ BottomAffordance.ts
 │   ├ SmallDrawer.ts
 │   ├ FullAppWindow.ts
 │   ├ HelpSheet.ts
 │   ├ ChatPane.ts
 │   └ ResultDetailPane.ts
 ├ state/...
 ├ apps/...
 ├ registry/apps.registry.ts
 ├ search/...
 └ util/...
```
Key surfaces:  
• **Home** – header, omnibox, results list, pinned/recents.  
• **BottomAffordance** → **SmallDrawer** (1×4).  
• **FullAppWindow** – responsive grid (auto-fit, minmax).  
• **HelpSheet** – modal with shortcuts.  
• **ChatPane** – thread panel.  
• **ResultDetailPane** – slide-in info on `→`.

---

## 5. App Registry & Per-App Files
Each app lives in `src/apps/<id>.ts`:

```ts
export const WeatherApp = {
  id: 'weather',
  name: 'Weather',
  icon: WeatherSvg,
  capabilities: {searchable:true, launchable:true},
  search(query){ /* return SearchResult[] */ },
  launch(payload){ /* open surface */ },
  render(container){ /* optional panel UI */ }
};
```

Central registry `registry/apps.registry.ts`:

```ts
export const AppRegistry = [
  {module: WeatherApp, placement:'drawer'},
  /* … */
];
export const SmallDrawerApps = ['weather','notes','todo','music'];
```

UI reads registry at runtime; when an app is added/removed, surfaces recompute layout automatically.

---

## 6. Adaptivity to App Count
• **SmallDrawer** renders up to four tiles from `SmallDrawerApps`; if <4, grid shrinks.  
• Overflow signalled by **“More…”** strip; click opens **FullAppWindow**.  
• **FullAppWindow** uses CSS grid with `auto-fit` columns and virtualizes (e.g., `react-window`) when app count > 30.
• **Outer window auto-resizes** to fit each surface’s height/width (within the max constraints) while preserving a slim transparent margin to maintain hover affordances.

---

## 7. Animations & Motion Hooks
`util/motion.ts` exports:

```ts
export const MotionTokens = {
  showWindow:      {duration:Spec.Timing.Show, easing:'cubic-bezier(...)'},
  resizeSpring:    {stiffness:180, damping:22},
  listItemStagger: {duration:Spec.Timing.ListItem, stagger:24},
  hoverLift:       {/* … */}
};
export function useTransition(token, deps){ /* returns style props */ }
```

All components import tokens rather than hard-coding ms values.  
`PrefersReducedMotion` check disables scale/translate animations when true.

---

## 8. Accessibility Integration
• Results list: `role=listbox`; each row `role=option` with `aria-selected`.  
• Live region announces streaming chat tokens.  
• Visible focus rings via `:focus-visible`.  
• All surfaces trap focus until closed; `Esc` restores prior focus.  
_Detailed interaction rules reference the UX spec §12._

---

## 9. File / Folder Layout (proposal)
```
src/
  shell/        overlay window, router, keybinds
  ui/           shared components & surfaces
  state/        store + slices
  apps/         per-app modules
  registry/     apps.registry.ts
  search/       providers, ranker, cache
  util/         motion, event bus, logger
```
Tests live beside code (`*.spec.ts`); docs in `/docs`.

---

## 10. Open Questions
1. State store: keep custom observable or adopt Zustand/Signals?  
2. Animation lib: continue CSS/JS helpers or integrate a library (e.g., Motion One)?  
3. Shadow DOM vs. plain DOM overlay—any host page compatibility constraints?  
4. How soon to replace `react-window` with smarter virtualization if app grid grows?  

Answers will be logged in `DECISIONS.md` as they solidify.  
