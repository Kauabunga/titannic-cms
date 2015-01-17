'use strict';

var os = require('os');



//figure our the ip of our server
var lookupIpAddress,
    lookupIpAddressDomain,
    lookupIpAddressGoogleCallback;

(function(){
  var ifaces = os.networkInterfaces();

  function forEachNet(details){
    if (details.family === 'IPv4') {
      lookupIpAddress = details.address;
    }
  }
  for (var dev in ifaces) {
    if (dev !== 'en1' && dev !== 'en0') {
      continue;
    }
    ifaces[dev].forEach(forEachNet);
  }

  if(lookupIpAddress){
    lookupIpAddressDomain = 'http://' + lookupIpAddress + ':9000/'
  }

})();


// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/titanniccms-dev'
  },

  seedDB: true,

  host: lookupIpAddress || process.env.HOST || 'localhost',

};
