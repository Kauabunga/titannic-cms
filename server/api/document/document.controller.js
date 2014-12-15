'use strict';

var _ = require('lodash');
var q = require('q');
var Document = require('./document.model');
var Schema = require('./../schema/schema.model');
var googledrive = require('../../googledrive/googledrive.service');
var https = require('follow-redirects').https;
var Log = require('log');
var log = new Log('document.controller');


/**
 * Get list of documents
 * @param req
 * @param res
 */
exports.index = function(req, res) {
  Document.find(function (err, documents) {
    if(err) { return handleError(res, err); }

    //TODO we need to ensure the returned documents are inline with the User role

    return res.json(200, documents);
  });
};


/**
 * Get a single document
 *
 * @param req
 * @param res
 */
exports.show = function(req, res) {

  var schemaDeferred = q.defer();

  Document.findById(req.params.id, function (err, document) {

    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }

    //If the document is already being edited we need to deny this request
    if(document.active){
      return res.send(423);
    }

    log.debug('Document: ' + JSON.stringify(document));
    log.debug('Schema id: ' + document.schemaId);


    //Get the documents schema
    Schema.findById(document.schemaId, function (err, schema){
      log.debug('Schema found: ' + JSON.stringify(schema));
      schemaDeferred.resolve(schema);
    });

    schemaDeferred.promise.then(
      function success(schema){

        //TODO we need to fetch the google doc from goooogle - should really be using correct api + library as we will have to when editing?
        //TODO distinguish google errors from server errors


        log.debug('Fetching google doc and schema');
        var googleContentDeferred = googledrive.fetchGoogleDoc(document.name, document.googleDocContentId);
        var googleSchemaDeferred = googledrive.fetchGoogleDoc(schema.name, schema.googleDocSchemaId);

        /**
         *
         */
        q.all([googleContentDeferred, googleSchemaDeferred]).then(
          function success(responseBodies){
            log.debug('          ---> Creating Response');

            try{

              var deserialisedContent = JSON.parse(responseBodies[0]);
              var deserialisedSchema = JSON.parse(responseBodies[1]);
              var documentObject = document.toObject();
              documentObject.content = deserialisedContent;
              documentObject.schema = deserialisedSchema;

              log.debug('          ---> 200 RESPONSE to client' + '\n');
              res.status(200).json(documentObject);

            }
            catch(error){
              log.error(error);
              res.send(500);
            }


          },
          function error(error){
            log.error(error);
            res.send(500);
          });


        //TODO we need to store the content in our own database using the User id as a key
        //      if the document is not saved we can keep the edit for as long as it doesn't get updated by someone else
        //      if the document is updated then we need to only allow the user to view their old edits and perhaps copy them
        //      somewhere else

        //TODO we need to lock (active) the current copy so other users are not able to edit it at the same time


      },
      function error(error){
        log.error(error);
        res.send(500);
      }
    );


  });
};

/**
 * Creates a new document in the DB.
 *
 * @param req
 * @param res
 */
exports.create = function(req, res) {
  Document.create(req.body, function(err, document) {
    if(err) { return handleError(res, err); }
    return res.json(201, document);
  });
};

/**
 * Updates an existing document in the DB.
 */
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }

  //TODO need to also update the document on google docs
  log.debug('Updating document', req.body._id);

  if(req.body && req.body.content){

    var googleContentUpdateDeferred = googledrive.updateDocument(req, req.body.googleDocContentId, req.body.content);

    googleContentUpdateDeferred.then(
      function success(){

        //only want to save the document to the db if our google request is successful
        Document.findById(req.params.id, function (err, document) {
          if (err) { return handleError(res, err); }
          if(!document) { return res.send(404); }
          var updated = _.merge(document, req.body);
          updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.json(200, document);
          });
        });

      },
      function error(){
        log.error('Failed to update google doc content');
        res.send(500);
    });



  }
  else{
    //TODO is it mandatory to update a document with content?
    //      should separate documents meta data from content
    log.error('Content not passed while updating document');
    res.send(500);
  }

};

/**
 * Deletes a document from the DB.
 *
 * @param req
 * @param res
 */
exports.destroy = function(req, res) {
  Document.findById(req.params.id, function (err, document) {
    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    document.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
