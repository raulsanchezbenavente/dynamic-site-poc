const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('testByModuleApi', {
  listModules: () => ipcRenderer.invoke('modules:list'),
  runTests: (payload) => ipcRenderer.invoke('tests:run', payload),
  closeApp: () => ipcRenderer.invoke('app:close'),
});
