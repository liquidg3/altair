/**
 * The dashboard for Command Central. Simply allows you to select a commander, then run that commander, then start it again.
 * It manages a state machine with the following states
 *
 * firstRun, selectCommander, selectCommand, executeCommand
 */

define(['altair/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin',
        'altair/when',
        'altair/StateMachine',
        'altair/plugins/node!underscore'
        ], function (declare,
                     hitch,
                     _IsCommanderMixin,
                     when,
                     StateMachine,
                     _) {


    return declare([_IsCommanderMixin], {

        //state
        activeCommand:     '',
        activeCommander:   null,
        sm:                null, //state machine

        startup: function (options) {

            this.sm = new StateMachine({
                state:      _.has(options, 'state') ? options.state : 'firstRun',
                states:     ['firstRun', 'selectCommander', 'selectCommand', 'executeCommand'],
                delegate:   this
            });

            return this.inherited(arguments);
        },

        /**
         * See the flow of .then()'s for the script
         */
        execute: function (options) {

            return this.sm.execute({
                repeat: true
            });

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

            var options         = {}, //options for the select
                d               = new this.module.Deferred(),
                longLabels      = this.module.adapter().longLabels;

            this.module.refreshCommanders().then(hitch(this, function (commanders) {

                Object.keys(commanders).forEach(function (alias) {
                    if (alias !== 'altair') {
                        var label = longLabels ? commanders[alias].options.description : commanders[alias].options.label;
                        options[alias] = label || commanders[alias].name;
                    }
                });

                this.select('choose commander', null, options).then(hitch(this, function (commander) {
                    this.activeCommander = this.module.commander(commanders[commander]);
                    d.resolve({ commander: this.activeCommander });
                }));

            }));

            return d;

        },

        //select a command (assuming commander is set
        onStateMachineDidEnterSelectCommand: function (e) {

            var commander   = e.get('commander'),
                commands    = commander.options.commands,
                options     = {},
                aliases     = {},
                d           = new this.module.Deferred(),
                longLabels  = this.module.adapter().longLabels;

            //let user select the command they want to run by outputing a
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
            this.select('choose command', null, { multiOptions: options, aliases: aliases, id: "command-select"}).then(function (command) {

                //save active adapter in-case we transition to another state prematurely or out of order
                this.activeCommand = command;

                //pass command and commander onto next state
                d.resolve({
                    commander:  commander,
                    command:    this.activeCommand
                });

            });

            return d;

        },

        //we need to execute the command
        onStateMachineDidEnterExecuteCommand: function (e) {

            var commander   = e.get('commander'),
                command     = e.get('command'),
                schema      = commander.schemaForCommand(command),
                d           = new this.module.Deferred(),
                results;

            if (schema) {

                this.form(schema).then(hitch(this, function (values) {

                    console.dir(values);
                    d.resolve();

                })).otherwise(hitch(this, function (err) {

                    console.error(err);

                }));

            }
            //no schema tied to the command, run it straight away
            else {

                results = commander[command]();
                if (results.then) {
                    d = results;
                }
            }

            return d;

        }

    });

});
