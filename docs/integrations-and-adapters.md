# Integrations & Adapters

This document explains the **adapter pattern** used to plug new apps and features into Hubo’s local Electron runtime without editing core code. It is purely technical—UX behavior is covered in `hubo-ui-ux-spec.md`.

---

## 1. Goals
* **Isolation** – every app lives in its own JS module (`/apps/<id>.js`) with no global coupling.  
* **Self-describing** – adapters export a small metadata object the hub can introspect at runtime.  
* **Registry-driven placement** – a single central file (`apps.registry.js`) declares which adapters load and where they appear (drawer, full app grid, search index, etc.).  
* **Safety first** – default runtime has _no_ network/file‐system access; apps must explicitly request permissions.  
* **Hot extensibility** – dropping a new adapter file + registry entry is enough to surface the app instantly.

---

## 2. Adapter Interface

Each adapter module must be an ES module exporting the symbols below. Only the first (`meta`) is mandatory; the rest are capability-based and may be omitted.

```js
// apps/weather.js
export const meta = {
  id: 'weather',
  name: 'Local Weather',
  icon: '🌤️',          // unicode or asset path
  capabilities: {
    searchable: true,  // appears in omnibox results
    launchable: true,  // can be executed (Enter) to open view
    hasView: true      // renders a UI panel/surface
  }
};

/**
 * Optional: called when omnibox query text matches this app.
 * Should return an array of { title, subtitle?, icon?, payload } objects
 */
export function search(query, ctx) { /* ... */ }

/**
 * Optional: executed when user selects/launches the app from search or UI.
 * The `payload` comes from a chosen search result or null for generic launch.
 */
export function launch(payload, ctx) { /* ... */ }

/**
 * Optional: render live UI into a provided DOM container.
 * Invoked only if `meta.capabilities.hasView` is true.
 */
export function render(container, ctx) { /* ... */ }
```

### Context Object (`ctx`)
Hubo injects a **context** object with helpers:
```ts
{
  preferences,          // user prefs API
  permissions,          // request/grant permissions
  storage,              // namespaced key-value store
  closeView,            // callback to close current panel
  emitEvent,            // global pub-sub
  version               // current adapter API semver
}
```

---

## 3. Discovery & Registration

`/src/apps.registry.js` is the single source of truth for what loads:

```js
// apps.registry.js
import weather from './apps/weather.js';
import notes   from './apps/notes.js';

export const apps = [
  { module: weather, placement: 'primary' }, // shows in small drawer
  { module: notes,   placement: 'secondary' } // only visible in full app window
];
```

Key points  
* **Ordered array** – the sequence controls draw order in UI.  
* **Placement flag** – `primary | secondary | hidden` lets UI scale gracefully with varying counts.  
* Registry can be generated dynamically (e.g. read a directory) in future but starts as explicit imports for tree-shaking friendliness.

---

## 4. Permissions & Sandboxing
* **Electron renderer isolation** – Hubo’s renderer runs with `nodeIntegration:false` and `contextIsolation:true`. Adapters execute inside this isolated context (no direct `require`, `fs`, or `child_process`).  
* **Preload bridge** – A preload script exposes a minimal `hubo` API via `contextBridge`. All adapter calls for storage, events, or permission requests go through this bridge.  
* **IPC-gated capabilities** – File-system or network operations are performed only in the Electron **main** process after policy checks. In the renderer, `fetch` is stubbed/blocked for adapters; requesting `'network'` permission triggers an IPC round-trip where the main process prompts the user and enforces allow/deny.  
* **Revocable & visible** – Granted permissions are listed in *Settings → Privacy & Permissions* and can be revoked at any time. Adapters must never pollute global scope; ESLint rules forbid `eval` and global writes.

---

## 5. Versioning & Compatibility
* **Adapter API version** is semver-tagged (`ctx.version`).  
* Core hub declares the max compatible major version.  
* When loading, hub checks `module.meta.apiVersion` (optional) and refuses to load if the major number exceeds its own.  
* Missing capability functions are gracefully ignored; hub will simply hide related UI affordances.

---

## 6. Examples

### Minimal “Hello” App

```js
// apps/hello.js
export const meta = {
  id: 'hello',
  name: 'Hello World',
  icon: '👋',
  capabilities: { launchable: true, hasView: true }
};

export function launch() {
  // opens default view – could be a toast, modal, etc.
}

export function render(container) {
  container.innerHTML = '<h1>Hello Hubo!</h1>';
}
```

### Corresponding Registry Snippet
```js
import hello from './apps/hello.js';

export const apps = [
  { module: hello, placement: 'primary' },
  // ...other apps
];
```

With just these two files, “Hello World” now:
1. Appears in the small drawer (primary placement).  
2. Can be launched via omnibox top result.  
3. Renders its own UI panel when opened.

---

**Next Steps**  
* Add ESLint rule set `hubo/adapter-safe` to enforce interface shape and sandbox safety.  
* Provide CLI scaffold `npm run new-app` to generate boilerplate adapter + registry line.  
* Evaluate directory auto-discovery once plugin count grows.

