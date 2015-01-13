(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryViewCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.fadeIn = undefined;


      /**
       *
       */
      $timeout(function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        });


        


      });




    });

})();
