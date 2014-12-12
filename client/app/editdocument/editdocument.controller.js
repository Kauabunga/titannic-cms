'use strict';

angular.module('titannicCmsApp')
  .controller('EditdocumentCtrl', function ($scope, $stateParams, $log, $http) {

    $scope.document = undefined;
    $scope.documentContent = undefined;

    $log.debug('Editing document', $stateParams);

    /**
     *
     */
    $http.get('/api/documents/' + $stateParams.documentId).success(function(document) {
      $log.debug('Editing document response', document, document.content);

      $scope.document = document;


      //TODO Should really load this in an external service / component
      if(typeof document.content === 'object'){
        $scope.documentContent = JSON.stringify(document.content);
      }
      else{
        //error
      }



      //TODO handle socket updating document on client until submission -> lasts as long as user session? As long as lock on file? Locks can be removed by admin?
      //socket.syncUpdates('document', $scope.documentList);

    }).error(function(data, statusCode){

      if(statusCode === 423){
        //TODO Document is already in use
      }
      else{
        //TODO generic
      }

    });

    /**
     *
     */
    $scope.updateDocument = function updateDocument(){

    };


  });
