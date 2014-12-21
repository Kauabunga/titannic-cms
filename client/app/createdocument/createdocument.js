(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider) {
      $stateProvider
        .state('createdocument', {
          url: '/createdocument',
          templateUrl: 'app/createdocument/createdocument.html',
          controller: 'CreatedocumentCtrl'
        });
    });

})();
