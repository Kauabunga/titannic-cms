'use strict';

angular.module('titannicCmsApp')
  .service('Document', function ($log, $q, $http, $rootScope) {

    var _document;
    var _deferred;

    var self = this;


    /**
     *
     * @param document
     */
    this.setDocumentContent = function (content){
      $log.debug('DocumentService setting document', content);
      _document.content = content;
      $rootScope.$emit('Document:update', _document);
    };

    /**
     *
     * @returns {*}
     */
    self.getDocument = function(docId){

      $log.debug('Getting document', docId);

      if(! _deferred){
        _deferred = $q.defer();

        $http.get('/api/documents/' + docId).success(function(document) {

          _document = document;
          _deferred.resolve(document);

          //TODO handle socket updating document on client until submission -> lasts as long as user session? As long as lock on file? Locks can be removed by admin?
          //socket.syncUpdates('document', $scope.documentList);

        }).error(function(data, statusCode){
          _deferred.reject(data, statusCode);
        });

      }

      return _deferred.promise;
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

        })
        .error(function(){
          deferred.reject();
        });

      return deferred.promise;
    };

    /**
     *
     */
    self.clearDocument = function(){
      _deferred = undefined;
      _document = undefined;
    };

  });

