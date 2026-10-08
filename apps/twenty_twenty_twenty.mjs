// 20-20-20: every 20 minutes, cover the screen for 20 seconds so you look away.
// Toggled on and off by clicking the app. Runs in the main process, so it keeps
// going when the Hubo window is closed. Off after a restart.
import { BrowserWindow, ipcMain, powerMonitor, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

// Env overrides are for testing, so you don't have to wait 20 minutes.
const WORK_SECONDS = Number(process.env.BREAK_WORK_SECONDS ?? 20 * 60);
const BREAK_SECONDS = Number(process.env.BREAK_SECONDS ?? 20);

// The overlay is drawn this far past every screen edge so Windows' thin window
// border and rounded corners fall off-screen.
const BLEED = 8;

let running = false;
let locked = false;
let suspended = false;
let workTimer = null;
let overlays = [];
let listening = false;

function scheduleBreak() {
  clearTimeout(workTimer);
  if (!running || locked || suspended) return;
  workTimer = setTimeout(showBreak, WORK_SECONDS * 1000);
}

function showBreak() {
  const primaryId = screen.getPrimaryDisplay().id;
  overlays = screen.getAllDisplays().map((display) => {
    const win = new BrowserWindow({
      show: false,
      frame: false,
      resizable: false,
      movable: false,
      skipTaskbar: true,
      backgroundColor: '#1e1e1e', // matches the dark theme, so no flash before the page paints
      webPreferences: { preload: path.join(srcDir, 'break-overlay-preload.js') },
    });
    win.loadFile(path.join(srcDir, 'break-overlay.html'), {
      query: {
        seconds: String(BREAK_SECONDS),
        role: display.id === primaryId ? 'main' : 'mirror',
      },
    });
    win.setAlwaysOnTop(true, 'screen-saver');
    win.once('ready-to-show', () => {
      win.show();
      // Display bounds, not work area, so the taskbar is covered. Set after show():
      // Electron clamps a fullscreen or pre-show window to the work area on Windows.
      const b = display.bounds;
      win.setBounds({ x: b.x - BLEED, y: b.y - BLEED, width: b.width + BLEED * 2, height: b.height + BLEED * 2 });
      if (display.id === primaryId) win.focus();
    });
    return win;
  });
}

function closeOverlays() {
  overlays.forEach((win) => !win.isDestroyed() && win.close());
  overlays = [];
}

// Sleeping or locking means you're away from the screen: drop any break in
// progress and restart the 20 minutes once you're back. The screen merely
// turning off doesn't count, since you may still be reading it.
function listenForAway() {
  if (listening) return;
  listening = true;
  const away = (setFlag) => () => {
    setFlag(true);
    clearTimeout(workTimer);
    closeOverlays();
  };
  const back = (setFlag) => () => {
    setFlag(false);
    scheduleBreak();
  };
  const setLocked = (v) => { locked = v; };
  const setSuspended = (v) => { suspended = v; };
  powerMonitor.on('lock-screen', away(setLocked));
  powerMonitor.on('suspend', away(setSuspended));
  powerMonitor.on('unlock-screen', back(setLocked));
  powerMonitor.on('resume', back(setSuspended));
}

function start() {
  listenForAway();
  running = true;
  scheduleBreak();
}

function stop() {
  running = false;
  clearTimeout(workTimer);
  closeOverlays();
}

ipcMain.on('break:done', () => {
  closeOverlays();
  scheduleBreak();
});
ipcMain.on('break:quit', stop);

export function twentyTwentyTwenty() {
  if (running) {
    stop();
    return { message: 'Breaks off' };
  }
  start();
  return { message: 'Breaks on' };
}
