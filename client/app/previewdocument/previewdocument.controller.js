(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('PreviewdocumentCtrl', function ($scope, $http, Document, $stateParams, Notification, $location, $timeout, socket, $log) {

      $scope.fadeIn = undefined;
      $scope.environment = $stateParams.environment || 'dev';

      $scope.getPreviewUrlDeferred = undefined;

      $scope.$previewIframe = $('.previewIframe');



      (function init() {

        var previewDeferred = getPreviewUrl();


        previewDeferred.then(function(){

          socket.socket.on('preview:urlupdate:start', function(documentId, environment){
            $log.debug('socket - preview:urlupdate:start', documentId, environment);
            if($stateParams.documentId === documentId && $scope.environment === environment) {
              $scope.fadeIn = false;
            }
          });

          socket.socket.on('preview:urlupdate:start:error', function(documentId, environment){
            $log.debug('socket - preview:urlupdate:start:error', documentId, environment);
            if($stateParams.documentId === documentId && $scope.environment === environment) {
              $scope.fadeIn = true;
            }
          });
        });




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

              /**
               *
               */
              socket.socket.on('preview:urlupdate', function(documentId, environment){


                //TODO we should be switching between the dev and update routes to display the latest update..... rather than getting stuck on the dev screen

                $log.debug('socket preview:urlupdate event', documentId, environment, $scope.firstLoad);



                if($stateParams.documentId === documentId){

                  if($scope.environment === environment){
                    //need to force iframe refresh
                    window.location.reload();
                  }
                  else{
                    $location.path('/previewdocument/' + documentId + '/'+ environment);
                  }

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

        return $scope.getPreviewUrlDeferred;

      }


      /**
       *
       */
      $scope.$on('$destroy', function(){

        socket.socket.removeListener('preview:urlupdate');

      });


    });

})();
