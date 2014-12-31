(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('AdminCtrl', function ($scope, $http, Auth, User, $location, $timeout) {

      // Use the User $resource to fetch all users
      $scope.users = User.query();

      $scope.fadeIn = undefined;


      $timeout(function init(){

        $timeout(function(){
          $scope.fadeIn = true;
        }, 50);

      });

      /**
       *
       * @param user
       */
      $scope.delete = function (user) {
        User.remove({id: user._id});
        angular.forEach($scope.users, function (u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      };


      /**
       *
       */
      $scope.addUser = function(){
        $location.path('/adduser');
      };



    });

})();
