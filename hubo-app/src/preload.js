// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

const API = {
  closeWindow: () => ipcRenderer.invoke('close-window'),
  updateSearch: (text) => ipcRenderer.invoke('update-search', text)
}

contextBridge.exposeInMainWorld('preload', API);