'use strict';

var _ = require('lodash');
var q = require('q');
var Document = require('./document.model');
var Schema = require('./../schema/schema.model');
var googledrive = require('../../googledrive/googledrive.service');
var preview = require('../../components/preview/preview.service');
var https = require('follow-redirects').https;
var config = require('../../config/environment');
var Log = require('log');
var log = new Log('document.controller');


/**
 * Get list of documents
 *
 * @param req
 * @param res
 */
exports.index = function getDocuments(req, res) {
  Document.find(function (err, documents) {
    if (err) { return handleError(res, err); }
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

  Document.findById(req.params.id, function (err, document) {

    if (err) {
      log.error('error finding document', err);
      handleError(res, err);
    }
    else if (!document) {
      log.error('error finding document', 404);
      res.send(404);
    }
    else {

      preview.getPreview(req.params.id, req.params.env, req.params.isPreviewPageReload).then(
        function success() {

          req.headers.host = req.headers.host || 'localhost';

          var url;
          var clientHost = req.headers.host.split(':')[0];

          log.debug('successful get preview document', clientHost, config.env);

          //if the request is coming from an ip address hostname and we are in a development environment serve up a different url
          var ipPattern = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
          if(ipPattern.test(clientHost) && config.env.indexOf('dev') !== -1){
            log.debug('is ip req host');
            url = config.localSiteProtocol + '://' + clientHost + ':' + config.localSitePort + '/' + (document.previewPath || '');
          }
          else{
            url = config.localSiteProtocol + '://' + config.localSite + ':' + config.localSitePort + '/' + (document.previewPath || '');
          }

          res.status(200).json({ url: url });

        },
        function error(statusCode) {

          if (typeof statusCode !== "number") {
            statusCode = 500;
          }

          log.error('Failed to get document preview', statusCode);
          res.send(statusCode);

        });
    }
  });

};


/**
 * Get a single document
 *
 * @param req
 * @param res
 */
exports.show = function(req, res) {

  if(req && req.params && req.params.id) {

    var schemaDeferred = q.defer();

    Document.findById(req.params.id, function (err, document) {

      if (err) {
        return handleError(res, err);
      }
      if (!document) {
        return res.send(404);
      }

      //TODO validate that it is the same user -> require socket client id ... If the document is already being edited we need to deny this request
      //if(document.lockedBy !== undefined){
      //  return res.send(423);
      //}

      log.debug('Document: ' + JSON.stringify(document));
      log.debug('Schema id: ' + document.schemaId);


      //Get the documents schema
      Schema.findById(document.schemaId, function (err, schema) {
        if(err) { schemaDeferred.reject(); }
        log.debug('Schema found: ' + JSON.stringify(schema));
        schemaDeferred.resolve(schema);
      });

      schemaDeferred.promise.then(
        function success(schema) {

          log.debug('Fetching google doc and schema');
          var googleContentDeferred = googledrive.fetchGoogleDoc(document.name, document.devContentGoogleDocId);
          var googleSchemaDeferred = googledrive.fetchGoogleDoc(schema.name, schema.googleDocSchemaId);

          /**
           *
           */
          q.all([googleContentDeferred, googleSchemaDeferred]).then(
            function success(responseBodies) {
              log.debug('          ---> Creating Response');

              try {

                var deserialisedContent = JSON.parse(responseBodies[0]);
                var deserialisedSchema = JSON.parse(responseBodies[1]);
                var documentObject = document.toObject();

                delete documentObject.previewContentCache;
                delete documentObject.currentPreviewContentCache;

                documentObject.content = deserialisedContent;
                documentObject.schema = deserialisedSchema;

                log.debug('          ---> 200 RESPONSE to client' + '\n');
                res.status(200).json(documentObject);
              }
              catch (jsonParseError) {
                log.error(jsonParseError);
                res.send(500);
              }


            },
            function error(contentFetchError) {
              log.error('failed to get document', arguments);
              log.error(contentFetchError);
              res.send(contentFetchError);
            });

        },
        function error(getSchemaObjectError) {
          log.error(getSchemaObjectError);
          res.send(500);
        }
      );


    });
  }
  else {
    log.error('invalid params to get document');
    res.send(400);
  }

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
 */
exports.lockDocument = function(docId, key, username){

  var deferred = q.defer();

  log.debug('Locking document', docId);

  Document.findById(docId, function (err, document) {
    if (err) {
      log.error('failed to find document to unlock', err);
      deferred.reject(err);

    }
    else if( ! document) {
      log.error('failed to find document to unlock');
      deferred.reject(err);
    }
    else if(document.lockedKey){
      log.error('document already locked with key', document.lockedKey);
      deferred.reject();
    }
    else{
      document.lockedKey = key;
      document.lockedBy = username;
      document.save(function (err) {
        if (err) {
          log.error('failed to update document ', err);
          deferred.reject(err);
        }
        else{
          log.debug('successfully locked document', key);
          deferred.resolve();
        }

      });
    }

  });

  return deferred.promise;
};

/**
 * unlock a document by id
 * TODO this should be a function on the document
 *
 * @param docId
 */
exports.unlockById = function(docId){

  var deferred = q.defer();

  Document.findById(docId, function (err, document) {
    if (err) {
      log.error('failed to find document to unlock', err);
      deferred.reject();
    }
    else if(!document) {
      log.error('failed to find document to unlock');
      deferred.reject();
    }
    else{
      document.lockedKey = undefined;
      document.lockedBy = undefined;
      document.save(function (err) {
        if (err) {
          log.error('failed to update document ', err);
          deferred.reject();
        }
        else{
          deferred.resolve();
        }
      });
    }

  });

  return deferred.promise;
};


/**
 *
 * get the history list of a document
 *
 */
exports.getHistory = function(req, res){

  log.debug('Get Document history');

  if(req && req.params && req.params.id) {

    var googleHistoryDeferred = googledrive.getDocumentHistory(req, req.params.id);

    googleHistoryDeferred.then(
      function success(documentHistory) {

        try {
          if (typeof documentHistory === 'string') {
            documentHistory = JSON.parse(documentHistory);
          }

          res.json(200, documentHistory);
        }
        catch(error){
          log.error('error parsing document history');
          res.send(500);
        }

      },
      function error(statusCode) {

        if(typeof statusCode !== "number"){
          statusCode = 500;
        }

        log.error('Failed to get google doc history', statusCode);
        res.send(statusCode);
      });
  }
  else {
    log.error('invalid params passed to document history');
    res.send(400);
  }

};


/**
 *
 * get the history content of a document
 *
 */
exports.getHistoryContent = function(req, res){

  log.debug('Get Document history content');

  if(req && req.params && req.params.id && req.params.historyId) {

    var googleContentUpdateDeferred = googledrive.getDocumentHistoryContent(req, req.params.id, req.params.historyId);

    googleContentUpdateDeferred.then(
      function success(documentHistoryContent) {

        try {
          var deserialisedContent = JSON.parse(documentHistoryContent);
          log.debug('          ---> 200 RESPONSE to get history content ' + '\n');
          res.json(200, deserialisedContent);
        }
        catch(error){
          log.error('error parsing document history content', error);
          res.send(500);
        }

      },
      function error(statusCode) {

        if(typeof statusCode !== "number"){
          statusCode = 500;
        }

        log.error('Failed to get google doc history content', statusCode);
        res.send(statusCode);
      });
  }
  else {
    log.error('invalid params passed to document history content');
    res.send(400);
  }

};



/**
 * Updates an existing document in the DB and google docs
 *
 * TODO this should be using the devContentGoogleDocId from the db rather than the request
 *
 */
exports.update = function(req, res) {

  log.debug('Updating document', req.body._id);

  if(req.body._id) { delete req.body._id; }

  //get user from the session -> helper in user

  if(req.body && req.body.content){

    var googleContentUpdateDeferred = googledrive.updateDocument(req, req.params.id, req.body.devContentGoogleDocId, req.body.content, 'dev');

    googleContentUpdateDeferred.then(
      function success(){

        log.debug('succesfully updated google doc document -> updating local info');
        //only want to save the document to the db if our google request is successful
        Document.findById(req.params.id, function (err, document) {
          if (err) { return handleError(res, err); }
          if(!document) { return res.send(404); }

          delete req.body.devContentCache;
          delete req.body.liveContentCache;
          delete req.body.previewContentCache;
          delete req.body.currentPreviewContentCache;

          var updated = _.merge(document, req.body);
          updated.save(function (err) {
            if (err) { return handleError(res, err); }

            delete document.previewContentCache;
            delete document.currentPreviewContentCache;

            return res.json(200, document);
          });
        });

      },
      function error(statusCode){

        if(typeof statusCode !== "number"){
          statusCode = 500;
        }

        log.error('Failed to update google doc content', statusCode);
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
 * Update a preview content
 *
 * @param req
 * @param res
 */
exports.updatePreviewContent = function(req, res){

  log.debug('Updating preview content');

  if(req.params && req.params.id) {

    Document.findById(req.params.id, function (err, document) {
      if (err) {
        handleError(res, err);
      }
      else if (!document) {
        res.send(404);
      }
      else{

        //let our sockets know that we are updating preview content
        preview.updatingPreviewContentEvent(req.params.id, 'preview');


        var googleContentUpdateDeferred = googledrive.updateDocument(req, req.params.id, document.previewContentGoogleDocId, req.body, 'preview');
        googleContentUpdateDeferred.then(
          function success(){

            log.debug('succesfully updated google preview document');
            res.send(200);

          },
          function error(statusCode){

            preview.updatingPreviewContentErrorEvent(req.params.id, 'preview');

            if(typeof statusCode !== "number"){
              statusCode = 500;
            }

            log.error('Failed to update google doc content', statusCode);
            res.send(statusCode);
          });

      }

    });
  }
  else {
    log.error('invalid params to update preview content');
    res.send(400);
  }


};


/**
 * Publishes a document
 *
 */
exports.publish = function(req, res) {

  log.debug('Publishing document', req.body._id);

  if(req.body._id) { delete req.body._id; }

  //get user from the session -> helper in user
  if(req.body && req.body.content && req.body.liveContentGoogleDocId){

    googledrive.updateDocument(req, req.params.id, req.body.liveContentGoogleDocId, req.body.content, 'live').then(
      function success(){
        log.debug('succesfully published google doc document -> updating local info');
        //dont want to update the document in our db on an publish request
        Document.findById(req.params.id, function (err, document) {
          if (err) { return handleError(res, err); }
          if(!document) { return res.send(404); }

          delete document.previewContentCache;
          delete document.currentPreviewContentCache;

          return res.json(200, document);
        });

      },
      function error(statusCode){
        if(typeof statusCode !== "number"){
          statusCode = 500;
        }
        log.error('Failed to update google doc content', statusCode);
        res.send(statusCode);
      });

  }
  else {
    log.error('Content not passed while updating document');
    res.send(400);
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

/**
 *
 * @param res
 * @param err
 * @returns {*}
 */
function handleError(res, err) {
  return res.send(500, err);
}
