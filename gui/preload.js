
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getStatus: () => ipcRenderer.invoke('get-status'),
    controlSystem: (action) => ipcRenderer.invoke('system-control', action),
    toggleProcess: (name, shouldStart) => ipcRenderer.invoke('toggle-process', name, shouldStart)
});
