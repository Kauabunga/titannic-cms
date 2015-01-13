(function() {


  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.when('/historydocument/{documentId}', '/historydocument/{documentId}/dev');

      //TODO these should really be child routes/states of a parent edit state - locking function in root - rest in each seperately

      $stateProvider
        .state('historydocument', {
          url: '/historydocument/{documentId}/{env}',
          templateUrl: 'app/editdocument/historydocument.html',
          controller: 'EditdocumentCtrl'
        });

      $stateProvider
        .state('editdocument', {
          url: '/editdocument/{documentId}',
          templateUrl: 'app/editdocument/editdocument.html',
          controller: 'EditdocumentCtrl',
          authenticate: true
        });
    });


})();
