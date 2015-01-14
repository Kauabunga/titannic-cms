(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryViewCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.fadeIn = undefined;


      $scope.historyContent = undefined;
      $scope.historyContentLoaded = false;
      $scope.historyContentDeferred = undefined;



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

          });

        }));



      })();







    });

})();
