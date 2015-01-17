(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentContentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {

      $scope.fadeIn = undefined;

      $scope.isPublishing = undefined;

      $scope.resetEditor = $scope.resetEditor || undefined;
      $scope.toggleEditorOptions = $scope.toggleEditorOptions || undefined;


      $scope.isPreviewLoading = false;
      //we always init to using the dev preivew document
      $scope.isDevPreview = true;
      $scope.previewUpdateDeferred = undefined;

      $scope.changeHandle = undefined;
      $scope.restoreHandle = undefined;




      /**
       *
       */
      (function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        }, 0);

        var devPreviewDeferred = $scope.prefetchPreviewUrl('dev');


        $scope.$watch('getDocumentDeferred', _.once(function() {


          /**
           *
           */
          $scope.getDocumentDeferred.then(function success(document) {


            /**
             * Listen to document change events so we are able to pre-fetch the preview for the user by updating the content on the preview copy
             */
            $scope.changeHandle = $rootScope.$on('Document:' + $stateParams.documentId + ':update', function($event, document){
              $log.debug('change handle in content document controller - updating preview content', document);

              devPreviewDeferred.then(function success() {
                updatePreviewDocumentChanges(document, false);
              });
            });

            //ensure that we have init our dev document fetch first
            devPreviewDeferred.then(function success(){
              //init updating our preview document - there is a moment where the user may open the dev version of the update document
              updatePreviewDocumentChanges(document, true);
            });
          });


        }));




      })();


      /**
       *
       * @param document
       */
      function updatePreviewDocumentChanges(document, isInit){

        if(document.content){

          if(! isInit){
            $scope.isPreviewLoading = true;
          }

          $scope.previewUpdateDeferred = Document.updatePreviewDocument(document._id, document.content);
          $scope.previewUpdateDeferred.finally(function(){$scope.isPreviewLoading = false;});
          $scope.previewUpdateDeferred.then(
            function success(){
              $scope.isDevPreview = false;
              $scope.prefetchPreviewUrl('preview');
            });
        }
      }




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
        if($scope.isUpdating || $scope.isPublishing || $scope.isPreviewLoading){
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
      $scope.restoreHandle = $rootScope.$on('restoredocument', function(){
        $scope.updateDocument();
      });

      /**
       *
       */
      $scope.$on('$destroy', function(){

        if($scope.restoreHandle){
          $scope.restoreHandle();
        }

        if($scope.changeHandle){
          $scope.changeHandle();
        }

        //TODO if we dirty
        //TODO if we dirty
        //TODO if we dirty we probably want to restore this content - maybe with a notification
        //TODO if we dirty

        //need to reset the content back to the original
        Document.setDocumentContent($stateParams.documentId, $scope.document.contentOriginal);

      });






    });

})();
