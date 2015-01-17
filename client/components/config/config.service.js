(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .factory('Config', function Auth($location, $rootScope, $http, User, $cookieStore, $q, $log, $timeout) {

      var self = this;
      var config = {
        get: _get
      };

      var defaults = {
        host: 'titanic.solnetsolutions.co.nz',
        env: 'prod'
    };

      /**
       *
       * @param key
       * @private
       */
      function _get(key){
        var $value = $('#server-config #' + key);
        if($value){
          return $value.text();
        }
        else{
          return defaults[key];
        }
      }

      return config;

    });


})();
