'use strict';

angular.module('titannicCmsApp')
  .controller('MainCtrl', function ($scope, $http, socket, $location, Schema, Document) {

    $scope.documentList = undefined;
    $scope.schemaList = undefined;


    /**
     *
     */
    (function init(){

      var documentDeferred = Document.getAll();

      documentDeferred.then(
        function success(documents){
          $scope.documentList = documents;
          socket.syncUpdates('document', $scope.documentList);
        },
        function error(){

        });


      var schemaDeferred = Schema.getAll();

      schemaDeferred.then(
        function success(schemas){
          $scope.schemaList = schemas;
          socket.syncUpdates('schema', $scope.schemaList);

        },
        function error(){

      });

    })();


    /**
     *
     * @param document
     */
    $scope.editDocument = function editDocument(document){
      $location.path('/editdocument/' + document._id);
    };

    /**
     *
     * @param schema
     */
    $scope.editSchema = function editSchema(schema){
      $location.path('/editschema/' + schema._id);
    };

    /**
     *
     */
    $scope.createDocument = function createDocument(){
      $location.path('/createdocument');
    };

    /**
     *
     */
    $scope.createSchema = function createSchema(){
      $location.path('/createschema');
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

      Document.deleteDocument(document._id);

    };

    /**
     *
     */
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('document');
      socket.unsyncUpdates('schema');
    });
  });
