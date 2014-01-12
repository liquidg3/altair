/**
 * The cache cartridge handles cache through the use of "plugins". Plugins are easy to make and introduce into the system.
 * First, take a look at ./plugins/Base.js for a list of methods you need to implement. We are going to try and ship
 * with a few popular plugins (memcached for now) and hope that people will write more as needed.
 *
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    'altair/Lifecycle',
    'dojo/Deferred'], function (declare, lang, Lifecycle, Deferred) {

    return declare([Lifecycle], {

        plugin: null,

        /**
         * Load and startup any the plugin.
         *
         * @param options
         * @returns {*}
         */
        startup: function (options) {

            options = options || this.options;

            this.deferred = new Deferred();

            if(options.plugin) {

                require([options.plugin.path], lang.hitch(this, function (Plugin) {
                    this.plugin = new Plugin();
                    this.plugin.startup(options.plugin.options);
                    this.deferred.resolve(this);
                }));


            }
            //plugin is already set
            else if(this.plugin) {
                this.plugin.startup();
                this.deferred.resolve(this);
            }
            //no plugin set
            else {
                this.deferred.resolve(this);
            }

            return this.inherited(arguments);

        },

        /**
         * Teardown the plugin if one is set
         *
         * @returns {*}
         */
        teardown: function () {
            if(this.plugin) {
                return this.plugin.teardown();
            } else {
                return this.inherited(arguments);
            }
        }

    });


});