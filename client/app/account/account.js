(function() {

  'use strict';



  angular.module('titannicCmsApp')
    .config(function ($stateProvider) {
      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'app/account/login/login.html',
          controller: 'LoginCtrl',
          resolve: {
            isLoggedIn: function(Auth, $q, Notification, $location, $timeout){

              var continueToLogin = $q.defer();

              function yesCallback(){
                Auth.logout();
                continueToLogin.resolve();
              }

              function noCallback(){
                $location.path('/');
                continueToLogin.reject();
              }

              //after a second we need the route to do something...
              var asyncCheckSuccess = false;
              $timeout(function(){
                if(! asyncCheckSuccess){
                  asyncCheckSuccess = true;
                  continueToLogin.resolve();
                }

              }, 1000);

              Auth.isLoggedInAsync(function callback(isLoggedIn){

                if(! asyncCheckSuccess){
                  asyncCheckSuccess = true;
                  if(isLoggedIn){
                    Notification.confirmation('Are you sure you want to logout?', yesCallback, noCallback, {yesText: 'Logout', noText: 'Cancel'});
                  }
                  else{
                    continueToLogin.resolve();
                  }
                }

              });


              return continueToLogin.promise;

            }
          }
        })
        .state('signup', {
          url: '/signup',
          templateUrl: 'app/account/signup/signup.html',
          controller: 'SignupCtrl'
        })
        .state('settings', {
          url: '/settings',
          templateUrl: 'app/account/settings/settings.html',
          controller: 'SettingsCtrl',
          authenticate: true
        });
    });

})();
