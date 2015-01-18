'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'http://localhost:9000',
  SESSION_SECRET:   'titanniccms-secret',

  FACEBOOK_ID:      'app-id',
  FACEBOOK_SECRET:  'secret',

  TWITTER_ID:       'app-id',
  TWITTER_SECRET:   'secret',

  GOOGLE_ID:        'app-id',
  GOOGLE_SECRET:    'secret',

  //the local site that our cms content is targeting
  LOCAL_SITE: 'localhost',
  LOCAL_SITE_PORT: '80',
  LOCAL_SITE_PROTOCOL: 'http',

  GOOGLE_API_KEY: '',
  GOOGLE_WATCH_CALLBACK: '/api/google/watchcallback',

  GOOGLE_ACCESS_ACCOUNT_REFRESH_TOKEN: '1/alvSO0JR0PClZVuaalupfL3XXXXXXXXXXXXXXXXXXXX',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
