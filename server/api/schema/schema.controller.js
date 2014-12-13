'use strict';

var _ = require('lodash');
var Schema = require('./schema.model');

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
    return res.json(schema);
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