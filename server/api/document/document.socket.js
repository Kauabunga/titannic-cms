/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var User = require('../user/user.model');
var Document = require('./document.model');
var DocumentController = require('./document.controller');





var jwt = require('jsonwebtoken');

var q = require('q');
var Log = require('log');
var log = new Log('document.socket');


/**
 * TODO should be in User controller
 * @param socket
 */
function getUserFromSocket(socket){

  var deferred = q.defer();

  var token = jwt.decode(socket.handshake.query.token);

  //ensure that the user has actually locked the file
  User.findById(token._id, function(err, user){

    if(err){
      log.error('unable to get user from socket', err, token);
      deferred.reject(err);
    }
    else if(!user){
      log.error('unable to get user from socket', user, token);
      deferred.reject(user);
    }
    else{
      log.debug('got user from socket', user.name);
      deferred.resolve(user);
    }
  });

  return deferred.promise;

}


/**
 *
 * @param socket
 */
exports.register = function(socket) {

  var lockedDocumentId;

  Document.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });


  function unlockDocument(){
    var unlockDeferred = DocumentController.unlockById(lockedDocumentId);
    unlockDeferred.then(
      function success() {
        socket.emit('document:unlock:success');
        lockedDocumentId = undefined;
      },
      function error(unlockError) {
        socket.emit('document:unlock:error', unlockError);
      });
  }

  /**
   *
   */
  socket.on('document:unlock', function(){

    if(lockedDocumentId !== undefined) {
      unlockDocument();
    }
    else{
      log.error('Client attempting unlock without lock');
    }

  });

  /**
   *
   */
  socket.on('connect_failed', function(){

    if(lockedDocumentId !== undefined){
      log.error('socket connect_failed with locked document');
      //release on disconnect
      unlockDocument();

    }
  });

  socket.on('disconnect', function(){

    if(lockedDocumentId !== undefined){
      log.error('socket disconnected with locked document');
      //release on disconnect
      unlockDocument();

    }
  });


  socket.on('document:lock', function(docId){

    log.debug(docId);
    log.debug(socket.id);

    var lockedDeferred = DocumentController.lockDocument(docId, socket.id);

    lockedDeferred.then(
      function success(){
        lockedDocumentId = docId;
        socket.emit('document:lock:success');
      },
      function error(){
        socket.emit('document:lock:error');
      });

  });

};

function onSave(socket, doc, cb) {
  socket.emit('document:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}
