(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .service('Schema', function ($http, $q, $log, Notification) {

      var self = this;


      var _deferredGetDocument = {};

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


      self.getMetaSchema = (function(){

        //TODO
        var metaSchema = {

          'type': 'object',
          'title': 'Structure title',
          'properties': {
            'type': {
              'type': 'string'
            },
            'title': {
              'type': 'string'
            },
            'properties': {
              type: 'object',
              'properties': {

              }
            }
          }

        };

        return function(){
          return metaSchema;
        };

      })();


      /**
       *
       * @param schemaId
       * @param options
       */
      self.getSchema = function(schemaId, options){

        options = options || {};

        if (schemaId === undefined) {
          $log.warn('Document.getSchema schemaId is undefined');
          return $q.reject();
        }

        if (!_deferredGetDocument[schemaId] || options.force) {

          _deferredGetDocument[schemaId] = $q.defer();


          $http.get('/api/schemas/' + schemaId).success(function (schema) {
            //make a copy of the content as we see from the server so we are able to reset
            schema.contentOriginal = angular.copy(schema.content);
            _deferredGetDocument[schemaId].resolve(schema);

          }).error(function (data, statusCode) {

            if(statusCode === 503){
              Notification.error('Google docs is dead yo', {duration: -1});
            }
            else if(statusCode === 403){
              Notification.error('Your google account does not have access to this account!!', {duration: -1});
            }

            $log.error('failed to get document', data);
            _deferredGetDocument[schemaId].reject(statusCode);

          });

        }

        return _deferredGetDocument[schemaId].promise;
      };




    });

})();
