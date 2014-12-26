(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('PreviewdocumentCtrl', function ($scope, $http, Document, $stateParams, Notification, $location, $timeout) {

      $scope.fadeIn = undefined;

      (function init() {

        var getPreviewUrlDeferred = Document.getPreviewUrl($stateParams.documentId);

        getPreviewUrlDeferred.finally(function(){
          //TODO get iframe loaded event?
          $timeout(function(){
            $scope.fadeIn = true;
          }, 800);

        });

        getPreviewUrlDeferred.then(
          function success(data) {

            if (data && data.url) {
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
