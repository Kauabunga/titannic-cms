(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {

      $scope.document = undefined;
      $scope.documentContent = undefined;

      $log.debug('Editing document', $stateParams.documentId);

      $scope.fadeIn = undefined;
      $scope.isUpdating = undefined;
      $scope.isPublishing = undefined;
      $scope.stillLoadingMessage = undefined;
      $scope.isDirty = undefined;

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

        
        Document.releaseDocument($scope.document._id);


        destroyHandle();
      });


      /**
       *
       */
      function updateContent() {

        if ($scope.document !== undefined) {
          $scope.documentContent = JSON.stringify($scope.document.content);
          $log.debug($scope.documentContent);
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


        $timeout(function () {
          $scope.fadeIn = true;
        }, 0);

        var getDocumentDeferred = Document.getDocument($stateParams.documentId, {force: true});


        var finishedLoading = false;

        //show still loading message after 500ms
        $timeout(function(){
          if( ! finishedLoading){
            $scope.stillLoadingMessage = true;
          }
        }, 500);

        getDocumentDeferred.finally(function () {

          finishedLoading = true;
          $scope.stillLoadingMessage = false;

        });


        getDocumentDeferred.then(
          function success(document) {
            $log.debug('Successful Edit get document', $stateParams.documentId);
            $scope.document = document;

          },
          function error(statusCode) {

            if (statusCode === 401) {
              Notification.error('You need to login to access this document');
              $location.path('/');
            }
            else if (statusCode === 423) {
              //TODO Document is already in use
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
      $scope.updateDocument = function updateDocument() {

        if(! $scope.isUpdating && ! $scope.isPublishing){

          $scope.isUpdating = true;

          var $inputs = $('span.json-editor input');
          $inputs.attr('disabled', 'disabled');
          var updateDeferred = Document.updateDocument($stateParams.documentId);

          updateDeferred.finally(function(){
            $timeout(function(){
              $scope.isUpdating = false;
              $inputs.removeAttr('disabled');
            });

          });

        }

      };



      /**
       *
       */
      $scope.publishDocument = function publishDocument() {

        function yesCallback(){
          $scope.isPublishing = true;

          var $inputs = $('span.json-editor input');
          $inputs.attr('disabled', 'disabled');

          var publishDeferred = Document.publishDocument($stateParams.documentId);

          publishDeferred.finally(function(){
            $timeout(function(){
              $scope.isPublishing = false;

              $inputs.removeAttr('disabled');
            });

          });


        }

        function noCallback(){
          $scope.isPublishing = false;
        }


        if($scope.isDirty){
          Notification.info('You need to update the dev document before publishing');
        }
        else if(! $scope.isUpdating && ! $scope.isPublishing){
          Notification.confirmation('Are you sure you want make this document live?', yesCallback, noCallback, {yesText: 'Publish', noText: 'Cancel'});
        }

      };


      /**
       *
       */
      $scope.previewDocument = function previewDocument($event) {

        if($scope.isUpdating || $scope.isPublishing){
          $event.preventDefault();
        }

      };


    });

})();
