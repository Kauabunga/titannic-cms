(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('MainCtrl', function ($scope, $http, socket, $location, Schema, Document, Notification, $log, Auth, $timeout, $q) {

      $scope.documentList = undefined;
      $scope.schemaList = undefined;

      $scope.fadeIn = false;

      /**
       * timeout on init to ensure that all the user state is sorted out
       */
      $timeout(function init() {

        //need to ensure that the user is logged in before loading resources as this is the landing page
        var loggedinDeferred = $q.defer();

        if(Auth.isLoggedIn()){
          loggedinDeferred.resolve();
        }
        else{
          //perform an async login check - its possible that our session has timed out but we can live with that edge case

          Auth.isLoggedInAsync(function(isLoggedIn){

            if(isLoggedIn){
              loggedinDeferred.resolve();
            }
            else{
              //should be handled by our routing
            }
          });

        }


        //We do not want to go fetching all this junk if the user is not authenticated.
        //It is tricky as this is our landing page and our authentication router hook is dependant on the
        // async login call
        loggedinDeferred.promise.finally(function(){

          var documentDeferred = Document.getAll();
          var schemaDeferred;

          if(Auth.isAdmin()){
            schemaDeferred = Schema.getAll();

            schemaDeferred.then(
              function success(schemas) {
                $scope.schemaList = schemas;
                socket.syncUpdates('schema', $scope.schemaList);

              },
              function error(schemaError) {
                Notification.error('Error loading schema list');
                $log.error('Error loading schema list', schemaError);
              });

          }
          else{
            schemaDeferred = $q.when();
          }

          $q.all([documentDeferred, schemaDeferred]).finally(function () {
            $timeout(function () {
              $scope.fadeIn = true;
            });
          });

          documentDeferred.then(
            function success(documents) {
              $scope.documentList = documents;
              socket.syncUpdates('document', $scope.documentList);
            },
            function error(documentError) {
              Notification.error('Error loading document list');
              $log.error('Error loading document list', documentError);
            });

        });


      });


      /**
       * ensure that our main page fades in at most after 200ms
       */
      $timeout(function () {
        $scope.fadeIn = true;
      }, 200);


      /**
       *
       * @returns {Boolean}
       */
      $scope.isAdmin = function(){
        return Auth.isAdmin();
      };

      /**
       *
       * @param document
       */
      $scope.editDocument = function editDocument(document) {

        function onClickCallback() {
          $scope.$apply(function () {
            $location.path('/login');
          });
        }

        if (Auth.isLoggedIn()) {
          $location.path('/editdocument/' + document._id);
        }
        else {
          Notification.error('You need to be logged in to access this document', {
            onClickCallback: onClickCallback
          });
        }

      };

      /**
       *
       * @param schema
       */
      $scope.editSchema = function editSchema(schema) {
        $location.path('/editschema/' + schema._id);
      };

      /**
       *
       */
      $scope.createDocument = function createDocument() {
        $location.path('/createdocument');
      };

      /**
       *
       */
      $scope.createSchema = function createSchema() {
        $location.path('/createschema');
      };

      /**
       *
       * @param $event
       * @param document
       */
      $scope.deleteDocument = function deleteDocument($event, document) {



        function yesCallback() {
          $log.debug('yes callback for delete');
          var deleteDeferred = Document.deleteDocument(document._id);

          deleteDeferred.then(function(){
            Notification.success('Document deleted');
          });

          $scope.$apply(function () {
            $scope.deletingDocument = false;
          });

        }

        function noCallback() {
          $log.debug('no callback for delete');
          $scope.$apply(function () {
            $scope.deletingDocument = false;
          });
        }



        if( ! $scope.deletingDocument){
          //Do not want to trigger the edit document click trigger
          $event.preventDefault();
          $event.stopPropagation();

          $scope.deletingDocument = true;

          Notification.confirmation('Are you sure you want to delete the document?', yesCallback, noCallback);
        }

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

})();
