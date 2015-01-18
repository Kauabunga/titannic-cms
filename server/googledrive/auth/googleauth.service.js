

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

  var httpService = require('../../components/http/http.service.js');


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


  }


  /**
   * Get the refresh token from the db
   *
   * @private
   */
  function _getRefreshToken(){

    var deferred = q.defer();






    return deferred.promise;

  }

  /**
   *
   */
  function _refreshAccessToken(){



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
        deferred.resolve(googleAuth);
      }


    });

    return deferred.promise;
  }




})();
