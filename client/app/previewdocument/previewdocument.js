'use strict';

angular.module('titannicCmsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('previewdocument', {
        url: '/previewdocument/{documentId}',
        templateUrl: 'app/previewdocument/previewdocument.html',
        controller: 'PreviewdocumentCtrl'
      });
  });
