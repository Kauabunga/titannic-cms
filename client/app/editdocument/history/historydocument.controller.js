(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.fadeIn = undefined;
      $scope.historyEnv = $stateParams.env || '';

      $scope.googleDocumentEnvId = undefined;

      //TODO rename this to documentHistoryList
      $scope.documentHistory = undefined;
      $scope.documentHistoryLoaded = false;
      $scope.documentHistoryDeferred = undefined;



      /**
       *
       */
      (function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        });


        $scope.$watch('getDocumentDeferred', _.once(function(){

          $scope.getDocumentDeferred.then(
            function success(document){

              $scope.googleDocumentEnvId = document[$scope.historyEnv + 'ContentGoogleDocId'];

              if(! $scope.googleDocumentEnvId ){
                $log.error('Document does not have property', documentEnvId, document);
                Notification.error('Document does not have content for ' + $scope.historyEnv + ' environment');
              }
              else{

                $scope.documentHistoryDeferred = Document.getHistory($scope.googleDocumentEnvId);
                $scope.documentHistoryDeferred.finally(function(){
                  $timeout(function(){
                    $scope.documentHistoryLoaded = true;
                  });

                });
                $scope.documentHistoryDeferred.then(
                  function success(documentHistory){
                    $log.debug('Successfully fetched google doc history', documentHistory);

                    try {
                      documentHistory.items = documentHistory.items.slice().reverse();
                      $scope.documentHistory = documentHistory;
                    }
                    catch(error){
                      Notification.error('Something went wrong getting document history');
                      $log.error('Unable to get documentHistory and reverse array', error, documentHistory);
                    }

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

        }));


      })();





    });

})();
