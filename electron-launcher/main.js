const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');

const runningScripts = new Map();
let isShuttingDown = false;
const terminalSessions = new Map();
let terminalSessionCounter = 0;
const windowsCommandExistsCache = new Map();
let cachedGitBashExecutablePath;
let cachedWindowsTerminalTypes = null;
const DEFAULT_WINDOW_STATE = {
  width: 1180,
  height: 760,
  minWidth: 960,
  minHeight: 640,
};

const defaultSourceMode = app.isPackaged ? 'prod' : 'dev';
const packageSource = {
  mode: defaultSourceMode,
  customPath: '',
};

function getLauncherIconPath() {
  const platformIconName = process.platform === 'darwin' ? 'avianca-icon.icns' : 'avianca-icon.png';
  const platformIconPath = path.join(__dirname, 'assets', platformIconName);
  if (fs.existsSync(platformIconPath)) {
    return platformIconPath;
  }

  const fallbackIconPath = path.join(__dirname, 'assets', 'avianca-icon.png');
  return fs.existsSync(fallbackIconPath) ? fallbackIconPath : null;
}

function applyAppIcon() {
  if (!(process.platform === 'darwin' && app.dock && typeof app.dock.setIcon === 'function')) {
    return;
  }

  const iconCandidates = [
    path.join(__dirname, 'assets', 'avianca-icon.icns'),
    path.join(__dirname, 'assets', 'avianca-icon.png'),
  ].filter((candidatePath) => fs.existsSync(candidatePath));

  for (const iconPath of iconCandidates) {
    try {
      app.dock.setIcon(iconPath);
      return;
    } catch {
      // Try the next available icon candidate.
    }
  }
}

function getWindowStatePath() {
  return path.join(app.getPath('userData'), 'launcher-window-state.json');
}

function readWindowState() {
  try {
    const raw = fs.readFileSync(getWindowStatePath(), 'utf8');
    const parsed = JSON.parse(raw);

    return {
      width: Number(parsed?.width) || DEFAULT_WINDOW_STATE.width,
      height: Number(parsed?.height) || DEFAULT_WINDOW_STATE.height,
      minWidth: DEFAULT_WINDOW_STATE.minWidth,
      minHeight: DEFAULT_WINDOW_STATE.minHeight,
      x: Number.isFinite(parsed?.x) ? Number(parsed.x) : undefined,
      y: Number.isFinite(parsed?.y) ? Number(parsed.y) : undefined,
      isMaximized: Boolean(parsed?.isMaximized),
    };
  } catch {
    return { ...DEFAULT_WINDOW_STATE, isMaximized: false };
  }
}

function writeWindowState(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  const bounds = win.isMaximized() ? win.getNormalBounds() : win.getBounds();
  const nextState = {
    width: Math.max(Math.round(bounds.width || DEFAULT_WINDOW_STATE.width), DEFAULT_WINDOW_STATE.minWidth),
    height: Math.max(Math.round(bounds.height || DEFAULT_WINDOW_STATE.height), DEFAULT_WINDOW_STATE.minHeight),
    x: Number.isFinite(bounds.x) ? Math.round(bounds.x) : undefined,
    y: Number.isFinite(bounds.y) ? Math.round(bounds.y) : undefined,
    isMaximized: win.isMaximized(),
  };

  try {
    fs.mkdirSync(path.dirname(getWindowStatePath()), { recursive: true });
    fs.writeFileSync(getWindowStatePath(), `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');
  } catch {
    // Ignore window-state persistence failures.
  }
}

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

function createTerminalSession(options = null) {
  terminalSessionCounter += 1;
  const requestedTerminalType = String(options?.terminalType || '').trim().toLowerCase();
  const availableTypes = getWindowsTerminalTypes();
  const availableIds = new Set(availableTypes.map((entry) => entry.id));
  const defaultTerminalType = getSystemDefaultWindowsTerminalType(availableTypes) || 'cmd';
  const terminalType = availableIds.has(requestedTerminalType) ? requestedTerminalType : defaultTerminalType;
  const id = `session-${Date.now()}-${terminalSessionCounter}`;
  const session = {
    id,
    name: `Session ${terminalSessionCounter}`,
    cwd: getDefaultTerminalWorkingDirectory(),
    terminalType,
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
    terminalType: session.terminalType,
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

async function interruptTerminalSession(sessionId) {
  const session = getTerminalSession(sessionId);
  if (!session?.activeProcess) {
    return false;
  }

  await killProcessTree(session.activeProcess);
  return true;
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

function normalizeCommandForTerminalPresentation(command) {
  if (!command || process.platform === 'win32') {
    return command;
  }

  // Keep complex shell expressions untouched.
  if (!/^[\w./~\-\s]+$/.test(command)) {
    return command;
  }

  const tokens = command.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return command;
  }

  let lsTokenIndex = 0;
  if (tokens[0] === 'sudo') {
    lsTokenIndex = 1;
    while (lsTokenIndex < tokens.length && /^-/.test(tokens[lsTokenIndex])) {
      lsTokenIndex += 1;
    }
  }

  if (lsTokenIndex >= tokens.length || tokens[lsTokenIndex] !== 'ls') {
    return command;
  }

  const lsArguments = tokens.slice(lsTokenIndex + 1);
  const hasExplicitFormat = lsArguments.some(
    (token) => token === '-1' || /^--format(=|$)/.test(token) || /^-[^-]*[Cxm][^-]*$/.test(token)
  );

  if (hasExplicitFormat) {
    return command;
  }

  return [...tokens.slice(0, lsTokenIndex + 1), '-C', ...lsArguments].join(' ');
}

function normalizeCommandForSudoStdin(command) {
  if (!command || process.platform === 'win32') {
    return command;
  }

  const trimmed = String(command).trim();
  if (!/^sudo(?:\s|$)/i.test(trimmed)) {
    return command;
  }

  // If caller already requested stdin mode, keep the command untouched.
  if (/(?:^|\s)(?:-S|--stdin)(?:\s|$)/.test(trimmed)) {
    return command;
  }

  return trimmed.replace(/^sudo(?:\s+|$)/i, 'sudo -S ');
}

function getTerminalCompletionContext(input, cursor) {
  const value = String(input ?? '');
  const safeCursor = Math.max(0, Math.min(Number.isInteger(cursor) ? cursor : value.length, value.length));
  const left = value.slice(0, safeCursor);

  let start = left.length;
  while (start > 0 && !/\s/.test(left[start - 1])) {
    start -= 1;
  }

  const token = value.slice(start, safeCursor);
  const commandName = left
    .slice(0, start)
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0];

  return {
    start,
    end: safeCursor,
    token,
    directoryOnly: commandName === 'cd',
  };
}

function getLongestCommonPrefix(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return '';
  }

  let prefix = String(values[0] ?? '');
  for (let index = 1; index < values.length && prefix.length > 0; index += 1) {
    const candidate = String(values[index] ?? '');
    while (prefix.length > 0 && !candidate.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }

  return prefix;
}

function resolveCompletionDirectory(cwd, token) {
  const homeDir = app.getPath('home');
  const hasTrailingSlash = token.endsWith('/');

  let pathPart = token;
  if (!hasTrailingSlash) {
    pathPart = path.dirname(token);
  }

  const baseName = hasTrailingSlash ? '' : path.basename(token);

  if (!token) {
    return {
      directoryPath: cwd,
      prefix: '',
      baseName: '',
    };
  }

  if (token.startsWith('/')) {
    const normalizedDir = pathPart === '.' ? '/' : path.normalize(pathPart);
    const prefix = normalizedDir === '/' ? '/' : `${normalizedDir.replace(/\\/g, '/')}/`;
    return {
      directoryPath: normalizedDir,
      prefix,
      baseName,
    };
  }

  if (token.startsWith('~')) {
    const normalizedDir = pathPart === '.' ? '~' : pathPart;
    const suffix = normalizedDir === '~' ? '' : normalizedDir.slice(2);
    const directoryPath = suffix ? path.join(homeDir, suffix) : homeDir;
    const prefix = normalizedDir === '~' ? '~/' : `${normalizedDir}/`;
    return {
      directoryPath,
      prefix,
      baseName,
    };
  }

  const normalizedDir = pathPart === '.' ? '' : pathPart;
  return {
    directoryPath: path.resolve(cwd, normalizedDir || '.'),
    prefix: normalizedDir ? `${normalizedDir.replace(/\\/g, '/')}/` : '',
    baseName,
  };
}

function completeTerminalInput(sessionId, input, cursor) {
  const session = getTerminalSession(sessionId);
  if (!session) {
    return {
      ok: false,
      error: 'Terminal session not found',
      start: 0,
      end: 0,
      token: '',
      completion: '',
      suggestions: [],
    };
  }

  const context = getTerminalCompletionContext(input, cursor);
  if (/['"`]/.test(context.token)) {
    return {
      ok: true,
      ...context,
      completion: context.token,
      suggestions: [],
    };
  }

  const resolved = resolveCompletionDirectory(session.cwd, context.token);
  if (!fs.existsSync(resolved.directoryPath)) {
    return {
      ok: true,
      ...context,
      completion: context.token,
      suggestions: [],
    };
  }

  let entries = [];
  try {
    entries = fs.readdirSync(resolved.directoryPath, { withFileTypes: true });
  } catch {
    return {
      ok: true,
      ...context,
      completion: context.token,
      suggestions: [],
    };
  }

  const showHidden = resolved.baseName.startsWith('.');
  const normalizedBaseName = resolved.baseName.toLowerCase();
  const suggestions = entries
    .filter((entry) => {
      if (!showHidden && entry.name.startsWith('.')) {
        return false;
      }

      if (!entry.name.toLowerCase().startsWith(normalizedBaseName)) {
        return false;
      }

      if (context.directoryOnly) {
        if (entry.isDirectory()) {
          return true;
        }

        if (entry.isSymbolicLink()) {
          try {
            const stats = fs.statSync(path.join(resolved.directoryPath, entry.name));
            return stats.isDirectory();
          } catch {
            return false;
          }
        }

        return false;
      }

      return true;
    })
    .map((entry) => {
      const suffix = entry.isDirectory() ? '/' : '';
      const replacement = `${resolved.prefix}${entry.name}${suffix}`;
      return {
        display: `${entry.name}${suffix}`,
        replacement,
      };
    })
    .sort((left, right) => left.display.localeCompare(right.display));

  const completion = getLongestCommonPrefix(suggestions.map((entry) => entry.replacement)) || context.token;

  return {
    ok: true,
    ...context,
    completion,
    suggestions,
  };
}

function commandExistsOnWindows(commandName) {
  if (process.platform !== 'win32') {
    return false;
  }

  const normalizedName = String(commandName || '').trim().toLowerCase();
  if (!normalizedName) {
    return false;
  }

  if (windowsCommandExistsCache.has(normalizedName)) {
    return windowsCommandExistsCache.get(normalizedName);
  }

  try {
    const result = spawnSync('where', [normalizedName], {
      windowsHide: true,
      stdio: 'ignore',
      shell: false,
    });
    const exists = !result.error && result.status === 0;
    windowsCommandExistsCache.set(normalizedName, exists);
    return exists;
  } catch {
    windowsCommandExistsCache.set(normalizedName, false);
    return false;
  }
}

function resolveGitBashExecutablePath() {
  if (cachedGitBashExecutablePath !== undefined) {
    return cachedGitBashExecutablePath;
  }

  const knownCandidates = [
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
  ];

  for (const candidatePath of knownCandidates) {
    if (fs.existsSync(candidatePath)) {
      cachedGitBashExecutablePath = candidatePath;
      return cachedGitBashExecutablePath;
    }
  }

  if (commandExistsOnWindows('bash.exe')) {
    cachedGitBashExecutablePath = 'bash.exe';
    return cachedGitBashExecutablePath;
  }

  cachedGitBashExecutablePath = null;
  return cachedGitBashExecutablePath;
}

function getWindowsTerminalTypes() {
  if (process.platform !== 'win32') {
    return [];
  }

  if (Array.isArray(cachedWindowsTerminalTypes)) {
    return [...cachedWindowsTerminalTypes];
  }

  const options = [{ id: 'cmd', label: 'Command Prompt (cmd)' }];

  if (commandExistsOnWindows('powershell.exe')) {
    options.push({ id: 'powershell', label: 'Windows PowerShell' });
  }

  if (commandExistsOnWindows('pwsh.exe')) {
    options.push({ id: 'pwsh', label: 'PowerShell 7 (pwsh)' });
  }

  if (resolveGitBashExecutablePath()) {
    options.push({ id: 'git-bash', label: 'Git Bash' });
  }

  cachedWindowsTerminalTypes = options;
  return [...cachedWindowsTerminalTypes];
}

function getSystemDefaultWindowsTerminalType(availableOptions) {
  if (process.platform !== 'win32') {
    return '';
  }

  const availableIds = new Set((availableOptions || []).map((option) => option.id));
  const comSpec = String(process.env.ComSpec || process.env.COMSPEC || '').toLowerCase();

  if (availableIds.has('pwsh') && /pwsh(\.exe)?$/.test(comSpec)) {
    return 'pwsh';
  }

  if (availableIds.has('powershell') && /powershell(\.exe)?$/.test(comSpec)) {
    return 'powershell';
  }

  if (availableIds.has('cmd')) {
    return 'cmd';
  }

  return availableOptions?.[0]?.id || '';
}

function resolveWindowsTerminalSpawn(terminalType, commandToRun, cwd, env) {
  const type = String(terminalType || 'cmd').trim().toLowerCase();

  if (type === 'powershell' && commandExistsOnWindows('powershell.exe')) {
    return {
      command: 'powershell.exe',
      args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', commandToRun],
      options: { cwd, env, windowsHide: true, shell: false },
    };
  }

  if (type === 'pwsh' && commandExistsOnWindows('pwsh.exe')) {
    return {
      command: 'pwsh.exe',
      args: ['-NoProfile', '-Command', commandToRun],
      options: { cwd, env, windowsHide: true, shell: false },
    };
  }

  if (type === 'git-bash') {
    const bashPath = resolveGitBashExecutablePath();
    if (bashPath) {
      return {
        command: bashPath,
        args: ['--noprofile', '--norc', '-lc', commandToRun],
        options: { cwd, env, windowsHide: true, shell: false },
      };
    }
  }

  return {
    command: 'cmd.exe',
    args: ['/d', '/s', '/c', commandToRun],
    options: { cwd, env, windowsHide: true, shell: false },
  };
}

function getEffectiveWindowsSessionTerminalType(session, requestedTerminalType = '') {
  const availableTypes = getWindowsTerminalTypes();
  const availableIds = new Set(availableTypes.map((entry) => entry.id));
  const requestedType = String(requestedTerminalType || '').trim().toLowerCase();
  const sessionType = String(session?.terminalType || '').trim().toLowerCase();
  const defaultType = getSystemDefaultWindowsTerminalType(availableTypes) || 'cmd';

  if (availableIds.has(requestedType)) {
    return requestedType;
  }

  if (availableIds.has(sessionType)) {
    return sessionType;
  }

  return defaultType;
}

function executeTerminalCommand(sessionId, commandInput, executionOptions = null) {
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

    const commandToRun = normalizeCommandForSudoStdin(normalizeCommandForTerminalPresentation(command));

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
    const requestedTerminalType = String(executionOptions?.terminalType || '');

    let child = null;
    if (process.platform === 'win32') {
      const effectiveTerminalType = getEffectiveWindowsSessionTerminalType(session, requestedTerminalType);
      session.terminalType = effectiveTerminalType;
      const spawnConfig = resolveWindowsTerminalSpawn(effectiveTerminalType, commandToRun, cwd, env);
      child = spawn(spawnConfig.command, spawnConfig.args, spawnConfig.options);
    } else {
      child = spawn(commandToRun, [], {
        cwd,
        env,
        windowsHide: true,
        shell: true,
      });
    }

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

function sendTerminalInput(sessionId, input, options = null) {
  return new Promise((resolve) => {
    const session = getTerminalSession(sessionId);
    if (!session) {
      resolve({ ok: false, error: 'Terminal session not found\n' });
      return;
    }

    const child = session.activeProcess;
    if (!child || !child.stdin || child.stdin.destroyed || !child.stdin.writable) {
      resolve({ ok: false, error: 'No active command is waiting for input\n' });
      return;
    }

    const appendNewline = options?.appendNewline !== false;
    const normalizedInput = String(input ?? '').replace(/\r/g, '').replace(/\n/g, '');
    const payload = appendNewline ? `${normalizedInput}\n` : normalizedInput;

    try {
      child.stdin.write(payload, 'utf8', (error) => {
        if (error) {
          resolve({ ok: false, error: `${error.message}\n` });
          return;
        }

        resolve({ ok: true });
      });
    } catch (error) {
      resolve({ ok: false, error: `${error?.message || 'Failed to write to stdin'}\n` });
    }
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
  const iconPath = getLauncherIconPath();
  const windowState = readWindowState();
  let persistWindowStateTimeout = null;

  const scheduleWindowStatePersist = () => {
    if (persistWindowStateTimeout) {
      clearTimeout(persistWindowStateTimeout);
    }

    persistWindowStateTimeout = setTimeout(() => {
      persistWindowStateTimeout = null;
      writeWindowState(win);
    }, 150);
  };

  const win = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: windowState.minWidth,
    minHeight: windowState.minHeight,
    x: windowState.x,
    y: windowState.y,
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.on('close', () => {
    writeWindowState(win);
  });

  win.on('resized', () => {
    scheduleWindowStatePersist();
  });

  win.on('moved', () => {
    scheduleWindowStatePersist();
  });

  win.on('maximize', () => {
    writeWindowState(win);
  });

  win.on('unmaximize', () => {
    writeWindowState(win);
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  if (windowState.isMaximized) {
    win.once('ready-to-show', () => {
      if (!win.isDestroyed()) {
        win.maximize();
      }
    });
  }
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

function sanitizeLogMessage(value) {
  return String(value);
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

ipcMain.handle('terminal:create-session', async (_event, options) => {
  const session = createTerminalSession(options);
  return { id: session.id, name: session.name, cwd: session.cwd, terminalType: session.terminalType };
});

ipcMain.handle('terminal:list-sessions', async () => {
  return listTerminalSessions();
});

ipcMain.handle('terminal:close-session', async (_event, sessionId) => {
  const closed = await closeTerminalSession(sessionId);
  return { ok: closed };
});

ipcMain.handle('terminal:interrupt-session', async (_event, sessionId) => {
  const interrupted = await interruptTerminalSession(sessionId);
  return { ok: interrupted };
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

ipcMain.handle('terminal:complete-input', async (_event, payload) => {
  return completeTerminalInput(payload?.sessionId, payload?.input ?? '', payload?.cursor);
});

ipcMain.handle('terminal:send-input', async (_event, payload) => {
  const sessionId = payload?.sessionId;
  const input = payload?.input ?? '';
  const options = payload?.options ?? null;
  return sendTerminalInput(sessionId, input, options);
});

ipcMain.handle('terminal:get-types', async () => {
  const options = getWindowsTerminalTypes();
  return {
    supported: process.platform === 'win32',
    options,
    defaultType: getSystemDefaultWindowsTerminalType(options),
  };
});

ipcMain.handle('terminal:run-command', async (_event, payload) => {
  const sessionId = payload?.sessionId;
  const commandInput = payload?.command ?? '';
  const executionOptions = payload?.options ?? null;
  return executeTerminalCommand(sessionId, commandInput, executionOptions);
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
  applyAppIcon();
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
