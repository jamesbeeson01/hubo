# Testing & Quality

A pragmatic guide to validating Hubo’s codebase.  Each section lists target areas, suggested tools, and sample assertions—focused on technical behaviour, not visual spec restatement.

---

## 1&nbsp;·&nbsp;Unit Tests

Target areas  
• **Components** – `Omnibox`, `ResultsList`, `Drawer`, `HelpSheet`.  
• **Utilities** – `ranker.ts`, `debounce.ts`, store slices.

Typical stack  
`Vitest` + `@testing-library` (DOM hooks) + `jsdom`.

Example checks  
- Omnibox renders placeholder, updates value, fires `onChange` debounce.  
- ResultsList moves `aria-selected` index on `ArrowDown`.  
- `ranker()` orders by score; pinned item weight > others.  
- Store slice default state matches schema; selector memoizes.

---

## 2&nbsp;·&nbsp;Integration Tests

Combine multiple modules inside one JS runtime (no browser).

Focus areas  
1. **Provider Orchestrator** – feed mock providers; expect merged, ranked output with deduplication.  
2. **App Registry ↔ Launcher** – registering N mock apps must surface correct metadata and dispatch `app:open`.  
3. **Drawer ⇄ Full-App Window** – simulate clicks through EventBus; assert state transitions (`surface='smallDrawer' → 'fullApp'`) without memory leaks.

Run with `Vitest --runMode=integration` using real state store & event bus.

---

## 3&nbsp;·&nbsp;End-to-End (E2E)

Automate full desktop bundle (Electron app) with Playwright.

Essential flows  
1. Open (`Ctrl+Alt+H`) / Close; verify window visibility toggles ≤120 ms.  
2. Esc cascade: Esc in panel closes panel → drawer → home → window.  
3. `Ctrl+K` toggles Help; focus trapped in overlay.  
4. Bottom hover → Small Drawer → “More…” → Full App grid.  
5. Type query, `ArrowDown` select, `Enter` launch top result.  
6. `→` opens detail pane, `←` closes.

Headless run in CI, headed run nightly for video capture.

---

## 4&nbsp;·&nbsp;Accessibility

Automated  
- `axe-core` scan per surface (home, drawer, full app, chat).  
- Lighthouse a11y score ≥ 95.

Manual spot-checks  
- Tab/Shift+Tab focus order across omnibox → results → drawers.  
- Verify ARIA roles (`listbox`, `option`, `dialog`) present.  
- Reduced-motion flag (`prefers-reduced-motion`) disables transform animations.

---

## 5&nbsp;·&nbsp;Performance

Budgets on mid-range 4-core laptop:

| Metric | Threshold |
|--------|-----------|
| Overlay open → first paint | < 120 ms |
| Debounced search → first results paint | < 150 ms |
| Renderer bundle (gzip) | ≤ 350 KB |
| Idle memory after 5 min | ≤ 150 MB |

Test with Lighthouse CI + Playwright tracing; fail CI if >10 % regression.

---

## 6&nbsp;·&nbsp;CI Outline (GitHub Actions)

1. `lint` – ESLint, Stylelint, type-check.  
2. `test:unit` – Vitest unit suite.  
3. `test:integration` – Vitest integration tag.  
4. `test:e2e` – Playwright headless.  
5. `build` – Production bundle; measure gzip size.  
6. `perf` – Lighthouse CI budgets.  
7. `upload-coverage` – Codecov; thresholds 90 % utils, 75 % overall.

Only green pipelines can merge to `main`.  
