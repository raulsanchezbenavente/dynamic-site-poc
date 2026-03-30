const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('storybookByModuleApi', {
  listModules: () => ipcRenderer.invoke('modules:list'),
  getPrefs: () => ipcRenderer.invoke('prefs:get'),
  setPrefs: (payload) => ipcRenderer.invoke('prefs:set', payload),
  runStorybook: (payload) => ipcRenderer.invoke('storybook:run', payload),
  closeApp: () => ipcRenderer.invoke('app:close'),
});
