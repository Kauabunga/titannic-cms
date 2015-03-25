(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('LoginCtrl', function ($scope, Auth, $location, $window, $timeout, $log, hotkeys) {
      $scope.user = {};
      $scope.errors = {};

      $scope.fadeIn = undefined;

      $scope.stillLoggingIn = undefined;

      $timeout(function(){
        $scope.fadeIn = true;
      }, 50);


      $scope.user.email = undefined;


      //TODO record last login and prepopulate with it
      if(localStorage){
        //check to see if user name already exists
        $scope.user.email = localStorage.getItem('latestEmail');
      }



      //TODO write directive that doesnt allow password saves.....
      //     Remove password before submissions


      function isValid(){

        //promises + server side email check - security lock out on frequent attempts = 50
        $scope.isValid = true;
      }




      //TODO submit login event to same session browsers
      //socket.socket.on('login')

      $scope.login = function (form) {
        $scope.submitted = true;

        $log.debug('logging in with form', form);

        if (form.$valid) {

          $scope.isLoggingInLocal = true;

          Auth.login({
            email: $scope.user.email,
            password: $scope.user.password
          })
            .then(function () {
              // Logged in, redirect to home

              if(localStorage){
                localStorage.setItem('latestEmail', $scope.user.email);
              }


            })
            .catch(function (err) {

              $scope.isLoggingInLocal = false;

              $scope.errors.other = err.message;
            });
        }
      };


      /**
       * This is always going to take us to a new page
       */
      $scope.loginOauth = function (provider) {


        //TODO if we reach 5000ms then we should display a message - logging into Google....
        $scope.isLoggingInGoogle = true;

        var $body = $('body');
        $body.css('transition', 'opacity 3s ease');

        $body.toggleClass('logging-in-google', true);

        setTimeout(function () {
          $body.css('opacity', 0.4);

          setTimeout(function () {
            $window.location.href = '/auth/' + provider;
          }, 0);
        }, 0);



      };
    });

})();
