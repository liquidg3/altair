/**
 * Altair's Event/Emitter is a little twist on the original NodeJs EventEmitter implementation. The event system has been
 * augmented with a query engine to allow much more sophisticated listening potential.
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    './Event',
    'dojo/Deferred',
    './QueryAgent'
], function (declare, lang, Event, Deferred, QueryAgent) {


    var agent = new QueryAgent();

    return declare(null, {

        agent: agent,
        _listeners: {},

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

        emit: function (event, data, callback, config) {

            event = this._normalizeEvent(event, data);

            //are there any listeners?
            var matches = 0;

            if(this._listeners[event.name]) {

                var _agent = (config && config.agent) ? config.agent : this.agent;

                this._listeners[event.name].forEach(lang.hitch(this, function (listener) {

                    if(_agent.matches(event, listener.query)) {

                        listener.callback(event);
                        matches ++;

                    }

                }));

            }


            return matches;

        },

        /**
         * Pass an event name (string) or event object and get back an event object. Very handy way to normalize data
         * for event related logic.
         *
         * @param eventName
         * @param data
         * @returns {core.lib.altair.events.Event}
         * @private
         */
        _normalizeEvent: function (eventName, data) {
            return typeof eventName == 'string' ? new Event(eventName, data) : eventName;
        }

    });
})
;