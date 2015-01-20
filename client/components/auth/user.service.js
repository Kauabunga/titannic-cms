(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .factory('User', function ($resource) {
      return $resource('/api/users/:id/:controller',
        {
          id: '@_id'
        },
        {
          changePassword: {
            method: 'PUT',
            params: {
              controller: 'password'
            }
          },


          setRole: {
            method: 'PUT',
            params: {
              controller: 'role'
            }
          },

          get: {
            method: 'GET',
            params: {
              id: 'me'
            }
          }
        });
    });

})();
