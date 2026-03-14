const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherApi', {
  quitApp: () => ipcRenderer.invoke('app:quit'),
  listScripts: () => ipcRenderer.invoke('scripts:list'),
  startScript: (scriptName) => ipcRenderer.invoke('scripts:start', scriptName),
  stopScript: (scriptName) => ipcRenderer.invoke('scripts:stop', scriptName),
  openExternal: (url) => ipcRenderer.invoke('external:open', url),
  getPackageSource: () => ipcRenderer.invoke('package-source:get'),
  setPackageSource: (payload) => ipcRenderer.invoke('package-source:set', payload),
  pickCustomPackageJson: () => ipcRenderer.invoke('package-source:pick-custom'),
  createTerminalSession: () => ipcRenderer.invoke('terminal:create-session'),
  listTerminalSessions: () => ipcRenderer.invoke('terminal:list-sessions'),
  closeTerminalSession: (sessionId) => ipcRenderer.invoke('terminal:close-session', sessionId),
  getTerminalCwd: (sessionId) => ipcRenderer.invoke('terminal:get-cwd', sessionId),
  runTerminalCommand: (sessionId, command) => ipcRenderer.invoke('terminal:run-command', { sessionId, command }),
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
