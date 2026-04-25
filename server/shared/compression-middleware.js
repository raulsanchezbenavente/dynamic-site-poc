const compression = require('compression');
const zlib = require('zlib');

function createCompressionMiddleware() {
  return compression({
    // Prefer Brotli when available, fallback to gzip/deflate by negotiation.
    brotli: {
      enabled: true,
      zlib: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
        },
      },
    },
  });
}

module.exports = {
  createCompressionMiddleware,
};
