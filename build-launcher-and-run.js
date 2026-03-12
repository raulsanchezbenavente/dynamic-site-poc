const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const repoRoot = __dirname;
const distElectronDir = path.join(repoRoot, 'dist-electron');

function runOrThrow(command, args, label) {
  console.log(`\n[step] ${label}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
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

function findBuiltArtifact() {
  if (process.platform === 'win32') {
    const exeCandidates = walkFiles(distElectronDir, (fullPath, name) => {
      return fullPath.includes(`${path.sep}win-unpacked${path.sep}`) && name.toLowerCase().endsWith('.exe');
    });

    if (exeCandidates.length === 0) {
      throw new Error('Windows executable not found inside dist-electron/win-unpacked');
    }

    return exeCandidates[0];
  }

  if (process.platform === 'darwin') {
    const macCandidates = [
      path.join(distElectronDir, 'mac'),
      path.join(distElectronDir, 'mac-arm64'),
      path.join(distElectronDir, 'mac-universal'),
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

  const appImageCandidates = walkFiles(distElectronDir, (_fullPath, name) => name.endsWith('.AppImage'));

  if (appImageCandidates.length > 0) {
    return appImageCandidates[0];
  }

  const unpackedCandidates = walkFiles(path.join(distElectronDir, 'linux-unpacked'), (fullPath, name) => {
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
    const child = spawn('cmd.exe', ['/d', '/s', '/c', 'start', '', artifactPath], {
      cwd: repoRoot,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
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

  runOrThrow(npm, ['install'], 'Installing dependencies (npm install)');
  runOrThrow(npm, ['run', buildScript], `Building launcher (${buildScript})`);

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
