(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.when('/previewdocument/{documentId}', '/previewdocument/{documentId}/dev');

      $stateProvider
        .state('previewdocument', {
          url: '/previewdocument/{documentId}/{environment}',
          templateUrl: 'app/previewdocument/previewdocument.html',
          controller: 'PreviewdocumentCtrl'
        });
    });

})();
