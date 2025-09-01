# Data Model

A local-first, privacy-respecting schema for Hubo’s runtime and persisted state.  
All entities are stored client-side (IndexedDB preferred) with lightweight in-memory mirrors for quick lookup and reactive UI updates.

---

## 1&nbsp;&nbsp;Core Types

| Entity | Purpose | Selected Fields (shape) | Storage |
|--------|---------|-------------------------|---------|
| **UserPrefs** | Global per-device preferences | `{ theme: "light\|dark", reducedMotion: boolean, shortcuts: Record<string,string> }` | `prefs` store |
| **AppDefinition** | Static description of an installable/launchable app | `{ id: string, name: string, icon: string, capabilities: string[], placement: "drawer\|panel\|hidden" }` | bundled JSON / remote manifest |
| **AppInstance** | Runtime instance state (window position, size, etc.) | `{ id: string, state: Record<string,unknown> }` | in-memory only (session) |
| **SearchResult** | Normalised search hit consumed by omnibox | `{ id: string, kind: "app"⏐"file"⏐"systemApp"⏐"shortcut", title: string, subtitle?: string, icon?: string, action: () => void }` | derived (ephemeral) |
| **Pin** | User-pinned item for quick access | `{ targetId: string, kind: SearchResult["kind"], order: number }` | `pins` store |
| **Recent** | Recently launched/viewed item | `{ targetId: string, kind: SearchResult["kind"], at: number }` | `recents` store |
| **ChatMessage** | Single message in a chat thread | `{ id: string, role: "user"⏐"assistant"⏐"system", content: string, at: number }` | embedded in `ChatThread` |
| **ChatThread** | Collection of messages plus metadata | `{ id: string, title: string, messages: ChatMessage[] }` | `threads` store |

> All time values are Unix epoch milliseconds.  
> Strings are UTF-8; binary blobs (e.g. icons) stored via Blob or data-URL.

---

## 2&nbsp;&nbsp;Persistence

**Storage engine:** IndexedDB (via `idb` helper) for durability and offline resilience.

| Store | Key | Value | Notes |
|-------|-----|-------|-------|
| `prefs` | constant `"singleton"` | `UserPrefs` | single record pattern |
| `pins` | auto-inc | `Pin` | compound index on `order` |
| `recents` | auto-inc | `Recent` | index on `at` (desc) |
| `threads` | `threadId` | `ChatThread` | large payloads; consider chunking |
| `cache` | hashed request key | any | search / metadata cache |

### Serialization Guidelines
1. Keep payloads JSON-serialisable; strip functions/blobs before persist.
2. Icons referenced by URL; cached variants stored separately in `cache`.
3. Prefer shallow updates; write only the modified record to minimise churn.

### Migrations
- Use a `meta` object in `prefs` with `schemaVersion`.  
- Increment `schemaVersion` when breaking changes occur; run an upgrade function inside `indexedDB.open()`’s `upgrade` callback.  
- Provide idempotent migration steps keyed by version number.

---

## 3&nbsp;&nbsp;Indexing

1. **In-memory maps**  
   - `appsById`, `shortcutsById` constructed at boot from `AppDefinition` manifest(s).  
   - Exposed as reactive stores (e.g. `Observable` / `Proxy`) for instant UI updates.

2. **Async enrichment**  
   - Background workers enhance SearchResult entries (e.g., file system metadata, icon fetching).  
   - Results updated in place; UI list diffing ensures smooth animated updates.

3. **Search pipeline**  
   - Tokenise input → query providers → merge streams → rank → slice top N.  
   - Ranking signals: exact prefix, recent use, pinned weight (+∞), fuzzy score.

---

## 4&nbsp;&nbsp;Privacy

- **Local-only by default**: No entity leaves the device unless the user explicitly enables cloud sync in future iterations.
- **Easy reset**: *Settings → Clear Data* drops all IndexedDB stores and reloads.
- **Granular control**: Users may clear individual stores (e.g., *Clear recents*) without affecting others.
- **No hidden telemetry**: Logging is written to `console` or local log files only when debug mode is enabled.

> The above guarantees align with Hubo’s principle of user sovereignty: your data, your machine, your rules.
