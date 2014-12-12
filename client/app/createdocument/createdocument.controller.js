'use strict';

angular.module('titannicCmsApp')
  .controller('CreatedocumentCtrl', function ($scope, $log, $http, $q) {


    //Document model
    $scope.document = {
      name: '',
      info: '',
      googleDocContentId: ''
    };

    //TODO permission levels


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

            $http.post('/api/documents', $scope.document)
              .success(function(data, status){
                deferred.resolve(data, status);
                reset();
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

      if($scope.document.name === '' ||
          $scope.document.googleDocContentId === ''){

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
        googleDocContentId: ''
      }
    }


  });
