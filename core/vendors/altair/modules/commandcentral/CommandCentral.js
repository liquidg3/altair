/**
 * COMMAND CENTRAL
 *
 * The main HUD for all terminal based interactions in altair. It uses the _HasAdaptersMixin to support multiple different
 * flavors of terminal. It uses _HasListenersMixin to listen into every module as it starts up so it can check for new
 * commanders. It uses _HasCommandersMixin because it has the Dashboard commander, which is the main dashboard for Altair.
 */
define(['dojo/_base/declare',
        'altair/modules/adapters/mixins/_HasAdaptersMixin',
        'altair/modules/events/mixins/_HasListenersMixin',
        'altair/modules/commandcentral/mixins/_HasCommandersMixin',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'dojo/promise/all'],

    function (declare,
              _HasAdaptersMixin,
              _HasListenersMixin,
              _HasCommandersMixin,
              hitch,
              mixin,
              all) {

        return declare('altair/modules/commandcentral/CommandCentral', [_HasAdaptersMixin, _HasListenersMixin, _HasCommandersMixin], {

            _focusedCommander: null,
            _commanders: null,


            /**
             * Set the selected terminal interface adapter. Pull from options if needed. Then start the dashboard commander if autostart is not false
             *
             * @returns {*}
             */
            startup: function (options) {

                options = options || this.options;

                this._commanders        = {};
                this._selectedAdapter   = options ? options.adapter : this._selectedAdapter;

                if(!this._selectedAdapter) {

                    if(!process.stdin.isTTY || !process.stdout.isTTY) {
                        this._selectedAdapter = 'adapters/Prompt';
                    } else {
                        this._selectedAdapter = 'adapters/Blessed';
                    }

                }

                if(!options || options.autostart !== false) {
                    return this.inherited(arguments).then(this.hitch('go'));
                } else {
                    return this.inherited(arguments);
                }


            },

            /**
             * Starts the command central experience through any commander whose key is
             * dashboard. If you want to make your own dashboard, make it something like
             * altair-dashboard.
             */
            go: function () {

                this.refreshCommanders().then(this.hitch(function (commanders) {
                    this.focus(commanders.dashboard);
                    commanders.dashboard.go();
                }));

                return this;
            },


            /**
             * Focus's a commander
             *
             * @param commander
             * @returns {altair|modules|commandcentral|CommandCentral}
             */
            focus: function (commander) {

                //blur last focused commander
                if(this._focusedCommander) {
                    this._focusedCommander.blur();
                }

                this._focusedCommander = commander;

                commander.focus();

                return this;
            },

            commanders: function () {
                return this._commanders;
            },

            /**
             * Pull the latest commanders, instantiating ones that are not already alive. This allows us to pull in
             * new commanders while altair continues to run.
             */
            refreshCommanders: function () {

                var def = new this.Deferred();

                this.emit('register-commanders').then(this.hitch(function (results) {

                    var commanders  = {},
                        list        = [],
                        adapter     = this.adapter();

                    //loop through the results of every listener and flatten them into single object
                    results.forEach(this.hitch(function (_commanders) {
                        commanders = mixin(commanders, _commanders);
                    }));

                    //now instantiate any commanders not yet instantiated
                    Object.keys(commanders).forEach(this.hitch(function (name) {

                        if(!(name in this._commanders)) {

                            var options = commanders[name],
                                path    = options.path;

                            //we don't need the path, it is replaced by name (which is more a fqn than path is)
                            delete options.path;

                            //default to our adapter, but one can be passed in (not sure why)
                            options.adapter = options.adapter || adapter;

                            list.push(this.foundry(path, options).then(this.hitch(function (c) {
                                this._commanders[name] = c;
                            })));

                        }

                    }));

                    //after all commanders are instantiated and started up, resolve the deferred with them all
                    all(list).then(hitch(def, 'resolve', this._commanders)).otherwise(hitch(console,'error'));

                })).otherwise(hitch(console,'error'));

                return def;
            }


        });
    });