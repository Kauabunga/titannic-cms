(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentHistoryCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {


      $scope.historyEnv = $stateParams.env || '';


    });

})();
