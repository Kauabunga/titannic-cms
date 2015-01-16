(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentContentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {

      $scope.fadeIn = undefined;

      $scope.isPublishing = undefined;

      $scope.resetEditor = $scope.resetEditor || undefined;
      $scope.toggleEditorOptions = $scope.toggleEditorOptions || undefined;

      /**
       *
       */
      (function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        }, 0);

        $scope.prefetchPreviewUrl();

      })();






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
       * TODO if document is not dirty then use the current dev copy to prev
       * TODO if document is not dirty then use the current dev copy to prev
       * TODO if document is not dirty then use the current dev copy to prev
       * TODO if document is not dirty then use the current dev copy to prev
       *
       * TODO     if the document becomes dirty - update the preview document with the current copy and disable button
       *          on becoming clean again - use the dev copy
       *
       *          TODO will need to tidy dodgey dity states
       *
       */
      $scope.previewDocument = function previewDocument($event) {

        if($scope.isUpdating || $scope.isPublishing){
          $event.preventDefault();
        }
      };



      /**
       *
       */
      $scope.gotoHistory = function(){
        $location.path('/editdocument/' + $stateParams.documentId + '/history');
      };


      /**
       *
       */
      var restoreHandle = $rootScope.$on('restoredocument', function(){
        $scope.updateDocument();
      });

      /**
       *
       */
      $scope.$on('$destroy', function(){
        restoreHandle();

        //TODO if we dirty
        //TODO if we dirty
        //TODO if we dirty we probably want to restore this content - maybe with a notification
        //TODO if we dirty

        //need to reset the content back to the original
        Document.setDocumentContent($stateParams.documentId, $scope.document.contentOriginal);

      });






    });

})();
