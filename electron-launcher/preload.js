const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherApi', {
  listScripts: () => ipcRenderer.invoke('scripts:list'),
  startScript: (scriptName) => ipcRenderer.invoke('scripts:start', scriptName),
  stopScript: (scriptName) => ipcRenderer.invoke('scripts:stop', scriptName),
  getPackageSource: () => ipcRenderer.invoke('package-source:get'),
  setPackageSource: (payload) => ipcRenderer.invoke('package-source:set', payload),
  pickCustomPackageJson: () => ipcRenderer.invoke('package-source:pick-custom'),
  onScriptLog: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on('scripts:log', listener);
    return () => ipcRenderer.removeListener('scripts:log', listener);
  },
  onScriptStatus: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on('scripts:status', listener);
    return () => ipcRenderer.removeListener('scripts:status', listener);
  },
});
