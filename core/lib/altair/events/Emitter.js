/**
 * Altair's Event/Emitter is a little twist on the original NodeJs EventEmitter implementation. The event system has been
 * augmented with a query engine to allow for much more sophisticated listening. Take a look at the ReadMe.md or someshit.
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        './Event',
        'altair/facades/hitch',
        'altair/events/Deferred',
        'dojo/Deferred',
        './QueryAgent',
        'dojo/promise/all',
        'dojo/when'

], function (declare,
             lang,
             Event,
             hitch,
             Deferred,
             DojoDeferred,
             QueryAgent,
             all,
             when) {


    var agent = new QueryAgent();

    return declare('altair/events/Emitter', null, {

        _eventListenerQueryAgent: agent,
        _listeners: null,

        constructor: function () {
            this._listeners = {};
        },

        /**
         * Alias for "on()"
         *
         * @param event
         * @param callback
         * @param query
         * @param config
         * @returns {dojo.Deferred}
         */
        addEventListener: function (event, callback, query, config) {
            return this.on(event, callback, query, config);
        },

        /**
         * Add a listener with optional query
         *
         * @param event
         * @param callback
         * @param query
         * @param config
         * @returns {dojo.Deferred}
         */
        on: function (event, callback, query, config) {

            //get _listeners ready
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }

            //if they passed a query as the 2nd argument
            if(callback && !lang.isFunction(callback)) {
                query       = callback;
                callback    = null;
            }

            //create deferred & listener
            var deferred = new Deferred(),
                listener = {
                    callback:   callback,
                    query:      query,
                    deferred:   deferred
                };

            //add listener to array
            this._listeners[event].push(listener);

            return deferred;

        },

        /**
         *
         * @param event
         * @param data
         * @param callback
         * @param config
         */
        emit: function (event, data, config) {

            event = this._normalizeEvent(event, data);

            //build a list of results all listeners...
            var list = [];

            if(this._listeners[event.name]) {

                var _agent = (config && config.agent) ? config.agent : this._eventListenerQueryAgent;

                this._listeners[event.name].forEach(hitch(this, function (listener) {

                    if(_agent.matches(event, listener.query)) {

                        var def,
                            results;

                        //if the listener was passed as the callback, or 2nd param, of on()
                        if(listener.callback) {

                            results = listener.callback(event);

                            if(results) {
                                list.push(when(results));
                            }

                        }

                        //the cool cats are using derrrferrrrds
                        def = new DojoDeferred();
                        list.push(def);

                        listener.deferred.resolve(event).then(function (results) {

                            results = results[0];

                            if(results !== undefined && (!results.isInstanceOf || !results.isInstanceOf(Event))) {

                                if( results && results.then) {
                                    results.then(hitch(def, 'resolve')).otherwise(hitch(def, 'reject'));
                                } else {

                                    def.resolve(results);
                                }


                            } else {
                                def.resolve();
                            }

                        });


                    }

                }));

            }

            return all(list);

        },

        /**
         * Pass an event name (string) or event object and get back an event object. Very handy way to normalize data
         * for event related logic.
         *
         * @param eventName
         * @param data
         * @returns {altair.io.core.lib.altair.events.Event}
         * @private
         */
        _normalizeEvent: function (eventName, data) {
            return (typeof eventName == 'string') ? new Event(eventName, data, this) : eventName;
        }

    });
})
;