# Architecture Decision Record Log

This document tracks major technical decisions for the Hubo project.  
Each entry follows the template:

`ADR-00XX  Title — Status (Proposed | Accepted | Deprecated)`

Sections:
1. Context  
2. Decision  
3. Consequences  
4. References (optional)

---

## ADR-0001  Local-only Electron app (Phase 1) — **Accepted**

**Context**  
Early iterations focus on rapid UI feedback. Running entirely on the local machine avoids backend hosting, auth flow, and network latency.

**Decision**  
Phase 1 delivers Hubo as a local Electron desktop application with no backend services.

**Consequences**  
+ Simpler security/privacy posture; no data leaves the device.  
+ Faster development and iteration on UI surfaces.  
− No server-side chat proxy; external AI calls must be client-side or stubbed.  
− System-wide indexing limited until later phases add background services.

---

## ADR-0002  Separate JS file per app; single registry file defines placement — **Accepted**

**Context**  
Hubo surfaces multiple mini-apps (tiles). Modularity and dynamic layout are priorities.

**Decision**  
Each app is implemented in its own JavaScript module (and optional UI component) file. A single `apps-registry.js` describes metadata (id, title, icon, default zone: drawer, pinned, full-grid).

**Consequences**  
+ Clear separation of concerns; easy addition/removal of apps.  
+ UI can adapt automatically based on registry length.  
− Slight overhead maintaining the registry file.  
− Cross-app shared utilities must be imported explicitly.

---

## ADR-0003  UI-first implementation order — **Accepted**

**Context**  
Stakeholders want visible progress and early usability.

**Decision**  
Development order:  
1. Main window open/close & shortcuts (`Ctrl + Alt + H`, `Esc`)  
2. Help window (`Ctrl + K`)  
3. Bottom hover affordance & small drawer  
4. Full app window  
5. Stubs for search / chat internals (to be fleshed out later)

**Consequences**  
+ Rapid demonstration value.  
+ Enables parallel work on visual polish.  
− Underlying providers mocked initially; risk of rework when wiring real data.

---

## ADR-0004  Local storage via IndexedDB for prefs/pins/recents — **Accepted**

**Context**  
Phase 1 is local-only; we still need persistence across sessions.

**Decision**  
Use IndexedDB (wrapped in a small DAO layer) to store user preferences, pinned apps, and recent items.

**Consequences**  
+ Works offline; aligns with local-only architecture.  
+ Browser-level security sandbox.  
− Need migration/versioning logic for schema changes.  
− Provide “Clear Hubo Data” action to reset state.

---

## ADR-0005  Centralized Keybinds & Motion modules — **Accepted**

**Context**  
The UI spec mandates consistent shortcut handling and motion timings (supporting “Reduce Motion”).

**Decision**  
Create two core modules:  
* `keybinds.js` – maps all global shortcuts, exposes subscribe API.  
* `motion.js` – exports timing constants and helper functions (e.g., `fadeScale(element, opts)`).

**Consequences**  
+ Single source of truth ensures uniform behavior across surfaces.  
+ Easy to respect OS accessibility settings for reduced motion.  
− Modules become critical dependencies; must avoid circular imports.

---

### Template for Future ADRs

`ADR-00XX  Meaningful Title — Status`

**Context**  
Explain the forces at play and any relevant background.

**Decision**  
State the choice made. Be explicit.

**Consequences**  
List positive and negative results of the decision.

**References**  
(Optional) Link to discussions, issues, or specs.
