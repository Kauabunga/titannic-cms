(function() {


  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider, $urlRouterProvider) {


      $urlRouterProvider.when('/editdocument/{documentId}', '/editdocument/{documentId}/content');
      $urlRouterProvider.when('/editdocument/{documentId}/history', '/editdocument/{documentId}/history/dev');

      //TODO these should really be child routes/states of a parent edit state - locking function in root - rest in each seperately


      $stateProvider
        .state('editdocument', {
          url: '/editdocument/{documentId}',
          controller: 'EditdocumentCtrl',
          templateUrl: 'app/editdocument/editdocument.html',
          authenticate: true
        });

      $stateProvider
        .state('editdocument.history', {
          url: '/history/{env}',
          templateUrl: 'app/editdocument/history/historydocument.html',
          controller: 'EditdocumentHistoryCtrl',
          authenticate: true
        });

      $stateProvider
        .state('editdocument.content', {
          url: '/content',
          templateUrl: 'app/editdocument/content/contentdocument.html',
          controller: 'EditdocumentContentCtrl',
          authenticate: true
        });
    });


})();
