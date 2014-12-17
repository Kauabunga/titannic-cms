'use strict';

angular.module('titannicCmsApp')
  .controller('MainCtrl', function ($scope, $http, socket, $location, Schema, Document, Notification, $log, Auth) {

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
        function error(error){
          Notification.error('Error loading document list');
          $log.error('Error loading document list', error);
        });


      var schemaDeferred = Schema.getAll();

      schemaDeferred.then(
        function success(schemas){
          $scope.schemaList = schemas;
          socket.syncUpdates('schema', $scope.schemaList);

        },
        function error(error){
          Notification.error('Error loading schema list');
          $log.error('Error loading schema list', error);
      });

    })();


    /**
     *
     * @param document
     */
    $scope.editDocument = function editDocument(document){

      function onClickCallback(){
        $scope.$apply(function(){
          $location.path('/login')
        });
      }

      if(Auth.isLoggedIn()){
        $location.path('/editdocument/' + document._id);
      }
      else{
        Notification.error('You need to be logged in to access this document', {
          onClickCallback: onClickCallback
        });
      }

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

      function yesCallback(){
        $log.debug('yes callback for delete');
        Document.deleteDocument(document._id);

      }
      function noCallback(){
        $log.debug('no callback for delete');
      }
      Notification.confirmation('Are you sure you want to delete the document?', yesCallback, noCallback);



    };

    /**
     *
     */
    var destroyHandle = $scope.$on('$destroy', function () {
      $log.debug('Main Ctrl $destroy');

      socket.unsyncUpdates('document');
      socket.unsyncUpdates('schema');
      destroyHandle();
    });
  });
