// projects/<project>/karma.conf.js
const makeKarma = require('../../karma.base.conf.js');
const path = require('node:path');
module.exports = makeKarma(path.basename(__dirname));
