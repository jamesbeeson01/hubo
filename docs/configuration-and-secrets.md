# Configuration & Secrets Guide

This document explains how to configure a local Hubo **Electron** desktop build.  
All settings live on the developer machine—there is currently no remote or production profile.

---

## 1. Environments

| Environment | Purpose | How to set |
|-------------|---------|-----------|
| **local**   | Default for every `npm run dev` or packaged build. | Nothing required. The app auto-detects local mode. |
| **.env.local** | Optional overrides for experimenting with providers or alternate endpoints. | Create a file `./.env.local` at repo root. Keys in this file are injected at startup and **never committed** (`.gitignore`). |

Example `.env.local`:
```
HUBO_LOG_LEVEL=debug
HUBO_SEARCH_TIMEOUT_MS=3000
```

Notes  
• Only variables prefixed with `HUBO_` are read.  
• Missing variables are filled with built-in defaults; the app remains launchable without any file.

---

## 2. Feature Flags

Feature flags gate experimental surfaces or providers without requiring code removal.

```js
// src/config/flags.js
export const flags = {
  enableSystemAppSearch: false,
  enableChatStreamingV2: true,
  showDebugPanel: false,
};
```

How it works  
1. Flags are simple booleans read at runtime.  
2. A helper `useFlag(flagName)` returns the value reactively inside UI code.  
3. To flip a flag locally, set `HUBO_FLAG_<UPPER_NAME>=true` in `.env.local` (e.g., `HUBO_FLAG_SHOW_DEBUG_PANEL=true`).  
4. Build scripts merge `.env.local` values over the default flag object.

---

## 3. Secrets

Never keep credentials in plaintext repo files or `.env.local`.

1. **OS Keychain Helper (preferred)**  
   - On first launch requiring a credential (e.g., OpenAI token), the app prompts and stores it in the system keychain via the `keytar` module.  
   - Subsequent launches read from the keychain silently.

2. **Encrypted Fallback File**  
   - If the keychain API is unavailable (rare), secrets are written to `~/.hubo/secrets.enc`.  
   - The file is AES-256 encrypted with a passphrase the user supplies at first run and cached for the session.  
   - Rotation: delete the file to trigger a new prompt.

3. **Never in Git / Never in Plain `.env`**  
   - CI checks fail if a token-like pattern appears in commits.  
   - `.env.local` should hold *references* or toggles, not secret values.

---

## 4. App Registry as Configuration

All installed apps and their placement are declared in **`src/registry/apps.registry.js`**.  
This file is the single source of truth the UI reads at startup.

```js
export const appRegistry = [
  {
    id: 'calendar',
    title: 'Calendar',
    icon: 'icons/calendar.svg',
    surfaces: ['drawer', 'fullWindow'],      // where it can appear
    entry: () => import('../apps/calendar'), // lazy import
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: 'icons/notes.svg',
    surfaces: ['drawer'],
    entry: () => import('../apps/notes'),
  },
  // …
];
```

Guidelines  
• **One JS file, many apps** – each app lives in its own folder under `src/apps/<appId>/`.  
• **Dynamic loading** keeps startup time low; only the active surface’s apps are imported.  
• **Adaptive Layout** – the UI queries `appRegistry.length` to decide grid columns, tile sizes, and paging so the layout adjusts automatically as you add/remove entries.

Updating the registry  
1. Add a new object with required fields (`id`, `title`, `icon`, `surfaces`, `entry`).  
2. No additional wiring is needed; the omnibox, drawers, and full app window will auto-reflect the change on next reload.

---

### Quick Checklist

- [ ] Added/edited `.env.local`? **Commit? ➜ No.**  
- [ ] Introducing a new flag? Update `flags.js` + docs.  
- [ ] Need a secret? Use keychain helper; **never** plain text.  
- [ ] Shipping a new app? Register it in `apps.registry.js`, push code in `src/apps/<id>/`.  

Happy hacking! 🎉
