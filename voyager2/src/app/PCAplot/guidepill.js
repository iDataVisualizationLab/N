'use strict';

angular.module('vlui')
    .service('GuidePill', ['Dataset' , function (Dataset,PCAplot) {
        var GuidePill = {
            // Functions


            get: get,
            // Event

            // Event, with handler in the listener

            /** Set a fieldDef for a channel */
            set: set,

            /** Remove a fieldDef from a channel */

            // Data
            pills: {},
            /** Listener  */
            listener: null
        };

        // Add listener type that Pills just pass arguments to its listener
        // FIXME: properly implement listener pattern
        [
            'add', 'select', 'preview', 'update', 'reset', 'sort'
        ].forEach(function(listenerType) {
            GuidePill[listenerType] = function() {
                if (GuidePill.listener && GuidePill.listener[listenerType]) {
                    return GuidePill.listener[listenerType].apply(null, arguments);
                }
            };
        });



        function set(type) {
            return
        }

        /**
         * Get a fieldDef of a pill of a given channelId
         */
        function get(channelId) {
            return GuidePill.pills[channelId];
        }


        return GuidePill;
    }]);
