(function() {

  'use strict';

  angular.module('titannicCmsApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'btford.socket-io',
    'ui.router',
    'angularMoment'
  ])
  /**
   *
   * Config
   */
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider, $logProvider) {

      $urlRouterProvider
        .otherwise('/');

      $locationProvider.html5Mode(true);
      $httpProvider.interceptors.push('authInterceptor');

      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://localhost/**',

        'http://titanic.solnetsolutions.co.nz:80/**',
        'http://titanic.solnetsolutions.co.nz/**',
        'titanic.solnetsolutions.co.nz:80/**',
        'titanic.solnetsolutions.co.nz/**',

        'solnet.co.nz/**',
        'www.solnet.co.nz/**',
        'http://www.solnet.co.nz:80/**',
        'http://www.solnet.co.nz/**',
        'https://www.solnet.co.nz:443/**',
        'https://www.solnet.co.nz/**'
      ]);

      // The blacklist overrides the whitelist so the open redirect here is blocked.
      $sceDelegateProvider.resourceUrlBlacklist([
        'http://blacklist.example.com'
      ]);


      //TODO abstract to config server provider / inject as js?
      if($('#server-config #env').text() === 'production'){
        $logProvider.debugEnabled(false);
      }

    })

  /**
   * Interceptor
   *
   */
    .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
      return {
        // Add authorization token to headers
        request: function (config) {
          config.headers = config.headers || {};
          if ($cookieStore.get('token')) {
            config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
          }
          return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function (response) {
          if (response.status === 401) {
            $location.path('/login');
            // remove any stale tokens
            $cookieStore.remove('token');
            return $q.reject(response);
          }
          else {
            return $q.reject(response);
          }
        }
      };
    })
  /**
   * App run
   *
   */
    .run(function ($rootScope, $location, Auth, $window, Notification, $log, $timeout) {

      /**
       * Redirect to login if route requires auth and you're not logged in
       */
      $rootScope.$on('$stateChangeStart', function (event, next) {
        Auth.isLoggedInAsync(function (loggedIn) {
          if (next.authenticate && !loggedIn) {
            $log.debug('Unauthed state change start redir to /login');
            $location.path('/login');
          }
        });
      });

      $rootScope.$on('$stateChangeError', function(error, state){

        if(state.name === 'login'){
          $log.debug('cancel logout from login route', arguments);

          $timeout(function(){
            $location.path('/');
          });
        }
        else{
          $log.error('state change error', arguments);
        }

      });


        /**
       *
       * @returns {Boolean}
       */
      $rootScope.isAdmin = function(){
        return Auth.isAdmin();
      };

      //add a class based upon the current route
      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        try {
          var split = toState.name.split('.');
          $rootScope.currentRoute = split[0];
        }
        catch (error) {
          $log.debug('Error trying to attach body class name', error);
        }
      });


      /**
       *
       */
      $rootScope.$on('$viewContentLoaded', function (event) {

        var $elLoaderScreen = $('#index-loader-screen');



        //TODO would be nicer with promises in app run
        //   on route load/ready/rendered...
        setTimeout(function () {
          $elLoaderScreen.css('height', $(document).height() +'px');
          $elLoaderScreen.toggleClass('fade-out', true);
        }, 200);


        setTimeout(function () {
          if ($elLoaderScreen) {
            $elLoaderScreen.remove();
          }
        }, 1000);

      });


      /**
       *
       * @type {boolean}
       */
      $rootScope.isOnline = navigator.onLine;
      $window.addEventListener('offline', function () {
        $rootScope.$apply(function() {
          $rootScope.isOnline = false;
        });
      }, false);
      $window.addEventListener('online', function () {
        $rootScope.$apply(function() {
          $rootScope.isOnline = true;
        });
      }, false);


      /**
       * bind to the global error handler so we can create notifications for unhandled exceptions
       *
       * @type {Function}
       */
      var onErrorOriginal = $window.onerror || function () {};

      $window.onerror = function (errorMsg, url, lineNumber) {
        onErrorOriginal();
        Notification.error('Uncaught explosions!!! ' + errorMsg);
        $log.error(errorMsg);
        $log.error(url + ' ' + lineNumber);

      };

    });

})();
