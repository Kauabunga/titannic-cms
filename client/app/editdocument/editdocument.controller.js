'use strict';

angular.module('titannicCmsApp')
  .controller('EditdocumentCtrl', function ($scope, $stateParams, $log, $http, Document, Notification, $rootScope, $location, socket) {

    $scope.document = undefined;
    $scope.documentContent = undefined;

    $log.debug('Editing document', $stateParams.documentId);


    /**
     * TODO this is nasty having to watch the entire document should subscribe to the $emit event
     */
    $scope.$watch('document', function(){
      updateContent();
    }, true);

    /**
     *
     */
    var destroyHandle = $scope.$on('$destroy', function(){
      $log.debug('EditdocumentCtrl $destroy', socket);

      destroyHandle();
    });


    /**
     *
     */
    function updateContent(){

      if($scope.document !== undefined){
        $scope.documentContent = JSON.stringify($scope.document.content);
        $log.debug($scope.documentContent);
      }
      else if(typeof $scope.document !== 'undefined'){
        $log.error('Content not a json object', $scope.document);

        Notification.error('Updating. Content not a json object');
      }

    }

    /**
     *
     */
    (function init(){


      var getDocumentDeferred = Document.getDocument($stateParams.documentId);
      getDocumentDeferred.finally(function(){

      });

      getDocumentDeferred.then(
        function success(document){
          $log.debug('Successful Edit get document', $stateParams.documentId);
          $scope.document = document;

        },
        function error(statusCode){

          if(statusCode === 401){
            Notification.error('You need to login to access this document');
            $location.path('/');
          }
          else if(statusCode === 423){
            //TODO Document is already in use
            $log.error('Document already in use', statusCode);
            Notification.error('Document already in use');
            $location.path('/');
          }
          else if(statusCode === 404){
            //not found redirect home
            Notification.error('Document not found / ain\'t exist');

            $location.path('/');

          }
          else{
            $log.error('Something went wrong getting document', statusCode);
            Notification.error('Something went wrong getting document');
          }

        });

    })();


    /**
     *
     */
    $scope.updateDocument = function updateDocument(){
      var updateDefered = Document.updateDocument($stateParams.documentId);

      updateDefered.then(function success(){

      },
      function error(){

      });

    };


    /**
     *
     */
    $scope.previewDocument = function previewDocument(){
      $location.path('/previewdocument/' + $stateParams.documentId);
    };


  });
