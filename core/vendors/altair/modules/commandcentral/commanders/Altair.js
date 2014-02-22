/**
 * The dashboard for Command Central. Simply allows you to select a commander, then run that commander, then start it again.
 */

define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin',
        'altair/Deferred'
     ], function (declare, hitch, _IsCommanderMixin, Deferred) {


    return declare('altair/modules/commandcentral/commanders/Altair', [_IsCommanderMixin], {

        showingMenu:       false,
        selectedCommander: null,
        firstRun:          true,

        startup: function (options) {

            this.module.on('cartridges/Module::did-startup-module').then(hitch(this, 'refreshMenu'));

            return this.inherited(arguments);
        },

        /**
         * Show splash, then render our main menu
         */
        execute: function (options) {

            var d;

            if (this.firstRun) {
                this.firstRun = false;
                d = this.splash();
            } else {
                d = new Deferred();
                d.resolve();
            }

            //show the commander select
            d.then(hitch(this, 'commanderSelect'))
            //set the selected commander
            .then(hitch(this, function (commander) {

                this.selectedCommander = commander;
                this.selectedCommander.focus();

                return commander;

            }))
            //show the command select menu
            .then(hitch(this, 'commandSelect'))
            //execute the selected command
            .then(hitch(this, function (command) {

                return this.executeCommand(this.selectedCommander, command);

            }))
            //start it all over again
            .then(hitch(this, function () {
                this.selectedCommander.blur();
                this.selectedCommander = null;
                this.execute();
            }));


            return this.inherited(arguments);

        },


        /**
         * Render the commander select menu.
         */
        commanderSelect: function () {

            this.showingMenu = true;

            var options = {},
                d = new Deferred(),
                longLabels = this.module.adapter().longLabels;

            this.module.refreshCommanders().then(hitch(this, function (commanders) {

                Object.keys(commanders).forEach(function (alias) {
                    if (alias !== 'altair') {
                        var label = longLabels ? commanders[alias].options.description : commanders[alias].options.label;
                        options[alias] = label || commanders[alias].name;
                    }
                });

                this.select('choose commander', options, 'commander-select').then(hitch(this, function (commander) {
                    this.showingMenu = false;
                    d.resolve(commander);
                }));

            }));

            return d;

        },

        /**
         * Refresh the menu if it is currently showing
         */
        refreshMenu: function () {

            if (this.showingMenu) {

                throw "FINISH";

            }

        },

        /**
         * After a commander is selected, show it.
         *
         * @param commander
         */
        commandSelect: function (commander) {

            commander = this.module.commander(commander);

            var commands = commander.options.commands,
                options = {},
                aliases = {},
                d = new Deferred(),
                longLabels = this.module.adapter().longLabels;

            //let user select the command they want to run by outputing a
            //simple select box. also get aliases ready to check
            Object.keys(commands).forEach(hitch(this, function (name) {

                var c = commands[name],
                    label = longLabels ? c.description : c.label;

                options[name] = label || c.description;

                if (c.aliases && longLabels) {

                    options[name] += ' aliases: ' + c.aliases.join(', ');
                    c.aliases.forEach(function (a) {
                        aliases[a] = name;
                    });
                }

            }));

            this.select('choose command', options, { retry: false, id: "command-select"}).then(hitch(this, function (selected) {

                    d.resolve(selected);

                })).otherwise(hitch(this, function (selected) {

                    if (aliases.hasOwnProperty(selected)) {
                        d.resolve(aliases[selected]);
                    } else {
                        this.writeLine('invalid command selected', 'alert');
                        this.commandSelect(commander);
                    }

                }));

            return d;

        },

        /**
         * Runs a command on a commander. Tries to do this by seeing if a schema is defined. if one is, it outputs a form, then passes it as the values
         * to the callback.
         *
         * @param commander
         * @param command
         */
        executeCommand: function (commander, command) {

            commander = this.module.commander(commander);

            var schema  = commander.schemaForCommand(command),
                d       = new Deferred(),
                results;

            if (schema) {

                this.form(schema).then(hitch(this, function (values) {

                        console.dir(values);

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
