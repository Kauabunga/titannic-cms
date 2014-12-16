/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');

exports.register = function(socket) {
  Document.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });

  //TODO post updates to clients after registering watch with google drive

}

function onSave(socket, doc, cb) {
  socket.emit('document:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}
