'use strict';

angular.module('titannicCmsApp')
  .service('Notification', function () {


    var self = this;


    /**
     *
     * @param content
     */
    self.success = function(content){
      var n = noty({
        text: content,
        type: 'success',
        timeout: 5000,
        theme: 'relax',
        animation: {
          open: 'animated bounceInLeft', // Animate.css class names
          close: 'animated bounceOutLeft', // Animate.css class names
          easing: 'swing', // unavailable - no need
          speed: 500 // unavailable - no need
        }
      });
    };

    /**
     *
     * @param content
     */
    self.error = function(content){
      var n = noty({
        text: content,
        type: 'error',
        timeout: 5000,
        theme: 'relax',
        animation: {
          open: 'animated bounceInLeft', // Animate.css class names
          close: 'animated bounceOutLeft', // Animate.css class names
          easing: 'swing', // unavailable - no need
          speed: 500 // unavailable - no need
        }
      });

    };




  });
