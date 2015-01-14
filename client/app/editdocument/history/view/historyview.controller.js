(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryViewCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.fadeIn = undefined;


      $scope.historyDocumentItem = undefined;

      $scope.historyContent = undefined;
      $scope.historyContentLoaded = false;
      $scope.historyContentDeferred = undefined;


      $scope.isRestoring = undefined;
      $scope.previewReady = false;


      /**
       *
       */
      (function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        });


        $scope.$watch('getDocumentDeferred', _.once(function(){

          /**
           *
           */
          $scope.getDocumentDeferred.then(function success(){

            /**
             * fetch history content
             */
            $scope.historyContentDeferred = Document.getHistoryDocument($scope.googleDocumentEnvId, $stateParams.historyId);
            $scope.historyContentDeferred.finally(function(){ $scope.historyContentLoaded = true; });
            $scope.historyContentDeferred.then(
              function success(historyContent){
                $log.debug('Successful get history document content', historyContent);
                $scope.historyContent = historyContent;
              },
              function error(status){
                $log.error('Error get history document content', status);
                if(status !== 401){
                  Notification.error('Failed to get history document content');
                }
              });

            /**
             * get history item for meta data
             */
            $scope.documentHistoryDeferred.then(function success(){
              var i, currentItem;
              for(i = 0; i < $scope.documentHistory.items.length; i++){
                currentItem = $scope.documentHistory.items[i];
                if(currentItem.id === $stateParams.historyId){
                  $scope.historyDocumentItem = currentItem;
                  break;
                }
              }

            });

            /**
             * Start updating our preview document for the user to preview
             */
            $scope.historyContentDeferred.then(function success(historyContent){

              var updatePreviewDeferred = Document.updatePreviewDocument($scope.document._id, historyContent);
              updatePreviewDeferred.then(function success(){
                $log.debug('update preview successful');
                $scope.previewReady = true;
              });

            });

          });

        }));



      })();


      /**
       *
       */
      $scope.previewDocumentHistory = function($event){

        if( ! $scope.previewReady){
          $event.stopPropagation();
          $event.preventDefault();
        }

      };


      /**
       *
       * @param $event
       */
      $scope.restoreDocument = function($event){


        if(! $scope.isRestoring){
          $log.debug('restoring document', $event);
          $scope.isRestoring = true;

          //TODO implement
          //TODO implement
          //TODO implement
          //TODO implement

        }


      };





    });

})();
