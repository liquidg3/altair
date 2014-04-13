# Lifecycle Object managing a simple State Machine
A StateMachine is an object that has a this.state, can be one of any this.states = ['state1', 'state2'],
and can transition between states;

In altair/StateMachine, when the states transition (state1 -> state2), we'll fire some events, executing callbacks you have configured . By
using the Altair/Lifecycle (modules, commanders, etc) to manage your State Machine, you get a great way to configure state
machines at run time. This flexibility allows you to do some pretty cool things (like optimization). Note that altair/StateMachines
are not linear, we can transition to any state in any order at any time, so your callbacks must take it into consideration.

In this example, I'm going to show you how I built commandcentral/commanders/Altair, which is the object you have interfaced
with if you have ever used Altair. By using a State Machine to independently manage the state of a user's CLI session,
we can keep our code super thin and clean.

This is an abbreviated example, see

```js
define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/mixins/_HasCommandersMixin',
        'altair/facades/when',
        'altair/plugins/node!underscore'
], function (declare,
             hitch,
             _IsCommanderMixin, //mixes in Lifecycle for us
             when,
             _) {


    return declare([_IsCommanderMixin], {

        fsm:    null, //finite state machine

        //start-support
        activeCommander: null,
        activeCommand:   null,
        //end-support


        startup: function (options) {

            var _options = options || this.options;

            //State Machines are altair/events/Emitters, but setting up a hundred listeners is tedious,
            //so we use the "delegate" pattern to lend us a hand. The state machine will check if a
            //method exists before setting the listener.
            this.fsm = new StateMachine({
                state:  _.has(_options, 'startingState') ? _options.startingState : 'firstRun'
                states: ['firstRun', 'selectCommander', 'selectCommand', 'executeCommand'],
                delegate: this //convenient way to have all your listeners set for you for callbacks that exist
            });

            return this.inherited();

        },

        execute: function () {

            //will run each state in order, each receiving (input) the return value (output) from previous
            return this.fsm.execute().then(hitch(this, function (returnedFromFinalState) {

                console.log('this.stateMachineDidEnterExecuteCommand returned', returnedFromFinalState);

                //start the whole thing over again
                return this.fsm.reset().execute();

            })).otherwise(hitch(this, function (err) {

                //called if any state fails, breaks, or any unhandled exception is thrown
                console.log('eeerr neerrrr!', err);

            }));

            //OR i can completely control state management by jumping to states manually
            return this.fsm.transitionToState('selectcommand', { foo: 'bar' }).then(function (results) {
                console.log(results); //[ "nextState", { state: data } ]
            });


        },

        /**
         * StateMachine delegate methods (callbacks for state change events). They use the following pattern;
         *
         * onStateMachineWillEnter{{StateName}}
         * onStateMachineDidEnter{{StateName}}
         * onStateMachineDidExit{{StateName}}
         */
         //We have entered firstRun, our first state
         onStateMachineDidEnterFirstRun: function ($e) {

            this.writeLine('Welcome Friend!');

            //state machine expects listeners to return ['nextState', { any: data, you: want }];
            return { foo: 'bar' }; //this data becomes available in the event for the next command

         },

         onStateMachineDidEnterSelectCommand: function ($e) {

            var foo = e.get('foo'); //i get this because the previous state returned it (it may not be here if we jumped to this state)


            if(foo) {
                console.log('you were in first run before this, weren\'t you?');
            }

            //some async process (waiting for input? showing graphix? animation?)
            //by returning a Deferred (return from readLine), we will stay in this state
            return this.readLine('enter commander name').then(function (named) {

                //the deferred will now resolve with this value which, according to state machine conventions, will
                //be passed through to the event of next state
                return { commander: named };

            });

         },

         onStateMachineDidEnterExecuteCommand: function (e) {

            //returned data from previous state gets mixed into event data
            console.log(e.get('commander'));

            if(!this.someErrorCheck()) {
                //if returning an array, the 1st value is the next state you want to transition to, the 2nd value is an
                //object mixed into the event, just like previous examples
                return ['selectCommand', { commander: e.get('commander') }];
            }

            var d = new this.Deferred();

            setTimeout(function () {
                d.resolve(['firstRun', {}]); //will start the whole thing over since firstRun is our first state
            }, 10);

            return d;

         },

         //I am making sure my executeCommand state always has a "commander" if I can offer one up. the following allows us
         //to jump to the executeCommand state and have it be like it was previously
         onStateMachineWillEnterExecuteCommand: function (e) {

            if(!e.get('commander')) {

                e.set('commander', this->activeCommander);

            } else {
                this.activeCommander = e.get('commander');

            }

         },


    });

});
```