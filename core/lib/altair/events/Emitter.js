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
        'altair/facades/series',
        'lodash'
], function (declare,
             Event,
             hitch,
             Deferred,
             BaseDeferred,
             QueryAgent,
             all,
             when,
             series,
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
         * @param options
         * @returns {dojo.Deferred}
         */
        addEventListener: function (event, callback, query, options) {
            return this.on(event, callback, query, options);
        },

        /**
         * Add a listener with optional query
         *
         * @param event
         * @param callback
         * @param query
         * @param options
         * @returns {dojo.Deferred}
         */
        on: function (event, callback, query, options) {

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
                this._listeners[event] = _.filter(this._listeners[event], function (listener) {
                    return listener.deferred !== deferred;
                });
            }

            return this;
        },

        /**
         * Emit an event by name passing along data. Customize it with options.
         *
         * @param event
         * @param data
         * @param callback
         * @param options
         */
        emit: function (event, data, options) {

            event = this.coerceEvent(event, data);

            //build a list of results all listeners...
            var list = [],
                _agent;

            if(this._listeners[event.name]) {

                _agent = (options && options.agent) ? options.agent : this._eventListenerQueryAgent;

                _.each(this._listeners[event.name], hitch(this, function (listener) {

                    if(_agent.matches(event, listener.query)) {

                        var dfd,
                            results;


                        //if the listener was passed as the callback, or 2nd param, of on()
                        if(listener.callback) {

                            results = hitch(listener, 'callback', event);
                            list.push(results);

                        }

                        if(listener.deferred.hasWaiting()) {


                            list.push(function (listener, event) {

                                return function () {

                                    var dfd = new BaseDeferred()

                                    listener.deferred.resolve(event).then(function (results) {

                                        results = results[0];

                                        if(results !== undefined && (!results.isInstanceOf || !results.isInstanceOf(Event))) {

                                            return when(results).then(hitch(dfd, 'resolve')).otherwise(hitch(dfd, 'reject'));

                                        }

                                        dfd.resolve();

                                    }).otherwise(function (err) {

                                        dfd.reject(err);

                                    });

                                    return dfd;

                                };


                            }(listener, event));


                        }



                    }

                }));

            }

            return series(list).then(function (results) {
                event.setResults(results);
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
});