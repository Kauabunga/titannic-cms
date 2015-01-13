(function() {


  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider, $urlRouterProvider) {


      $urlRouterProvider.when('/editdocument/{documentId}', '/editdocument/{documentId}/content');
      $urlRouterProvider.when('/editdocument/{documentId}/history', '/editdocument/{documentId}/history/dev');


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
                  .state('editdocument.history.view', {
                    url: '/view',
                    templateUrl: 'app/editdocument/history/historydocument.html',
                    controller: 'EditdocumentHistoryViewCtrl',
                    authenticate: true
                  });

                $stateProvider
                  .state('editdocument.history.preview', {
                    url: '/preview',
                    templateUrl: 'app/editdocument/history/historydocument.html',
                    controller: 'EditdocumentHistoryPreviewCtrl',
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
