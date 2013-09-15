var statsobj = require('../lib/stats');
var version = 'v' + require('../package.json').version;

var started = Date.now();

module.exports = stats;

function stats(req, res) {
  var ret = {
    system: {
      arch: process.arch,
      dir: process.cwd(),
      fskvversion: version,
      mem: process.memoryUsage(),
      nodeversion: process.version,
      now: Date.now(),
      pid: process.pid,
      platform: process.platform,
      started: started
    },
    http: statsobj
  };
  res.json(ret);
}
