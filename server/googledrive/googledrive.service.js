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


  //nasty - google does not have a method for getting a file revision


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

  var _deferredCommentCache = {};


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

        Document.find(function (err, documents) {
          if(err){
            log.error('Google drive init error documents', err);
            return;
          }

          log.debug('Google drive init : found documents');

          for(i = 0; i < documents.length; i++){
            var currentDocument = documents[i];

            cacheGoogleDoc('init fetch live doc -> ' + currentDocument.name, currentDocument.liveContentGoogleDocId, currentDocument._id);
            cacheGoogleDoc('init fetch dev doc  -> ' + currentDocument.name, currentDocument.devContentGoogleDocId, currentDocument._id);
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
  function cacheGoogleDoc(name, googleId, dbId, options){

    var deferred = q.defer();
    var fetchDeferred = fetchGoogleDoc(name, googleId, options);

    fetchDeferred.then(
      function success(fetchResponse){

        deferred.resolve(fetchResponse);

        //var subscribeDeferred = subscribeGoogleDoc(name, googleId, dbId, options);

        //subscribeDeferred.then(
        //  function success(){
        //    deferred.resolve();
        //  },
        //  function error(){
        //    deferred.reject();
        //});
      },
      function error(){
        deferred.reject();
      });

    return deferred.promise;
  }


  /**
   * Attaches the user object to the request if authenticated
   *
   * //TODO we need to ensure the returned documents are inline with the User role
   *
   * Otherwise returns 403
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

    return _deferredCache[deferredId];
  }


  /**
   *
   *
   *      AUTHENTICATED
   *
   *
   */






  /**
   *
   */
  function getDocumentHistory(req, googleDocContentId, options){

    var deferredId = 'cache_' + googleDocContentId;
    var currentUserDeferred = User.getUserFromRequest(req);

    if( ! _deferredHistoryCache[deferredId] || (options && options.force)) {

      var googleHistoryDeferred = _deferredHistoryCache[deferredId] = q.defer();

      currentUserDeferred.then(
        function success(user) {

          log.debug('authing with accessToken', user.accessToken);

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
            oauth2Client.setCredentials({ access_token: user.accessToken });
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
          log.error('could not get user for google history document');
          googleHistoryDeferred.reject(401);
        });

    }

    return _deferredHistoryCache[deferredId].promise;
  }

  /**
   *
   */
  function getDocumentHistoryContent(req, googleDocContentId, googleDocHistoryId, options){

    var deferredId = 'cache_' + googleDocContentId + '_' + googleDocHistoryId;
    var currentUserDeferred = User.getUserFromRequest(req);


    var metadataDeferred = q.defer();
    var contentDeferred = q.defer();


    if( ! _deferredHistoryContentCache[deferredId] || (options && options.force)) {

      var googleHistoryContentDeferred = _deferredHistoryContentCache[deferredId] = q.defer();

      currentUserDeferred.then(
        function success(user) {

          log.debug('authing with accessToken', user.accessToken);

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
            oauth2Client.setCredentials({ access_token: user.accessToken });
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
                token: user.accessToken

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
        function error(userError){
          log.error('could not get user for google history content document');
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

    return _deferredHistoryContentCache[deferredId].promise;
  }



  /**
   *
   * @param googleDocContentId
   * @param content
   * @param googleApiKey
   */
  function updateDocument(req, googleDocContentId, content) {

    var currentUserDeferred = User.getUserFromRequest(req);
    var googleContentDeferred = q.defer();

    var deferredId = 'cache_' + googleDocContentId;

    //remove our cached copy of the promises
    delete _deferredCache[deferredId];
    delete _deferredHistoryCache[deferredId];

    log.debug('Updating document - current user:', req.user.name);

    currentUserDeferred.then(
      function success(user) {

        log.debug('authing with accessToken', user.accessToken);

        function googleCallback(error, body, googleResponse) {

          if (googleResponse && googleResponse.statusCode >= 200 && googleResponse.statusCode < 300) {
            log.debug('successful response');
            googleContentDeferred.resolve();
          }
          else {
            googleContentDeferred.reject(googleResponse.statusCode);
          }
        }

        try {
          var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
          oauth2Client.setCredentials({ access_token: user.accessToken });
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
        log.error('could not get user for google update document');
        googleContentDeferred.reject(401);
      });


    return googleContentDeferred.promise;
  }





  /**
   *
   * @param name
   * @param id
   * @param options
   */
  function subscribeGoogleDoc(name, googleId, dbId, options) {

    var deferred = q.defer();


    log.debug('subscribeGoogleDoc', name);


    function googleCallback(error, body, googleResponse){

      if (googleResponse && googleResponse.statusCode >= 200 && googleResponse.statusCode < 300) {
        log.debug('successful subscribe/watch response');
        deferred.resolve();
      }
      else {
        log.error('error subscribe/watch response', error);
        deferred.reject();
      }

    }


    try {


      //var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
      //
      //oauth2Client.setCredentials({
      //  access_token: user.accessToken
      //});

      var drive = google.drive({version: 'v2', apiKey: config.google.apiKey});


      drive.files.watch({
        fileId: googleId,
        id: dbId,//string, A UUID or similar unique string that identifies this channel.
        //expiration:  '', //long, Date and time of notification channel expiration, expressed as a Unix timestamp, in milliseconds. Optional.
        //token:  '', //string, An arbitrary string delivered to the target address with each notification delivered over this channel. Optional.
        type: 'web_hook', //string, The type of delivery mechanism used for this channel. The only option is web_hook.
        address: config.domain //string The address where notifications are delivered for this channel.
      }, googleCallback);
    }
    catch(error){
      log.error('failed to watch google doc', error);
    }


    //TODO subscribe for updates
    //TODO create subscription service api

    return deferred.promise;

  }

  /**
   * TODO create endpoint for service api to call back
   */
  function subscribeChangeEvent(){


  }




  exports.cacheGoogleDoc = cacheGoogleDoc;
  //exports.subscribeChangeEvent = subscribeChangeEvent;
  exports.updateDocument = updateDocument;
  exports.fetchGoogleDoc = fetchGoogleDoc;
  exports.getDocumentHistory = getDocumentHistory;
  exports.getDocumentHistoryContent = getDocumentHistoryContent;


})();
