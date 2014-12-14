'use strict';

angular.module('titannicCmsApp')
  .service('Document', function ($log, $q, $http, $rootScope, Notification) {

    var _documents = {};
    var _deferredGetDocument = {};

    var self = this;


    /**
     *
     * @param document
     */
    self.setDocumentContent = function (docId, content){
      $log.debug('DocumentService setting document', content);
      _documents[docId].content = content;
      $rootScope.$emit('Document:' + docId + ':update', _documents[docId]);
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

      if(_documents[id]){
        delete _documents[id];
      }
      if(_deferredGetDocument[id]){
        delete _deferredGetDocument[id];
      }
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
    self.getDocument = function(docId, options){

      options = options || {};

      if(docId === undefined){
        $log.warn('Document.getDocument docId is undefined');
        return $q.reject();
      }

      $log.debug('Getting document', docId);

      if(! _deferredGetDocument[docId] || options.force){
        _deferredGetDocument[docId] = $q.defer();

        $http.get('/api/documents/' + docId).success(function(document) {

          _documents[docId] = document;
          _deferredGetDocument[docId].resolve(document);

          //TODO handle socket updating document on client until submission -> lasts as long as user session? As long as lock on file? Locks can be removed by admin?
          //socket.syncUpdates('document', $scope.documentList);

        }).error(function(data, statusCode){
          _deferredGetDocument[docId].reject(data, statusCode);
          Notification.error('Document service failed to get single document');
        });

      }

      return _deferredGetDocument[docId].promise;
    };

    /**
     *
     */
    self.updateDocument = function(docId){
      $log.debug('Submitting document', _documents[docId]);

      var deferred = $q.defer();

      //Dont need to be passing the schema back to the webservice
      var updateDocument = angular.copy({}, _documents[docId]);
      delete updateDocument.schema;

      $http.put('/api/documents/' + updateDocument._id, updateDocument)
        .success(function(){
          deferred.resolve();

          Notification.success('Document updated');

        })
        .error(function(error){
          deferred.reject();

          $log.error(error);

          Notification.error('Document service failed to update document');

        });

      return deferred.promise;
    };


  });

