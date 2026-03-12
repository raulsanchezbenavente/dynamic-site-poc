const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const repoRoot = __dirname;
const distElectronDir = path.join(repoRoot, 'dist-electron');
let currentOutputDir = distElectronDir;

function sleepMs(ms) {
  const shared = new SharedArrayBuffer(4);
  const view = new Int32Array(shared);
  Atomics.wait(view, 0, 0, ms);
}

function getLauncherExeName() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    const productName = String(packageJson?.build?.productName || 'Dynamic Site Launcher').trim();
    return `${productName}.exe`;
  } catch {
    return 'Dynamic Site Launcher.exe';
  }
}

function runOrThrow(command, args, label, envOverrides = null) {
  console.log(`\n[step] ${label}`);
  const isWindowsNpm = process.platform === 'win32' && /^npm(\.cmd)?$/i.test(command);
  const finalCommand = isWindowsNpm ? 'cmd.exe' : command;
  const finalArgs = isWindowsNpm ? ['/d', '/s', '/c', ['npm', ...args].join(' ')] : args;
  const env = { ...process.env };

  if (envOverrides) {
    for (const [key, value] of Object.entries(envOverrides)) {
      if (value == null) {
        delete env[key];
      } else {
        env[key] = String(value);
      }
    }
  }

  const result = spawnSync(finalCommand, finalArgs, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
    env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function npmCommand() {
  return 'npm';
}

function stopWindowsLauncherIfRunning() {
  if (process.platform !== 'win32') {
    return;
  }

  const exeName = getLauncherExeName();
  console.log(`\n[step] Ensuring ${exeName} is not running`);

  const result = spawnSync('taskkill', ['/IM', exeName, '/T', '/F'], {
    cwd: repoRoot,
    stdio: 'ignore',
    shell: false,
    windowsHide: true,
  });

  // taskkill returns non-zero when process is not running; that's fine.
  if (result.error) {
    console.warn(`[warn] Could not run taskkill for ${exeName}: ${result.error.message}`);
  }

  // Also stop detached child processes still running from win-unpacked (e.g. crashpad_handler).
  const winUnpackedPrefix = path.join(distElectronDir, 'win-unpacked').replace(/\\/g, '\\\\');
  const psScript = [
    '$ErrorActionPreference = "SilentlyContinue"',
    `$prefix = "${winUnpackedPrefix}"`,
    'Get-CimInstance Win32_Process |',
    '  Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase) } |',
    '  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }',
  ].join('; ');

  const psResult = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
    cwd: repoRoot,
    stdio: 'ignore',
    shell: false,
    windowsHide: true,
  });

  if (psResult.error) {
    console.warn(`[warn] Could not run PowerShell process cleanup: ${psResult.error.message}`);
  }

  // Give Windows a short moment to release file handles.
  sleepMs(700);
}

function cleanWindowsUnpackedOutput() {
  if (process.platform !== 'win32') {
    return;
  }

  const winUnpackedDir = path.join(distElectronDir, 'win-unpacked');
  if (!fs.existsSync(winUnpackedDir)) {
    return;
  }

  console.log(`\n[step] Cleaning previous output (${winUnpackedDir})`);

  let lastError = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      fs.rmSync(winUnpackedDir, { recursive: true, force: true });
      return;
    } catch (error) {
      lastError = error;
      const code = String(error?.code ?? '');
      if (code !== 'EBUSY' && code !== 'EPERM') {
        throw error;
      }

      console.warn(`[warn] Cleanup attempt ${attempt}/6 failed (${code}). Retrying...`);
      stopWindowsLauncherIfRunning();
      sleepMs(500 * attempt);
    }
  }

  if (lastError) {
    throw lastError;
  }
}

function createWindowsFreshOutputDir() {
  if (process.platform !== 'win32') {
    currentOutputDir = distElectronDir;
    return;
  }

  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runsRoot = path.join(distElectronDir, 'runs');
  currentOutputDir = path.join(runsRoot, `win-${safeTimestamp}`);
  fs.mkdirSync(currentOutputDir, { recursive: true });
}

function buildScriptByPlatform() {
  switch (process.platform) {
    case 'win32':
      return 'launcher:build:win';
    case 'darwin':
      return 'launcher:build:mac';
    case 'linux':
      return 'launcher:build:linux';
    default:
      throw new Error(`Unsupported OS: ${process.platform}`);
  }
}

function walkFiles(dirPath, matcher, collected = []) {
  if (!fs.existsSync(dirPath)) {
    return collected;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, matcher, collected);
      continue;
    }

    if (matcher(fullPath, entry.name)) {
      collected.push(fullPath);
    }
  }

  return collected;
}

function walkDirectories(dirPath, matcher, collected = []) {
  if (!fs.existsSync(dirPath)) {
    return collected;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (!entry.isDirectory()) {
      continue;
    }

    if (matcher(fullPath, entry.name)) {
      collected.push(fullPath);
      continue;
    }

    walkDirectories(fullPath, matcher, collected);
  }

  return collected;
}

function pickNewestPath(paths) {
  return [...paths].sort((left, right) => {
    const leftTime = fs.statSync(left).mtimeMs;
    const rightTime = fs.statSync(right).mtimeMs;
    return rightTime - leftTime;
  })[0];
}

function escapePowerShellSingleQuotedString(value) {
  return String(value).replace(/'/g, "''");
}

function findBuiltArtifact() {
  if (process.platform === 'win32') {
    const exeCandidates = walkFiles(currentOutputDir, (fullPath, name) => {
      return fullPath.includes(`${path.sep}win-unpacked${path.sep}`) && name.toLowerCase().endsWith('.exe');
    });

    if (exeCandidates.length === 0) {
      throw new Error('Windows executable not found inside dist-electron/win-unpacked');
    }

    return exeCandidates[0];
  }

  if (process.platform === 'darwin') {
    const macCandidates = [
      path.join(currentOutputDir, 'mac'),
      path.join(currentOutputDir, 'mac-arm64'),
      path.join(currentOutputDir, 'mac-universal'),
    ];

    const appCandidates = macCandidates.flatMap((candidateDir) =>
      walkDirectories(candidateDir, (_fullPath, name) => {
        return name.endsWith('.app');
      })
    );

    if (appCandidates.length === 0) {
      throw new Error('macOS app bundle not found inside dist-electron/mac, mac-arm64, or mac-universal');
    }

    return pickNewestPath(appCandidates);
  }

  const appImageCandidates = walkFiles(currentOutputDir, (_fullPath, name) => name.endsWith('.AppImage'));

  if (appImageCandidates.length > 0) {
    return appImageCandidates[0];
  }

  const unpackedCandidates = walkFiles(path.join(currentOutputDir, 'linux-unpacked'), (fullPath, name) => {
    if (name.includes('.')) {
      return false;
    }

    try {
      const stats = fs.statSync(fullPath);
      return (stats.mode & 0o111) !== 0;
    } catch {
      return false;
    }
  });

  if (unpackedCandidates.length === 0) {
    throw new Error('Linux executable not found (expected .AppImage or linux-unpacked binary)');
  }

  return unpackedCandidates[0];
}

function launchBuiltArtifact(artifactPath) {
  console.log(`\n[step] Launching: ${artifactPath}`);

  if (process.platform === 'darwin') {
    const result = spawnSync('open', [artifactPath], {
      cwd: repoRoot,
      stdio: 'inherit',
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(`Failed to open macOS app bundle (exit code ${result.status})`);
    }

    return;
  }

  if (process.platform === 'win32') {
    const escapedPath = escapePowerShellSingleQuotedString(artifactPath);
    const psScript = [
      `$proc = Start-Process -FilePath '${escapedPath}' -PassThru`,
      'Start-Sleep -Milliseconds 350',
      '$ws = New-Object -ComObject WScript.Shell',
      '[void]$ws.AppActivate($proc.Id)',
    ].join('; ');

    const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
      cwd: repoRoot,
      stdio: 'ignore',
      shell: false,
      windowsHide: true,
    });

    if (result.error || result.status !== 0) {
      // Fallback: still launch app even if focus activation fails.
      const child = spawn('cmd.exe', ['/d', '/s', '/c', 'start', '', artifactPath], {
        cwd: repoRoot,
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      });
      child.unref();
    }

    return;
  }

  if (artifactPath.endsWith('.AppImage')) {
    fs.chmodSync(artifactPath, 0o755);
  }

  const child = spawn(artifactPath, [], {
    cwd: path.dirname(artifactPath),
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

function main() {
  const npm = npmCommand();
  const buildScript = buildScriptByPlatform();

  stopWindowsLauncherIfRunning();
  createWindowsFreshOutputDir();

  runOrThrow(npm, ['install'], 'Installing dependencies (npm install)');

  const buildArgs = ['run', buildScript];
  if (process.platform === 'win32') {
    buildArgs.push('--', `--config.directories.output=${currentOutputDir}`);
  }
  const buildEnvOverrides =
    process.platform === 'win32'
      ? {
          CSC_IDENTITY_AUTO_DISCOVERY: 'false',
          CSC_LINK: null,
          CSC_KEY_PASSWORD: null,
          WIN_CSC_LINK: null,
          WIN_CSC_KEY_PASSWORD: null,
        }
      : null;

  runOrThrow(npm, buildArgs, `Building launcher (${buildScript})`, buildEnvOverrides);

  const artifactPath = findBuiltArtifact();
  launchBuiltArtifact(artifactPath);

  console.log('\n[done] Build completed and launcher started successfully.');
}

try {
  main();
} catch (error) {
  const message = error && error.message ? error.message : String(error);
  console.error(`\n[error] ${message}`);
  process.exit(1);
}
