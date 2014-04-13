/**
 * Mixin that'll help you setup a ton of listeners via configs/listeners.json.  Here are some examples of what you can
 * put in your configs/listeners.json
 *
 * {
 *      "vendor:module::event-name": "callbackName",   ---> basic event to callback pairing
 *      "vendor:module::event-name-2": {               ---> callbacks with queries
 *          "olderDudes": {
 *              "age": { "$gte": 50 }
 *          },
 *          "youngerDudes": {                          ---> more than one callback for an event? nest them
 *              "age": { "$lt": 50 }
 *          },
 *          "everyone": {}                              ---> nesting a query'less listener is easy, just pass it nothing
 *      }
 *
 * }
 *
 * Remember, because your simply constructing an object literal, if you want to listen to the same event more than once
 * you must nest both callbacks under the same event
 *
 */
define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/Lifecycle',
        'altair/events/Emitter'
], function (declare,
             hitch,
             Lifecycle,
             Emitter) {


    /**
     * Help parse callback string. It can be a method name or a fully qualified nexus name
     *
     * @param parent
     * @param callback
     */
    function parseCallback(parent, callback) {

        var results,
            parts;

        if(callback.search('::') === -1) {

            results = hitch(parent, callback);

        } else {

            parts = callback.split('::');

            results = hitch(parent.nexus(parts[0]), parts[1]);

        }

        return results;
    }

    return declare([Lifecycle, Emitter], {

        startup: function () {
            var def = new this.Deferred(),
                sup = hitch(this, 'inherited', arguments);


            /**
             * Parse listeners config, then set all listeners.
             */
            this.parseConfig('configs/listeners.json').then(hitch(this, function (listeners) {
                var events  = Object.keys(listeners),
                    pass    = true;

                events.forEach(hitch(this, function (eventName) {

                    //determine the format of the callback
                    var callback = listeners[eventName];

                    switch(typeof callback) {

                        case 'string':

                            this.on(eventName).then(parseCallback(this, callback));

                            break;

                        default:
                            pass = false;
                            def.reject('Failed to set listener to ' + eventName + ' inside of ' + this.name);

                    }

                }));

                if(pass) {
                    sup().then(hitch(def, 'resolve')).otherwise(hitch(def, 'reject'));
                }

            })).otherwise(hitch(def, 'reject'));

            return def;

        },

        registerEvents: function (e) {
            return this.package.events;
        }

    });

});
