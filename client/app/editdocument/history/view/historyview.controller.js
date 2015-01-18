(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryViewCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.fadeIn = undefined;


      $scope.historyDocumentItem = undefined;

      $scope.historyContent = undefined;
      $scope.historyContentLoaded = false;
      $scope.historyContentDeferred = undefined;


      $scope.isRestoringOnDestroy = false;
      $scope.restoreReady = false;
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

            $timeout(function(){

              /**
               * fetch history content
               */
              $scope.historyContentDeferred = Document.getHistoryDocument($scope.googleDocumentEnvId, $stateParams.historyId);
              $scope.historyContentDeferred.finally(function(){ $scope.historyContentLoaded = true; });
              $scope.historyContentDeferred.then(
                function success(historyContent){
                  $log.debug('Successful get history document content', historyContent);
                  $scope.historyContent = historyContent;

                  $scope.restoreReady = true;

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

                  //start fetching the preview url
                  var getPreviewUrlDeferred = Document.getPreviewUrl($stateParams.documentId, 'preview');
                  getPreviewUrlDeferred.then(
                    function success(){
                      $log.debug('get preview url success');
                    },
                    function error(err){
                      $log.debug('get preview url error', err);
                    });

                });

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

        //TODO our directive is writting to our documents content service.... it should be writing to the document in its scope?
        //TODO our directive is writting to our documents content service.... it should be writing to the document in its scope?
        //TODO our directive is writting to our documents content service.... it should be writing to the document in its scope?
        //TODO our directive is writting to our documents content service.... it should be writing to the document in its scope?
        if($scope.restoreReady){
          $location.path('/editdocument/' + $stateParams.documentId + '/content');

          $scope.isRestoringOnDestroy = true;
        }

      };

      /**
       *
       */
      $scope.$on('$destroy', function(){

        if($scope.isRestoringOnDestroy){
          $timeout(function(){
            //TODO need to call update on the new scope - once the new controller scope is loaded
            $rootScope.$emit('restoredocument');
          });
        }
        else{
          //need to reset the content back to the original
          Document.setDocumentContent($stateParams.documentId, $scope.document.contentOriginal);
        }
      });





    });

})();
