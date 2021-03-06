(function() {

  'use strict';


  var q = require('q');
  var mongoose = require('mongoose');
  var config = require('../config/environment');
  var url = require('url');
  var Log = require('log');
  var log = new Log('googledrive.service');
  var User = require('../api/user/user.controller');
  var Document = require('../api/document/document.model');
  var Schema = require('../api/schema/schema.model');
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;
  var httpService = require('../components/http/http.service');
  var googleAuthService = require('./auth/googleauth.service');



  /**
   *
   * Cache all get defers
   *
   * @type {{}}
   * @private
   */
  var _deferredCache = {};
  var _deferredHistoryCache = {};
  var _deferredHistoryContentCache = {};

  /**
   *
   */
  (function init(){

    //Want to fire off initial requests for documents and cache them.
    //Also, once cached, register callback to google to get edit/update events -> Document socket + (store dev/live in database)
    var i;

      //TODO we want to wrap this in a promise so that we can ensure this is completed before giving any google docs back to the client that wont get cached/watched

      //TODO how do we get these requests to work without setTieout - process.nextTick()?
      setTimeout(function(){


        googleAuthService.getAccessToken();

        Document.find(function (err, documents) {
          if(err){
            log.error('Google drive init error documents', err);
            return;
          }

          log.debug('Google drive init : found documents');

          for(i = 0; i < documents.length; i++){
            var currentDocument = documents[i];

            cacheGoogleDoc('init fetch live doc -> ' + currentDocument.name, currentDocument.liveContentGoogleDocId, currentDocument, 'live');
            cacheGoogleDoc('init fetch dev doc  -> ' + currentDocument.name, currentDocument.devContentGoogleDocId, currentDocument, 'dev');



          }
        });

        Schema.find(function (err, schemas) {
          if(err){
            log.error('Google drive init error schemas', err);
            return;
          }

          log.debug('Google drive init : found schemas');
          for(i = 0; i < schemas.length; i++){
            var currentSchema = schemas[i];

            cacheGoogleDoc('init fetch schema -> ' + currentSchema.name, currentSchema.googleDocSchemaId, currentSchema._id);

          }
        });
      }, 2000);


  })();


  /**
   *
   * @param name
   * @param id
   * @param options
   */
  function cacheGoogleDoc(name, googleId, document, environment, options){

    var deferred = q.defer();
    var fetchDeferred = fetchGoogleDoc(name, googleId, options);

    fetchDeferred.then(
      function success(fetchResponse){

        deferred.resolve(fetchResponse);

        //only attempt to cache if there was a valid document passed to the function
        if(document && typeof document.save === 'function' && environment){

          //save the fetchResponse in the db - if it fails it is not the end of the world
          try {

            //TODO fix this junk in fetchGoogleDoc....
            var contentString = JSON.parse(fetchResponse);
            contentString = JSON.stringify(contentString);

            document[environment + 'ContentCache'] = contentString;
            document.save(function(err){
              if(err){
                log.error('Could not cache google doc content', err);
              }
              else{
                log.debug('successfully cached document google content for environment', environment);
              }
            });

          }
          catch(error){
            log.error('Could not cache google doc content', environment, error);
          }
        }

      },
      function error(){
        deferred.reject();
      });

    return deferred.promise;
  }


  /**
   * Attaches the user object to the request if authenticated
   *
   * Otherwise returns 403
   *
   * TODO this should return either a well formed json item or a json string
   *
   */
  function fetchGoogleDoc(name, id, options) {

    var deferredId = 'cache_' + id;
    if( ! _deferredCache[deferredId] || (options && options.force)){

      var httpOptions = {
        name: name || '',
        host: 'docs.google.com',
        path: '/uc?id=' + id + '&export=download' + '&random=' + (Math.random() * 100000),
        agent: false
      };
      _deferredCache[deferredId] = httpService.https(httpOptions);
    }

    _deferredCache[deferredId].then(null,
      function error(){
        //TODO we should be checking this at the start of the request?
        delete _deferredCache[deferredId];
      });

    return _deferredCache[deferredId];
  }

  /**
   *
   * @param req
   * @returns {*}
   * @private
   */
  function _getAccessToken(req, environment) {

    var deferred = q.defer();
    var currentUserDeferred = User.getUserFromRequest(req);

    currentUserDeferred.then(
      function success(user) {

        //If we are targeting the preview environment then always use our shared user
        if(user.provider === 'google' && environment !== 'preview'){
          log.debug('got token from google user', user.accessToken);
          deferred.resolve(user.accessToken);
        }
        else{
          //get the access token from our shared user

          var accessTokenDeferred = googleAuthService.getAccessToken();
          accessTokenDeferred.then(
            function success(token){
              log.debug('got token from shared google user', token);
              deferred.resolve(token);
            },
            function error(){
              deferred.reject();
            });

        }

      },
      function error() {

        deferred.reject();
      });


    return deferred.promise;
  }


  /**
   *
   */
  function getDocumentHistory(req, googleDocContentId, options){

    var deferredId = 'cache_' + googleDocContentId;

    var accessTokenDeferred = _getAccessToken(req);

    if( ! _deferredHistoryCache[deferredId] || (options && options.force)) {

      var googleHistoryDeferred = _deferredHistoryCache[deferredId] = q.defer();

      accessTokenDeferred.then(
        function success(token) {



          log.debug('authing with accessToken', token);

          function googleCallback(error, body, googleResponse) {

            if (googleResponse && googleResponse.statusCode >= 200 && googleResponse.statusCode < 300) {
              log.debug('successful get history response', googleResponse.statusCode);
              googleHistoryDeferred.resolve(body);
            }
            else{
              log.error('Get document history google error', error, googleResponse.statusCode);
              googleHistoryDeferred.reject(googleResponse.statusCode);
            }
          }

          try {
            var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
            oauth2Client.setCredentials({ access_token: token });
            var drive = google.drive({version: 'v2', auth: oauth2Client});

            drive.revisions.list({
              fileId: googleDocContentId
            }, googleCallback);

          }
          catch (error) {
            log.error('Error getting google doc history google doc', error);
            googleHistoryDeferred.reject(500);
          }

        },
        function error(){
          log.error('could not get token for google history document');
          googleHistoryDeferred.reject(401);
        });

    }

    _deferredHistoryCache[deferredId].promise.then(
      function success(){},
      function error(){
        delete _deferredHistoryCache[deferredId];
      });


    return _deferredHistoryCache[deferredId].promise;
  }

  /**
   *
   */
  function getDocumentHistoryContent(req, googleDocContentId, googleDocHistoryId, options){

    var deferredId = 'cache_' + googleDocContentId + '_' + googleDocHistoryId;

    var accessTokenDeferred = _getAccessToken(req);


    var metadataDeferred = q.defer();
    var contentDeferred = q.defer();


    if( ! _deferredHistoryContentCache[deferredId] || (options && options.force)) {

      var googleHistoryContentDeferred = _deferredHistoryContentCache[deferredId] = q.defer();

      accessTokenDeferred.then(
        function success(token) {


          log.debug('authing with accessToken', token);

          //get google meta data

          function googleCallback(error, body, googleResponse) {
            if (googleResponse && googleResponse.statusCode >= 200 && googleResponse.statusCode < 300) {
              log.debug('successful get history response body', body);
              metadataDeferred.resolve(body);
            }
            else {
              log.error('Get document history content google error', error, googleResponse.statusCode);
              metadataDeferred.reject(googleResponse.statusCode);
            }
          }

          try {
            var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
            oauth2Client.setCredentials({ access_token: token });
            var drive = google.drive({version: 'v2', auth: oauth2Client});

            drive.revisions.get({
              fileId: googleDocContentId,
              revisionId: googleDocHistoryId
            }, googleCallback);

          }
          catch (error) {
            log.error('Error getting google doc history content google doc', error);
            metadataDeferred.reject(500);
          }

          metadataDeferred.promise.then(
            function success(metaData){

              var parsedUrl = url.parse(metaData.downloadUrl);
              var httpsOptions = {
                name: 'historycontent' + googleDocHistoryId,
                host: parsedUrl.host || parsedUrl.hostname,
                path: parsedUrl.path,
                agent: false,
                token: token

              };

              var httpDeferred = httpService.https(httpsOptions);
              httpDeferred.then(
                function success(content){
                  contentDeferred.resolve(content);
                },
                function error(status){
                  contentDeferred.reject(status);
                });


            },
            function error(status){
              log.error('failed to get document history metadata');
              googleHistoryContentDeferred.reject(status);
            });

        },
        function error(){
          log.error('could not get token for google history content document');
          googleHistoryContentDeferred.reject(401);
        });


      /**
       *
       */
      contentDeferred.promise.then(
        function success(historyContent){

          log.debug('successful get history content', historyContent);

          googleHistoryContentDeferred.resolve(historyContent);
        },
        function error(status){
          log.debug('error get history content', status);
          googleHistoryContentDeferred.reject(status);
        });

    }


    _deferredHistoryContentCache[deferredId].promise.then(
      function success(){},
      function error(){
        delete _deferredHistoryCache[deferredId];
      });

    return _deferredHistoryContentCache[deferredId].promise;
  }



  /**
   *
   * @param googleDocContentId
   * @param content
   * @param googleApiKey
   */
  function updateDocument(req, documentId, googleDocContentId, content, environment) {

    log.debug('Updating document - current user:', req.user.name);

    var accessTokenDeferred = _getAccessToken(req, environment);
    var documentDeferred = q.defer();
    var googleContentDeferred = q.defer();
    var updateDeferred = q.defer();
    var deferredId = 'cache_' + googleDocContentId;

    var contentString = content;
    if(typeof contentString !== 'string'){
      contentString = JSON.stringify(contentString);
    }

    //cache the content in our document model
    Document.findById(documentId, function(err, document){

      if(err){
        log.error('error getting document in updateDocument', err);
        documentDeferred.reject(500);
      }
      else if(! document){
        log.error('error getting document in updateDocument', 404);
        documentDeferred.reject(404);
      }
      else{
        documentDeferred.resolve(document);
      }

    });

    /**
     *
     */
    documentDeferred.promise.then(
      function success(document){

        //if our current cache is identical then skip the update
        if(document[environment + 'ContentCache'] && document[environment + 'ContentCache'] === contentString) {
          log.debug('Content is identical - skipping update');

          //TODO touch document to update date meta etc..
          //TODO touch document to update date meta etc..
          //TODO touch document to update date meta etc..

          googleContentDeferred.resolve(false);
        }
        else {

          log.debug('Content is different - updating in google doc');

          //remove our cached copy of the promises
          delete _deferredCache[deferredId];
          delete _deferredHistoryCache[deferredId];


          accessTokenDeferred.then(
            function success(token) {

              log.debug('authing with accessToken', token);

              function googleCallback(error, body, googleResponse) {

                if (googleResponse && googleResponse.statusCode >= 200 && googleResponse.statusCode < 300) {
                  log.debug('successful response');

                  //send the document to be updated in the db
                  googleContentDeferred.resolve(document);
                }
                else {
                  googleContentDeferred.reject(googleResponse.statusCode);
                }
              }

              try {
                var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
                oauth2Client.setCredentials({ access_token: token });
                var drive = google.drive({version: 'v2', auth: oauth2Client});

                drive.files.update({
                  fileId: googleDocContentId,
                  media: {
                    mimeType: 'application/json',
                    body: JSON.stringify(content)
                  }
                }, googleCallback);

              }
              catch (error) {
                log.error('Error updating google doc', error);
                googleContentDeferred.reject(500);
              }

            }, function error() {
              log.error('could not get token for google update document');
              googleContentDeferred.reject(401);
            });
          }

      },
      function error(err){
        log.debug('failed ot get document', err);
        googleContentDeferred.reject(500);
      });


    googleContentDeferred.promise.then(
      function success(document){

        log.debug('successfully got document and google update');

        if(document) {

          try {
            document[environment + 'ContentCache'] = contentString;

            document.save(function (err) {
              if (err) {
                log.error('error updating document content');
                updateDeferred.reject(500);
              }
              else {
                log.debug('successfully updated document content cache for env', environment, document);
                updateDeferred.resolve();
              }
            });
          }
          catch (error) {
            log.error('error while trying to cache google update content', error);
            updateDeferred.reject(500);
          }
        }
        else{
          log.debug('document already updated');
          //we already have updated the document
          updateDeferred.resolve();
        }

      },
      function error(status){
        log.error('failed to update google content', status);
        if(typeof status !== 'number'){
          status = 500;
        }
        updateDeferred.reject(status);
      });

    return updateDeferred.promise;
  }


  exports.updateDocument = updateDocument;
  exports.fetchGoogleDoc = fetchGoogleDoc;
  exports.getDocumentHistory = getDocumentHistory;
  exports.getDocumentHistoryContent = getDocumentHistoryContent;


})();
