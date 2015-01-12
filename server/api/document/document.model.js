'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocumentSchema = new Schema({
  name: String,
  info: String,


  //key of the document lock (socket id of user)
  lockedKey: String,
  lockedBy: String,

  //id of the google drive live + dev
  liveContentGoogleDocId: String,
  devContentGoogleDocId: String,

  previewPath: String,

  //local copy of the document before/after it is pushed to google docs
  localDocCopy: String,

  //link to schema id
  schemaId: String,

  //environment the document targets
  environment: String,

  //what user role is required to view
  viewRole: String,

  //what user role is required to edit
  editRole: String,

  //what user role is required to publish
  publishRole: String
});

module.exports = mongoose.model('Document', DocumentSchema);
