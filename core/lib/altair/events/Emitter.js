/**
 * Altair's Event/Emitter is a little twist on the original NodeJs EventEmitter implementation. The event system has been
 * augmented with a query engine to allow for much more sophisticated listening. Take a look at the ReadMe.md or someshit.
 */
define(['altair/facades/declare',
        './Event',
        'altair/facades/hitch',
        'altair/events/Deferred',
        'altair/Deferred',
        './QueryAgent',
        'dojo/promise/all',
        'altair/facades/when',
        'lodash'
], function (declare,
             Event,
             hitch,
             Deferred,
             BaseDeferred,
             QueryAgent,
             all,
             when,
             _) {


    var agent = new QueryAgent();

    return declare(null, {

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
            if(callback && !_.isFunction(callback)) {
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
         * Remove a listener by its deferred
         *
         * @param event string, name of the event
         * @param deferred, the deferred that was returned from "on"
         * @returns {null}
         */
        removeEventListener: function (event, deferred) {
            if(this._listeners[event]) {
                this._listeners[event] = _.filter(function (listener) {
                    return listener.deferred !== deferred;
                });
            }

            return this;
        },

        /**
         * Emit an event by name passing along data. Customize it with config.
         *
         * @param event
         * @param data
         * @param callback
         * @param config
         */
        emit: function (event, data, config) {

            event = this.coerceEvent(event, data);

            //build a list of results all listeners...
            var list = [],
                toRemove = [],
                _agent;

            if(this._listeners[event.name]) {

                _agent = (config && config.agent) ? config.agent : this._eventListenerQueryAgent;

                this._listeners[event.name].forEach(hitch(this, function (listener) {

                    if(_agent.matches(event, listener.query)) {

                        var def,
                            results,
                            hasValue = false;

                        //if the listener was passed as the callback, or 2nd param, of on()
                        if(listener.callback) {

                            results = listener.callback(event);

                            if(results) {
                                list.push(when(results));
                                hasValue = true;
                            }

                        }

                        //the cool cats are using derrrferrrrds
                        def = new BaseDeferred();
                        list.push(def);

                        listener.deferred.resolve(event).then(function (i) {

                            return function (results) {

                                results = results[0];

                                if(results !== undefined && (!results.isInstanceOf || !results.isInstanceOf(Event))) {
                                    when(results).then(function (results) {

                                        //if we already have a value and this listener did not return anything, remove it
                                        if(hasValue && !results) {
                                            toRemove.push(i);
                                        }

                                        def.resolve(results);

                                    }).otherwise(hitch(def, 'reject'));
                                } else {

                                    //do not pass this back if we already have at least 1 return value for this event
                                    if(hasValue) {
                                        toRemove.push(i);
                                    }
                                    def.resolve();
                                }

                            };

                            //should we stop looping after first error?
                        }(list.length - 1)).otherwise(hitch(def, 'reject'));



                    }

                }));

            }

            return all(list).then(function (results) {

                var cleaned = [];

                results.forEach(function (value, index) {
                    if(_.indexOf(toRemove, index) === -1) {
                        cleaned.push(value);
                    }

                });

                event.setResults(cleaned);
                return event;



            });

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
        coerceEvent: function (eventName, data) {
            return (typeof eventName === 'string') ? new Event(eventName, data, this) : eventName;
        }

    });
})
;