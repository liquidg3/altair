/**
 * The dashboard for Command Central. Simply allows you to select a commander, then run that commander, then start it again.
 */
define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin'
], function (declare,
             hitch,
             _IsCommanderMixin) {


    return declare('altair/modules/commandcentral/commanders/Altair', [_IsCommanderMixin], {

        showingMenu: false,

        startup: function (options) {

            this.module.on('cartridges/Module::did-startup-module').then(hitch(this, 'refreshMenu'));

            return this.inherited(arguments);
        },

        /**
         * Show splash, then render our main menu
         */
        execute: function () {

            this.splash();
            this.menu();

            return this.inherited(arguments);

        },

        /**
         * Render the commander select menu.
         */
        menu: function () {

            this.showingMenu = true;

            var options    = {};

            this.module.refreshCommanders().then(hitch(this, function (commanders) {

                Object.keys(commanders).forEach(function (alias) {
                    if(alias !== 'dashboard') {
                        options[alias] = commanders[alias].options.description || commanders[alias].name;
                    }
                });

                this.select('choose commander', options, 'commander-select').then(hitch(this, function (commander) {
                    this.showingMenu = false;
                    this.selectCommander(commander)
                }));

            }));


        },

        /**
         * Refresh the menu if it is currently showing
         */
        refreshMenu: function () {

            if(this.showingMenu) {

                throw "FINISH";

            }

        },

        /**
         * After a commander is selected, show it.
         *
         * @param named
         */
        selectCommander: function (named) {

            var commander = this.module.commander(named),
                commands  = commander.options.commands,
                options   = {},
                aliases   = {};

            //let user select the command they want to run by outputing a
            //simple select box. also get aliases ready to check
            Object.keys(commands).forEach(hitch(this, function (name) {
                var c           = commands[name];
                options[name]   = c.description;

                if(c.aliases) {
                    options[name] += ' aliases: ' + c.aliases.join(', ');
                    c.aliases.forEach(function (a) {
                        aliases[a] = name;
                    });
                }

            }));


            this.select('choose command', options, { retry: false, id: "command-select"}).then(hitch(this, function (selected) {

                this.selectCommand(commander, selected);

            })).otherwise(hitch(this, function (selected) {

                if(selected in aliases) {
                    this.selectCommand(commander, aliases[selected]);
                } else {
                    this.writeLine('invalid command selected', 'alert');
                    this.selectCommander(commander);
                }

            }));

        },

        /**
         * Runs a command on a commander. Tries to do this by seeing if a schema is defined. if one is, it outputs a form, then passes it as the values
         * to the callback.
         *
         * @param commander
         * @param command
         */
        selectCommand: function (commander, command) {

            commander = this.module.commander(commander);

            var schema = commander.schemaForCommand(command);

            if(schema) {

                this.form(schema).then(hitch(this, function (values) {

                    console.dir(values);

                })).otherwise(hitch(this, function (err) {

                    console.error(err);

                }))

            } else {
                commander[command]();
            }

        }

    });

});
