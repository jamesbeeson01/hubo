const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('breakOverlay', {
  done: () => ipcRenderer.send('break:done'),
  quit: () => ipcRenderer.send('break:quit'),
});
