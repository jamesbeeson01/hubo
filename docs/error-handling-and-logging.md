# Error Handling & Logging

This document defines how Hubo’s runtime maps internal errors to user-facing UX, how we log incidents for troubleshooting, and how we validate behaviour in automated tests.

---

## 1&nbsp;·&nbsp;Error Taxonomy

| Code | Description | Typical Origin | UX Surface |
|------|-------------|----------------|------------|
| **user_input** | Invalid or unsupported command, malformed prefix token, missing required data. | Omnibox parsing, chat command resolver. | Inline validation in omnibox or chat, toast if global. |
| **provider_failure** | A search/chat provider or app adapter returned an error status or unexpected payload. | REST/GraphQL calls, local adapter APIs. | Toast with “Retry” + “Details” (optional). |
| **network_blocked** | The request failed because the user is offline, VPN/firewall blocked, or timeout. | Fetch/XHR layer. | Toast with “Retry” and network status icon. |
| **permission_denied** | Missing OAuth scope, OS permission, or adapter capability. | Auth middleware, system APIs. | Toast with “Grant Access…” CTA or “Open Settings”. |
| **unknown** | Anything uncaught by the above categories. | Unhandled promise rejection, runtime exception. | Toast labelled “Unexpected error”, offers “Report”. |

---

## 2&nbsp;·&nbsp;Handling Strategy

1. **Central Error Boundary**  
   • All async flows (`fetch()`, adapter calls, message streaming) are wrapped in a `HuboErrorBoundary` module that converts thrown values into a normalized `HuboError` object `{ code, message, details?, correlationId }`.  
   • UI components subscribe to a global `error$` event bus (tiny RxJS Subject) and render toasts via a `<ErrorToastContainer/>`.

2. **Retry & Back-off**  
   • For `network_blocked` and `provider_failure`, automated exponential back-off (2 → 4 → 8 s, max 3 attempts) before surfacing a toast.  
   • The toast’s **Retry** button triggers `error.retry()` immediately, bypassing back-off.  
   • **Undo** action (when available) calls the inverse command supplied in error metadata.

3. **Toast Rendering (per UI spec §11)**  
   • Position: top-right within Hubo window.  
   • Style: compact pill, dark smoky blue border accent, fades in 120 ms, auto-dismiss after 6 s unless hovered.  
   • **Esc** closes the foremost toast, matching global dismiss semantics.  
   • Concurrency: stacked max 3 toasts; older ones collapse upward.

4. **Graceful Degradation**  
   • If the central toast container fails, fallback to native `alert()` in dev mode; production logs but suppresses duplicate dialogs.

---

## 3&nbsp;·&nbsp;Logging

| Channel | Audience | Format |
|---------|----------|--------|
| **Structured log file** | Power users / support | JSON Lines; daily rotation in user-config dir (`~/.hubo/logs`). |
| **Dev console** | Developers | Color-coded groups: `UI`, `Provider`, `Network`, `Adapter`. |
| **Analytics pipeline** | Optional opt-in | Aggregated event with hashed user id + `correlationId`. |

Key points:

- Every `HuboError` includes a **correlationId** (UUID v4) propagated through provider calls and embedded in toast “Details”.  
- Logs use `level` field (`debug`, `info`, `warn`, `error`, `fatal`) and the taxonomy `code`.  
- PII scrubbing: request/response bodies are redacted before disk or analytics emission.  
- In production, console output defaults to `warn+` and can be toggled via **Ctrl + Shift + D**.

---

## 4&nbsp;·&nbsp;Testing

Automated suites must verify both functional handling and UX surfacing.

1. **Unit**  
   - Mock adapter returning `{ status:500 }` → expect `HuboError` with `provider_failure`.  
   - Ensure retry logic stops after 3 attempts and emits bus event.

2. **Integration**  
   - Run headless browser (Playwright) with network throttled offline.  
   - Type “/help” → expect `network_blocked` toast within 1 s.  
   - Click **Retry** while still offline → same toast re-appears (once).

3. **End-to-End**  
   - Launch app, inject script to throw uncaught exception, assert toast “Unexpected error” and presence of `Report` action.  
   - Validate **Esc** closes toast, returning focus to previous surface.

4. **Regression Matrix**

| Scenario | Expected Toast | Retry? |
|----------|----------------|--------|
| VPN drop during search | network_blocked | Yes |
| Missing Google OAuth token | permission_denied | Grant Access |
| Adapter parse error | provider_failure | Retry |
| Typo command `>>bad` | user_input | N/A |
| Unknown JS exception | unknown | Report |

Test helpers live in `/tests/helpers/error-fixtures.ts` to simulate each taxonomy type.

---

### References

- UI/UX spec §11 “Errors” for toast behaviour.  
- UI/UX spec §3 “Esc dismiss hierarchy”.  
- Logging style cribbed from [Mozilla’s Structured Logs](https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/structured/structured.html) guidelines (conceptual reference).  
