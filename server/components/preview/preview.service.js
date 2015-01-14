(function() {

  'use strict';


  var q = require('q');

  var config = require('../../config/environment');
  var https = require('follow-redirects').https;
  var http = require('http');

  var Log = require('log');
  var log = new Log('preview.service');


  /**
   *
   * @param httpOptions
   * @returns {*}
   */
  exports.getPreview = function(environment, googleDocId){

    //first we need to attempt to update the local sites content (force it to refetch from google)
    var refreshDeferred = q.defer();
    var previewDeferred = q.defer();

    if(environment && googleDocId) {

      var options = {
        host: config.localSite,
        port: config.localSitePort,
        path: '/api/forcecontentupdate/' + environment + '/' + googleDocId,
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

          previewDeferred.resolve();

        },
        function error(status) {
          previewDeferred.reject(status);
        });

    }
    else{
      log.error('invalid params', googleDocId, environment);
      previewDeferred.reject(400);
    }


    return previewDeferred.promise;
  };


})();
