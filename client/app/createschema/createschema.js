'use strict';

angular.module('titannicCmsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('createschema', {
        url: '/createschema',
        templateUrl: 'app/createschema/createschema.html',
        controller: 'CreateschemaCtrl'
      });
  });