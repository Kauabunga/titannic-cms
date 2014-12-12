'use strict';

angular.module('titannicCmsApp')
  .controller('MainCtrl', function ($scope, $http, socket, $location) {


    /**
     * Initial fetch of documents list
     *
     */
    $http.get('/api/documents').success(function(documents) {
      $scope.documentList = documents;
      socket.syncUpdates('document', $scope.documentList);
    }).error(function(data, statusCode){

      if(statusCode === 401){
        //TODO handle unauthorised
      }
      else{
        //TODO generic
      }

    });

    /**
     *
     * @param document
     */
    $scope.editDocument = function editDocument(document){
        $location.path('/editdocument/' + document._id);
    };

    /**
     *
     */
    $scope.createDocument = function createDocument(){
      $location.path('/createdocument');
    };

    /**
     *
     * @param $event
     * @param document
     */
    $scope.deleteDocument = function deleteDocument($event, document) {

      //Do not want to trigger the edit document click trigger
      $event.preventDefault();
      $event.stopPropagation();

      $http.delete('/api/documents/' + document._id);
    };

    /**
     *
     */
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('document');
    });
  });
