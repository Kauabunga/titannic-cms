/* global Select */

(function(){

  'use strict';

  console.log('uyoyoyoyo');
  angular.module('titannicCmsApp')
    .directive('select', function ($log, $timeout) {
      return {
        templateUrl: 'app/select/select.html',
        restrict: 'EAC',
        link: function (scope, element, attrs) {

          $timeout(function(){
            Select.init();
          });


        }
      };
    });


})();
