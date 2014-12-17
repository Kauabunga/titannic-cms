'use strict';

angular.module('titannicCmsApp')
  .service('Notification', function () {


    var self = this;


    /**
     *
     * @param content
     * @param yesCallback
     * @param noCallback
     */
    self.confirmation = function(content, yesCallback, noCallback){

      var n = noty({
        text: content,
        type: 'info',
        timeout: 2000,
        theme: 'relax',
        layout: 'center',
        animation: {
          open: 'animated bounceInLeft', // Animate.css class names
          close: 'animated bounceOutRight', // Animate.css class names
          easing: 'swing', // unavailable - no need
          speed: 500 // unavailable - no need
        },
        buttons: [
          {
            addClass: 'btn btn-primary',
            text: 'Ok', onClick: function($noty) {
              $noty.close();
              // this = button element
              // $noty = $noty element
              yesCallback();

            }
          },
          {
            addClass: 'btn btn-danger',
            text: 'Cancel', onClick: function ($noty) {
              $noty.close();
              noCallback();
            }
          }
        ]
      });

    };

    /**
     *
     * @param content
     */
    self.success = function(content){
      var n = noty({
        text: content,
        type: 'success',
        timeout: 2000,
        theme: 'relax',
        layout: 'topCenter',
        animation: {
          open: 'animated bounceInLeft', // Animate.css class names
          close: 'animated bounceOutRight', // Animate.css class names
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
        timeout: 3000,
        theme: 'relax',
        layout: 'topCenter',
        animation: {
          open: 'animated bounceInLeft', // Animate.css class names
          close: 'animated bounceOutRight', // Animate.css class names
          easing: 'swing', // unavailable - no need
          speed: 500 // unavailable - no need
        }
      });

    };




  });
