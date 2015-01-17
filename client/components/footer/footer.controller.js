(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .controller('FooterCtrl', function ($scope, $location, $log, $state, Document, $stateParams, $timeout) {

      $scope.documentName = undefined;
      $scope.fadeInDocumentName = undefined;

      /**
       *
       */
      $scope.goHome = function(){
        $location.path('/');
      };


      /**
       *
       */
      $timeout(function init(){
        if($state.current.name === 'previewdocument'){
          $log.debug($state);

          var documentDeferred = Document.getAll();
          documentDeferred.then(function success(documents){
            var i;
            for(i = 0; i < documents.length; i++){
              if(documents[i]._id === $stateParams.documentId){
                $scope.documentName = documents[i].name;
              }
            }
            $timeout(function(){
              $scope.fadeInDocumentName = true;
            }, 50);

          });
        }
      }, 2000);


    });

})();
