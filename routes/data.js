var fs = require('fs');

var staticroute = require('static-route')({
  autoindex: false,
  logger: function () {}
});

module.exports = data;

function data(req, res) {
  var uri = decodeURIComponent(req.urlparsed.pathname);
  var file = uri.replace(/^\/data\//, '');

  // validate key
  if (!safekey(file)) {
    res.json({error: 'Key contains illegal characters'}, 400);
    return;
  }

  // check HTTP method
  switch (req.method) {
    case 'HEAD':
    case 'GET':
      // rely on static-route... for now
      req.urlparsed.pathname = req.urlparsed.pathname.replace('/data', '');
      staticroute(req, res);
      break;
    case 'PUT':
      var exclusive = req.urlparsed.query.hasOwnProperty('exclusive');
      var ws = fs.createWriteStream(file, {flags: exclusive ? 'wx' : 'w'});

      req.pipe(ws);

      ws.on('close', function() {
        res.json({message: 'saved', status: 'ok'});
      });

      ws.on('error', function(err) {
        var code = exclusive && err.code === 'EEXIST' ? 409 : 500;
        res.json({error: err.message, code: err.code}, code);
        ws.destroy();
      });

      break;
    case 'DELETE':
      fs.unlink(file, function(err) {
        if (err) {
          var code = err.code === 'ENOENT' ? 404 : 500;
          res.json({error: err.message, code: err.code}, code);
        } else {
          res.json({message: 'deleted', status: 'ok'});
        }
      });
      break;
    default:
      res.json({error: 'Unsupported HTTP method'}, 501);
      break;
  }
}

// check if a key is safe
function safekey(key) {
  return key && key.indexOf('/') === -1 && key.indexOf('\\') === -1 && key.indexOf('\0') === -1;
}
