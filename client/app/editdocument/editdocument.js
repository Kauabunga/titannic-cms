(function() {


  'use strict';

  angular.module('titannicCmsApp')
    .config(function ($stateProvider, $urlRouterProvider) {


      $urlRouterProvider.when('/editdocument/{documentId}', '/editdocument/{documentId}/content');

      $urlRouterProvider.when('/editdocument/{documentId}/history', '/editdocument/{documentId}/history/dev');
      $urlRouterProvider.when('/editdocument/{documentId}/history/{env}', '/editdocument/{documentId}/history/{env}/edit');



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
                  .state('editdocument.history.edit', {
                    url: '/edit',
                    templateUrl: 'app/editdocument/history/edit/historyedit.html',
                    controller: 'EditdocumentHistoryEditCtrl',
                    authenticate: true
                  });
                $stateProvider
                  .state('editdocument.history.view', {
                    url: '/view',
                    templateUrl: 'app/editdocument/history/view/historyview.html',
                    controller: 'EditdocumentHistoryViewCtrl',
                    authenticate: true
                  });
                $stateProvider
                  .state('editdocument.history.preview', {
                    url: '/preview',
                    templateUrl: 'app/editdocument/history/preview/historydocument.html',
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
