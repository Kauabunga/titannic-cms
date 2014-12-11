'use strict';

angular.module('titannicCmsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('editdocument', {
        url: '/editdocument/{documentId}',
        templateUrl: 'app/editdocument/editdocument.html',
        controller: 'EditdocumentCtrl'
      });
  });
