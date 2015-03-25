/* global io */

(function() {

  'use strict';

  angular.module('titannicCmsApp')
    .factory('socket', function (socketFactory, Auth, Notification, $rootScope, $timeout, $log) {

      // socket.io now auto-configures its connection when we ommit a connection url
      var ioSocket = io('', {
        // Send auth token on connection, you will need to DI the Auth service above
        'query': 'token=' + Auth.getToken(),
        path: '/socket.io-client'
      });

      var socket = socketFactory({
        ioSocket: ioSocket
      });


      function disconnect(){
        $log.debug('socket disconnected');
      }

      function connectionFailed(){
        //ensure that our online state has a chance to be all geezey
        $timeout(function(){
          if($rootScope.isOnline){
            Notification.error('Socket connection failed. Server is dead!', {duration: -1});
          }
          else{
            Notification.error('Socket connection failed. You are offline!', {duration: -1});
          }

        });

      }

      function error(){
        $log.debug('socket error');
      }

      socket.on('disconnect', disconnect);
      socket.on('connect_failed', connectionFailed);
      socket.on('error', error);

      return {
        socket: socket,

        /**
         * Register listeners to sync an array with updates on a model
         *
         * Takes the array we want to sync, the model name that socket updates are sent from,
         * and an optional callback function after new items are updated.
         *
         * @param {String} modelName
         * @param {Array} array
         * @param {Function} cb
         */
        syncUpdates: function (modelName, array, cb) {
          cb = cb || angular.noop;

          /**
           * Syncs item creation/updates on 'model:save'
           */
          socket.on(modelName + ':save', function (item) {
            $rootScope.$apply(function(){

              var oldItem = _.find(array, {_id: item._id});
              var index = array.indexOf(oldItem);
              var event = 'created';

              // replace oldItem if it exists
              // otherwise just add item to the collection
              if (oldItem) {
                array.splice(index, 1, item);
                event = 'updated';
              } else {
                array.push(item);
              }

              cb(event, item, array);

            });

          });

          /**
           * Syncs removed items on 'model:remove'
           */
          socket.on(modelName + ':remove', function (item) {
              $rootScope.$apply(function() {
                var event = 'deleted';
                _.remove(array, {_id: item._id});
                cb(event, item, array);
              });
          });
        },

        /**
         * Removes listeners for a models updates on the socket
         *
         * @param modelName
         */
        unsyncUpdates: function (modelName) {
          socket.removeAllListeners(modelName + ':save');
          socket.removeAllListeners(modelName + ':remove');
        }
      };
    });

})();
