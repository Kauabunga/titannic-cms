(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
      var currentUser = {};
      if ($cookieStore.get('token')) {
        currentUser = User.get();
      }

      return {

        /**
         * Authenticate user and save token
         *
         * @param  {Object}   user     - login info
         * @param  {Function} callback - optional
         * @return {Promise}
         */
        login: function (user, callback) {
          var cb = callback || angular.noop;
          var deferred = $q.defer();

          $http.post('/auth/local', {
            email: user.email,
            password: user.password
          }).
            success(function (data) {
              $cookieStore.put('token', data.token);
              currentUser = User.get();
              deferred.resolve(data);
              return cb();
            }).
            error(function (err) {
              this.logout();
              deferred.reject(err);
              return cb(err);
            }.bind(this));

          return deferred.promise;
        },

        /**
         * Delete access token and user info
         *
         * @param  {Function}
         */
        logout: function () {
          $cookieStore.remove('token');
          currentUser = {};
        },

        /**
         *
         */
        getRoles: function(){
          var deferred = $q.defer();

          $http.get('api/users/roles')
            .success(function(successResponse){
              deferred.resolve(successResponse);
            })
            .error(function(errorResponse, statusCode){
              deferred.reject(statusCode);
            });

          return deferred.promise;
        },

        /**
         * Create a new user
         *
         * @param  {Object}   user     - user info
         * @param  {Function} callback - optional
         * @return {Promise}
         */
        createUser: function (user, callback) {
          var cb = callback || angular.noop;

          return User.save(user,
            function (data) {
              $cookieStore.put('token', data.token);
              currentUser = User.get();
              return cb(user);
            },
            function (err) {
              this.logout();
              return cb(err);
            }.bind(this)).$promise;
        },

        /**
         * Create a new user from a admin account
         *
         * @param  {Object}   user     - user info
         * @return {Promise}
         */
        adminCreateUser: function (user) {

          var deferred = $q.defer();

          $http.post('/api/users/admincreate', user)
            .success(function(response){
              deferred.resolve(response);
            })
            .error(function(response, status){
              deferred.reject(status);
            });

          return deferred.promise;

        },

        /**
         * Change password
         *
         * @param  {String}   oldPassword
         * @param  {String}   newPassword
         * @param  {Function} callback    - optional
         * @return {Promise}
         */
        changePassword: function (oldPassword, newPassword, callback) {
          var cb = callback || angular.noop;

          return User.changePassword({id: currentUser._id}, {
            oldPassword: oldPassword,
            newPassword: newPassword
          }, function (user) {
            return cb(user);
          }, function (err) {
            return cb(err);
          }).$promise;
        },

        /**
         * Gets all available info on authenticated user
         *
         * @return {Object} user
         */
        getCurrentUser: function () {
          return currentUser;
        },

        /**
         * Check if a user is logged in
         *
         * @return {Boolean}
         */
        isLoggedIn: function () {
          return currentUser.hasOwnProperty('role');
        },

        /**
         * Waits for currentUser to resolve before checking if user is logged in
         */
        isLoggedInAsync: function (cb) {
          if (currentUser.hasOwnProperty('$promise')) {
            currentUser.$promise.then(function () {
              cb(true);
            }).catch(function () {
              cb(false);
            });
          } else if (currentUser.hasOwnProperty('role')) {
            cb(true);
          } else {
            cb(false);
          }
        },

        /**
         * Check if a user is an admin
         *
         * @return {Boolean}
         */
        isAdmin: function () {
          return currentUser.role === 'admin';
        },

        /**
         * Get auth token
         */
        getToken: function () {
          return $cookieStore.get('token');
        }
      };
    });

})();
