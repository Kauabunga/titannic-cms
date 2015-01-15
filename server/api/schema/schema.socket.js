/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Schema = require('./schema.model');

exports.register = function(socketio, socket) {
  Schema.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Schema.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('schema:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('schema:remove', doc);
}
