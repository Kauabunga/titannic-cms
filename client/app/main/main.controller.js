'use strict';

angular.module('titannicCmsApp')
  .controller('MainCtrl', function ($scope, $http, socket, $location) {


    $http.get('/api/documents').success(function(documents) {
      $scope.documentList = documents;
      socket.syncUpdates('document', $scope.documentList);
    });

    $scope.addDocument = function() {
      if($scope.document === '') {
        return;
      }
      $http.post('/api/documents', { name: $scope.document });
      $scope.document = '';
    };

    $scope.editDocument = function(document){
        $location.path('/editdocument/' + document._id);
    };

    $scope.deleteDocument = function(document) {
      $http.delete('/api/documents/' + document._id);
    };






    /*
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };
  */

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('document');
    });
  });
