(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('PreviewdocumentCtrl', function ($scope, $http, Document, $stateParams, Notification, $location, $timeout) {

      $scope.fadeIn = undefined;
      $scope.environment = $stateParams.environment || 'dev';

      (function init() {


        var getPreviewUrlDeferred = Document.getPreviewUrl($stateParams.documentId, $scope.environment);

        getPreviewUrlDeferred.finally(function(){
          $timeout(function(){
            $scope.fadeIn = true;
          }, 800);

        });

        getPreviewUrlDeferred.then(
          function success(data) {

            if (data && data.url) {

              $('.previewIframe').bind('load', function() {
                $scope.$apply(function(){
                  $scope.fadeIn = true;
                });
              });

              $scope.iframePreviewUrl = data.url;
            }
            else {
              Notification.error('Unexpected response from get preview url');
              $location.path('/');
            }
          },
          function error() {
            Notification.error('Error fetching preview url');
          });


      })();


    });

})();
