'use strict';

angular.module('titannicCmsApp')
  .controller('CreatedocumentCtrl', function ($scope, $log, $http, $q, Document, $location, Schema, Notification) {


    //Document model
    $scope.document = {
      name: '',
      info: '',
      googleDocContentId: '',
      schemaId: ''
    };

    $scope.schemaList = undefined;

    //TODO permission levels

    (function init(){
      var schemaDeferred = Schema.getAll();

      schemaDeferred.then(
        function success(schemas){
          $scope.schemaList = schemas;
        },
        function error(){
          Notification.error('Failed to get schema list');
        }
      );

    })();

    /**
     *
     */
    $scope.newDocument = function newDocument() {

      $log.debug('Adding new document', $scope);

      var deferred = $q.defer();

      var validationDeferred = isValid();

      validationDeferred.then(
        function success(valid){

          if(! valid) {
            deferred.reject();
          }
          else{

            var createDeferred = Document.createDocument($scope.document);
            createDeferred.then(
              function success(){
                $location.path('/');
              },
              function error(){
                Notification.error('Server failed to create new document');
            })

          }

        },
        function error(){
          //TODO handle validation error
          Notification.error('New document form invalid');

        });


      return deferred.promise;

    };

    /**
     *
     * @returns {boolean}
     */
    function isValid(){

      //TODO validate that the google doc id is valid i.e. can get publicly and can edit via server

      var deferred = $q.defer();
      var valid = true;

      if($scope.document.name === '' ||
          $scope.document.googleDocContentId === '' ||
          $scope.document.schemaId === ''){

        valid = false;
      }

      deferred.resolve(valid);

      return deferred.promise;
    }

    /**
     *
     */
    function reset(){
      $scope.document = {
        name: '',
        info: '',
        googleDocContentId: '',
        schemaId: ''
      }
    }


  });
