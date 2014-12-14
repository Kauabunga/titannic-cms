'use strict';

angular.module('titannicCmsApp')
  .service('Notification', function () {


    var self = this;


    /**
     *
     * @param content
     */
    self.error = function(content){
      var n = noty({
        text: content,
        animation: {
          type: 'error',
          open: 'animated bounceInLeft', // Animate.css class names
          close: 'animated bounceOutLeft', // Animate.css class names
          easing: 'swing', // unavailable - no need
          speed: 500 // unavailable - no need
        }
      });

    };


  });
