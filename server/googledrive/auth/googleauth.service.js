

(function() {

  'use strict';


  var q = require('q');
  var mongoose = require('mongoose');
  var config = require('../../config/environment/index');
  var url = require('url');
  var Log = require('log');
  var log = new Log('googledrive.service');

  var User = require('../../api/user/user.controller.js');
  var Document = require('../../api/document/document.model.js');
  var Schema = require('../../api/schema/schema.model.js');



  var GoogleAuthModel = require('./googleauth.model');



  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;



  /**

   DOCUMENTATION

   https://developers.google.com/accounts/docs/OAuth2WebServer#refresh


   ENDPOINT

   https://www.googleapis.com/oauth2/v3/token


   REQUEST

   POST /oauth2/v3/token HTTP/1.1
   Host: www.googleapis.com
   Content-Type: application/x-www-form-urlencoded

   client_id=8819981768.apps.googleusercontent.com&
   client_secret={client_secret}&
   refresh_token=1/6BMfW9j53gdGImsiyUH5kU5RsR4zwI9lUVX-tqf8JXQ&
   grant_type=refresh_token


   RESPONSE

   {
     "access_token":"1/fFBGRNJru1FQd44AzqT3Zg",
     "expires_in":3920,
     "token_type":"Bearer",
   }

   */

  exports.getAccessToken = getAccessToken;


  /**
   *
   */
  function getAccessToken(){

    //check to see if the token is out of date - needs refreshing

    var googleAuthStateDeferred = _getGoogleAuthState();
    var accessTokenDeferred = q.defer();


    googleAuthStateDeferred.then(
      function success(googleAuth){


        //TODO check how long ago the last refresh was
        var refreshTokenDeferred = _refreshAccessToken(googleAuth);




        if(! googleAuth.googleAccess.lastRefreshDate){

        }

        else {

        }
      },
      function error(){
        accessTokenDeferred.reject();
      });

    return accessTokenDeferred.promise;

  }


  /**
   *
   */
  function _refreshAccessToken(googleAuthState){

    var deferred = q.defer();

    log.debug('refreshing access token with state', googleAuthState);


    try {


      var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
      oauth2Client.setCredentials({refreshToken: googleAuthState.googleAccess.refreshToken, refresh_token: googleAuthState.googleAccess.refreshToken});
      console.log('oauth2Client', oauth2Client);


      oauth2Client.refreshAccessToken(function (error, googleResponse) {


        if(error){
          log.debug('new access token? error', error);
          deferred.reject();
        }
        else{
          log.debug('refresh access token response from goolge', googleResponse);

          //googleResponse.expiry_date: 1421553674063
          //googleResponse.access_token: 1421553674063

        }


      });

    }
    catch(error){
      log.error('couldnt get access token from refresh token', error);
    }


    return deferred.promise;
  }

  /**
   *
   */
  function _getGoogleAuthState(){

    var deferred = q.defer();

    GoogleAuthModel.find({}, function(err, googleAuth){

      log.debug('_getGoogleAuthState', googleAuth);

      if(err){
        log.error('_getGoogleAuthState error', err);
        deferred.reject(err);
      }
      else if(! googleAuth){
        log.error('_getGoogleAuthState error - not found', googleAuth);
        deferred.reject();
      }
      else{

        //TODO make this a singleton
        //TODO make this a singleton
        //TODO make this a singleton
        //TODO make this a singleton
        deferred.resolve(googleAuth[0]);
      }


    });

    return deferred.promise;
  }




})();
