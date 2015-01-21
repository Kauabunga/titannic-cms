(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentContentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout, hotkeys, $state) {

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

      $scope.navigateAwayDirtyHandle = undefined;
      $scope.navigateAwayDirtyTargetState = undefined;
      $scope.navigateNotificationActive = false;



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
       * listen to save hotkeys
       */

      function saveHotkey(event, hotkey){
        $log.debug('hotkey', event, hotkey);

      }

      hotkeys.add({
        combo: 'ctrl+s',
        callback: function(event, hotkey){
          event.preventDefault();
          $log.debug('hotkey', event, hotkey);
          $scope.updateDocument();
        }
      });

      hotkeys.add({
        combo: 'command+s',
        callback: function(event, hotkey){
          event.preventDefault();
          $log.debug('hotkey', event, hotkey);
          $scope.updateDocument();
        }
      });




      /**
       *
       * @param document
       */
      function updatePreviewDocumentChanges(document, isInit){

        if(document.content){

          if(! isInit){
            $scope.isPreviewLoading = true;

            //Here we want to notify all other tabs that we have made a change and will be refreshing
            //      time to start the loading icon


          }

          $scope.previewUpdateDeferred = Document.updatePreviewDocument(document._id, document.content);
          $scope.previewUpdateDeferred.finally(function(){$scope.isPreviewLoading = false;});
          $scope.previewUpdateDeferred.then(
            function success(){
              $scope.isDevPreview = false;
              $scope.prefetchPreviewUrl('preview');
            },
            function error(){
              //In an error case - need to tell the tabs that there was an error....
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
       *
       *
       */
      $scope.previewDocument = function previewDocument($event) {
        // we can just let this go whenever
        //if($scope.isUpdating || $scope.isPublishing || $scope.isPreviewLoading){
        //  $event.preventDefault();
        //}
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
      $scope.navigateAwayDirtyHandle = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

        function yesCallback(){
          $scope.isDirty = false;
          $scope.navigateNotificationActive = false;
          $state.go($scope.navigateAwayDirtyTargetState.name, toParams);
        }

        function noCallback(){
          $scope.navigateAwayDirtyTargetState = undefined;

          $scope.navigateNotificationActive = false;

          //TODO need to tidy up the browser history stack
        }

        if($scope.isDirty && ! $scope.navigateNotificationActive){

          $log.debug('Attempting to navigate away while in a dirty state', toState);

          $scope.navigateNotificationActive = true;
          //keep record of what state the user is trying to get away to
          $scope.navigateAwayDirtyTargetState = toState;

          event.preventDefault();
          $scope.navigateNotificationActive = true;
          Notification.confirmation('You will lose all changes if you leave this page', yesCallback, noCallback, {yesText: 'Leave', noText: 'Cancel'});
        }

      });


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

        if($scope.navigateAwayDirtyHandle){
          $scope.navigateAwayDirtyHandle();
        }

        //TODO if we dirty
        //TODO if we dirty
        //TODO if we dirty
        //TODO if we dirty
        $scope.isDirty = false;
        $scope.navigateNotificationActive = false;


        //need to reset the content back to the original
        if($scope.document){
          Document.setDocumentContent($stateParams.documentId, $scope.document.contentOriginal);
        }


        hotkeys.del('command+s');
        hotkeys.del('ctrl+s');

      });






    });

})();
