'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var Log = require('log');
var log = new Log('auth.google.index');

var router = express.Router();

router
  .get('/', passport.authenticate('google', {
    failureRedirect: '/signup',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    session: false
  }))

  .get('/callback', passport.authenticate('google', {
    failureRedirect: '/signup',
    session: false
  }), googleAuthCallback);


function googleAuthCallback(req, res){

  log.debug('googleAuthCallback', res);

  auth.setTokenCookie(req, res);
}

module.exports = router;
