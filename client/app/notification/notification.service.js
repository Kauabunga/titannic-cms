/* global noty */

(function() {

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
      self.confirmation = function (content, yesCallback, noCallback, options) {

        yesCallback = yesCallback || function(){};
        noCallback = noCallback || function(){};

        options = options || {};
        options.yesText = options.yesText || 'Delete';
        options.noText = options.noText || 'Cancel';

        var n = noty({
          text: content,
          type: 'info',
          theme: 'relax',
          layout: 'center',
          animation: {
            open: 'animated zoomIn', // Animate.css class names
            close: 'animated zoomOut', // Animate.css class names
            easing: 'swing', // unavailable - no need
            speed: 300 // unavailable - no need
          },
          buttons: [
            {
              addClass: 'btn btn-danger',
              text: options.yesText, onClick: function ($noty) {
              $noty.close();
              // this = button element
              // $noty = $noty element
              yesCallback();

            }
            },
            {
              addClass: 'btn btn-primary',
              text: options.noText, onClick: function ($noty) {
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
      self.success = function (content) {
        var n = noty({
          text: content,
          type: 'success',
          timeout: 3000,
          theme: 'relax',
          layout: 'topCenter',
          animation: {
            open: 'animated zoomIn', // Animate.css class names
            close: 'animated zoomOut', // Animate.css class names
            easing: 'swing', // unavailable - no need
            speed: 500 // unavailable - no need
          }
        });
      };

      /**
       *
       * @param content
       */
      self.info = function (content) {
        var n = noty({
          text: content,
          type: 'info',
          timeout: 2000,
          theme: 'relax',
          layout: 'topCenter',
          animation: {
            open: 'animated zoomIn', // Animate.css class names
            close: 'animated zoomOut', // Animate.css class names
            easing: 'swing', // unavailable - no need
            speed: 500 // unavailable - no need
          }
        });
      };

      /**
       *
       * @param content
       */
      self.error = function (content, options) {

        options = options || {};

        var onClickCallback = options.onClickCallback || function () {
          };

        var n = noty({
          text: content,
          type: 'error',
          timeout: 3000,
          theme: 'relax',
          layout: 'topCenter',
          animation: {
            open: 'animated zoomIn', // Animate.css class names
            close: 'animated zoomOut', // Animate.css class names
            easing: 'swing', // unavailable - no need
            speed: 500 // unavailable - no need
          },
          callback: {
            onCloseClick: onClickCallback
          }
        });

      };


    });

})();
