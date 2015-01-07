(function(){

  'use strict';

  angular.module('titannicCmsApp')
    .controller('AdduserCtrl', function ($scope, $timeout, $log, Auth, $location, Notification, $q) {

      $scope.fadeIn = undefined;
      $scope.roles = undefined;

      $scope.user = {
        role: 'user',
        name: undefined,
        email: undefined
      };


      /**
       *
       */
      $timeout(function init(){

        $log.debug('Add User Ctrl init');

        //fade in static elements
        $timeout(function(){
          $scope.fadeIn = true;
        }, 50);


        var rolesDeferred = Auth.getRoles();
        rolesDeferred.then(
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
       */
      $scope.createUser = function(){

        var deferred = $q.defer();

        var validationDeferred = isValid();

        validationDeferred.then(
          function success(valid) {

            if (!valid) {
              $log.debug('Form invalid');
              Notification.error('Some fields are buggered mate');
              deferred.reject();
            }
            else {

              $log.debug('Creating user with form', $scope.userForm);
              $log.debug('Creating user with user', $scope.user);

              var createDeferred = Auth.adminCreateUser($scope.user);

              createDeferred.then(
                function success() {
                  $location.path('/admin');
                },
                function error() {
                  Notification.error('Server failed to create new user');
                });

            }

          },
          function error() {
            //TODO handle validation error
            Notification.error('New user form invalid');

          });

        return deferred.promise;
      };


      /**
       *
       */
      function isValid() {
        var deferred = $q.defer();

        deferred.resolve($scope.userForm.$valid);

        return deferred.promise;
      }


    });

})();
