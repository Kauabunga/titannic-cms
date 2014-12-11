'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocumentSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,

  //id of the google drive
  googleDocId: String,

  //local copy of the document before/after it is pushed to google docs
  localDocCopy: String,

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
