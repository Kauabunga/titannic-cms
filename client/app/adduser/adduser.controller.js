(function(){

  'use strict';

  angular.module('titannicCmsApp')
    .controller('AdduserCtrl', function ($scope, $timeout, $log, Auth) {

      $scope.fadeIn = undefined;
      $scope.roles = undefined;

      $scope.user = {
        role: 'user'
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
        //TODO use angular form validation.... need 1.3...


      };



    });

})();
