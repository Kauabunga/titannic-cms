(function() {

  'use strict';


  var q = require('q');
  var mongoose = require('mongoose');
  var config = require('../config/environment');
  var https = require('follow-redirects').https;
  var Log = require('log');
  var log = new Log('googledrive.service');

  var User = require('../api/user/user.controller');
  var Document = require('../api/document/document.model');
  var Schema = require('../api/schema/schema.model');

  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;


  /**
   *
   * Cache all get defers
   *
   * @type {{}}
   * @private
   */
  var _deferredCache = {};


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
      function success(){
        var subscribeDeferred = subscribeGoogleDoc(name, googleId, dbId, options);

        subscribeDeferred.then(
          function success(){
            deferred.resolve();
          },
          function error(){
            deferred.reject();
        });
      },
      function error(){
        deferred.reject();
      });

    return deferred.promise;
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


  /**
   * Attaches the user object to the request if authenticated
   *
   * //TODO we need to ensure the returned documents are inline with the User role
   *
   * Otherwise returns 403
   */
  function fetchGoogleDoc(name, id, options) {

    if( ! _deferredCache['cache-' + id] || (options && options.force)){

      _deferredCache['cache-' + id] = q.defer();

      var httpOptions = {
        name: name || '',
        host: 'docs.google.com',
        path: '/uc?id=' + id + '&export=download' + '&random=' + (Math.random() * 100000),
        agent: false
      };

      console.log('REQUEST : ' + httpOptions.name + '    url: ' + httpOptions.host + httpOptions.path);

      //TODO or if the request was rejected
      var googleContentRequest = https.get(httpOptions, function googleResponse(googleResponse) {

        if (googleResponse.statusCode >= 200 && googleResponse.statusCode < 300) {
          console.log('          ---> ' + httpOptions.name + ' 200 response = ' + googleResponse.statusCode);

          // Buffer the body entirely for processing as a whole.
          var bodyChunks = [];
          googleResponse.on('data', function (chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
          }).on('end', function () {

            var content = '';

            try {
              content = Buffer.concat(bodyChunks);
              console.log('          ---> ' + httpOptions.name + '   CONTENT found ');

              _deferredCache['cache-' + id].resolve(content);

            }
            catch (error) {
              _deferredCache['cache-' + id].reject(googleResponse);

              console.log('    ---> ' + httpOptions.name + '   Error parsing response for document: ' + httpOptions.name);
              console.log('         ' + httpOptions.name + '   CONTENT: ' + content);
              console.log('         ' + httpOptions.name + '   URL: ' + httpOptions.host + httpOptions.path);
              console.log(error);

            }

          }).on('error', function (error) {
            _deferredCache['cache-' + id].reject(googleResponse);
            console.log('        ---> ' + httpOptions.name + '   ERROR https.get error: ' + error);
          });

        }
        else {
          _deferredCache['cache-' + id].reject(googleResponse);
          console.log('          ---> ' + httpOptions.name + '   ERROR Non 200 response = ' + googleResponse.statusCode);
        }

      });

      googleContentRequest.setTimeout(10000, function (error) {
        console.log('        ---> ' + httpOptions.name + '   Google doc timeout: ' + error);
        _deferredCache['cache-' + id].reject(error);
      });

      googleContentRequest.on('error', function (error) {
        console.log('        ---> ' + options.name + '   ERROR https.get error: ' + error);
        _deferredCache['cache-' + id].reject(error);
      });

    }





    return _deferredCache['cache-' + id].promise;

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


    //remove our cached copy of the promise
    delete _deferredCache['cache-' + googleDocContentId];

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
            googleContentDeferred.reject();
          }
        }

        try {
          var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);

          oauth2Client.setCredentials({
            access_token: user.accessToken
          });

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
          googleContentDeferred.reject();
        }

      }, function error() {

        googleContentDeferred.reject();
      });


    return googleContentDeferred.promise;
  }


  exports.cacheGoogleDoc = cacheGoogleDoc;
  //exports.subscribeChangeEvent = subscribeChangeEvent;
  exports.updateDocument = updateDocument;
  exports.fetchGoogleDoc = fetchGoogleDoc;


})();
