/**
 * Simple State Machine.
 */
define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/events/Emitter',
        'altair/events/Event',
        'altair/Deferred',
        'altair/facades/__',
        'altair/plugins/node!underscore.string',
        'altair/plugins/node!underscore'
        ],
    function (declare,
              hitch,
              Emitter,
              Event,
              Deferred,
              __,
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

            this.state  = options && _.has(options, 'state') ? options.state : null; //starting state is optional
            this.states = options.states;

            if(options && _.has(options, 'delegate')) {
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
                    if(delegate[methodName] !== undefined) {
                        listeners.push(this.on(eventName, hitch(delegate, methodName), { state: state }));
                    }

                }));

            }));

            return listeners;
        },

        /**
         * Start me over!
         *
         * @returns {altair.events.Emitter}
         */
        reset: function () {
            this.state = this.states[0];
            return this;
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
         * wait until it is resolved before continuing. When we resolbvthwve our deferred, we will pass the return value
         * of the last state we transitionedTo
         *
         * @param options  - repeat: loop back on itself?
         * @returns {altair.Deferred}
         */
        execute: function (options) {

            //lastResponse is is in form [state, data]... if no state, we're done
            var d               = new Deferred(),
                state           = options && _.has(options, 'state') ? options.state : this.states[0], //optionally override starting state
                lastResponse    = [state, {}],
                fire            = hitch(this, function (i) {

                    if(!lastResponse[0]) {
                        d.resolve(lastResponse[1]);
                        return;
                    }

                    this.transitionTo(lastResponse[0], lastResponse[1], options).then(function (response) {
                        lastResponse = response;
                        fire();
                    }).otherwise(hitch(d, 'reject'));

                });

            fire();

            return d;
        },

        /**
         * Pass me a state and I'll let you know which state is next... if you on the last state, i'll pass back the first
         *
         * @param state
         * @param backToFirst
         *
         * @returns {*}
         */
        nextState: function (state, backToFirst) {

            var i = _.indexOf(this.states, state) + 1,
                next = '';

            if(i < this.states.length) {
                next = this.states[i];
            } else if(backToFirst === true){
                next = this.states[0];
            }

            return next;
        },

        /**
         * Same as above, but opposite order
         * @param state
         * @param backToLast
         * @returns {string}
         */
        previousState: function (state, backToLast) {

            var i = _.indexOf(this.states, state) - 1,
                next = '';

            if(i > 0) {
                next = this.states[i];
            } else if(backToLast === true){
                next = this.states[this.states.length-1];
            }

            return next;
        },

        /**
         * Transition to a particular state (which involves emitting all events that are the lifecycle of the state.
         *
         * @param state the state (must match something in this.states)
         * @param data object passed through to event (usually whatever was returned from previous state)
         */
        transitionTo: function (state, data, options) {

            this.state = state;//probably should wait until didEnterState before setting this, yeah?

            var d           = new Deferred(),
                eventData   = data,
                events      = Object.keys(this._listenerMap),
                lastResponse,
                nextState   = this.nextState(state, options && _.has(options, 'repeat') ? options.repeat : false),
                fire        = hitch(this, function (i) {

                    //are we on the last event?
                    if(i === events.length) {
                        d.resolve([nextState, lastResponse]);
                        return;
                    }

                    //make sure our event data is an object
                    if(!_.isObject(eventData)) {
                        eventData = {};
                    }

                    //make sure we at least have the state
                    eventData.state = state;

                    var e = new Event(events[i], eventData, this);

                    //emit this event
                    this.emit(e).then(hitch(this, function (results) {

                        //get the results from the last event listener if any listeners are set
                        if(results.length > 0) {

                            lastResponse = results.pop();

                            //if lastResponse is in the form of [ nextState, { event: data } ]
                            if(_.isArray(lastResponse)) {

                                var _state = lastResponse[0];

                                if(_.indexOf(this.states, _state) === 0) {
                                    d.reject(__('State "%s" does not exist on this state machine.', _state));
                                }

                                nextState       = _state;
                                eventData       = lastResponse[1];
                                lastResponse    = lastResponse[1];

                            } else if(_.isObject(lastResponse)) {
                                eventData = lastResponse;
                            }

                        }

                        fire(++i);

                    })).otherwise(hitch(d, 'reject'));

                });

            fire(0);

            return d;

        }


    });
});
