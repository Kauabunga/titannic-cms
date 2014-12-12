'use strict';

angular.module('titannicCmsApp')
  .controller('EditdocumentCtrl', function ($scope, $stateParams, $log, $http, Document, $rootScope) {

    $scope.document = undefined;
    $scope.documentContent = undefined;

    $log.debug('Editing document', $stateParams);


    $scope.$watch('document', function(){
      updateContent();
    }, true);


    function updateContent(){

      if($scope.document){
        $scope.documentContent = JSON.stringify($scope.document.content);
        $log.debug($scope.documentContent);
      }
      else{
        $log.error('Content not a json object', $scope.document);
      }

    }

    /**
     *
     */
    (function init(){

      var getDocumentDeferred = Document.getDocument($stateParams.documentId);
      getDocumentDeferred.finally(function(){});

      getDocumentDeferred.then(
        function success(document){

          $scope.document = document;

        },
        function error(data, statusCode){

          if(statusCode === 423){
            //TODO Document is already in use
            $log.error('Document already in use', data, statusCode);
          }
          else{
            //TODO generic
            $log.error('Something went wrong getting document', data, statusCode);
          }

        });

    })();


    /**
     *
     */
    $scope.updateDocument = function updateDocument(){
      Document.updateDocument();
    };


  });
