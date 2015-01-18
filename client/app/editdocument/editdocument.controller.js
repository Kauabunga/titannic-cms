(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {

      $log.debug('MAIN EDIT DOCUMENT CTRL', $stateParams.documentId);

      $scope.document = undefined;
      $scope.documentId = undefined;
      $scope.documentContent = undefined;
      $scope.getDocumentDeferred = undefined;

      $scope.isDirty = undefined;
      $scope.isUpdating = undefined;

      $scope.fadeIn = undefined;
      $scope.stillLoadingMessage = undefined;


      /**
       * TODO this is nasty having to watch the entire document should subscribe to the $emit event
       */
      $scope.$watch('document', function () {
        updateContent();
      }, true);

      /**
       *
       */
      var destroyHandle = $scope.$on('$destroy', function () {
        $log.debug('EditdocumentCtrl $destroy', socket);

        if($scope.documentId){
          Document.releaseDocument($scope.documentId);

          $scope.prefetchPreviewUrl($scope.documentId, 'dev');
        }

        destroyHandle();
      });


      /**
       *
       */
      function updateContent() {

        $log.debug('updating content for document', $scope.document);

        if ($scope.document !== undefined) {
          $scope.documentContent = JSON.stringify($scope.document.content);
        }
        else if (typeof $scope.document !== 'undefined') {
          $log.error('Content not a json object', $scope.document);

          Notification.error('Updating. Content not a json object');
        }
      }

      /**
       *
       */
      (function init() {

        $scope.documentId = $stateParams.documentId;

        $scope.getDocumentDeferred = Document.getDocument($stateParams.documentId, {force: true});

        var finishedLoading = false;

        //show still loading message after 500ms
        $timeout(function(){
          if( ! finishedLoading){
            $scope.stillLoadingMessage = true;
          }
        }, 500);

        $scope.getDocumentDeferred.finally(function () {

          finishedLoading = true;
          $scope.stillLoadingMessage = false;

        });


        $scope.getDocumentDeferred.then(
          function success(document) {
            $log.debug('Successful Edit get document', $stateParams.documentId);
            $scope.document = document;

          },
          function error(statusCode) {

            $log.debug('failed to get document', statusCode);

            if (statusCode === 401) {
              Notification.error('You need to login to access this document');
              $location.path('/');
            }
            else if (statusCode === 423) {

              $log.error('Document already in use', statusCode);
              Notification.error('Document already in use');
              $location.path('/');

            }
            else if (statusCode === 404) {
              //not found redirect home
              Notification.error('Document not found / ain\'t exist');

              $location.path('/');

            }
            else {
              $log.error('Something went wrong getting document', statusCode);
              Notification.error('Something went wrong getting document');
            }

          });

      })();



      /**
       *
       */
      $scope.prefetchPreviewUrl = function(environment){

        environment = environment || 'dev';

        //ready the preview url
        var previewUrlDeferred = Document.getPreviewUrl($stateParams.documentId, environment);
        previewUrlDeferred.then(
          function success(){
            $log.debug('successfully pre-fetched preview url for ', environment);
          },
          function error(status){
            $log.error('errored pre-fetched preview url for ', environment, status);
          });

        return previewUrlDeferred;

      };



      /**
       *
       */
      $scope.updateDocument = function updateDocument() {

        if(! $scope.isUpdating && ! $scope.isPublishing){

          $scope.isUpdating = true;

          //need a timeout here to make sure that we have blured the field
          $timeout(function(){

            var $inputs = $('span.json-editor input');
            $inputs.attr('disabled', 'disabled');
            var updateDeferred = Document.updateDocument($stateParams.documentId);

            updateDeferred.finally(function(){
              $timeout(function(){
                $scope.isUpdating = false;
                $inputs.removeAttr('disabled');
              });
            });

            updateDeferred.then(function success(){
              $scope.prefetchPreviewUrl();
            });

          });


        }

      };


    });

})();
