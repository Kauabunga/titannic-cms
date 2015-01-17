(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .service('Document', function ($log, $q, $http, $rootScope, Notification, socket, $timeout) {

      var _documents = {};
      var _deferredGetDocument = {};

      var self = this;


      /**
       *
       * @param document
       */
      self.setDocumentContent = function (docId, content) {
        $log.debug('DocumentService setting document', docId);
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




      //TODO ensure that when updating/publishing a document, that the user/tab owns the lock
      //TODO ensure that when updating/publishing a document, that the user/tab owns the lock
      //TODO ensure that when updating/publishing a document, that the user/tab owns the lock
      //TODO ensure that when updating/publishing a document, that the user/tab owns the lock

      /**
       * Release the lock on a document
       * @param docId optional... server keeping this state
       */
      self.releaseDocument = function(docId, options){

        $log.debug('releasing document', docId);


        socket.socket.emit('document:unlock');

        $(window).off('beforeunload', self.releaseDocument);

        socket.socket.on('document:unlock:success', function(){
          socket.socket.removeListener('document:unlock:success');
          socket.socket.removeListener('document:unlock:error');

          $log.debug('document unlock success');
        });
        socket.socket.on('document:unlock:error', function(){
          socket.socket.removeListener('document:unlock:success');
          socket.socket.removeListener('document:unlock:error');

          $log.error('document unlock error');
        });

        if(docId && _deferredGetDocument[docId]){
          delete _deferredGetDocument[docId];
        }

      };


      /**
       * get a list of a documents history
       */
      self.getHistory = function(docId, options){

        var deferred = $q.defer();


        if( ! docId ){
          $log.error('no docId passed to getHistory');
          deferred.reject(400);
        }
        else {

          $http.get('api/documents/historylist/' + docId)
            .success(function (documentHistory) {
              deferred.resolve(documentHistory);

            })
            .error(function (response, status) {
              deferred.reject(status);
            });
        }


        return deferred.promise;

      };


      /**
       * get a specific history revision of a google doc id
       */
      self.getHistoryDocument = function(googleDocId, historyId, options){

        var deferred = $q.defer();

        if( ! googleDocId || ! historyId){
          $log.error('no docId or historyId passed to getHistoryDocument');
          deferred.reject(400);
        }
        else {
          $http.get('api/documents/historydocument/' + googleDocId + '/' + historyId)
            .success(function(documentHistory){
              deferred.resolve(documentHistory);

            })
            .error(function(response, status){
              deferred.reject(status);
            });
        }


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

          //TODO handle socket disconnect scenarios - from start (isOnline?).. inbetween events

          //if the user refreshes the page - first release the document
          $(window).on('beforeunload', self.releaseDocument);


          socket.socket.on('document:lock:success', function(){
            $log.debug('document lock success');

            socket.socket.removeListener('document:lock:success');
            socket.socket.removeListener('document:lock:error');


            $http.get('/api/documents/' + docId).success(function (document) {
              //make a copy of the content as we see from the server so we are able to reset
              document.contentOriginal = angular.copy(document.content);
              _documents[docId] = document;
              _deferredGetDocument[docId].resolve(document);

            }).error(function (data, statusCode) {

              $log.error('failed to get document', data);
              _deferredGetDocument[docId].reject(statusCode);

            });

          });

          socket.socket.on('document:lock:error', function(error){
            $log.error('document lock error', error);

            socket.socket.removeListener('document:lock:success');
            socket.socket.removeListener('document:lock:error');

            $(window).off('beforeunload', self.releaseDocument);


            _deferredGetDocument[docId].reject(423);

          });

          //TODO we should attempt this a couple of times in quick succession if we get rejected
          $timeout(function(){
            socket.socket.emit('document:lock', docId);
          }, 100);


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

          $http.put('/api/documents/publish/' + publishDocument._id, publishDocument)
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
       * Update the content of a preview document
       */
      self.updatePreviewDocument = function (docId, previewContent) {

        var deferred = $q.defer();

        //Dont need to be passing the schema back to the webservice
        $log.debug('Submitting document preview update', docId);

        $http.put('/api/documents/updatepreview/' + docId, previewContent)
          .success(function () {
            deferred.resolve();
          })
          .error(function (error, statusCode) {

            if(statusCode !== 401){
              Notification.error('Document service failed to update document');
            }

            deferred.reject(statusCode);
            $log.error(error, statusCode);

          });

        return deferred.promise;
      };


      /**
       *
       * @param docId
       */
      self.getPreviewUrl = function (docId, environment, options) {

        var deferred = $q.defer();
        options = options || {};


        $http.get('/api/documents/preview/' + docId + '/' + environment + '/' + ((options.fromPreviewPage === true) ? 'true' : 'false'))
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
