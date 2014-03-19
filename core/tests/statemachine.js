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


            "executing state machine can transition to state and pass data": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                        onStateMachineDidEnterEnd: function (e) {
                            t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                            def.resolve(true);
                        }
                    },  sm    = new StateMachine({
                        state: 'start',
                        states: ['start', 'end']
                    });

                sm.transitionTo('end', {foo: 'bar'});

                return def;

            },


            "executing state machine runs states in order": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                    onStateMachineDidEnterStart: function (e) {
                        return ['end', { foo: 'bar' }];
                    },
                    onStateMachineDidEnterEnd: function (e) {
                        t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                        def.resolve(true);
                    }
                },  sm    = new StateMachine({
                        state: 'start',
                        states: ['start', 'end']
                    });


                sm.execute();

                return def;

            },

            "executing state machine runs states (waits for deferred)": function (t) {

                var def         = new Deferred(),
                    delegate    = {
                    onStateMachineDidEnterStart: function (e) {

                            var d = new Deferred();

                            setTimeout(function () {
                                d.resolve(['end', { foo: 'bar' }]);
                            }, 10);

                            return d;

                    },
                    onStateMachineDidEnterEnd: function (e) {
                            t.is(e.get('foo'), 'bar', 'states did not pass outputs/inputs');
                        }
                    },  sm    = new StateMachine({
                        state: 'start',
                        states: ['start', 'end']
                    });


                sm.execute().then(hitch(def,'resolve')).otherwise(hitch(def, 'reject'));

                return def;

            }



    });


});