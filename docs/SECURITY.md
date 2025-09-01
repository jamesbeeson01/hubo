# Security Guide for Hubo (Electron Desktop App)

This document lists concrete hardening steps every Hubo build **must** apply before shipping.  
All snippets assume CommonJS in the Electron **main** process unless noted.

---

## 1 · BrowserWindow Safe Defaults

```js
// src/main/main.js
const {BrowserWindow} = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 600,
    show: false,                  // show after 'ready-to-show'
    frame: false,                 // custom chrome
    backgroundColor: '#00000000', // transparent overlay
    webPreferences: {
      contextIsolation: true,     // <— isolates worlds
      nodeIntegration: false,     // <— disable Node in renderer
      sandbox: true,              // <— OS-level sandbox where supported
      webSecurity: true,          // <— enforces same-origin / CSP
      devTools: !app.isPackaged,  // disable devtools in production
      preload: MAIN_PRELOAD_PATH, // minimal, audited bridge
    }
  });

  win.once('ready-to-show', () => win.show());
}
```

Checklist  
✓ `contextIsolation` **true**  
✓ `nodeIntegration` **false**  
✓ `sandbox` **true**  
✓ `webSecurity` **true**  
✓ DevTools only in dev (`!app.isPackaged`)  

---

## 2 · Navigation & New-Window Lock-down

```js
// block external navigation inside overlay
win.webContents.on('will-navigate', (e, url) => {
  if (url !== win.webContents.getURL()) e.preventDefault();
});

// deny window.open except for explicitly allowed targets
win.webContents.setWindowOpenHandler(({url}) => {
  return {action: 'deny'};   // change to 'allow' after explicit validation
});
```

---

## 3 · Permission Gating (Camera, Mic, etc.)

```js
const {session} = require('electron');

session.defaultSession.setPermissionRequestHandler(
  (wc, permission, cb) => {
    const allowed = false; // default deny
    // Optional fine-grained logic here
    cb(allowed);
});
```

---

## 4 · IPC & Preload Safety

**Preload:** expose a **minimal** audited surface only.

```js
// src/preload/preload.js
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('hubo', {
  version: APP_VERSION,
  toggleVisibility: () => ipcRenderer.send('hubo:toggle'),
  // strictly typed channels – never expose ipcRenderer directly
  onSearchResults: cb => ipcRenderer.on('hubo:results', (_, r) => cb(r))
});
```

Rules  
1. No direct `require` or Node primitives in renderer.  
2. Allow-list channels; validate arguments types in **main** before acting.  
3. Strip or clone large objects to avoid prototype pollution.

---

## 5 · Content-Security-Policy (CSP)

### Renderer HTML

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               img-src 'self' data:;
               script-src 'self';
               style-src 'self' 'unsafe-inline'">
```

### Additional Hardening (optional)

```js
session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
  cb({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [ "default-src 'self'; img-src 'self' data:;" ]
    }
  });
});
```

---

## 6 · Disable `remote` Module

Electron’s `@electron/remote` (and legacy `remote`) remain a privilege-escalation vector.

```js
app.disableHardwareAcceleration();           // unrelated but typical
process.env.ELECTRON_DISABLE_REMOTE_MODULE = 'true';
```

---

## 7 · AutoUpdater Signatures (Future Work)

When adopting `electron-updater`:

1. Sign macOS builds with Developer ID + notarize.  
2. Sign Windows builds with Authenticode.  
3. Enable `autoUpdater.setFeedURL()` over **HTTPS** only.  
4. Verify signature hash in `update-downloaded` before `quitAndInstall()`.

---

## 8 · Secrets Handling

| Secret Type             | Storage                                   | Library |
|-------------------------|-------------------------------------------|---------|
| API tokens (Chat)       | OS keychain                               | `keytar` |
| Local encryption keys   | AES-256 via `safeStorage` (fallback Pass) | Built-in |
| Session state / prefs   | IndexedDB (renderer)                      | N/A |

Guidelines  
• Encrypt _before_ persisting anything sensitive.  
• Never log secrets; scrub before structured logs.  
• Offer “Clear All Data” menu that deletes keychain entries + IndexedDB.

---

## 9 · Release Checklist

- [ ] BrowserWindow uses safe defaults (section 1).  
- [ ] Navigation & new-window handlers registered (section 2).  
- [ ] Permissions handler default-deny (section 3).  
- [ ] Preload audited & types guarded (section 4).  
- [ ] CSP meta tag present and tested (section 5).  
- [ ] `remote` disabled & DevTools disabled in prod.  
- [ ] API keys stored via keytar / safeStorage.  
- [ ] Manual pen-test: try drag-dropping external URL, window.open, etc.  

Security is an **ongoing process**; file issues or pull requests with improvements.
