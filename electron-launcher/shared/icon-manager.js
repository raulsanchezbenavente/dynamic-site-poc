const fs = require('fs');
const path = require('path');

function buildSharedModalIconConfig({ launcherDir }) {
  const modalAssetsDir = path.join(launcherDir, '..', 'test-by-module', 'assets');
  const launcherAssetsDir = path.join(launcherDir, '..', 'assets');

  return {
    candidates: [
      path.join(modalAssetsDir, 'mac', 'modal-icon.icns'),
      path.join(modalAssetsDir, 'mac', 'modal-icon.png'),
      path.join(modalAssetsDir, 'linux', 'modal-icon.png'),
      path.join(modalAssetsDir, 'windows', 'modal-icon.png'),
      path.join(modalAssetsDir, 'modal-icon.png'),
      path.join(launcherAssetsDir, 'mac', 'avianca-icon.icns'),
      path.join(launcherAssetsDir, 'mac', 'avianca-icon.png'),
      path.join(launcherAssetsDir, 'linux', 'avianca-icon.png'),
      path.join(launcherAssetsDir, 'windows', 'avianca-icon.png'),
    ],
    dockCandidates: [
      path.join(modalAssetsDir, 'mac', 'modal-icon.png'),
      path.join(modalAssetsDir, 'mac', 'modal-icon.icns'),
      path.join(modalAssetsDir, 'modal-icon.png'),
      path.join(launcherAssetsDir, 'mac', 'avianca-icon.png'),
      path.join(launcherAssetsDir, 'mac', 'avianca-icon.icns'),
    ],
  };
}

function createIconManager({ app, nativeImage, candidates, dockCandidates }) {
  let cachedIconPath = null;

  function getIconPath() {
    if (cachedIconPath && fs.existsSync(cachedIconPath)) {
      return cachedIconPath;
    }

    for (const candidatePath of candidates) {
      if (fs.existsSync(candidatePath)) {
        cachedIconPath = candidatePath;
        return cachedIconPath;
      }
    }

    return null;
  }

  function applyAppIcon() {
    if (!(process.platform === 'darwin' && app.dock && typeof app.dock.setIcon === 'function')) {
      return;
    }

    const availableDockCandidates = dockCandidates.filter((candidatePath) => fs.existsSync(candidatePath));

    for (const iconPath of availableDockCandidates) {
      try {
        if (path.extname(iconPath).toLowerCase() === '.png') {
          const runtimeIcon = nativeImage.createFromPath(iconPath);
          if (!runtimeIcon.isEmpty()) {
            app.dock.setIcon(runtimeIcon);
            return;
          }
        }

        app.dock.setIcon(iconPath);
        return;
      } catch {
        // Try the next available icon candidate.
      }
    }
  }

  return {
    getIconPath,
    applyAppIcon,
  };
}

module.exports = {
  buildSharedModalIconConfig,
  createIconManager,
};
