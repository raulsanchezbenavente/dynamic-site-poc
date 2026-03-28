const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { app, BrowserWindow, ipcMain } = require('electron');

const projectRoot = path.resolve(__dirname, '..', '..');
const modulesRoot = path.join(projectRoot, 'src', 'app', 'modules');
const prefsFileName = 'test-by-module-prefs.json';

let mainWindow = null;
let activeChild = null;

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
    .filter((entry) => moduleHasSpecFiles(path.join(modulesRoot, entry.name)))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 360,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Test by module',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
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
      error: `No modules with .spec.ts files were found in ${modulesRoot}`,
    };
  }

  return { ok: true, modules };
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

  const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = [
    'run',
    'ng',
    '--',
    'test',
    `--include=src/app/modules/${moduleName}/**/*.spec.ts`,
    watch ? '--watch=true' : '--watch=false',
  ];

  if (!watch) {
    args.push('--browsers=ChromeHeadless');
  }

  if (coverage) {
    args.push('--code-coverage=true');
  }

  console.log(`[test-by-module] Running: ${npmExecutable} ${args.join(' ')}`);

  const child = spawn(npmExecutable, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
