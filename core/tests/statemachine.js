define(['doh/runner',
        'altair/StateMachine',
        'altair/Deferred',
        'altair/facades/hitch'
    ],
    function (doh,
              StateMachine,
              Deferred,
              hitch) {

        "use strict";

        doh.register('statemachine', {


            "test starting state": function (t) {

                var sm = new StateMachine({
                    state: 'start',
                    states: ['start', 'end']
                });

                t.is(sm.state, 'start', 'starting state not set');

            },

            "listeners are set on delegate": function (t) {

                var delegate = {
                    onStateMachineDidEnterStart: function () {

                    },
                    onStateMachineDidExitStart: function () {

                    }
                },  sm    = new StateMachine({
                        state: 'start',
                        states: ['start', 'end']
                    }),
                    listeners = sm.attachListeners(delegate);


                t.is(listeners.length, 2, 'listeners not all set');


            },


            "state machine can transition to state and pass data": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                        onStateMachineDidEnterEnd: function (e) {
                            t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                            def.resolve(true);
                        }
                    },  sm    = new StateMachine({
                        delegate: delegate,
                        state: 'start',
                        states: ['start', 'end']
                    });

                sm.transitionTo('end', {foo: 'bar'});

                return def;

            },

            "state machine can transition to state and events can pass data": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                        onStateMachineWillEnterEnd: function (e) {
                            t.is(e.get('foo'), 'notbar', 'transitionTo lost data!');
                            return {foo: 'bar'};
                        },
                        onStateMachineDidEnterEnd: function (e) {
                            t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                            def.resolve(true);
                        }
                    },  sm    = new StateMachine({
                        delegate: delegate,
                        state: 'start',
                        states: ['start', 'end']
                    });

                sm.transitionTo('end', {foo: 'notbar'});

                return def;

            },

            "state machine can transition to state and handle reject": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                        onStateMachineDidEnterStart: function (e) {
                            t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                            var d = new Deferred();
                            d.reject(['end', { foo: 'bar' }]);
                            return d;
                        }
                    },  sm    = new StateMachine({
                        delegate: delegate,
                        state: 'start',
                        states: ['start', 'end']
                    });

                sm.transitionTo('start', {foo: 'bar'}).then(function () {
                    def.reject('should not have fired this');
                }).otherwise(function (err) {
                    t.is(err[0], 'end', 'error passthrough failed');
                    def.resolve();
                });

                return def;

            },

            "executing state machine runs states in order": function (t) {

                var def         = new Deferred(),
                    startCalled = false,
                    delegate    = {
                    onStateMachineDidEnterStart: function (e) {
                        startCalled = true;
                        t.is(e.get('state'), 'start', 'Wrong event passed');
                        return {foo: 'bar'};
                    },
                    onStateMachineDidEnterEnd: function (e) {
                        t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                        if(startCalled) {
                            def.resolve(true);
                        } else {
                            def.reject();
                        }
                    }
                },  sm    = new StateMachine({
                        delegate: delegate,
                        state: 'start',
                        states: ['start', 'end']
                    });


                sm.execute();

                return def;

            },

            "executing state machine runs states and waits for deferred": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                    onStateMachineDidEnterStart: function (e) {

                        var d = new Deferred();

                        setTimeout(function () {
                            d.resolve({ foo: 'bar' });
                        }, 10);

                        return d;

                    },
                    onStateMachineDidEnterEnd: function (e) {
                            t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                            def.resolve();
                        }
                    },  sm    = new StateMachine({
                        delegate: delegate,
                        state: 'start',
                        states: ['start', 'end']
                    });


                sm.execute();

                return def;

            },

            "executing state machine runs states in manual order": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                        onStateMachineDidEnterStart: function (e) {
                            return ['end', {foo: 'bar'}];
                        },
                        onStateMachineDidEnterIdle: function (e) {
                            t.fail('this state should never be hit.');
                            def.reject();
                        },
                        onStateMachineDidEnterEnd: function (e) {
                            t.is(e.get('foo'), 'bar', 'redirect did not pass ouputs');
                            def.resolve();
                        }
                    },  sm    = new StateMachine({
                        delegate: delegate,
                        state: 'start',
                        states: ['start', 'idle', 'end']
                    });


                sm.execute();

                return def;

            }



    });


});