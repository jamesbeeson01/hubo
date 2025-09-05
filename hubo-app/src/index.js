const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('node:path');
const { appRegistry, smallDrawerApps } = require('../apps/registry.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 400,
    titleBarStyle: 'hidden',
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();


};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Alt+CommandOrControl+H', () => {
    console.log('ctrl+alt+H event');
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (!win.isVisible() || !win.isFocused()) {
        win.show();
        win.focus();
      } else {
        win.close();
      }
    } else {
      createWindow();
    }
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// IPC handler for closing the window
ipcMain.handle('close-window', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.close();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('All windows are closed. Program still running.');
    // app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle('update-search', (event, text) => {
  const i = text.length - 1;
  if(text.length == 0) {
    console.log('No input');
    return [];
  } 
  else if(0 < text.length & text.length <= appRegistry.length) {
    console.log(appRegistry[text.length - 1].name);
    return appRegistry.slice(0, text.length).map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      icon: app.icon
    }));
  } 
  else {
    console.log('No app found at index.');
    return appRegistry.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      icon: app.icon
    }));;
  }
});

ipcMain.handle('get-apps', (event, small=false) => {
  const apps = small ? smallDrawerApps : appRegistry;
  return apps.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      icon: app.icon
    }));
});

ipcMain.handle('app-trigger', (event, id) => {
  const app = appRegistry.find(app => app.id === id);
  if (app) {
    console.log(`Triggering app: ${app.name}`);
    app.call();
  } else {
    console.log(`App with id '${id}' not found`);
  }
});

ipcMain.handle('back-log', (event, content) => {
  console.log(content);
});