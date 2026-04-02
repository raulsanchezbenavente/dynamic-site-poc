const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { app, BrowserWindow, ipcMain, nativeImage, screen } = require('electron');
const { buildSharedModalIconConfig, createIconManager } = require('../shared/icon-manager');

const projectRoot = path.resolve(__dirname, '..', '..');
const modulesRoot = path.join(projectRoot, 'src', 'app', 'modules');
const angularJsonPath = path.join(projectRoot, 'angular.json');
const prefsFileName = 'storybook-by-module-prefs.json';

if (process.platform === 'win32') {
  const isolatedUserDataPath = path.join(app.getPath('appData'), 'dynamic-site-storybook-by-module');
  app.setPath('userData', isolatedUserDataPath);
}

let mainWindow = null;
let activeChild = null;
const sharedModalIconConfig = buildSharedModalIconConfig({ launcherDir: __dirname });

const { getIconPath, applyAppIcon } = createIconManager({
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

function listModuleNames() {
  if (!fs.existsSync(modulesRoot)) {
    return [];
  }

  return fs
    .readdirSync(modulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function readStorybookTargets() {
  if (!fs.existsSync(angularJsonPath)) {
    return [];
  }

  let angularConfig;
  try {
    angularConfig = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  } catch {
    return [];
  }

  const projects = angularConfig?.projects || {};
  const entries = [];

  for (const [projectName, projectConfig] of Object.entries(projects)) {
    const architect = projectConfig?.architect || projectConfig?.targets || {};

    for (const [targetName, targetConfig] of Object.entries(architect)) {
      const builder = String(targetConfig?.builder || '').trim();
      if (!builder.includes('storybook')) {
        continue;
      }

      if (!builder.includes('start-storybook')) {
        continue;
      }

      const configDir = String(targetConfig?.options?.configDir || '').trim();
      const configDirMatch = configDir.match(/src\/app\/modules\/([^/]+)\/\.storybook$/i);
      const nameMatch = targetName.match(/^storybook[-:]?(.+)$/i);

      const moduleName =
        (configDirMatch && configDirMatch[1] ? String(configDirMatch[1]).trim() : '') ||
        (nameMatch && nameMatch[1] ? String(nameMatch[1]).trim() : '');

      if (!moduleName) {
        continue;
      }

      entries.push({
        moduleName,
        targetName,
        projectName,
      });
    }
  }

  // If there are duplicate module names, keep the first one found for predictability.
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.moduleName)) {
      return false;
    }
    seen.add(entry.moduleName);
    return true;
  });
}

function listModules() {
  const moduleNames = listModuleNames();
  const storybookTargets = readStorybookTargets();
  const targetsByModule = new Map(storybookTargets.map((item) => [item.moduleName, item]));

  return moduleNames
    .map((name) => {
      const storybook = targetsByModule.get(name) || null;
      return {
        name,
        hasStorybook: Boolean(storybook),
        storybookTarget: storybook ? `${storybook.projectName}:${storybook.targetName}` : null,
      };
    })
    .sort((a, b) => {
      if (a.hasStorybook !== b.hasStorybook) {
        return a.hasStorybook ? -1 : 1;
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

function runCompodocForModule(moduleName) {
  const safeModuleName = String(moduleName || '').trim();
  const modulePath = path.join(modulesRoot, safeModuleName);
  const tsConfigPath = path.join(modulePath, 'tsconfig.lib.json');

  if (!fs.existsSync(tsConfigPath)) {
    return Promise.reject(new Error(`Could not find tsconfig.lib.json for module ${safeModuleName}.`));
  }

  const compodocArgs = ['exec', '--', 'compodoc', '-p', tsConfigPath, '-e', 'json', '-d', modulePath];
  const env = buildSpawnEnv();

  return new Promise((resolve, reject) => {
    let child;

    if (process.platform === 'win32') {
      const command = `npm ${compodocArgs.join(' ')}`;
      console.log(`[storybook-by-module] Running pre-step: cmd.exe /d /s /c ${command}`);
      child = spawn('cmd.exe', ['/d', '/s', '/c', command], {
        cwd: projectRoot,
        stdio: 'inherit',
        env,
        windowsHide: true,
        shell: false,
      });
    } else {
      console.log(`[storybook-by-module] Running pre-step: npm ${compodocArgs.join(' ')}`);
      child = spawn('npm', compodocArgs, {
        cwd: projectRoot,
        stdio: 'inherit',
        env,
        windowsHide: true,
        shell: false,
      });
    }

    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`Compodoc failed for module ${safeModuleName} (exit code ${exitCode}).`));
    });

    child.on('error', (error) => {
      reject(new Error(error?.message || `Compodoc failed for module ${safeModuleName}.`));
    });
  });
}

function getModuleDocumentationPath(moduleName) {
  const safeModuleName = String(moduleName || '').trim();
  return path.join(modulesRoot, safeModuleName, 'documentation.json');
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
  const iconPath = getIconPath();
  const windowIcon = iconPath ? nativeImage.createFromPath(iconPath) : null;
  const windowSize = { width: 520, height: 350 };
  const placement = getWindowPlacement(windowSize.width, windowSize.height);

  mainWindow = new BrowserWindow({
    width: windowSize.width,
    height: windowSize.height,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Storybook by module',
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

function hideAppPresenceDuringRun() {
  if (process.platform !== 'darwin') {
    return;
  }

  if (typeof app.setActivationPolicy === 'function') {
    try {
      app.setActivationPolicy('accessory');
    } catch {
      // Ignore policy changes that are not supported in this runtime.
    }
  }

  if (app.dock && typeof app.dock.hide === 'function') {
    try {
      app.dock.hide();
    } catch {
      // Ignore dock-hide failures.
    }
  }
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
      withStorybook: modules.filter((moduleItem) => moduleItem.hasStorybook).length,
      withoutStorybook: modules.filter((moduleItem) => !moduleItem.hasStorybook).length,
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

ipcMain.handle('storybook:run', async (_event, payload) => {
  if (activeChild) {
    return { ok: false, error: 'A Storybook command is already running.' };
  }

  const moduleName = String(payload?.moduleName || '').trim();
  const generateDocumentation = Boolean(payload?.generateDocumentation);

  if (!/^[a-z0-9._-]+$/i.test(moduleName)) {
    return { ok: false, error: 'Invalid module name.' };
  }

  const moduleEntry = listModules().find((item) => item.name === moduleName);
  if (!moduleEntry || !moduleEntry.hasStorybook || !moduleEntry.storybookTarget) {
    return { ok: false, error: `Module ${moduleName} does not have a Storybook target configured.` };
  }

  console.log(
    `[storybook-by-module] Selected module: ${moduleName} (target=${moduleEntry.storybookTarget}, port=6006)`
  );

  if (generateDocumentation) {
    try {
      await runCompodocForModule(moduleName);
    } catch (error) {
      const reason = error?.message || error;
      console.error('[storybook-by-module] Compodoc step failed:', reason);
      return { ok: false, error: `Compodoc failed: ${reason}` };
    }
  } else {
    const documentationPath = getModuleDocumentationPath(moduleName);
    if (!fs.existsSync(documentationPath)) {
      const missingDocumentationMessage =
        `documentation.json is missing for module ${moduleName} at ${documentationPath}. ` +
        'Enable "Generate documentation" and run again.';

      console.warn(`[storybook-by-module] ${missingDocumentationMessage}`);
      return { ok: false, error: missingDocumentationMessage };
    }
  }

  const ngArgs = ['run', 'ng', '--', 'run', moduleEntry.storybookTarget, '--port=6006', '--ci'];

  const env = buildSpawnEnv();
  let child;

  if (process.platform === 'win32') {
    const command = `npm ${ngArgs.join(' ')}`;
    console.log(`[storybook-by-module] Running: cmd.exe /d /s /c ${command}`);
    child = spawn('cmd.exe', ['/d', '/s', '/c', command], {
      cwd: projectRoot,
      stdio: 'inherit',
      env,
      windowsHide: true,
      shell: false,
    });
  } else {
    console.log(`[storybook-by-module] Running: npm ${ngArgs.join(' ')}`);
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
    mainWindow.destroy();
    mainWindow = null;
  }

  hideAppPresenceDuringRun();

  child.on('close', (exitCode) => {
    activeChild = null;
    app.exit(Number.isInteger(exitCode) ? exitCode : 1);
  });

  child.on('error', (error) => {
    console.error('[storybook-by-module] Failed to start Storybook:', error?.message || error);
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
  if (!activeChild) {
    app.quit();
  }
});
