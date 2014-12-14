'use strict';

angular.module('titannicCmsApp')
  .controller('EditdocumentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification) {

    $scope.document = undefined;
    $scope.documentContent = undefined;

    $log.debug('Editing document', $stateParams);


    /**
     *
     */
    $scope.$watch('document', function(){
      updateContent();
    }, true);

    /**
     *
     */
    var destroyHandle = $scope.$on('$destroy', function(){
      $log.debug('EditdocumentCtrl $destroy');

      Document.clearDocument();
      destroyHandle();
    });


    /**
     *
     */
    function updateContent(){

      if($scope.document !== undefined){
        $scope.documentContent = JSON.stringify($scope.document.content);
        $log.debug($scope.documentContent);
      }
      else if(typeof $scope.document !== 'undefined'){
        $log.error('Content not a json object', $scope.document);

        Notification.error('Updating. Content not a json object');
      }

    }

    /**
     *
     */
    (function init(){

      var getDocumentDeferred = Document.getDocument($stateParams.documentId);
      getDocumentDeferred.finally(function(){

      });

      getDocumentDeferred.then(
        function success(document){

          $scope.document = document;

        },
        function error(data, statusCode){

          if(statusCode === 423){
            //TODO Document is already in use
            $log.error('Document already in use', data, statusCode);
            Notification.error('Document already in use');
          }
          else{
            //TODO generic
            $log.error('Something went wrong getting document', data, statusCode);
            Notification.error('Something went wrong getting document');
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
