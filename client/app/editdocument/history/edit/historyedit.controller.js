(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryEditCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {

      $scope.fadeIn = undefined;

      /**
       *
       */
      (function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        });

      })();


      /**
       *
       * @param $event
       * @param historyItem
       */
      $scope.openHistory = function($event, $index, historyItem){

        $log.debug('open history', $index, historyItem);

        //TODO can probably use state here?
        $location.path('/editdocument/' + $scope.document._id + '/history/' + $scope.historyEnv + '/view/' + historyItem.id);

      };


      /**
       *
       * @param $event
       * @param env
       */
      $scope.changeEnv = function($event, env){
        if(env === $scope.historyEnv){
          $event.stopPropagation();
          $event.preventDefault();
        }
      };



    });

})();
