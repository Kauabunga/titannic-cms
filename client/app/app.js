(function() {

  'use strict';

  angular.module('titannicCmsApp', [
    'ngCookies',
    'ngTouch',
    'ngResource',
    'ngSanitize',
    'btford.socket-io',
    'ui.router',
    'headroom',
    'cfp.hotkeys',
    'angularMoment'
  ])
  /**
   * constants
   */
  .constant('angularMomentConfig', {
    timezone: 'Pacific/Auckland'
  })
  /**
   *
   * Config
   */
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider, $logProvider) {

      $urlRouterProvider
        .otherwise('/');

      $locationProvider.html5Mode(true);
      $httpProvider.interceptors.push('authInterceptor');




      //TODO abstract to config server provider / inject as js?
      if($('#server-config #env').text() === 'production'){
        $logProvider.debugEnabled(false);
      }


      //allow other devices to access the preview iframe on our dev envs
      var devHostHttp = 'self';
      var devHostHttps = 'self';
      if($('#server-config #host').text()){
        devHostHttp = 'http://' + $('#server-config #host').text() + '/**';
        devHostHttps = 'https://' + $('#server-config #host').text() + '/**';
      }

      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://localhost/**',
        devHostHttp,
        devHostHttps,

        'http://titanic.solnetsolutions.co.nz:80/**',
        'http://titanic.solnetsolutions.co.nz/**',
        'titanic.solnetsolutions.co.nz:80/**',
        'titanic.solnetsolutions.co.nz/**',

        'http://titannic-dev-heroku.herokuapp.com:80/**',
        'http://titannic-dev-heroku.herokuapp.com/**',
        'titannic-dev-heroku.herokuapp.com:80/**',
        'titannic-dev-heroku.herokuapp.com/**',

        'titannic-dev-heroku.herokuapp.com:443/**',
        'https://titannic-dev-heroku.herokuapp.com:443/**',
        'https://titannic-dev-heroku.herokuapp.com/**',

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



    })

  /**
   * Interceptor
   *
   */
    .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location, $timeout){
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

            // remove any stale tokens
            $cookieStore.remove('token');

            var deferred = $q.defer();

            //give the logout a second
            $timeout(function(){
              $location.path('/login');
              deferred.reject(response);
            });

            return deferred.promise;
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
    .run(function ($rootScope, $location, Auth, $window, Notification, $log, $timeout, amMoment) {

      $log.debug(angular);


      amMoment.changeLocale('en-gb');





      /**
       * temporary warning to say that chrome is currently the only smoke tested browser
       */
      function browserWarningCallback(){
        if(window.localStorage){
          window.localStorage.setItem('browser:warning', true);
        }
      }
      $timeout(function(){
        if(window.localStorage){
          var hasAlreadyDismissed = window.localStorage.getItem('browser:warning');
          $log.debug(hasAlreadyDismissed);
          if(hasAlreadyDismissed === null){
            var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            if(! isChrome){
              Notification.confirmation('This has only been smoke tested in Chrome. There may be explosions using this browser.', browserWarningCallback, browserWarningCallback, {yesText: 'Okay', noText: 'Okay'});
            }
          }
        }
      }, 1000);


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

      /**
       *
       * @returns {Boolean}
       */
      $rootScope.isPublisher = function(){
        return Auth.isPublisher();
      };

      /**
       *
       * @returns {Boolean}
       */
      $rootScope.isEditor = function(){
        return Auth.isEditor();
      };

      //add a class based upon the current route
      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        try {
          var split = toState.name.split('.');
          $rootScope.currentRoute = split[0];
          $rootScope.currentSubroute = split[1] || '';
          $rootScope.currentSubsubroute = split[2] || '';
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
