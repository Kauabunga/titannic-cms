'use strict';

var q = require('q');
var mongoose = require('mongoose');
var config = require('../config/environment');
var User = require('../api/user/user.model');
var https = require('follow-redirects').https;
var Log = require('log');
var log = new Log('googledrive.service');

var User = require('../api/user/user.controller');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;


/**
 *
 * @param googleDocContentId
 * @param content
 * @param googleApiKey
 */
function updateDocument(req, googleDocContentId, content){

  var currentUserDeferred = User.getUserFromRequest(req);
  var googleContentDeferred = q.defer();

  log.debug('Updating document - current user:', req.user);

  currentUserDeferred.then(
    function success(user){

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
      catch(error){
        log.error('Error updating google doc', error);
        googleContentDeferred.reject();
      }

  }, function error(){

      googleContentDeferred.reject();
  });




  return googleContentDeferred.promise;
}


/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function fetchGoogleDoc(name, id) {

  //TODO - should be using something like this with either the apiKey or OAuth
  //drive.files.get({
  //  fileId: '0B84YdCmz0nrQWjc5SzdDVEYwWXM',
  //  key: googleApiKey
  //}, googleCallback);


  var options = {
    name: name || '',
    host: 'docs.google.com',
    path: '/uc?id=' + id + '&export=download' + '&random=' + (Math.random() * 100000),
    agent: false
  };

  console.log('REQUEST : ' + options.name + '    url: ' + options.host + options.path);

  var googleDeferred = q.defer();

  var googleContentRequest = https.get(options, function googleResponse(googleResponse){

    if(googleResponse.statusCode >= 200 && googleResponse.statusCode < 300){
      console.log('          ---> ' + options.name + ' 200 response = ' + googleResponse.statusCode);

      // Buffer the body entirely for processing as a whole.
      var bodyChunks = [];
      googleResponse.on('data', function (chunk) {
        // You can process streamed parts here...
        bodyChunks.push(chunk);
      }).on('end', function () {

        var content = '';

        try {
          content = Buffer.concat(bodyChunks);
          console.log('          ---> ' + options.name + '   CONTENT found ');

          googleDeferred.resolve(content);

        }
        catch(error){
          googleDeferred.reject(googleResponse);

          console.log('    ---> ' + options.name + '   Error parsing response for document: ' + options.name);
          console.log('         ' + options.name + '   CONTENT: ' + content);
          console.log('         ' + options.name + '   URL: ' + options.host + options.path);
          console.log(error);

        }

      }).on('error', function(error){
        googleDeferred.reject(googleResponse);
        console.log('        ---> ' + options.name + '   ERROR https.get error: ' + error);
      });

    }
    else{
      googleDeferred.reject(googleResponse);
      console.log('          ---> ' + options.name + '   ERROR Non 200 response = ' + googleResponse.statusCode);
    }

  });

  /**
   *
   */
  googleContentRequest.setTimeout(10000, function(error){
    console.log('        ---> ' + options.name + '   Google doc timeout: ' + error);
    googleDeferred.reject(error);
  });

  /**
   *
   */
  googleContentRequest.on('error', function(error){
    console.log('        ---> ' + options.name + '   ERROR https.get error: ' + error);
    googleDeferred.reject(error);
  });


  return googleDeferred.promise;

}

exports.updateDocument = updateDocument;
exports.fetchGoogleDoc = fetchGoogleDoc;
