'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GoogleAuthSchema = new Schema({


  //refresh token for accessing google documents
  googleAccess: {
    refreshToken: String,
    accessToken: String,
    lastRefreshDate: String
  }


});

module.exports = mongoose.model('GoogleAuth', GoogleAuthSchema);
