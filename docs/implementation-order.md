# Implementation Order

This roadmap breaks development into clear, demo-ready phases.  
Each phase finishes with:  
• A runnable build that demonstrates the new surface or capability  
• Updated docs (architecture + DECISIONS)  
• Unit / integration / E2E tests passing in CI  

---

## Phase 1 – Bootstrap & Shell

Goals  
- Project skeleton (`electron` app) with hot-reload  
- Overlay window chrome, centered & rounded  
- Global **Ctrl + Alt + H** toggle; Esc cascade close logic  
- Core state store (signals or proxy-state)  
- Motion utilities and keybind dispatcher modules  
- Frameless, **transparent** window with **oversized bounds** (hover area outside visible card); user resizing disabled, window **auto-resizes programmatically** on state changes

Exit Criteria  
- Blank window opens / closes with shortcuts & basic fade-scale motion  
- Shell passes lint & unit tests; smoke E2E confirms open/close

---

## Phase 2 – Home & Omnibox (Skeleton)

Goals  
- Home layout scaffold; omnibox input bar at bottom  
- Keyboard focus management & **Esc** clear vs. close behavior  
- Selection cycling (**↑/↓**) placeholder list  
- “Send to chat…” stub entry  
- Pointer-leave / Esc collapses drawer  
- Bottom hover affordance relies on transparent margin; window height auto-resizes as drawer opens/closes

Exit Criteria  
- Typing shows mocked results list; arrow keys move highlight  
- **Enter** logs selected id; **Shift + Enter** expands input  
- Coverage tests for input behaviors

---

## Phase 3 – Bottom Affordance & Small Drawer

Goals  
- Hover affordance gradient + down arrow under main window  
- Click opens small 1 × 4 drawer populated from **App Registry**  
- Drawer adapts when fewer / more than four apps (pagination indicators)  
- Keyboard nav (**←/→ / ↑/↓ / Enter / Esc**)  
- Pointer-leave / Esc collapses drawer

Exit Criteria  
- Visual affordance appears on hover; drawer opens/closes smoothly  
- Registry JSON hot-reloaded; tests validate adaptation logic

---

## Phase 4 – Full App Window

Goals  
- “More…” strip reveals full app grid (responsive columns)  
- Inline search / filter within grid  
- Scroll container with max-height & spring resize motions  
- Pointer-leave collapses to Home; Esc chain respected

Exit Criteria  
- Grid fills from registry; filter narrows tiles live  
- Open/close interaction recorded in E2E flow

---

## Phase 5 – Help Window

Goals  
- **Ctrl + K** overlay with shortcut table & tips  
- Smoky-blue translucent panel w/ rounded corners  
- Close via **Ctrl + K** or **Esc**

Exit Criteria  
- Help opens atop any surface; accessibility roles announced  
- Keyboard navigation verified in tests

---

## Phase 6 – Search Orchestrator & Providers

Goals  
- Debounced fan-out orchestrator service  
- Provider interfaces: local apps, shortcuts (implemented); system apps, files (stubs)  
- Ranking module with pluggable signals; caching layer (LRU)  
- Results list displays real provider returns

Exit Criteria  
- Typing queries actual provider data; ranking deterministic in tests  
- ±150 ms debounce confirmed via perf tests

---

## Phase 7 – Recents & Pins Persistence

Goals  
- IndexedDB wrapper for user data  
- Pin / Unpin UI hover actions; recency updates on launch  
- Home default list populated from persisted store

Exit Criteria  
- Pins & recents survive reload; unit tests for DB ops  
- Migrations versioned

---

## Phase 8 – Chat UI & Adapter

Goals  
- Thread pane above omnibox; streaming token display  
- Inline actions: Copy, Edit, Regenerate  
- Client SDK adapter behind config flag; fallback mock for offline

Exit Criteria  
- **Ctrl + Enter** sends chat; streaming visible  
- Network stub vs. real adapter both green in integration tests

---

## Phase 9 – Hardening & Tests

Goals  
- Full E2E regression flows (Cypress/Playwright)  
- WCAG a11y audit; visible focus rings; screen-reader labels  
- Performance budgets: open ≤ 120 ms, search results ≤ 200 ms  
- Global error handling & toast notifications

Exit Criteria  
- CI passes E2E, a11y, perf thresholds  
- Release candidate tagged

---

## Ongoing

- Docs & DECISIONS.md updated each phase  
- Static analysis, lint, formatting enforced via pre-commit  
- Continuous feedback loop from UI/UX review
