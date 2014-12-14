'use strict';

angular.module('titannicCmsApp')
  .service('Document', function ($log, $q, $http, $rootScope, Notification) {

    var _document;
    var _deferredGetDocument;

    var self = this;


    /**
     *
     * @param document
     */
    self.setDocumentContent = function (content){
      $log.debug('DocumentService setting document', content);
      _document.content = content;
      $rootScope.$emit('Document:update', _document);
    };


    /**
     *
     */
    self.getAll = function(){

      var deferred = $q.defer();

      $http.get('/api/documents').success(function(documents) {
        deferred.resolve(documents);
      }).error(function(data, statusCode){
        deferred.reject(data, statusCode);
        Notification.error('Document service failed to fetch all documents');
      });

      return deferred.promise;
    };


    /**
     *
     */
    self.deleteDocument = function(id){
      $http.delete('/api/documents/' + id);
    };

    /**
     *
     */
    self.createDocument = function(document){

      var deferred = $q.defer();

      $http.post('/api/documents', document)
        .success(function(data, status){
          deferred.resolve(data, status);

        })
        .error(function(data, status){
          deferred.reject(data, status);
          Notification.error('Document service failed to create document');
        });

      return deferred.promise;
    };

    /**
     *
     * @returns {*}
     */
    self.getDocument = function(docId){

      $log.debug('Getting document', docId);

      if(! _deferredGetDocument){
        _deferredGetDocument = $q.defer();

        $http.get('/api/documents/' + docId).success(function(document) {

          _document = document;
          _deferredGetDocument.resolve(document);

          //TODO handle socket updating document on client until submission -> lasts as long as user session? As long as lock on file? Locks can be removed by admin?
          //socket.syncUpdates('document', $scope.documentList);

        }).error(function(data, statusCode){
          _deferredGetDocument.reject(data, statusCode);
          Notification.error('Document service failed to get single document');
        });

      }

      return _deferredGetDocument.promise;
    };

    /**
     *
     */
    self.updateDocument = function(){
      $log.debug('Submitting document', _document);

      var deferred = $q.defer();

      $http.put('/api/documents/' + _document._id, _document)
        .success(function(){
          deferred.resolve();

          self.clearDocument();
          Notification.success('Document updated');

        })
        .error(function(error){
          deferred.reject();

          $log.error(error);

          Notification.error('Document service failed to update document');

        });

      return deferred.promise;
    };

    /**
     *
     */
    self.clearDocument = function(){
      _deferredGetDocument = undefined;
      _document = undefined;
    };

  });

