(function() {

  'use strict';


  var q = require('q');

  var config = require('../../config/environment');
  var https = require('follow-redirects').https;
  var Log = require('log');
  var log = new Log('http.service');


  /**
   *
   * @param httpOptions
   * @returns {*}
   */
  exports.https = function(httpOptions){

    httpOptions = httpOptions || {};

    var deferred = q.defer();

    httpOptions.name = httpOptions.name || '';
    if(httpOptions.agent === undefined){ httpOptions.agent = false; }

    if(httpOptions.token){
      //Authorization: Bearer {your access token}
      httpOptions.headers = httpOptions.headers || {};
      httpOptions.headers.Authorization = 'Bearer ' + httpOptions.token;
      delete httpOptions.token;
    }

    //validate
    if(httpOptions.host !== undefined && httpOptions.path !== undefined){

      console.log('REQUEST : ' + httpOptions.name + '    url: ' + httpOptions.host + httpOptions.path);

      var request = https.get(httpOptions, function(response) {

        if (response.statusCode >= 200 && response.statusCode < 300) {
          console.log('          ---> ' + httpOptions.name + ' 200 response = ' + response.statusCode);

          // Buffer the body entirely for processing as a whole.
          var bodyChunks = [];
          response.on('data', function (chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
          }).on('end', function () {

            var content = '';
            try {
              content = Buffer.concat(bodyChunks);
              console.log('          ---> ' + httpOptions.name + '   CONTENT found - type: ' + typeof content);

              deferred.resolve(content);

            }
            catch (error) {
              console.log('    ---> ' + httpOptions.name + '   Error parsing response for document: ' + httpOptions.name);
              console.log('         ' + httpOptions.name + '   CONTENT: ' + content);
              console.log('         ' + httpOptions.name + '   URL: ' + httpOptions.host + httpOptions.path);
              console.log(error);

              deferred.reject(500);
            }

          }).on('error', function (error) {
            console.log('        ---> ' + httpOptions.name + '   ERROR https.get error: ' + error);
            deferred.reject(500);
          });

        }
        else {
          console.log('          ---> ' + httpOptions.name + '   ERROR Non 200 response = ' + response.statusCode);
          deferred.reject(response.statusCode);
        }

      });

      request.setTimeout(10000, function (error) {
        console.log('        ---> ' + httpOptions.name + '   https timeout: ' + error);
        deferred.reject(408);
      });

      request.on('error', function (error) {
        console.log('        ---> ' + httpOptions.name + '   ERROR https.get error: ' + error);
        deferred.reject(500);
      });


    }
    else {
      log.error('invalid options passed to http.service https', httpOptions);
      deferred.reject(400);
    }




    return deferred.promise;
  };


})();
