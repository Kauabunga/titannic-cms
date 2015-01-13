(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryEditCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {

      $scope.fadeIn = undefined;

      /**
       *
       */
      $timeout(function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        });

      });


      /**
       *
       * @param $event
       * @param historyItem
       */
      $scope.openHistory = function($event, historyItem){
        $log.debug('open history', $event, historyItem);

        //TODO can probably use state here?
        $location.path('/editdocument/' + $scope.document._id + '/history/' + $scope.historyEnv + '/view');

      };





    });

})();
