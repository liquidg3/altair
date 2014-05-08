/**
 * COMMAND CENTRAL
 *
 * The main HUD for all terminal based interactions in altair. It uses the _HasAdaptersMixin to support multiple different
 * flavors of terminal. It uses _HasListenersMixin to listen into every module as it starts up so it can check for new
 * commanders. It uses _HasCommandersMixin because it has the Dashboard commander, which is the main dashboard for Altair.
 */
define(['altair/facades/declare',
        '../adapters/mixins/_HasAdaptersMixin',
        '../events/mixins/_HasListenersMixin',
        './mixins/_HasCommandersMixin',
        'apollo/_HasSchemaMixin',
        'lodash',
        'altair/facades/mixin',
        'dojo/promise/all'],

    function (declare,
              _HasAdaptersMixin,
              _HasListenersMixin,
              _HasCommandersMixin,
              _HasSchemaMixin,
              _,
              mixin,
              all) {

        return declare([_HasSchemaMixin, _HasAdaptersMixin, _HasListenersMixin, _HasCommandersMixin], {

            _focusedCommander:  null,
            _commanders:        null,


            /**
             * Set the selected terminal interface adapter. Pull from options if needed. Then start the dashboard commander if autostart is not false
             *
             * @returns {*}
             */
            startup: function (options) {

                this._commanders        = {};

                var _options = options || this.options || {};

                //if there is no selected adapter being passed with startup, try our best to detect which one to use
                if(!options.selectedAdapter) {

                    if(!process.stdin.isTTY || !process.stdout.isTTY) {
                        this.set('selectedAdapter', 'adapters/Prompt');
                    } else {
                        this.set('selectedAdapter', 'adapters/Blessed');
                    }

                }

                return this.inherited(arguments);

            },

            /**
             * Get a commander by name. If you pass anything but a string, it passes it right back.
             * This allows you to pass what could be a string or a commander through and get back
             * a commander.
             *
             * @param named
             * @returns {*}
             */
            commander: function (named) {
                return (typeof named === 'string') ? this._commanders[named] : named;
            },

            /**
             * Starts the command central experience through any commander whose key is
             * altair.
             */
            execute: function () {

                if(this.get('autostart')) {

                    this.refreshCommanders().then(this.hitch(function (commanders) {
                        this.focus(commanders.altair);
                        commanders.altair.execute();
                    })).otherwise(this.log);

                }

                return this.inherited(arguments);
            },


            /**
             * Focus's a commander
             *
             * @param commander
             * @returns {this}
             */
            focus: function (commander) {

                //blur currently focused commander
                if(this._focusedCommander) {
                    this._focusedCommander.blur();
                }

                this._focusedCommander = commander;

                commander.focus();

                return this;
            },

            /**
             * All commanders
             *
             * @returns {null}
             */
            commanders: function () {
                return this._commanders;
            },

            /**
             * Pull the latest commanders, instantiating ones that are not already alive. This allows us to pull in
             * new commanders while altair continues to run.
             */
            refreshCommanders: function () {

                return this.emit('register-commanders').then(this.hitch(function (e) {

                      var commanders  = {},
                        results     = e.results();

                    //loop through the results of every listener and flatten them into single object
                    _.each(results, function (_commanders) {
                        commanders = mixin(commanders, _commanders);
                    }, this);


                    this._commanders = commanders;
                    return this._commanders;

                }));

            }


        });
    });