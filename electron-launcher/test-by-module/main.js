const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { app, BrowserWindow, ipcMain } = require('electron');

const projectRoot = path.resolve(__dirname, '..', '..');
const modulesRoot = path.join(projectRoot, 'src', 'app', 'modules');

let mainWindow = null;
let activeChild = null;

function listModules() {
  if (!fs.existsSync(modulesRoot)) {
    return [];
  }

  return fs
    .readdirSync(modulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
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
      error: `No modules found in ${modulesRoot}`,
    };
  }

  return { ok: true, modules };
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
