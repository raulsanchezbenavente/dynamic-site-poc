const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');

const runningScripts = new Map();
let isShuttingDown = false;
const terminalSessions = new Map();
let terminalSessionCounter = 0;

const defaultSourceMode = app.isPackaged ? 'prod' : 'dev';
const packageSource = {
  mode: defaultSourceMode,
  customPath: '',
};

function pathHasPackageJson(packageJsonPath) {
  if (!packageJsonPath) {
    return false;
  }

  return fs.existsSync(packageJsonPath);
}

function firstExistingPath(paths, predicate = null) {
  for (const candidatePath of paths) {
    if (pathHasPackageJson(candidatePath) && (!predicate || predicate(candidatePath))) {
      return candidatePath;
    }
  }

  // Fallback to any existing path if the predicate was too strict.
  if (predicate) {
    for (const candidatePath of paths) {
      if (pathHasPackageJson(candidatePath)) {
        return candidatePath;
      }
    }
  }

  return paths[0];
}

function uniqPaths(paths) {
  return Array.from(new Set(paths.filter(Boolean).map((candidate) => path.resolve(candidate))));
}

function findPackageJsonUpward(startDir, maxDepth = 6) {
  let current = path.resolve(startDir);

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const candidate = path.join(current, 'package.json');
    if (pathHasPackageJson(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}

function hasAngularWorkspace(packageJsonPath) {
  if (!pathHasPackageJson(packageJsonPath)) {
    return false;
  }

  const projectRoot = path.dirname(packageJsonPath);
  return fs.existsSync(path.join(projectRoot, 'angular.json'));
}

function isPackagedAppInternalPath(candidatePath) {
  const normalized = String(candidatePath ?? '')
    .replace(/\\/g, '/')
    .toLowerCase();
  return normalized.includes('.app/contents/resources/') || normalized.includes('/app.asar/');
}

function buildModeCandidates() {
  const execDir = path.dirname(process.execPath);
  const resourcesDir = process.resourcesPath;
  const appPath = app.getAppPath();
  const upwardFromExec = findPackageJsonUpward(execDir);

  return {
    dev: uniqPaths([path.resolve(process.cwd(), 'package.json'), path.resolve(__dirname, '..', 'package.json')]),
    prod: uniqPaths([
      // Windows-style location used previously.
      path.resolve(execDir, '..', '..', 'package.json'),
      // macOS .app container parent (e.g. /Applications or custom folder).
      path.resolve(execDir, '..', '..', '..', 'package.json'),
      // Packaged Electron app internals.
      path.join(resourcesDir, 'app.asar', 'package.json'),
      path.join(resourcesDir, 'app', 'package.json'),
      path.join(appPath, 'package.json'),
      // Generic fallback by walking up from the executable directory.
      upwardFromExec,
    ]),
  };
}

function getPackageSourceOptions() {
  const candidates = buildModeCandidates();
  const devPackageJsonPath = firstExistingPath(candidates.dev);
  const prodPackageJsonPath = firstExistingPath(
    candidates.prod,
    (candidatePath) => hasAngularWorkspace(candidatePath) && !isPackagedAppInternalPath(candidatePath)
  );

  return {
    dev: {
      mode: 'dev',
      label: 'Dev (current repository)',
      packageJsonPath: devPackageJsonPath,
      exists: pathHasPackageJson(devPackageJsonPath),
      candidates: candidates.dev,
    },
    prod: {
      mode: 'prod',
      label: 'Prod (project root)',
      packageJsonPath: prodPackageJsonPath,
      exists: pathHasPackageJson(prodPackageJsonPath),
      candidates: candidates.prod,
    },
  };
}

function resolvePackageJsonPath() {
  const options = getPackageSourceOptions();

  if (packageSource.mode === 'dev') {
    return options.dev.packageJsonPath;
  }

  if (packageSource.mode === 'prod') {
    return options.prod.packageJsonPath;
  }

  if (packageSource.mode === 'custom') {
    return packageSource.customPath;
  }

  throw new Error(`Unsupported package.json source mode: ${packageSource.mode}`);
}

function getProjectContext() {
  const packageJsonPath = resolvePackageJsonPath();

  if (!pathHasPackageJson(packageJsonPath)) {
    throw new Error(
      `package.json was not found at: ${packageJsonPath}\nSelect a different path from the launcher's dropdown.`
    );
  }

  return {
    packageJsonPath,
    projectRoot: path.dirname(packageJsonPath),
  };
}

function getDefaultTerminalWorkingDirectory() {
  const { projectRoot } = getProjectContext();
  return projectRoot;
}

function createTerminalSession() {
  terminalSessionCounter += 1;
  const id = `session-${Date.now()}-${terminalSessionCounter}`;
  const session = {
    id,
    name: `Session ${terminalSessionCounter}`,
    cwd: getDefaultTerminalWorkingDirectory(),
    activeProcess: null,
  };

  terminalSessions.set(id, session);
  return session;
}

function getTerminalSession(sessionId) {
  if (sessionId && terminalSessions.has(sessionId)) {
    const existing = terminalSessions.get(sessionId);
    if (existing.cwd && fs.existsSync(existing.cwd)) {
      return existing;
    }

    existing.cwd = getDefaultTerminalWorkingDirectory();
    return existing;
  }

  return null;
}

function listTerminalSessions() {
  return Array.from(terminalSessions.values()).map((session) => ({
    id: session.id,
    name: session.name,
    cwd: session.cwd,
  }));
}

async function closeTerminalSession(sessionId) {
  if (!sessionId || !terminalSessions.has(sessionId)) {
    return false;
  }

  const session = terminalSessions.get(sessionId);
  if (session?.activeProcess) {
    await killProcessTree(session.activeProcess);
    session.activeProcess = null;
  }

  return terminalSessions.delete(sessionId);
}

async function stopAllTerminalSessions() {
  const sessions = Array.from(terminalSessions.values());
  await Promise.all(
    sessions.map(async (session) => {
      if (!session.activeProcess) {
        return;
      }

      await killProcessTree(session.activeProcess);
      session.activeProcess = null;
    })
  );
}

function renameTerminalSession(sessionId, nextName) {
  const session = getTerminalSession(sessionId);
  if (!session) {
    return null;
  }

  const normalized = String(nextName ?? '').trim();
  if (!normalized) {
    return null;
  }

  session.name = normalized;
  return {
    id: session.id,
    name: session.name,
    cwd: session.cwd,
  };
}

function resolveTerminalPath(baseDir, target) {
  if (!target || target === '~') {
    return app.getPath('home');
  }

  const expanded = target.startsWith('~/') ? path.join(app.getPath('home'), target.slice(2)) : target;
  if (path.isAbsolute(expanded)) {
    return path.normalize(expanded);
  }

  return path.resolve(baseDir, expanded);
}

function normalizeTerminalCommand(input) {
  return String(input ?? '').replace(/\r\n/g, '\n').trim();
}

function executeTerminalCommand(sessionId, commandInput) {
  return new Promise((resolve) => {
    const session = getTerminalSession(sessionId);
    if (!session) {
      resolve({ ok: false, output: '', error: 'Terminal session not found\n', exitCode: 1, cwd: '' });
      return;
    }

    if (session.activeProcess) {
      resolve({
        ok: false,
        output: '',
        error: 'Another command is still running in this terminal session\n',
        exitCode: 1,
        cwd: session.cwd,
      });
      return;
    }

    const command = normalizeTerminalCommand(commandInput);
    if (!command) {
      resolve({ ok: true, output: '', error: '', exitCode: 0, cwd: session.cwd });
      return;
    }

    const cwd = session.cwd;
    const cdMatch = command.match(/^cd(?:\s+(.*))?$/i);
    if (cdMatch) {
      const rawTarget = (cdMatch[1] ?? '').trim();
      const nextDir = resolveTerminalPath(cwd, rawTarget || '~');

      if (!fs.existsSync(nextDir)) {
        resolve({
          ok: false,
          output: '',
          error: `cd: no such file or directory: ${rawTarget || '~'}\n`,
          exitCode: 1,
          cwd,
        });
        return;
      }

      const stats = fs.statSync(nextDir);
      if (!stats.isDirectory()) {
        resolve({
          ok: false,
          output: '',
          error: `cd: not a directory: ${rawTarget || '~'}\n`,
          exitCode: 1,
          cwd,
        });
        return;
      }

      session.cwd = nextDir;
      resolve({ ok: true, output: '', error: '', exitCode: 0, cwd: session.cwd });
      return;
    }

    const env = buildSpawnEnv();
    const options = {
      cwd,
      env,
      windowsHide: true,
      shell: true,
    };

    const child = spawn(command, [], options);
    session.activeProcess = child;
    let output = '';
    let error = '';
    let settled = false;

    const finalize = (payload) => {
      if (settled) {
        return;
      }

      settled = true;
      if (session.activeProcess === child) {
        session.activeProcess = null;
      }
      resolve(payload);
    };

    child.stdout.on('data', (chunk) => {
      const message = sanitizeLogMessage(chunk);
      output += message;
      broadcast('terminal:output', {
        sessionId: session.id,
        stream: 'stdout',
        message,
      });
    });

    child.stderr.on('data', (chunk) => {
      const message = sanitizeLogMessage(chunk);
      error += message;
      broadcast('terminal:output', {
        sessionId: session.id,
        stream: 'stderr',
        message,
      });
    });

    child.on('error', (spawnError) => {
      finalize({
        ok: false,
        output: '',
        error: `${spawnError.message}\n`,
        exitCode: 1,
        cwd,
        streamed: true,
      });
    });

    child.on('close', (code) => {
      finalize({
        ok: code === 0,
        output: '',
        error: '',
        exitCode: Number.isInteger(code) ? code : 1,
        cwd,
        streamed: true,
      });
    });
  });
}

function getPackageSourceStatus() {
  const options = getPackageSourceOptions();
  const selectedPath = resolvePackageJsonPath();

  return {
    mode: packageSource.mode,
    customPath: packageSource.customPath,
    selectedPath,
    exists: pathHasPackageJson(selectedPath),
    options,
  };
}

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'avianca-icon.png');

  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

function readScripts() {
  const { packageJsonPath } = getProjectContext();
  const raw = fs.readFileSync(packageJsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const scripts = parsed?.scripts ?? {};

  return Object.entries(scripts).map(([name, command]) => ({
    name,
    command,
    running: runningScripts.has(name),
  }));
}

function broadcast(channel, payload) {
  const windows = BrowserWindow.getAllWindows();
  for (const win of windows) {
    win.webContents.send(channel, payload);
  }
}

function stripAnsiEscapeCodes(value) {
  return String(value).replace(/[\u001b\u009b][[\]()#;?]*(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~])/g, '');
}

function sanitizeLogMessage(value) {
  const message = String(value);
  if (process.platform !== 'win32') {
    return message;
  }

  return stripAnsiEscapeCodes(message);
}

function buildSpawnEnv() {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value == null) {
      continue;
    }
    env[key] = String(value);
  }

  if (process.platform === 'win32') {
    // Keep Windows PATH semantics (semicolon + case-insensitive variable name).
    const pathKey = Object.keys(env).find((key) => key.toLowerCase() === 'path') || 'Path';
    const currentPathEntries = String(env[pathKey] ?? env.PATH ?? '')
      .split(';')
      .filter(Boolean);
    const fallbackPathEntries = ['C:\\Windows\\System32', 'C:\\Windows', 'C:\\Windows\\System32\\Wbem'];
    const mergedPath = Array.from(new Set([...currentPathEntries, ...fallbackPathEntries]));
    env[pathKey] = mergedPath.join(';');
    if (pathKey !== 'PATH') {
      env.PATH = env[pathKey];
    }
    return env;
  }

  // GUI apps on macOS often start with a reduced PATH and cannot find npm.
  const fallbackPathEntries = ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
  const currentPathEntries = String(env.PATH ?? '')
    .split(':')
    .filter(Boolean);
  const mergedPath = Array.from(new Set([...currentPathEntries, ...fallbackPathEntries]));
  env.PATH = mergedPath.join(':');

  return env;
}

function escapeShellArg(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function spawnScriptProcess(scriptName) {
  const { projectRoot } = getProjectContext();
  const env = buildSpawnEnv();

  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', `npm run ${scriptName}`], {
      cwd: projectRoot,
      env,
      windowsHide: true,
    });
  }

  const shellBinary = process.env.SHELL || '/bin/zsh';
  const command = `npm run ${escapeShellArg(scriptName)}`;

  return spawn(shellBinary, ['-l', '-c', command], {
    cwd: projectRoot,
    env,
    windowsHide: true,
  });
}

function killProcessTree(child) {
  return new Promise((resolve) => {
    if (!child || child.killed || child.exitCode != null) {
      resolve();
      return;
    }

    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
      killer.on('error', () => {
        try {
          child.kill('SIGTERM');
        } catch {
          // Ignore if process already exited.
        }
      });
      killer.on('close', () => {
        resolve();
      });
      return;
    }

    let killTimeout = null;

    const cleanup = () => {
      if (killTimeout) {
        clearTimeout(killTimeout);
      }
      resolve();
    };

    // Wait for the process to actually exit.
    child.once('exit', cleanup);
    child.once('close', cleanup);

    // Send SIGTERM first.
    try {
      child.kill('SIGTERM');
    } catch {
      // Ignore if process already exited.
    }

    // If process doesn't die in 5 seconds, force kill it.
    killTimeout = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {
        // Ignore if process already exited.
      }
    }, 5000);
  });
}

async function stopAllRunningScripts() {
  const children = Array.from(runningScripts.values());
  await Promise.all(children.map((child) => killProcessTree(child)));
  runningScripts.clear();
}

ipcMain.handle('scripts:list', async () => {
  try {
    return readScripts();
  } catch (error) {
    broadcast('scripts:log', {
      script: 'launcher',
      stream: 'stderr',
      message: `${error.message}\n`,
    });
    return [];
  }
});

ipcMain.handle('package-source:get', async () => {
  return getPackageSourceStatus();
});

ipcMain.handle('package-source:pick-custom', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select package.json',
    filters: [{ name: 'package.json', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (result.canceled || !result.filePaths?.[0]) {
    return null;
  }

  const selectedFile = result.filePaths[0];
  if (path.basename(selectedFile).toLowerCase() !== 'package.json') {
    throw new Error('You must select a package.json file');
  }

  return selectedFile;
});

ipcMain.handle('package-source:set', async (_event, payload) => {
  const mode = payload?.mode;
  const customPath = payload?.customPath;

  if (!['dev', 'prod', 'custom'].includes(mode)) {
    throw new Error(`Invalid mode: ${mode}`);
  }

  packageSource.mode = mode;

  if (mode === 'custom') {
    if (!customPath) {
      throw new Error('Missing custom path for package.json');
    }

    const resolvedCustomPath = path.resolve(customPath);
    if (path.basename(resolvedCustomPath).toLowerCase() !== 'package.json') {
      throw new Error('La ruta custom debe apuntar a package.json');
    }

    packageSource.customPath = resolvedCustomPath;
  }

  return getPackageSourceStatus();
});

ipcMain.handle('scripts:start', async (_event, scriptName) => {
  if (runningScripts.has(scriptName)) {
    return { ok: false, error: `Script ${scriptName} is already running.` };
  }

  const child = spawnScriptProcess(scriptName);

  runningScripts.set(scriptName, child);
  broadcast('scripts:status', { script: scriptName, running: true });

  child.stdout.on('data', (chunk) => {
    broadcast('scripts:log', { script: scriptName, stream: 'stdout', message: sanitizeLogMessage(chunk) });
  });

  child.stderr.on('data', (chunk) => {
    broadcast('scripts:log', { script: scriptName, stream: 'stderr', message: sanitizeLogMessage(chunk) });
  });

  child.on('error', (error) => {
    broadcast('scripts:log', { script: scriptName, stream: 'stderr', message: `${error.message}\n` });
  });

  child.on('close', (code) => {
    runningScripts.delete(scriptName);
    broadcast('scripts:status', { script: scriptName, running: false });
    broadcast('scripts:log', {
      script: scriptName,
      stream: code === 0 ? 'stdout' : 'stderr',
      message: `\nProcess finished (${scriptName}) with exit code ${code}\n`,
    });
  });

  return { ok: true };
});

ipcMain.handle('scripts:stop', async (_event, scriptName) => {
  const child = runningScripts.get(scriptName);
  if (!child) {
    return { ok: false, error: `Script ${scriptName} is not running.` };
  }

  await killProcessTree(child);
  return { ok: true };
});

ipcMain.handle('app:quit', async () => {
  app.quit();
  return { ok: true };
});

ipcMain.handle('external:open', async (_event, url) => {
  let parsed;

  try {
    parsed = new URL(String(url));
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, error: 'Unsupported URL protocol' };
  }

  try {
    await shell.openExternal(parsed.toString());
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || 'Failed to open URL' };
  }
});

ipcMain.handle('terminal:create-session', async () => {
  const session = createTerminalSession();
  return { id: session.id, name: session.name, cwd: session.cwd };
});

ipcMain.handle('terminal:list-sessions', async () => {
  return listTerminalSessions();
});

ipcMain.handle('terminal:close-session', async (_event, sessionId) => {
  const closed = await closeTerminalSession(sessionId);
  return { ok: closed };
});

ipcMain.handle('terminal:rename-session', async (_event, payload) => {
  const sessionId = payload?.sessionId;
  const nextName = payload?.name;
  const session = renameTerminalSession(sessionId, nextName);

  if (!session) {
    return { ok: false };
  }

  return { ok: true, session };
});

ipcMain.handle('terminal:get-cwd', async (_event, sessionId) => {
  const session = getTerminalSession(sessionId);
  if (!session) {
    return { cwd: getDefaultTerminalWorkingDirectory() };
  }

  return { cwd: session.cwd, id: session.id, name: session.name };
});

ipcMain.handle('terminal:run-command', async (_event, payload) => {
  const sessionId = payload?.sessionId;
  const commandInput = payload?.command ?? '';
  return executeTerminalCommand(sessionId, commandInput);
});

app.on('before-quit', (event) => {
  // Allow normal quit when there is nothing to clean up.
  if (isShuttingDown || runningScripts.size === 0) {
    return;
  }

  event.preventDefault();
  isShuttingDown = true;

  stopAllRunningScripts()
    .then(() => stopAllTerminalSessions())
    .catch(() => {
      // Ignore shutdown cleanup errors.
    })
    .finally(() => {
      app.quit();
    });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // This launcher should fully close when the last window is closed, including macOS.
  app.quit();
});
