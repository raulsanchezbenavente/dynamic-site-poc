const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { app, BrowserWindow } = require('electron');

const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const svgPath = path.join(assetsDir, 'modal-icon.svg');
const basePngPath = path.join(assetsDir, 'modal-icon.png');
const macDir = path.join(assetsDir, 'mac');
const linuxDir = path.join(assetsDir, 'linux');
const windowsDir = path.join(assetsDir, 'windows');
const macIcnsPath = path.join(macDir, 'modal-icon.icns');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writePng(image, outPath) {
  if (!image || image.isEmpty()) {
    throw new Error(`Empty image for ${outPath}`);
  }

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, image.toPNG());
}

async function renderSvgImage(svgText) {
  const size = 1024;
  const win = new BrowserWindow({
    show: false,
    width: size,
    height: size,
    transparent: true,
    frame: false,
    resizable: false,
    webPreferences: {
      backgroundThrottling: false,
    },
  });

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
      }
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    </style>
  </head>
  <body>
    ${svgText}
  </body>
</html>`;

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await win.webContents.executeJavaScript('document.fonts ? document.fonts.ready : Promise.resolve()');
  const image = await win.webContents.capturePage();
  win.destroy();

  if (!image || image.isEmpty()) {
    throw new Error('Could not render SVG to image');
  }

  return image;
}

function buildIconset(baseImage, iconsetDir) {
  const files = [
    ['icon_16x16.png', 16],
    ['icon_16x16@2x.png', 32],
    ['icon_32x32.png', 32],
    ['icon_32x32@2x.png', 64],
    ['icon_128x128.png', 128],
    ['icon_128x128@2x.png', 256],
    ['icon_256x256.png', 256],
    ['icon_256x256@2x.png', 512],
    ['icon_512x512.png', 512],
    ['icon_512x512@2x.png', 1024],
  ];

  ensureDir(iconsetDir);
  for (const [fileName, size] of files) {
    const resized = baseImage.resize({ width: size, height: size, quality: 'best' });
    writePng(resized, path.join(iconsetDir, fileName));
  }
}

function buildMacIcns(baseImage) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-by-module-icon-'));
  const tempIconsetDir = path.join(tempRoot, 'modal-icon.iconset');

  try {
    buildIconset(baseImage, tempIconsetDir);
    execFileSync('iconutil', ['-c', 'icns', tempIconsetDir, '-o', macIcnsPath], { stdio: 'ignore' });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function main() {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const rendered = await renderSvgImage(svg);
  const baseImage = rendered.resize({ width: 1024, height: 1024, quality: 'best' });

  writePng(baseImage.resize({ width: 1024, height: 1024, quality: 'best' }), basePngPath);
  writePng(baseImage.resize({ width: 1024, height: 1024, quality: 'best' }), path.join(macDir, 'modal-icon.png'));
  writePng(baseImage.resize({ width: 512, height: 512, quality: 'best' }), path.join(linuxDir, 'modal-icon.png'));
  writePng(baseImage.resize({ width: 256, height: 256, quality: 'best' }), path.join(windowsDir, 'modal-icon.png'));

  buildMacIcns(baseImage);

  console.log('Icon PNGs regenerated with Electron renderer.');
}

app.whenReady().then(() => {
  main()
    .then(() => {
      app.exit(0);
    })
    .catch((error) => {
      console.error(error?.message || error);
      app.exit(1);
    });
});
