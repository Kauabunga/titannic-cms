(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.fadeIn = undefined;
      $scope.historyEnv = $stateParams.env || '';



      /**
       *
       */
      (function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        }, 0);

      })();



    });

})();
