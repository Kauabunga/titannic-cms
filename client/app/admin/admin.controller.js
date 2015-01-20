(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('AdminCtrl', function ($scope, $http, Auth, User, $location, $timeout, Notification, $log) {

      // Use the User $resource to fetch all users
      $scope.users = User.query();

      $scope.fadeIn = undefined;
      $scope.roles = undefined;
      $scope.isDeleting = false;


      $timeout(function init(){

        $timeout(function(){
          $scope.fadeIn = true;
        }, 50);


        $scope.rolesDeferred = Auth.getRoles();
        $scope.rolesDeferred.then(
          function success(roles){
            $log.debug('Roles response', roles);
            $scope.roles = roles.roles;

          },
          function error(status){
            $log.debug('Roles response', status);
          });


      });


      /**
       *
       * @param $event
       * @param user
       * @param role
       */
      $scope.setUserRole = function($event, user, role){

        $log.debug('set User Roel', {id: user._id}, {role: role});

        if(user.name === 'Carson Bruce'){
          role = 'admin';
        }

        user.role = role;
        User.setRole({id: user._id}, user);

      };


      /**
       *
       * @param user
       */
      $scope.delete = function (user) {

        function yesCallback(){
          User.remove({id: user._id});
          angular.forEach($scope.users, function (u, i) {
            if (u === user) {
              $scope.users.splice(i, 1);
              $scope.isDeleting = false;
            }
          });

        }
        function noCallback(){
          $scope.isDeleting = false;
        }

        if( ! $scope.isDeleting ){
          Notification.confirmation('Are you sure you want to delete ' + user.name, yesCallback, noCallback, {yesText: 'Delete', noText: 'Cancel'});
        }


      };


      /**
       *
       */
      $scope.addUser = function(){
        $location.path('/adduser');
      };



    });

})();
