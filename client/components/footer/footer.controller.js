(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('FooterCtrl', function ($scope, $location) {

      $scope.goHome = function(){
        $location.path('/');
      };

    });

})();
