# Security & Privacy

This document describes how **Hubo (local-first edition)** safeguards user data and code integrity while running entirely on the user’s machine. The focus is on minimizing attack surface, preventing accidental disclosure, and laying groundwork for any future network-enabled features.

---

## 1 · Threat Model (lite)

| Asset | Potential Risk | Mitigation |
|-------|----------------|------------|
| Local user files & personal data surfaced inside Hubo | Malware or another local user reading sensitive data | • App runs in a sandboxed desktop container.<br>• File access limited to paths explicitly chosen by the user.<br>• No default network egress. |
| Adapter credentials (API keys, OAuth tokens) | Theft from disk or memory | • Stored only in OS-level keychain or encrypted local store.<br>• Never written in plaintext.<br>• In-memory encryption where supported. |
| Screen contents while Hubo is open | Shoulder-surfing, screen-sharing | • Global hide shortcut `Ctrl + Alt + H`.<br>• Optional auto-blur after idle. |
| Binary tampering | Malicious code injection | • Signed release packages (planned).<br>• SHA-256 checksums published with releases. |

_Default assumption: Hubo operates without network access unless the user enables an adapter that explicitly needs it._

---

## 2 · Secrets & Tokens

1. **Storage location**  
   • macOS: Apple Keychain  
   • Windows: Credential Manager / DPAPI-protected store  
   • Linux: libsecret / GNOME Keyring  

2. **Fallback (encrypted file)** – If the keychain API is unavailable, secrets are stored in `~/.hubo/secrets.enc`, AES-256-GCM encrypted with a user-supplied passphrase.

3. **Rotation**  
   • Each credential tracks `created_at` / `expires_at`.  
   • UI surfaces expiry alerts 30 days prior and offers *Replace* / *Revoke*.  

4. **Development**  
   • `.env.local` may reference *names* of secrets but never contain actual tokens.  
   • CI injects secrets via secure env vars; commits with token-like patterns are rejected.

---

## 3 · Permissions

Hubo follows **explicit opt-in**:

| Capability | Default | Grant Flow |
|------------|---------|-----------|
| Network requests | Denied | Adapter declares `"network"` capability → Hubo prompts user. |
| File-system outside app dir | Denied | Adapter triggers OS file-picker for exact paths. |
| Clipboard write | Read-only | Prompt on first write attempt. |
| Notifications | Denied | Prompt on first notification attempt. |

Users can revoke any permission under **Settings → Privacy & Permissions**. Adapters losing a permission fail gracefully and surface a toast.

---

## 4 · Telemetry

| Policy | Details |
|--------|---------|
| Default | **Off** |
| Opt-in | Settings toggle; clearly explains data collected. |
| Content | Only anonymous aggregate metrics (feature usage counts, performance timings). No search queries, file names, or chat content. |
| Transport | TLS 1.3; endpoint URL displayed in UI. |
| Control | Users can export or delete telemetry data at any time. |

Toggling telemetry off immediately stops collection and purges any queued data.

---

## 5 · Updates

| Stage | Approach |
|-------|----------|
| Early development | **Manual downloads** from GitHub releases or local builds. |
| Future production | Auto-update channel with delta patches. |
| Integrity | All release packages notarized / Authenticode-signed; installer verifies SHA-256 before applying. |
| User control | *Download & Install*, *Remind Me Later*, or *Skip Version* options; no silent updates. |

---

_These guidelines evolve with the project. Any change to security posture is logged in `DECISIONS.md` and highlighted in release notes._
