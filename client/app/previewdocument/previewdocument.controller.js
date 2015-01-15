(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('PreviewdocumentCtrl', function ($scope, $http, Document, $stateParams, Notification, $location, $timeout, socket, $log) {

      $scope.fadeIn = undefined;
      $scope.environment = $stateParams.environment || 'dev';

      $scope.getPreviewUrlDeferred = undefined;

      $scope.$previewIframe = $('.previewIframe');



      (function init() {

        getPreviewUrl();

      })();




      /**
       *
       */
      function getPreviewUrl(){

        $scope.fadeIn = false;

        $scope.getPreviewUrlDeferred = Document.getPreviewUrl($stateParams.documentId, $scope.environment, {fromPreviewPage: true});

        $scope.getPreviewUrlDeferred.finally(function(){
          $timeout(function(){
            $scope.fadeIn = true;
          }, 800);

        });

        $scope.getPreviewUrlDeferred.then(
          function success(data) {

            if (data && data.url) {

              $scope.$previewIframe.bind('load', function() {
                $scope.$apply(function(){
                  $scope.fadeIn = true;
                });
              });

              $scope.iframePreviewUrl = data.url;

              socket.socket.on('preview:urlupdate', function(documentId, environment){

                $log.debug('socket preview:urlupdate event', documentId, environment, $scope.firstLoad);

                socket.socket.removeListener('preview:urlupdate');
                if($stateParams.documentId === documentId && $scope.environment === environment){
                  window.location.reload();
                }

              });



            }
            else {
              Notification.error('Unexpected response from get preview url');
              $location.path('/');
            }
          },
          function error() {
            Notification.error('Error fetching preview url');
            $location.path('/');
          });


      }


      /**
       *
       */
      $scope.$on('$destroy', function(){

        socket.socket.removeListener('preview:urlupdate');

      });


    });

})();
