(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider) {
      $stateProvider
        .state('editschema', {
          url: '/editschema/{schemaId}',
          templateUrl: 'app/editschema/editschema.html',
          controller: 'EditschemaCtrl'
        });
    });


})();
