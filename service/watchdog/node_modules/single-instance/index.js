var assert = require('assert'),
    EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    net = require('net'),
    os = require('os'),
    path = require('path'),
    RSVP = require('rsvp'),
    util = require('util');

/* Options:
**   - socketPath: Can contain a custom socket path
*/
function SingleInstance(appName, options) {
  assert(appName, "Missing required parameter 'appName'.");

  var defaultSocketPath = (process.platform == 'win32') ?
    '\\\\.\\pipe\\' + appName + '-sock' :
    path.join(os.tmpdir(), appName + '.sock');

  this._name = appName;
  this._options = options || {};
  this._socketPath = this._options.socketPath || defaultSocketPath;
  this._server = null;
}
util.inherits(SingleInstance, EventEmitter);

SingleInstance.prototype.lock = function(callback) {
  var self = this;

  var promise = new RSVP.Promise(function(resolve, reject) {
    var client = net.connect({ path: self._socketPath }, function() {
      client.write('connectionAttempt', function() {
        reject('An application is already running')
      });
    });

    client.on('error', function(err) {
      try {
        fs.unlinkSync(self._socketPath);
      } catch (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
      self._server = net.createServer(function(connection) {
        connection.on('data', function() {
          self.emit('connection-attempt');
        });
      });
      resolve(true);
      self._server.listen(self._socketPath);
      self._server.on('error', function(err) {
        reject(err);
      });
    });
  });

  if (callback) {
    promise.then(function() {
      callback(null);
    }).catch(function(err) {
      callback(err);
    });
  }

  return promise;
}

SingleInstance.prototype.unlock = function(callback) {
  var self = this;
  var promise = new RSVP.Promise(function(resolve, reject) {
    if (self._server) {
      self._server.close(function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(true);
        }
      });
    } else {
      resolve(true);
    }
  });

  if (callback) {
    promise.then(function() {
      callback(null);
    }).catch(function(err) {
      callback(err);
    });
  }

  return promise;
}

module.exports = SingleInstance