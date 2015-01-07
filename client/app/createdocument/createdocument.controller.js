(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('CreatedocumentCtrl', function ($scope, $log, $http, $q, Document, $location, Schema, Notification, $timeout) {


      //Document model
      $scope.document = {
        name: '',
        info: '',
        liveContentGoogleDocId: '',
        devContentGoogleDocId: '',
        schemaId: ''
      };

      $scope.schemaList = undefined;
      $scope.fadeIn = undefined;

      //TODO permission levels

      (function init() {
        var schemaDeferred = Schema.getAll();

        schemaDeferred.then(
          function success(schemas) {
            $scope.schemaList = schemas;
          },
          function error() {
            Notification.error('Failed to get schema list');
          }
        );

        $timeout(function(){
          $scope.fadeIn = true;
        }, 50);

      })();

      /**
       *
       */
      $scope.newDocument = function newDocument() {

        var deferred = $q.defer();

        var validationDeferred = isValid();

        validationDeferred.then(
          function success(valid) {

            if (!valid) {
              $log.debug('Form invalid');

              Notification.error('Some fields are buggered mate');

              deferred.reject();
            }
            else {

              $log.debug('Adding new document', $scope);

              var createDeferred = Document.createDocument($scope.document);
              createDeferred.then(
                function success() {
                  $location.path('/');
                },
                function error() {
                  Notification.error('Server failed to create new document');
                });

            }

          },
          function error() {
            //TODO handle validation error
            Notification.error('New document form invalid');

          });


        return deferred.promise;

      };

      /**
       *
       * @returns {boolean}
       */
      function isValid() {

        //TODO validate that the google doc id is valid i.e. can get publicly and can edit via server

        var deferred = $q.defer();

        deferred.resolve($scope.documentForm.$valid);

        return deferred.promise;
      }




    });

})();
