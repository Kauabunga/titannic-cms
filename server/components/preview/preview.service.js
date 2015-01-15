(function() {

  'use strict';


  var q = require('q');

  var config = require('../../config/environment');
  var https = require('follow-redirects').https;
  var http = require('http');

  var Document = require('../../api/document/document.model');

  var Log = require('log');
  var log = new Log('preview.service');




  var _previewDeferredCache = {};


  /**
   *
   * @param environment
   * @param document
   * @returns {*}
   */
  function getGoogleDocId(environment, document){

    var envGoogleDocId;
    switch (environment) {
      case 'preview':
        envGoogleDocId = document.previewContentGoogleDocId;
        break;
      case 'live':
        envGoogleDocId = document.liveContentGoogleDocId;
        break;
      case 'dev':
        envGoogleDocId = document.devContentGoogleDocId;
        break;
      default:
        envGoogleDocId = document.devContentGoogleDocId;
        break;
    }

    return envGoogleDocId;
  }


  /**
   *
   * @param document
   */
  function getEnvDocumentContentCache(environment, document){
    return document[environment + 'ContentCache'];
  }





  /**
   *
   *
   * @param httpOptions
   * @returns {*}
   */
  exports.getPreview = function(documentId, environment, options){

    //first we need to attempt to update the local sites content (force it to refetch from google)
    var refreshDeferred = q.defer();
    var previewDeferred = q.defer();

    if(environment && documentId) {

      Document.findById(documentId, function (err, document) {

        if (err) {
          log.error('error finding document', err);
          previewDeferred.reject(500);
        }
        else if (!document) {
          log.error('error finding document', 404);
          previewDeferred.reject(404);
        }
        else {


          //if the preview content is identical to the environment content then resolve immediately
          var envDocumentCache = getEnvDocumentContentCache(environment, document);
          var previewDocumentCache = document.currentPreviewContentCache;


          if(envDocumentCache === undefined){
            //TODO we should go and get it....
          }



          if(envDocumentCache && envDocumentCache !== '' && envDocumentCache === previewDocumentCache){
            log.debug('resolving preview url from cache as preview content is equal to ', environment);
            previewDeferred.resolve();
          }
          else {

            //get the google doc id for the targeted environment
            var envGoogleDocId = getGoogleDocId(environment, document);

            var options = {
              host: config.localSite,
              port: config.localSitePort,
              path: '/api/forcecontentupdate/' + environment + '/' + envGoogleDocId,
              agent: false
            };

            log.debug('preview query with options:', options);

            var httpClient = (config.localSiteProtocol.indexOf('https') !== -1) ? https : http;
            var request = httpClient.get(options, function (res) {
              log.debug('Response from force update', res.statusCode);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                refreshDeferred.resolve(res);
              }
              else {
                refreshDeferred.reject(res.statusCode);
              }
            });

            /**
             *
             */
            request.setTimeout(10000, function (error) {
              log.error('failed to get content refresh timeout', error);
              refreshDeferred.reject(408);
            });

            /**
             *
             */
            request.on('error', function (error) {
              log.error('failed to get content refresh', error);
              refreshDeferred.reject(500);
            });


            /**
             * With a successful refresh we now need to build the link that will point to the content
             */
            refreshDeferred.promise.then(
              function success() {

                //TODO send a socket event back to the client for it to refresh any preview pages that it is targeting
                //TODO send a socket event back to the client for it to refresh any preview pages that it is targeting
                //TODO send a socket event back to the client for it to refresh any preview pages that it is targeting
                //TODO send a socket event back to the client for it to refresh any preview pages that it is targeting


                try {

                  //update preview document cache content
                  document.currentPreviewContentCache = getEnvDocumentContentCache(environment, document);

                  if(typeof document.currentPreviewContentCache !== 'string'){
                    document.currentPreviewContentCache = JSON.stringify(document.currentPreviewContentCache);
                  }

                  document.save(function (err) {
                    if (err) {
                      log.error('error updating document preview cache', err);
                      previewDeferred.reject(500);
                    }
                    else {
                      log.debug('successfully updated document preview cache', document);
                      previewDeferred.resolve();
                    }
                  });

                }
                catch(error){
                  log.error('error trying to update preview cache content', error);
                  previewDeferred.reject(500);
                }

              },
              function error(status) {
                previewDeferred.reject(status);
              });
          }

        }

      });


    }
    else{
      log.error('invalid params', documentId, environment);
      previewDeferred.reject(400);
    }


    return previewDeferred.promise;
  };


})();
