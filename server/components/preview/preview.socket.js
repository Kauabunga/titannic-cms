(function() {

  'use strict';


  var q = require('q');

  var config = require('../../config/environment');

  var Log = require('log');
  var log = new Log('preview.socket');


  var _socketio;

  /**
   *
   * @param documentId
   * @param environment
   */
  exports.emitPreviewUpdate = function (documentId, environment){
    _socketio.emit('preview:urlupdate', documentId, environment);
  };


  /**
   *
   * @param documentId
   * @param environment
   */
  exports.emitPreviewUpdateStart = function (documentId, environment){
    _socketio.emit('preview:urlupdate:start', documentId, environment);
  };

  /**
   *
   * @param documentId
   * @param environment
   */
  exports.emitPreviewUpdateStartError = function (documentId, environment){
    _socketio.emit('preview:urlupdate:start:error', documentId, environment);
  };

  /**
   *
   * @param socket
   */
  exports.register = function(socketio, socket) {

    if(!_socketio){
      _socketio = socketio;
    }

  };



})();
