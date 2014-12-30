(function(){


  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider) {
      $stateProvider
        .state('adduser', {
          url: '/adduser',
          templateUrl: 'app/adduser/adduser.html',
          controller: 'AdduserCtrl',
          authenticate: true
        });
    });



})();
