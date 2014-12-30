(function(){


  'use strict';

  angular.module('titannicCmsApp')
    .directive('select', function ($log) {
      return {
        templateUrl: 'app/select/select.html',
        restrict: 'EA',
        link: function (scope, element, attrs) {

          $log.debug('Select directive link');


        }
      };
    });


})();
