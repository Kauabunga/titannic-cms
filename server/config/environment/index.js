'use strict';

var path = require('path');
var _ = require('lodash');


function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'titannic-cms-secret'
  },

  // List of user roles
  userRoles: ['user', 'editor', 'publisher', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback',
    apiKey: process.env.GOOGLE_API_KEY || 'api-key',
    watchCallbackUrl: process.env.GOOGLE_WATCH_CALLBACK || 'api/google/watchcallback',
    refreshToken: process.env.GOOGLE_ACCESS_ACCOUNT_REFRESH_TOKEN || 'refresh-token'
  },

  //address for this site
  domain: (process.env.DOMAIN || 'http://localhost:9000/'),
  host: (process.env.HOST || 'localhost'),


  //our targeted site using the cms documents
  localSite: process.env.LOCAL_SITE || 'localhost',
  localSitePort: process.env.LOCAL_SITE_PORT || '80',
  localSiteProtocol: process.env.LOCAL_SITE_PROTOCOL || 'http'

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
