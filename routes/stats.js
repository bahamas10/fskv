var started = Date.now();
var version = require('../package.json').version;

module.exports = stats;

function stats(req, res) {
  var ret = {
    started: started,
    nodeversion: process.version,
    fskvversion: version,
    pid: process.pid,
    dir: process.cwd(),
    mem: process.memoryUsage(),
    arch: process.arch,
    platform: process.platform
  };
  res.json(ret);
}
