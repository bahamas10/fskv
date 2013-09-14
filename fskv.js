#!/usr/bin/env node
/**
 * A filesystem based key-value store in Node.JS
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: 4/27/13
 * License: MIT
 */

var fs = require('fs');
var http = require('http');
var path = require('path');

var accesslog = require('access-log');
var easyreq = require('easyreq');
var getopt = require('posix-getopt');

var package = require('./package.json');
var router = require('./router');

function usage() {
  return [
    'Usage: fskv [-b] [-d dir] [-h] [-H host] [-l] [-p port] [-u] [-v]',
    '',
    'A filesystem based key-value store in Node.JS via HTTP',
    '',
    'Options',
    '  -b, --buffer       buffer logging, defaults to ' + opts.buffer,
    '  -d, --dir <dir>    the database directory, defaults to ' + opts.dir,
    '  -h, --help         print this message and exit',
    '  -H, --host <host>  the address to bind to, defaults to ' + opts.host,
    '  -n, --no-log       disable logging, logging is enabled by default',
    '  -p, --port <port>  the port to bind to, defaults to ' + opts.port,
    '  -u, --updates      check npm for available updates',
    '  -v, --version      print the version number and exit'
  ].join('\n');
}

// command line arguments
var options = [
  'b(buffer)',
  'd:(dir)',
  'h(help)',
  'H:(host)',
  'n(no-log)',
  'p:(port)',
  'u(updates)',
  'v(version)'
].join('');
var parser = new getopt.BasicParser(options, process.argv);

var opts = {
  buffer: false,
  dir: './data',
  host: 'localhost',
  log: true,
  port: 9000
};
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'b': opts.buffer = true; break;
    case 'd': opts.dir = option.optarg; break;
    case 'h': console.log(usage()); process.exit(0);
    case 'H': opts.host = option.optarg; break;
    case 'n': opts.log = false; break;
    case 'p': opts.port = +option.optarg; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': console.log(package.version); process.exit(0);
    default: console.error(usage()); process.exit(1);
  }
}
var args = process.argv.slice(parser.optind());

// verify the dir by cd'ing there
try {
  process.chdir(opts.dir);
} catch (e) {
  console.error('cannot cd to %s: %s', opts.dir, e.message);
  console.error('exiting');
  process.exit(1);
}

http.createServer(onrequest).listen(opts.port, opts.host, started);

// server started
function started() {
  if (!opts.log)
    console.log = function() {};
  if (opts.buffer) {
    // buffer the logs
    var logbuffer = require('log-buffer');
    logbuffer(8192);
    // flush every 5 seconds
    setInterval(logbuffer.flush.bind(logbuffer), 5 * 1000);
  }
  console.log('server started on http://%s:%d', opts.host, opts.port);
}

// request callback
function onrequest(req, res) {
  easyreq(req, res);
  if (opts.log)
    accesslog(req, res);

  // route
  try {
    var route = router.match(req.urlparsed.pathname);
  } catch (e) {}
  if (!route)
    return res.notfound();

  // route it
  route.fn(req, res, route.params);
}
