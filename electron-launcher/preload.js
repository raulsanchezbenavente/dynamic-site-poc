const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherApi', {
  quitApp: () => ipcRenderer.invoke('app:quit'),
  listScripts: () => ipcRenderer.invoke('scripts:list'),
  startScript: (scriptName) => ipcRenderer.invoke('scripts:start', scriptName),
  stopScript: (scriptName) => ipcRenderer.invoke('scripts:stop', scriptName),
  exportLogs: (payload) => ipcRenderer.invoke('logs:export', payload),
  openExternal: (url) => ipcRenderer.invoke('external:open', url),
  getPackageSource: () => ipcRenderer.invoke('package-source:get'),
  setPackageSource: (payload) => ipcRenderer.invoke('package-source:set', payload),
  pickCustomPackageJson: () => ipcRenderer.invoke('package-source:pick-custom'),
  listTestModules: () => ipcRenderer.invoke('modules:list'),
  createTerminalSession: (options = null) => ipcRenderer.invoke('terminal:create-session', options),
  listTerminalSessions: () => ipcRenderer.invoke('terminal:list-sessions'),
  closeTerminalSession: (sessionId) => ipcRenderer.invoke('terminal:close-session', sessionId),
  interruptTerminalSession: (sessionId) => ipcRenderer.invoke('terminal:interrupt-session', sessionId),
  renameTerminalSession: (sessionId, name) => ipcRenderer.invoke('terminal:rename-session', { sessionId, name }),
  getTerminalCwd: (sessionId) => ipcRenderer.invoke('terminal:get-cwd', sessionId),
  getTerminalTypes: () => ipcRenderer.invoke('terminal:get-types'),
  completeTerminalInput: (sessionId, input, cursor) =>
    ipcRenderer.invoke('terminal:complete-input', { sessionId, input, cursor }),
  sendTerminalInput: (sessionId, input, options = null) =>
    ipcRenderer.invoke('terminal:send-input', { sessionId, input, options }),
  runTerminalCommand: (sessionId, command, options = null) =>
    ipcRenderer.invoke('terminal:run-command', { sessionId, command, options }),
  onTerminalOutput: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on('terminal:output', listener);
    return () => ipcRenderer.removeListener('terminal:output', listener);
  },
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
