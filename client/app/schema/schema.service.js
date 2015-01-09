(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .service('Schema', function ($http, $q, $log) {

      var self = this;


      /**
       *
       */
      self.createSchema = function (schema) {

        var deferred = $q.defer();

        $http.post('/api/schemas', schema)
          .success(function (data, status) {
            deferred.resolve(data);

          })
          .error(function (data, status) {
            deferred.reject(status);
          });

        return deferred.promise;
      };


      /**
       *
       */
      self.getAll = function () {
        var deferred = $q.defer();

        $http.get('/api/schemas').success(function (schemas) {
          deferred.resolve(schemas);
        }).error(function (data, statusCode) {
          deferred.reject(data, statusCode);
        });

        return deferred.promise;
      };


      /**
       *
       */
      self.deleteSchema = function (id) {
        var deferred = $q.defer();

        $http.delete('/api/schemas/' + id)
          .success(function (data, status) {
            deferred.resolve(data);

          })
          .error(function (data, status) {
            deferred.reject(status);
          });

        return deferred.promise;
      };


    });

})();
