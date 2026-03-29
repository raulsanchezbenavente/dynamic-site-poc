const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('testByModuleApi', {
  listModules: () => ipcRenderer.invoke('modules:list'),
  getPrefs: () => ipcRenderer.invoke('prefs:get'),
  setPrefs: (payload) => ipcRenderer.invoke('prefs:set', payload),
  runTests: (payload) => ipcRenderer.invoke('tests:run', payload),
  closeApp: () => ipcRenderer.invoke('app:close'),
});
