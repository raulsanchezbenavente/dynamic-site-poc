'use strict';
// Post-build script: pre-compresses all compressible files in dist with gzip and brotli.
// Generates .gz and .br alongside each original file.
// Useful for nginx (gzip_static on / brotli_static on) or CDN deployments that can
// serve pre-compressed files directly without on-the-fly CPU cost.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

const DIST_DIR = path.join(__dirname, 'dist', 'dynamic-site', 'browser');

const COMPRESSIBLE_EXTENSIONS = new Set([
  '.js',
  '.css',
  '.html',
  '.json',
  '.svg',
  '.txt',
  '.xml',
  '.webmanifest',
]);

async function compressFile(filePath) {
  const ext = path.extname(filePath);
  if (!COMPRESSIBLE_EXTENSIONS.has(ext)) return 0;

  const content = fs.readFileSync(filePath);

  const [gzipped, brotli] = await Promise.all([
    gzip(content, { level: zlib.constants.Z_BEST_COMPRESSION }),
    brotliCompress(content, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY },
    }),
  ]);

  fs.writeFileSync(`${filePath}.gz`, gzipped);
  fs.writeFileSync(`${filePath}.br`, brotli);

  return content.length;
}

async function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalBytes = 0;
  let fileCount = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const result = await processDir(fullPath);
      totalBytes += result.bytes;
      fileCount += result.count;
    } else if (
      entry.isFile() &&
      !entry.name.endsWith('.gz') &&
      !entry.name.endsWith('.br')
    ) {
      const bytes = await compressFile(fullPath);
      if (bytes > 0) {
        process.stdout.write('.');
        fileCount++;
        totalBytes += bytes;
      }
    }
  }

  return { bytes: totalBytes, count: fileCount };
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Dist directory not found: ${DIST_DIR}`);
    console.error('Run "npm run build" first.');
    process.exit(1);
  }

  console.log(`Compressing dist output: ${DIST_DIR}`);
  const start = Date.now();
  const { bytes, count } = await processDir(DIST_DIR);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\nCompressed ${count} files (${(bytes / 1024 / 1024).toFixed(1)} MB uncompressed) in ${elapsed}s`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
