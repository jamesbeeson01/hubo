// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

const API = {
  closeWindow: () => ipcRenderer.invoke('close-window'),
  getApps: (small=false) => ipcRenderer.invoke('get-apps', small),
  getDrawerApps: () => ipcRenderer.invoke('get-drawer-apps'),
  appTrigger: (id) => ipcRenderer.invoke('app-trigger', id),
  updateSearch: (text) => ipcRenderer.invoke('update-search', text),
  backLog: (content) => ipcRenderer.invoke('back-log', content)
}

contextBridge.exposeInMainWorld('preload', API);