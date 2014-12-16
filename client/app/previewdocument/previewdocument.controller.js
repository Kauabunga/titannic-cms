'use strict';

angular.module('titannicCmsApp')
  .controller('PreviewdocumentCtrl', function ($scope, $http, Document, $stateParams, Notification, $location) {


    (function init(){

      var getPreviewUrlDeferred = Document.getPreviewUrl($stateParams.documentId);

      getPreviewUrlDeferred.then(
        function success(data){
          Notification.success('Successful response from get preview url');
          if(data && data.url){
            $scope.iframePreviewUrl = data.url;
          }
          else{
            Notification.error('Unexpected response from get preview url');
            $location.path('/');
          }
        },
        function error(){
          Notification.error('Error fetching preview url');
      });


    })();



  });
