/* global noty */

(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .service('Notification', function ($log, $timeout, $rootScope, $location) {


      var self = this;
      var confimationActive = false;
      var $n;
      var $notificationScreen;

      function fadeoutNoty(){

        var fadeOutSuccessful = false;

        $notificationScreen.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          if( ! fadeOutSuccessful) {
            fadeOutSuccessful = true;
            $notificationScreen.toggleClass('active', false);
          }
        });

        $timeout(function(){
          $timeout(function(){
            if( ! fadeOutSuccessful){
              fadeOutSuccessful = true;
              $notificationScreen.toggleClass('active', false);
            }
          }, 501);

          $notificationScreen.toggleClass('fade-in', false);
        });

      }



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


        fadeoutNoty();


        confimationActive = false;
      }



      /**
       *
       * @param content
       * @param yesCallback
       * @param noCallback
       */
      self.confirmation = (function(){

        var _yesCallback,
            _noCallback;

        function cancelNoty(){
          closeNoty();
          $notificationScreen.off('click', cancelNoty);
          _noCallback();
        }

        $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
         //$log.debug(event, toState, toParams, fromState, fromParams);

          if ( confimationActive) {
            event.preventDefault();
            history.pushState($location.path());
            cancelNoty();
          }

        });

        return function (content, yesCallback, noCallback, options) {
        
          if( ! confimationActive){

            confimationActive = true;

            _yesCallback = yesCallback || function(){};
            _noCallback = noCallback || function(){};

            options = options || {};
            options.yesText = options.yesText || 'Delete';
            options.noText = options.noText || 'Cancel';

            $notificationScreen = $('#notification-screen');

            $notificationScreen.toggleClass('active', true);
            $timeout(function(){
              $notificationScreen.toggleClass('fade-in', true);
            });

            $notificationScreen.on('click', cancelNoty);


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
                  text: options.yesText,
                  onClick: function ($noty) {

                    closeNoty();

                    $notificationScreen.off('click', cancelNoty);

                    _yesCallback();
                  }
                },
                {
                  addClass: 'btn btn-primary',
                  text: options.noText,
                  onClick: function ($noty) {

                    cancelNoty();


                  }
                }
              ]
            });

          }

        };

      }());



      /**
       *
       * @param content
       */
      self.success = function (content, options) {

        options = options || {};
        options.duration = options.duration || 3000;


        var n = noty({
          text: content,
          type: 'success',
          timeout: options.duration,
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
      self.info = function (content, options) {

        options = options || {};
        options.duration = options.duration || 3000;


        var n = noty({
          text: content,
          type: 'info',
          timeout: options.duration,
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

        options.onClickCallback = options.onClickCallback || function () {};
        options.duration = options.duration || 3000;

        var n = noty({
          text: content,
          type: 'error',
          timeout: options.duration,
          theme: 'relax',
          layout: 'topCenter',
          animation: {
            open: 'animated zoomIn', // Animate.css class names
            close: 'animated zoomOut', // Animate.css class names
            easing: 'swing', // unavailable - no need
            speed: 500 // unavailable - no need
          },
          callback: {
            onCloseClick: options.onClickCallback
          }
        });

      };


    });

})();
