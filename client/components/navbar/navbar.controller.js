(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('NavbarCtrl', function ($scope, $location, Auth, $timeout) {
      $scope.menu = [{
        'title': 'Home',
        'link': '/'
      }];

      $scope.isCollapsed = true;
      $scope.isLoggedIn = Auth.isLoggedIn;
      $scope.isAdmin = Auth.isAdmin;
      $scope.getCurrentUser = Auth.getCurrentUser;

      $scope.goHome = function () {
        if (Auth.isLoggedIn()) {
          $location.path('/');
        }
      };

      $scope.logout = function () {
        Auth.logout();
        $timeout(function(){
          $location.path('/login');
        });

      };

      $scope.isActive = function (route) {
        return route === $location.path();
      };
    });

})();
