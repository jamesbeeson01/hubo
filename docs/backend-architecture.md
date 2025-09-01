# Backend Architecture

> Scope: A minimal stance that keeps Hubo entirely local in **Phase 1**, yet outlines a clean migration path to optional local helper services (and beyond) without locking us into premature work or cloud dependencies.

---

## 1 · Phase 1 — Client-Only Operation

| Aspect | Decision |
|--------|----------|
| Execution model | **Pure client**. The Electron desktop shell runs 100 % of logic. |
| Search | In-process providers: file-system crawl, installed-apps enumeration, settings store. |
| Chat | UI shipped; back-end calls stubbed. End-users can drop an OpenAI-style SDK key into local secrets to enable direct calls from the renderer process. |
| Data | Browser APIs (IndexedDB) + filesystem JSON for heavier artifacts. |
| Networking | **None** by default. App ships air-gapped; all outbound traffic is user-opt-in (e.g., enabling chat). |

Benefits  
• Zero-setup, offline works out-of-the-box.  
• Security budget stays simple—no exposed ports, no daemon to patch.  
• Fast iteration on UI while team validates value proposition.

---

## 2 · Future Local Helper Service (Optional, Phase 1.5+)

A lightweight companion process (Node.js or Go) that runs **locally only**—never on a remote server.

### Responsibilities
1. **Chat proxying**  
   • Holds API keys so the renderer process only sends prompts.  
   • Applies rate-limit & usage-meter logic.  

2. **Local indexing**  
   • File-system & application metadata indexer running with higher privileges than the sandboxed UI.  
   • Exposes fast `/search` to the client via IPC/HTTP.

3. **Telemetry batching (opt-in)**  
   • Collects anonymised metrics, batches and flushes when online.  
   • Keeps renderer dependency surface minimal.

### IPC Interface
| Option | Notes |
|--------|-------|
| Child Node process | Simplest; shares Node modules. |
| gRPC over loopback | Typed contracts, streaming chat tokens. |
| HTTP/REST over `localhost` | Universally debuggable; fallback codec for other languages. |

### Sandboxing & Permissions
- Helper runs under the user account, **drops privileges** (no admin).  
- Renderer ↔ helper authenticated by random token stored in OS keychain; prevents local spoofing.  
- Helper launched by hub with `--safe` flag to disable `eval`, dynamic `require`, etc.

---

## 3 · Data & Persistence

| Data Type | Store | Rationale |
|-----------|-------|-----------|
| Preferences, pins, recents | IndexedDB (`hubo_settings`) | Transactional, schema-versioned. |
| Search indices | File-based LevelDB or SQLite in app-data dir | Scales better than IndexedDB for tens of thousands of docs. |
| Chat cache | LRU in memory → JSON snapshot on quit | Quick restore, small footprint. |
| Secrets (API keys) | OS keychain (Keytar abstraction); fallback AES-encrypted JSON (PBKDF2) | Never raw plaintext. |
| Logs & telemetry | Rotating JSONL in `~/.hubo/logs` | For user-shared bug reports. |

Migrations handled by a small **storage manager** that bumps `schemaVersion` on app start.

---

## 4 · API Surface (reserved for helper)

Endpoints planned; concrete schemas live in `docs/api-spec.md`.

| Method | Path | Purpose |
|--------|------|---------|
| POST   | `/search` | Proxy omnibox query. |
| POST   | `/chat`   | Stream chat tokens. |
| GET    | `/apps`   | List registered adapters & metadata. |
| GET    | `/files`  | File-index status, reindex triggers. |
| GET/PUT| `/prefs`  | Read / update persisted preferences. |

Envelope structure:

```
{ ok: boolean, data?: any, error?: HuboError }
```

---

## 5 · Security Considerations

1. **Least Privilege** – Renderer in Chromium sandbox; helper (if enabled) runs user-level only.  
2. **Outbound Network** – Default deny; any integration explicitly asks user for network permission.  
3. **Authentication** – Renderer–helper token stored in keychain; rotated on each reboot.  
4. **Data at Rest** – Secrets encrypted; user data stored locally. No cloud sync unless enabled later.  
5. **Update Path** – Signed packages; helper checksum pinned in app manifest.

---

_This backend stance keeps Hubo lean for a local-only MVP while reserving clear seams for future expansion. All changes will be tracked in `DECISIONS.md`._
