'use strict';

var _ = require('lodash');
var Schema = require('./schema.model');

var googledrive = require('../../googledrive/googledrive.service');

var Log = require('log');
var log = new Log('schema.controller');

// Get list of schemas
exports.index = function(req, res) {
  Schema.find(function (err, schemas) {
    if(err) { return handleError(res, err); }
    return res.json(200, schemas);
  });
};

// Get a single schema
exports.show = function(req, res) {
  Schema.findById(req.params.id, function (err, schema) {
    if(err) { return handleError(res, err); }
    if(!schema) { return res.send(404); }


    var googleSchemaDeferred = googledrive.fetchGoogleDoc(schema.name, schema.googleDocSchemaId);

    googleSchemaDeferred.then(
      function success(schemaContent){

        try {

          var deserialisedSchema = JSON.parse(schemaContent);
          var schemaObject = schema.toObject();

          schemaObject.content = deserialisedSchema;


          res.status(200).json(schemaObject);


        }
        catch (jsonParseError) {
          log.error('Error parsing schema content', jsonParseError);
          res.send(500);
        }

      },
      function error(err){
        console.log('Error getting schema', JSON.stringify(err));
        return res.send(500);
      });

  });
};

// Creates a new schema in the DB.
exports.create = function(req, res) {
  Schema.create(req.body, function(err, schema) {
    if(err) { return handleError(res, err); }
    return res.json(201, schema);
  });
};

// Updates an existing schema in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Schema.findById(req.params.id, function (err, schema) {
    if (err) { return handleError(res, err); }
    if(!schema) { return res.send(404); }
    var updated = _.merge(schema, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, schema);
    });
  });
};

// Deletes a schema from the DB.
exports.destroy = function(req, res) {
  Schema.findById(req.params.id, function (err, schema) {
    if(err) { return handleError(res, err); }
    if(!schema) { return res.send(404); }
    schema.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
