const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { app, BrowserWindow, ipcMain, nativeImage, screen } = require('electron');
const { buildSharedModalIconConfig, createIconManager } = require('../shared/icon-manager');

const projectRoot = path.resolve(__dirname, '..', '..');
const modulesRoot = path.join(projectRoot, 'src', 'app', 'modules');
const prefsFileName = 'test-by-module-prefs.json';

if (process.platform === 'win32') {
  const isolatedUserDataPath = path.join(app.getPath('appData'), 'dynamic-site-test-by-module');
  app.setPath('userData', isolatedUserDataPath);
}

let mainWindow = null;
let activeChild = null;
const sharedModalIconConfig = buildSharedModalIconConfig({ launcherDir: __dirname });

const { getIconPath: getTestByModuleIconPath, applyAppIcon } = createIconManager({
  app,
  nativeImage,
  candidates: sharedModalIconConfig.candidates,
  dockCandidates: sharedModalIconConfig.dockCandidates,
});

function getPrefsFilePath() {
  return path.join(app.getPath('userData'), prefsFileName);
}

function normalizePrefs(raw) {
  return {
    moduleName: String(raw?.moduleName || '').trim(),
    watch: Boolean(raw?.watch),
    coverage: Boolean(raw?.coverage),
  };
}

function readPrefsFromDisk() {
  try {
    const filePath = getPrefsFilePath();
    if (!fs.existsSync(filePath)) {
      return normalizePrefs({});
    }

    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return normalizePrefs(parsed);
  } catch {
    return normalizePrefs({});
  }
}

function writePrefsToDisk(rawPrefs) {
  const prefs = normalizePrefs(rawPrefs);

  try {
    const filePath = getPrefsFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(prefs, null, 2)}\n`, 'utf8');
    return { ok: true, prefs };
  } catch (error) {
    return { ok: false, prefs, error: error?.message || 'Could not persist preferences' };
  }
}

function moduleHasSpecFiles(moduleDir) {
  const pending = [moduleDir];

  while (pending.length > 0) {
    const currentDir = pending.pop();
    let entries = [];

    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        pending.push(absolutePath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
        return true;
      }
    }
  }

  return false;
}

function listModules() {
  if (!fs.existsSync(modulesRoot)) {
    return [];
  }

  return fs
    .readdirSync(modulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => {
      const name = entry.name;
      const hasSpecs = moduleHasSpecFiles(path.join(modulesRoot, name));
      return { name, hasSpecs };
    })
    .sort((a, b) => {
      if (a.hasSpecs !== b.hasSpecs) {
        return a.hasSpecs ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });
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
  }

  return env;
}

function getWindowPlacement(width, height) {
  if (process.platform !== 'win32') {
    return null;
  }

  const centerX = Number.parseInt(String(process.env.DYNAMIC_SITE_LAUNCHER_CENTER_X || ''), 10);
  const centerY = Number.parseInt(String(process.env.DYNAMIC_SITE_LAUNCHER_CENTER_Y || ''), 10);
  const hasLauncherPoint = Number.isFinite(centerX) && Number.isFinite(centerY);
  const referencePoint = hasLauncherPoint ? { x: centerX, y: centerY } : screen.getCursorScreenPoint();
  const targetDisplay = screen.getDisplayNearestPoint(referencePoint);
  const area = targetDisplay?.workArea || targetDisplay?.bounds;

  if (!area) {
    return null;
  }

  return {
    x: Math.round(area.x + Math.max(0, (area.width - width) / 2)),
    y: Math.round(area.y + Math.max(0, (area.height - height) / 2)),
  };
}

function createWindow() {
  const iconPath = getTestByModuleIconPath();
  const windowIcon = iconPath ? nativeImage.createFromPath(iconPath) : null;
  const windowSize = { width: 520, height: 360 };
  const placement = getWindowPlacement(windowSize.width, windowSize.height);

  mainWindow = new BrowserWindow({
    width: windowSize.width,
    height: windowSize.height,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Test by module',
    ...(placement ? { x: placement.x, y: placement.y } : {}),
    ...(iconPath ? { icon: iconPath } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.platform === 'linux' && windowIcon && !windowIcon.isEmpty() && typeof mainWindow.setIcon === 'function') {
    try {
      mainWindow.setIcon(windowIcon);
    } catch {
      // Ignore runtime icon failures.
    }
  }

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '..', 'by-module', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('modules:list', async () => {
  const modules = listModules();
  if (modules.length === 0) {
    return {
      ok: false,
      modules: [],
      error: `No modules were found in ${modulesRoot}`,
    };
  }

  return {
    ok: true,
    modules,
    summary: {
      total: modules.length,
      withSpecs: modules.filter((moduleItem) => moduleItem.hasSpecs).length,
      withoutSpecs: modules.filter((moduleItem) => !moduleItem.hasSpecs).length,
    },
  };
});

ipcMain.handle('prefs:get', async () => {
  return { ok: true, prefs: readPrefsFromDisk() };
});

ipcMain.handle('prefs:set', async (_event, payload) => {
  const result = writePrefsToDisk(payload);
  if (!result.ok) {
    return { ok: false, error: result.error, prefs: result.prefs };
  }

  return { ok: true, prefs: result.prefs };
});

ipcMain.handle('tests:run', async (_event, payload) => {
  if (activeChild) {
    return { ok: false, error: 'A test command is already running.' };
  }

  const moduleName = String(payload?.moduleName || '').trim();
  const watch = Boolean(payload?.watch);
  const coverage = Boolean(payload?.coverage);

  if (!/^[a-z0-9._-]+$/i.test(moduleName)) {
    return { ok: false, error: 'Invalid module name.' };
  }

  const modulePath = path.join(modulesRoot, moduleName);
  if (!moduleHasSpecFiles(modulePath)) {
    return { ok: false, error: `Module ${moduleName} does not contain .spec.ts files.` };
  }

  console.log(
    `[test-by-module] Selected module: ${moduleName} (watch=${watch ? 'true' : 'false'}, coverage=${
      coverage ? 'true' : 'false'
    })`
  );

  const ngArgs = [
    'run',
    'ng',
    '--',
    'test',
    `--include=src/app/modules/${moduleName}/**/*.spec.ts`,
    watch ? '--watch=true' : '--watch=false',
  ];

  if (!watch) {
    ngArgs.push('--browsers=ChromeHeadless');
  }

  if (coverage) {
    ngArgs.push('--code-coverage=true');
  }

  const env = buildSpawnEnv();
  let child;

  if (process.platform === 'win32') {
    const command = `npm ${ngArgs.join(' ')}`;
    console.log(`[test-by-module] Running: cmd.exe /d /s /c ${command}`);
    child = spawn('cmd.exe', ['/d', '/s', '/c', command], {
      cwd: projectRoot,
      stdio: 'inherit',
      env,
      windowsHide: true,
      shell: false,
    });
  } else {
    console.log(`[test-by-module] Running: npm ${ngArgs.join(' ')}`);
    child = spawn('npm', ngArgs, {
      cwd: projectRoot,
      stdio: 'inherit',
      env,
      windowsHide: true,
      shell: false,
    });
  }

  activeChild = child;

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }

  child.on('close', (exitCode) => {
    activeChild = null;
    app.exit(Number.isInteger(exitCode) ? exitCode : 1);
  });

  child.on('error', (error) => {
    console.error('[test-by-module] Failed to start tests:', error?.message || error);
    activeChild = null;
    app.exit(1);
  });

  return { ok: true };
});

ipcMain.handle('app:close', async () => {
  app.quit();
  return { ok: true };
});

app.whenReady().then(() => {
  applyAppIcon();
  createWindow();
  applyAppIcon();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
