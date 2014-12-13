'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,

  //link to google doc json of the schema
  googleDocSchemaId: String

});

module.exports = mongoose.model('Schema', SchemaSchema);
