/**
 * The dashboard for Command Central. Simply allows you to select a commander, then run that commander, then start it again.
 * It manages a state machine with the following states
 *
 * firstRun, selectCommander, selectCommand, executeCommand
 *
 * You can automatically select a commander and the command to execute by passing arguments through with your original request
 *
 * $ ./altair.js {{commander}} {{command}}
 * $ ./altair.js forge                          #jumps you to the selectCommand state with theforge as the active commander
 * $ ./altair.js forge new                      #jumps you to executeCommand
 * $ ./altair.js forge new --vendor liquidfire  #if the command has a schema, you can populate it
 * $ ./altair.js forge new --vendor liquidfire --name TestModule --dir app
 *
 */
define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/mixin',
        '../mixins/_IsCommanderMixin',
        'altair/StateMachine',
        'lodash'
        ], function (declare,
                     hitch,
                     mixin,
                     _IsCommanderMixin,
                     StateMachine,
                     _) {


    return declare([_IsCommanderMixin], {

        //state
        activeCommand:     '',
        activeCommander:   null,
        sm:                null, //state machine
        startState:       'firstRun',

        startup: function (options) {

            this.sm = new StateMachine({
                state:      _.has(options, 'state') ? options.state : 'firstRun',
                states:     ['firstRun', 'selectCommander', 'selectCommand', 'executeCommand'],
                delegate:   this
            });

            return this.inherited(arguments);
        },

        /**
         * Kick of the state machine. We will stay in execute() until the state machine dies. Also attempts to read
         * arguments passed it to jump to a particular state.
         */
        execute: function (options) {

            var dfd = new this.Deferred(),
                run = hitch(this, function () {

                    this.sm.execute({
                        repeat: true,
                        state: this.startState
                    }).otherwise(hitch(this, function (err) {

                        //write the error to the console
                        this.writeError(err.error);

                        //jump to my best guess of what to do now (jump to last state on error, or first state if all else fails)
                        this.startState = this.sm.state ? this.sm.previousState(this.sm.state) : this.sm.states[0];

                        //if we can't go back any farther, so probably will never recover
                        if(this.sm.state && this.sm.previousState(this.sm.state) === '') {

                        }
                        //loop
                        else {

                            run();
                        }

                    }));
                });

            //make sure make this deferred available to our adapters who may want to bail out
            this.deferred = dfd;

            //try and determine starting state from adapter (which can read input)
            this.activeCommander = this.adapter.initialCommander();
            this.activeCommand   = this.adapter.initialCommand();

            //if there is an active commander, lets wait till it loads
            if(this.activeCommander && this.activeCommander.then) {

                //this can happen if the active command is set to a deferred. this lets us know that we should wait on
                // its promise to provide one later
                this.activeCommander.then(hitch(this, function (commander) {

                    //is an active command passed
                    if(commander) {
                        this.activeCommander = commander;
                        this.startState        = (this.activeCommand) ? 'executeCommand' : 'selectCommand';
                    }

                    run();

                })).otherwise(hitch(dfd, 'reject'));

            }
            //if no initial arguments were passed, then we will never have an activeCommander at this point, so start
            //from square one.
            else {
                run();
            }


            return this.inherited(arguments);

        },

        /**
         * State machine delegate methods
         */

        //show the splash screen on first run
        onStateMachineDidEnterFirstRun: function (e) {
            return this.adapter.splash();
        },

        //after exiting first run, lets drop first run from available states
        onStateMachineDidExitFirstRun: function (e) {
            this.sm.states = this.sm.states.slice(1); //drop firstRun state
        },

        //select a commander
        onStateMachineDidEnterSelectCommander: function (e) {

            var choices    = {}, //options for the select
                dfd        = new this.Deferred();

            this.parent.refreshCommanders().then(hitch(this, function (commanders) {

                Object.keys(commanders).forEach(function (name) {
                    if (name !== 'altair') {
                        choices[name]              = commanders[name].description();
                    }
                });

                choices.exit = 'Quit altair';

                return this.select('choose commander', null, choices).then(hitch(this, function (commander) {

                    //so we handle all flow logic in one place (next then())
                    if(commander === 'exit'){
                        return commander;
                    }

                    return this.parent.commander(commanders[commander]);

                }));

            })).then(hitch(this, function (commander) {

                if(commander === 'exit') {

                    //kill this event so we aren't passed to the next
                    e.preventDefault();

                    this.teardown();

                } else {

                    this.activeCommander = commander;
                    dfd.resolve({ commander: this.activeCommander });

                }


            })).otherwise(function (err) {

                if(err.message === 'canceled') {

                    this.teardown();

                } else {
                    dfd.reject(err);
                }

            }.bind(this));

            return dfd;

        },

        //try and ensure a commander is always passed to selectCommand state
        onStateMachineWillEnterSelectCommand: function (e) {

            var output = mixin({
                commander: this.activeCommander
            },e.data);

            return output;
        },

        //select a command (assuming commander is set)
        onStateMachineDidEnterSelectCommand: function (e) {

            var commander   = e.get('commander'),
                dfd         = new this.Deferred(),
                commands    = commander.commands(false),
                options     = {},
                aliases     = {},
                longLabels  = this.adapter.longLabels;

            if(!commands) {
                throw new Error('The commander named ' + commander.name + ' has no commands registered. See altair:CommandCentral/README.md');
            }

            //let user select the command they want to run by outputting a
            //simple select box. also get aliases ready to check
            Object.keys(commands).forEach(hitch(this, function (name) {

                var c       = commands[name],
                    label   = longLabels ? c.description : c.label;

                options[name] = label || c.description;

                if (c.aliases) {

                    if(!aliases[name]) {
                        aliases[name] = [];
                    }

                    c.aliases.forEach(function (a) {
                        aliases[name].push(a);
                    });
                }

            }));


            //show select
            this.select('choose command', null, { choices: options, aliases: aliases, id: "command-select"}).then(hitch(this, function (command) {

                //save active adapter in-case we transition to another state prematurely or out of order
                this.activeCommand = command;

                //pass command and commander onto next state
                dfd.resolve({
                    commander:  commander,
                    command:    this.activeCommand
                });

            })).otherwise(function (err) {

                //go back a state if they canceled
                if(err.message === 'canceled') {
                    this.activeCommander = null;
                    dfd.resolve([this.sm.previousState(this.sm.state)]);
                } else {
                    dfd.reject(err);
                }

            }.bind(this));

            return dfd;


        },

        //before we execute our command, make sure we have our commander and command (our best attempt)
        onStateMachineWillEnterExecuteCommand: function (e) {

            var output = mixin({
                commander:  this.activeCommander,
                command:    this.activeCommand
            },e.data);

            if(!output.commander || !output.commander.hasCommand(output.command)) {
                throw new Error('Could not find command: "' + output.command + '" in commander: "' + output.commander + '"');
            }

            return output;


        },

        //we need to execute the command
        onStateMachineDidEnterExecuteCommand: function (e) {

            var commander   = e.get('commander'),
                command     = e.get('command'),
                results,
                schema      = commander.schemaForCommand(command),
                d           = new this.Deferred(),
                done        = function (values) {

                    //clean up values using schema if one is supplied
                    if(schema) {
                        values = schema.applyOnValues(values, null, { methods: [ "fromCliValue", "toJsValue"]});
                    }

                    results = commander.executeCommand(command, values);
                    if (results && results.then) {
                        results.then(hitch(d, 'resolve')).otherwise(hitch(d, 'reject'));
                    } else {
                        d.resolve(results);
                    }

                };


            if (schema) {

                //if there is a schema, render a form
                this.form(schema).then(done).otherwise(hitch(d, 'reject'));

            }
            //no schema tied to the command, run it straight away
            else {
                done();
            }

            return d;

        },

        /**
         * Tear everything down.
         *
         * @returns {altair.Promise}
         */
        teardown: function () {

            //teardown our adapter
            this.adapter.teardown();

            //if we have a deferred, lets resolve it to signal to whomever executed us
            //that we are all done
            if(this.deferred) {
                this.deferred.resolve();
            }

            return this.inherited(arguments);


        }

    });

});
