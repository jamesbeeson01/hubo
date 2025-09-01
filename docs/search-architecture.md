# Search Architecture

This document describes the internal design of Hubo’s search subsystem. It complements the UI/UX specification (`docs/hubo-ui-ux-spec.md`) by detailing **how** queries move from the omnibox to results.

---

## 1 · Inputs & Prefixes

Token-based routing determines which provider(s) receive a query:

| Prefix | Meaning | Default Fallback |
| ------ | ------- | ---------------- |
| `>`    | Local application search only | LocalAppsProvider |
| `/`    | Chat-only; bypasses normal search | ChatProvider |
| `@`    | File search in the user workspace | FilesProvider |
| `*`    | System-wide application search (OS menu) | SystemAppsProvider |
| `?`    | Developer shortcuts (e.g., open repo in VS Code) | ShortcutsProvider |
| none   | Mixed search (all providers) | Parallel fan-out |

The omnibox parses the first non-whitespace character. Any unrecognized prefix is ignored and the query is treated as mixed search.

Edge cases  
• Empty input with `Down` key shows **Pinned** + **Recents** (handled by RecentsCache, §5).  
• Multi-line paste is accepted; only first line is searched, remaining lines populate chat draft.

---

## 2 · Providers

Each provider implements a common `SearchProvider` interface (see `docs/api-spec.md`).

| Provider | State | Notes |
|----------|-------|-------|
| **LocalAppsProvider** | Implemented | Reads `apps.registry.js`, supports fuzzy title + keyword match. |
| **SystemAppsProvider** | Stub | Placeholder for OS-level enumeration; disabled on unsupported OS. |
| **FilesProvider** | Stub | Future trigram index of project/workspace files. |
| **ShortcutsProvider** | Implemented | Static developer shortcuts; supports prefix `?`. |
| **ChatProvider** | Implemented | Returns single virtual result “Send to chat…”. Also invoked when no actionable result. |

Providers self-register at startup via `registerProvider(p)`; feature flags may disable any provider.

---

## 3 · Orchestration Pipeline

1. **Debounce** user keystrokes (100–150 ms).  
2. **Cancellation token** aborts in-flight provider calls on new input.  
3. **Parallel fan-out** to relevant providers based on prefix.  
4. **Aggregate** results once all promises settle (or after 250 ms timeout).  
5. **Rank** aggregated list (§4).  
6. **Slice** top six for UI; remainder stored for detail pane.  
7. **Emit** `search:results` event for rendering.

Timeout & error handling  
• Providers exceeding 250 ms are logged and skipped.  
• Cancelled providers return silently.  
• If all providers fail, fallback result is “Send to chat…”.

---

## 4 · Ranking

Weighted linear scoring:

```
score = Σ(weight_i × signal_i)
```

Signals & default weights:

| Signal | Description | Weight |
| ------ | ----------- | ------ |
| Prefix match | Query starts with provider’s prefix alias | 3 |
| Exact title match | Case-insensitive exact match | 2 |
| Recency | `1 / log(daysSinceLastLaunch+1)` | 1.5 |
| Pin boost | +5 if item pinned | 5 |
| Type priority | Provider base weight (apps > files > shortcuts) | variable |

Weights are configurable in `settings.json`. The orchestrator normalises scores to `[0,100]` before slicing.

---

## 5 · Caching

1. **Provider-level LRU** (≤128 entries), TTL 10 min.  
2. **RecentsCache** stores last 50 launched items with timestamps; used by ranking recency signal and to display default list when omnibox is empty.  
3. **Offline mode**: LocalAppsProvider & ShortcutsProvider remain functional; stale cached results served for stubs.

Cache keys include prefix + query text to avoid cross-pollution.

---

## 6 · Rendering Contract

Frontend consumes:

```ts
type SearchResult = {
  id: string;
  providerId: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
};
```

UI rules (aligned with UX spec):

1. **Display** at most **6 rows** beneath the omnibox.  
2. If list is empty, show single row **“Send to chat…”** from ChatProvider.  
3. `→` (Right Arrow) opens **detail pane** for the highlighted result.  
4. `←` (Left Arrow) closes detail pane.  
5. `Enter` triggers `result.action`; `Ctrl+Enter` always routes to chat.  
6. Rows include **Pin** and **Reveal** hover actions.

---

_This architecture can evolve; updates to providers, ranking, or caching will be recorded in `DECISIONS.md`._  
