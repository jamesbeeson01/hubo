# Hubo

Personal hub home for connecting personalized desktop apps and features

## The idea

There are two copies of Hubo on this computer:

| | **Stable** | **Working** |
|---|---|---|
| What it is | The installed app | The code in this repo, run from the terminal |
| How you open it | Desktop shortcut, taskbar, or **Ctrl+Alt+H** | `npm start` in `hubo-app`, then **Ctrl+Alt+Shift+H** |
| Git branch | `main` | `dev` (or any other branch) |
| When it changes | Only when you choose to install a new version | Every time you save and restart |

Rule of thumb: **`main` is always the version that is installed.** Experiment on `dev`. When `dev` is good, merge it into `main` and install it.

Both copies can run at the same time. The app checks whether it's the installed version or `npm start`, and picks its shortcut to match:

- **Ctrl+Alt+H** shows or hides the **stable** Hubo
- **Ctrl+Alt+Shift+H** shows or hides the **working** Hubo

They also keep their settings in separate folders, so testing won't affect the stable app.

---

## First-time setup

Do this once on a new computer.

1. Install [Node.js](https://nodejs.org) (LTS) and [Git](https://git-scm.com).
2. Clone the repo and install the dependencies:
   ```
   git clone https://github.com/jamesbeeson01/hubo.git
   cd hubo/hubo-app
   npm install
   ```
3. Give it your Gemini API key. The simplest way, which also works for the installed app, is a Windows user environment variable. Run this once in a terminal, then **close and reopen the terminal**:
   ```
   setx GEMINI_API_KEY "your-key-here"
   ```
   (A `hubo-app/.env` file with `GEMINI_API_KEY=your-key-here` also works for `npm start`, but the installed app may not find it.)
4. Create a `dev` branch for day-to-day work:
   ```
   git checkout -b dev
   ```
5. Install the stable version by following **Install or update the stable version** below.

---

## Daily work (the working version)

All commands run from `hubo/hubo-app`.

1. Make sure you're on `dev`: `git checkout dev`
2. Run it:
   ```
   npm start
   ```
   The stable Hubo can stay running. Use **Ctrl+Alt+Shift+H** to show or hide this one.
3. Edit code. To see your changes, stop it with **Ctrl+C** in the terminal and run `npm start` again. You can also type `rs` and press Enter in that terminal to restart.
4. Commit as you go:
   ```
   git add -A
   git commit -m "what I changed"
   ```

Logs (`console.log` in `src/index.js` and `apps/`) appear in the terminal.

---

## Install or update the stable version

Do this when the code on `dev` is good enough to use every day.

1. **Merge into `main`:**
   ```
   git checkout main
   git merge dev
   ```
2. **Bump the version number.** The installer won't update an install that has the same version.
   ```
   npm version patch --no-git-tag-version
   git commit -am "Release v1.0.x"
   ```
   (Use `minor` instead of `patch` for bigger changes.)
3. **Quit the stable Hubo if it's running** (see below).
4. **Build the installer:**
   ```
   npm run make
   ```
   This creates `hubo-app/out/make/squirrel.windows/x64/hubo-app-<version> Setup.exe`.
5. **Run that `Setup.exe`.** It installs to `%LOCALAPPDATA%\hubo-app`, adds a **desktop shortcut** and a **Start Menu** entry, then opens the app.
6. **Pin to the taskbar (first install only).** Press Start, type `hubo-app`, right-click it, and choose **Pin to taskbar**. The pin and the desktop shortcut keep working after updates.
7. Go back to working: `git checkout dev` and then `git merge main`, so `dev` has the new version number.

If something is broken after an update, check out the previous release commit on `main`, bump the version again, and rebuild.

---

## Quitting Hubo

Closing the Hubo window **does not quit it**. It keeps running in the background so that Ctrl+Alt+H can bring it back. To fully quit:

- **Stable:** Open Task Manager (Ctrl+Shift+Esc), find **hubo-app**, and click **End task**.
- **Working:** Press **Ctrl+C** in the terminal where `npm start` is running.

## Uninstalling

Settings → Apps → Installed apps → **hubo-app** → Uninstall.

## Quick reference

| I want to… | Do this (in `hubo-app`) |
|---|---|
| Test my changes | `git checkout dev`, then `npm start` |
| Restart the test version | `rs` + Enter, or Ctrl+C and `npm start` |
| Ship to the installed app | merge to `main` → `npm version patch --no-git-tag-version` → commit → quit stable → `npm run make` → run `Setup.exe` |
| Open the stable version | Desktop shortcut, taskbar, or Ctrl+Alt+H |
| Show/hide the test version | Ctrl+Alt+Shift+H (while `npm start` is running) |
| Fix missing packages after a pull | `npm install` |
