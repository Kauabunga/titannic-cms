'use strict';

var _ = require('lodash');
var q = require('q');
var Document = require('./document.model');
var Schema = require('./../schema/schema.model');
var googledrive = require('../../googledrive/googledrive.service');

var https = require('follow-redirects').https;
var http = require('http');

var config = require('../../config/environment');


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
 * Get a preview url for the document
 *
 * @param req
 * @param res
 */
exports.getPreview = function(req, res){

  //first we need to attempt to update the local sites content (force it to refetch from google)

  var httpClient = (config.localSiteProtocol.indexOf('https') !== -1) ? https : http;
  var refreshDeferred = q.defer();
  var previewDeferred = q.defer();

  var options = {
    host: config.localSite,
    port: config.localSitePort,
    //TODO make this configurable
    path: '/api/forcecontentupdate',
    agent: false
  };

  log.debug('preview query with options:', options);

  var request = httpClient.get(options, function(res){

    log.debug('Response from force update', res.statusCode);

    if(res.statusCode >= 200 && res.statusCode < 300){
      refreshDeferred.resolve(res);
    }
    else{
      refreshDeferred.reject(res);
    }
  });

  /**
   *
   */
  request.setTimeout(10000, function(error){
    log.error('failed to get content refresh timeout', error);
    refreshDeferred.reject(error);
  });

  /**
   *
   */
  request.on('error', function(error){
    log.error('failed to get content refresh', error);
    refreshDeferred.reject(error);
  });



  /**
   * With a successful refresh we now need to build the link that will point to the content
   */
  refreshDeferred.promise.then(
    function success(){


      Document.findById(req.params.id, function (err, document) {

        if (err) {
          previewDeferred.reject();
          handleError(res, err);
        }
        else if (!document) {
          previewDeferred.reject();
          res.send(404);
        }
        else{
          previewDeferred.resolve();

          var responseBody = {
            url: config.localSiteProtocol + '://' + config.localSite + ':' + config.localSitePort + '/' + (document.previewPath || '')
          };

          res.status(200).json(responseBody);
        }

      });

    },
    function error(){
      previewDeferred.reject();
      res.send(500);
    });


  return previewDeferred.promise;

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
        var googleContentDeferred = googledrive.fetchGoogleDoc(document.name, document.devContentGoogleDocId);
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
            catch(jsonParseError){
              log.error(jsonParseError);
              res.send(500);
            }


          },
          function error(contentFetchError){
            log.error(contentFetchError);
            res.send(500);
          });


        //TODO we need to store the content in our own database using the User id as a key
        //      if the document is not saved we can keep the edit for as long as it doesn't get updated by someone else
        //      if the document is updated then we need to only allow the user to view their old edits and perhaps copy them
        //      somewhere else

        //TODO we need to lock (active) the current copy so other users are not able to edit it at the same time


      },
      function error(getSchemaObjectError){
        log.error(getSchemaObjectError);
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
 *
 * @param docId
 */
exports.unlockById = function(docId){
  Document.findById(docId, function (err, document) {
    if (err) {
      log.error('failed to find document to unlock', err);
      return;
    }
    if(!document) {
      log.error('failed to find document to unlock');
      return;
    }
    document.active = false;
    document.save(function (err) {
      if (err) {
        log.error('failed to update document ', err);
      }
      return;
    });
  });
};

/**
 * Updates an existing document in the DB.
 */
exports.update = function(req, res) {

  log.debug('Updating document', req.body._id);

  if(req.body._id) { delete req.body._id; }

  //get user from the session -> helper in user

  if(req.body && req.body.content){

    var googleContentUpdateDeferred = googledrive.updateDocument(req, req.body.devContentGoogleDocId, req.body.content);

    googleContentUpdateDeferred.then(
      function success(){

        log.debug('succesfully updated google doc document -> updating local info');
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
      function error(updateError, statusCode){
        log.error('Failed to update google doc content', updateError, statusCode);
        res.send(statusCode);
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
