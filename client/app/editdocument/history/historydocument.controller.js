(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.fadeIn = undefined;
      $scope.historyEnv = $stateParams.env || '';

      $scope.documentHistory = undefined;
      $scope.documentHistoryLoaded = false;
      $scope.documentHistoryDeferred = undefined;


      /**
       *
       */
      $timeout(function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        });


        $scope.getDocumentDeferred.then(
          function success(document){

            var documentEnvId = document[$scope.historyEnv + 'ContentGoogleDocId'];

            if(! documentEnvId ){
              $log.error('Document does not have property', documentEnvId, document);
              Notification.error('Document does not have content for ' + $scope.historyEnv + ' environment');
            }
            else{
              $scope.documentHistoryDeferred = Document.getHistory(documentEnvId);

              $scope.documentHistoryDeferred.finally(function(){
                $scope.documentHistoryLoaded = true;
              });
              $scope.documentHistoryDeferred.then(
                function success(documentHistory){
                  $scope.documentHistory = documentHistory;
                  $log.debug('Successfully fetched google doc history', documentHistory);
                },
                function error(statusCode){
                  $log.error('failed to get document history', statusCode, $stateParams.documentId);

                  if(statusCode !== 401){
                    Notification.error('Something went wrong getting document history');
                  }
                }
              );
            }

          }
        );






      });



    });

})();
