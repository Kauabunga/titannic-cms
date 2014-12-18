/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');
var DocumentController = require('./document.controller');





var jwt = require('jsonwebtoken');

var q = require('q');
var Log = require('log');
var log = new Log('document.socket');


/**
 *
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




exports.register = function(socket) {
  Document.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  socket.emit('document:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}
