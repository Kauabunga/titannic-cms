(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('LoginCtrl', function ($scope, Auth, $location, $window, $timeout) {
      $scope.user = {};
      $scope.errors = {};

      $scope.fadeIn = undefined;

      $timeout(function(){
        $scope.fadeIn = true;
      }, 50);

      //TODO this needs to be a check with the server
      Auth.isLoggedInAsync(function(isLoggedIn){

          if(isLoggedIn){
            $location.path('/');
          }

        });

      //TODO submit login event to same session browsers
      //socket.socket.on('login')

      $scope.login = function (form) {
        $scope.submitted = true;

        if (form.$valid) {
          Auth.login({
            email: $scope.user.email,
            password: $scope.user.password
          })
            .then(function () {
              // Logged in, redirect to home
              $location.path('/');
            })
            .catch(function (err) {
              $scope.errors.other = err.message;
            });
        }
      };


      //This is always going to take us to a new page
      $scope.loginOauth = function (provider) {


        //TODO if we reach 5000ms then we should display a message - logging into Google....


        var $body = $('body');
        $body.css('transition', 'opacity 3s ease');

        $body.toggleClass('logging-in', true);
        $body.toggleClass('logging-in-google', true);

        setTimeout(function () {
          $body.css('opacity', 0.4);
        }, 0);

        $window.location.href = '/auth/' + provider;
      };
    });

})();
