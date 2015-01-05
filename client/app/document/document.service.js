(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .service('Document', function ($log, $q, $http, $rootScope, Notification, socket) {

      var _documents = {};
      var _deferredGetDocument = {};

      var self = this;


      /**
       *
       * @param document
       */
      self.setDocumentContent = function (docId, content) {
        $log.debug('DocumentService setting document', content);
        _documents[docId].content = content;
        $rootScope.$emit('Document:' + docId + ':update', _documents[docId]);

      };


      /**
       *
       */
      self.getAll = function () {

        var deferred = $q.defer();

        $http.get('/api/documents').success(function (documents) {
          deferred.resolve(documents);
        }).error(function (data, statusCode) {
          deferred.reject(data, statusCode);
          Notification.error('Document service failed to fetch all documents');
        });

        return deferred.promise;
      };


      /**
       *
       */
      self.deleteDocument = function (id) {
        var deferred = $q.defer();
        $http.delete('/api/documents/' + id).success(function(response){
          deferred.resolve(response);
        }).error(function(response, statusCode){
          deferred.reject(statusCode);
        });

        if (_documents[id]) {
          delete _documents[id];
        }
        if (_deferredGetDocument[id]) {
          delete _deferredGetDocument[id];
        }

        return deferred.promise;
      };

      /**
       *
       */
      self.createDocument = function (document) {

        var deferred = $q.defer();

        $http.post('/api/documents', document)
          .success(function (data, status) {
            deferred.resolve(data, status);

          })
          .error(function (data, status) {
            deferred.reject(data, status);
            Notification.error('Document service failed to create document');
          });

        return deferred.promise;
      };

      /**
       *
       * @returns {*}
       */
      self.getDocument = function (docId, options) {

        options = options || {};

        if (docId === undefined) {
          $log.warn('Document.getDocument docId is undefined');
          return $q.reject();
        }

        $log.debug('Getting document', docId);

        if (!_deferredGetDocument[docId] || options.force) {
          _deferredGetDocument[docId] = $q.defer();

          $http.get('/api/documents/' + docId).success(function (document) {
            //make a copy of the content as we see from the server so we are able to reset
            document.contentOriginal = angular.copy(document.content);
            _documents[docId] = document;
            _deferredGetDocument[docId].resolve(document);

            //TODO handle socket updating document on client until submission -> lasts as long as user session? As long as lock on file? Locks can be removed by admin?
            //socket.syncUpdates('document', $scope.documentList);

          }).error(function (data, statusCode) {

            $log.error('failed to get document', data);
            _deferredGetDocument[docId].reject(statusCode);

          });

        }

        return _deferredGetDocument[docId].promise;
      };

      /**
       *
       */
      self.updateDocument = function (docId) {

        var deferred = $q.defer();

        //Dont need to be passing the schema back to the webservice
        if(_documents && _documents[docId]){
          var updateDocument = angular.copy(_documents[docId]);
          if(updateDocument && updateDocument.schema){
            delete updateDocument.schema;
          }

          $log.debug('Submitting document', updateDocument);

          $http.put('/api/documents/' + updateDocument._id, updateDocument)
            .success(function () {
              deferred.resolve();

              _documents[docId].contentOriginal = angular.copy(_documents[docId].content);

              $rootScope.$emit('document:updated');
              Notification.success('Document updated');

            })
            .error(function (error) {
              deferred.reject();
              $log.error(error);
              Notification.error('Document service failed to update document');

            });

        }
        else{
          deferred.reject('Document doesnt (yet?) exist');
        }

        return deferred.promise;
      };


      /**
       *
       */
      self.publishDocument = function (docId) {

        var deferred = $q.defer();

        //Dont need to be passing the schema back to the webservice
        if(_documents && _documents[docId]){
          var publishDocument = angular.copy(_documents[docId]);
          if(publishDocument && publishDocument.schema){
            delete publishDocument.schema;
          }

          $log.debug('Submitting document to publish', publishDocument);

          $http.put('/api/documents/publish' + publishDocument._id, publishDocument)
            .success(function () {
              deferred.resolve();

              _documents[docId].contentOriginal = angular.copy(_documents[docId].content);

              $rootScope.$emit('document:publish');
              Notification.success('Document published');

            })
            .error(function (error) {
              deferred.reject();
              $log.error(error);
              Notification.error('Document service failed to publish document');

            });

        }
        else{
          deferred.reject('Document doesnt (yet?) exist');
        }

        return deferred.promise;
      };


      /**
       *
       * @param docId
       */
      self.getPreviewUrl = function (docId) {

        var deferred = $q.defer();

        $http.get('/api/documents/preview/' + docId)
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function (error) {
            deferred.reject(error);
          });

        return deferred.promise;

      };


    });

})();
