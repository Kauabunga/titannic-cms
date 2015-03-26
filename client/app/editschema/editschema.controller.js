(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditschemaCtrl', function ($scope, $stateParams, Schema, $location, Notification, $log) {


      $scope.schemaId = $stateParams.schemaId;
      $scope.schemaDocument = undefined;
      $scope.schemaPromise = undefined;
      $scope.schemaDocumentContent = undefined;


      $scope.fadeIn = false;

      /**
       *
       */
      (function init() {

        $scope.schemaPromise = Schema.getSchema($scope.schemaId);

        $scope.schemaPromise.then(
          function success(schema){

            $log.debug('Edit Schema ctrl :: get schema', schema);

            schema.schema = Schema.getMetaSchema();

            $scope.schemaDocument = schema;
            $scope.schemaDocumentContent = schema.content;



            $scope.fadeIn = true;

          },
          function error(err){
            $log.error('Unable to find schema', err);
            Notification.error('unable to find schema');
            $location.path('/');
          });



      })();


    });

})();
