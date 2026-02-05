
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getStatus: () => ipcRenderer.invoke('get-status'),
    getScripts: () => ipcRenderer.invoke('get-scripts'),
    runScript: (path) => ipcRenderer.invoke('run-script', path),
    controlSystem: (action) => ipcRenderer.invoke('system-control', action),
    toggleProcess: (name, shouldStart) => ipcRenderer.invoke('toggle-process', name, shouldStart),
    updatePref: (name, type, value) => ipcRenderer.invoke('update-pref', name, type, value)
});
