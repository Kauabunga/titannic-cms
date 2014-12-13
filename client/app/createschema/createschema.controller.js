'use strict';

angular.module('titannicCmsApp')
  .controller('CreateschemaCtrl', function ($scope, $log, $http, $q, $location) {

    //Document model
    $scope.document = {
      name: '',
      info: '',
      googleDocSchemaId: ''
    };

    //TODO permission levels

    /**
     *
     */
    $scope.newSchema = function newDocument() {

      $log.debug('Adding new schema', $scope);

      var deferred = $q.defer();

      var validationDeferred = isValid();

      validationDeferred.then(
        function success(valid){

          if(! valid) {
            deferred.reject();
          }
          else{

            $http.post('/api/schemas', $scope.schema)
              .success(function(data, status){
                deferred.resolve(data, status);
                $location.path('/');
              })
              .error(function(data, status){
                deferred.reject(data, status);
              });
          }

        },
        function error(){
          //TODO handle validation error
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

      if($scope.schema.name === '' ||
        $scope.schema.googleDocSchemaId === ''){

        valid = false;
      }

      deferred.resolve(valid);

      return deferred.promise;
    }

    /**
     *
     */
    function reset(){
      $scope.schema = {
        name: '',
        info: '',
        googleDocSchemaId: ''
      }
    }





  });
