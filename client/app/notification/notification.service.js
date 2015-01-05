/* global noty */

(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .service('Notification', function () {


      var self = this;


      var confimationActive = false;

      /**
       *
       * @param content
       * @param yesCallback
       * @param noCallback
       */
      self.confirmation = function (content, yesCallback, noCallback, options) {

        var $n;

        function closeNoty(){

          if($n){
            //TODO have to wait for it to be completely open?
            $n.close();
          }

          setTimeout(function(){
            $n.close();
          }, 200);

          setTimeout(function(){
            $n.close();
          }, 500);

          setTimeout(function(){
            $n.close();
          }, 1000);

          $notificationScreen.toggleClass('active', false);
          $notificationScreen.off('click', closeNoty);
          confimationActive = false;
          noCallback();
        }

        if( ! confimationActive){

          confimationActive = true;

          yesCallback = yesCallback || function(){};
          noCallback = noCallback || function(){};

          options = options || {};
          options.yesText = options.yesText || 'Delete';
          options.noText = options.noText || 'Cancel';

          var $notificationScreen = $('#notification-screen');

          $notificationScreen.toggleClass('active', true);

          $notificationScreen.on('click', closeNoty);


          $n = noty({
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


                setTimeout(function(){
                  $noty.close();
                }, 500);

                $notificationScreen.off('click', closeNoty);
                $notificationScreen.toggleClass('active', false);
                yesCallback();
                confimationActive = false;
              }
              },
              {
                addClass: 'btn btn-primary',
                text: options.noText, onClick: function ($noty) {
                $noty.close();
                setTimeout(function(){
                  $noty.close();
                }, 500);
                $notificationScreen.off('click', closeNoty);
                $notificationScreen.toggleClass('active', false);
                noCallback();
                confimationActive = false;


              }
              }
            ]
          });


        }


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
