/**
 * Simple State Machine.
 */
define(['altair/declare',
        'altair/facades/hitch',
        'altair/events/Emitter',
        'altair/Deferred',
        'altair/plugins/node!underscore.string',
        'altair/plugins/node!underscore'
        ],
    function (declare,
              hitch,
              Emitter,
              Deferred,
              _str,
              _) {


    "use strict";

    return declare([Emitter], {

        state:  null, //the my current state
        states: null, //all our possible states

        //statics
        _listenerMap: {
            'will-enter-state': 'onStateMachineWillEnter%s',
            'did-enter-state':  'onStateMachineDidEnter%s',
            'did-exit-state':   'onStateMachineDidExit%s'
        },

        constructor: function (options) {

            this.state  = _.has(options, 'state') ? options.state : null; //starting state is optional
            this.states = options.states;

            if(_.has(options, 'delegate')) {
                this.attachListeners(options.delegate);
            }

        },

        /**
         * Attach all our possible listeners to delegate depending on whether or not they exist
         *
         * @param delegate
         */
        attachListeners: function (delegate) {

            var listeners = [];

            //loop through each possible state
            this.states.forEach(hitch(this, function (state) {

                //then our listener map
                Object.keys(this._listenerMap).forEach(hitch(this, function (eventName) {

                    //construct the callbacks name
                    var methodName = this._stateAndEventNameToCallbackName(state, eventName);

                    //does the delegate have the name? if so, lets add a listener for it
                    if(_.has(delegate, methodName)) {
                        listeners.push(this.on(eventName, hitch(delegate, methodName)));
                    }

                }));

            }));

            return listeners;
        },

        /**
         * Utility to make it a tad easier to set listeners
         *
         * @param state
         * @param eventName
         * @returns {*}
         * @private
         */
        _stateAndEventNameToCallbackName: function (state, eventName) {
            return _str.sprintf(this._listenerMap[eventName], _str.capitalize(state));
        },

        /**
         * Loops through every state, emitting all events along the way. If an event listener returns a deferred, we
         * wait until it is resolved before continuing. When we resolve our deferred, we will pass the return value
         * of the last state executed
         */
        execute: function (options) {

            var d = new Deferred();


            return d;
        },

        /**
         * Transition to a particular state (which involves emitting all events that are the lifecycle of the state.
         *
         * @param state the state (must match something in this.states)
         * @param data object passed through to event (usually whatever was returned from previous state)
         */
        transitionTo: function (state, data) {

            var d = new Deferred();


            return d;

        }


    });
});
