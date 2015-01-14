(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('EditdocumentContentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket, $timeout) {

      $scope.fadeIn = undefined;
      $scope.isUpdating = undefined;
      $scope.isPublishing = undefined;

      $scope.isDirty = undefined;

      $scope.resetEditor = $scope.resetEditor || undefined;
      $scope.toggleEditorOptions = $scope.toggleEditorOptions || undefined;

      /**
       *
       */
      (function init() {

        $timeout(function () {
          $scope.fadeIn = true;
        }, 0);

      })();

      /**
       *
       */
      $scope.updateDocument = function updateDocument() {

        if(! $scope.isUpdating && ! $scope.isPublishing){

          $scope.isUpdating = true;

          var $inputs = $('span.json-editor input');
          $inputs.attr('disabled', 'disabled');
          var updateDeferred = Document.updateDocument($stateParams.documentId);

          updateDeferred.finally(function(){
            $timeout(function(){
              $scope.isUpdating = false;
              $inputs.removeAttr('disabled');
            });

          });

        }

      };


      /**
       *
       */
      $scope.publishDocument = function publishDocument() {

        function yesCallback(){
          $scope.isPublishing = true;

          var $inputs = $('span.json-editor input');
          $inputs.attr('disabled', 'disabled');

          var publishDeferred = Document.publishDocument($stateParams.documentId);

          publishDeferred.finally(function(){
            $timeout(function(){
              $scope.isPublishing = false;

              $inputs.removeAttr('disabled');
            });

          });


        }

        function noCallback(){
          $scope.isPublishing = false;
        }


        if($scope.isDirty){
          Notification.info('You need to update the dev document before publishing');
        }
        else if(! $scope.isUpdating && ! $scope.isPublishing){
          Notification.confirmation('Are you sure you want make this document live?', yesCallback, noCallback, {yesText: 'Publish', noText: 'Cancel'});
        }

      };


      /**
       *
       */
      $scope.previewDocument = function previewDocument($event) {

        if($scope.isUpdating || $scope.isPublishing){
          $event.preventDefault();
        }
      };


      /**
       *
       */
      $scope.gotoHistory = function(){
        $location.path('/editdocument/' + $scope.document._id + '/history');
      };






    });

})();
