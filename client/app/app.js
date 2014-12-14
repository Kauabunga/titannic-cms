'use strict';

angular.module('titannicCmsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router'
])
/**
 *
 * Config
 */
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
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
      responseError: function(response) {
        if(response.status === 401) {
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
  .run(function ($rootScope, $location, Auth, $window, Notification, $log) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });


    //bind to the global error handler so we can create notifications for unhandled exceptions
    var onErrorOriginal = $window.onerror || function(){};
    $window.onerror = function(errorMsg, url, lineNumber) {

      onErrorOriginal();
      Notification.error('Uncaught explosions!!! ' + errorMsg);
      $log.error(errorMsg);
      $log.error(url + ' ' + lineNumber);

    };

  });
