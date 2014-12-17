/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Document = require('./document.model');
var DocumentController = require('./document.controller');

exports.register = function(socket) {
  Document.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Document.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
  //TODO post updates to clients after registering watch with google drive

  //bind to socket disconnect and error -> also unlock the document
  socket.on('document:unlock', function(docId){
    console.log('DOCUMENT unlock!', docId);
    DocumentController.unlockById(docId);
  });

};

function onSave(socket, doc, cb) {
  socket.emit('document:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('document:remove', doc);
}
