/**
 * The cache cartridge handles cache through the use of "plugins". Plugins are easy to make and introduce into the system.
 * First, take a look at ./plugins/Base.js for a list of methods you need to implement. We are going to try and ship
 * with a few popular plugins (memcached for now) and hope that people will write more as needed.
 *
 * If you want to configure cache, create an app/config/cache.json file with:
 *
 * {
 *
 *  "plugin": {
 *      "path": "my/cache/adapter",
 *      "options": {
 *          "host": "127.0.0.1",
 *          "port": 7777
 *      }
 *  }
 *
 * }
 *
 * Make sure your adapter implements everything inside of altair/cartridges/cache/plugins/Base and that every method
 * returns a dojo/Deferred
 *
 */
define(['altair/facades/declare',
        '../_Base'],

    function (declare,
              _Base) {

    return declare([_Base], {

        name: 'cache',

        plugin: null,

        /**
         * Load and startup any the plugin.
         *
         * @param options
         * @returns {*}
         */
        startup: function ( options ) {

            var _options = options || this.options;

            this.deferred = new this.Deferred();

            if(_options.plugin) {

                require([_options.plugin.path], this.hitch(function ( Plugin ) {
                    this.plugin = new Plugin( this );
                    this.plugin.startup( _options.plugin.options );
                    this.deferred.resolve( this );
                }));

            }
            //plugin is already set
            else if( this.plugin ) {
                this.plugin.startup();
                this.deferred.resolve( this );
            }
            //no plugin set
            else {
                this.deferred.resolve( this );
            }

            return this.inherited( arguments );

        },

        /**
         * Teardown the plugin if one is set
         *
         * @returns {*}
         */
        teardown: function () {

            var results;

            if( this.plugin ) {
                results = this.plugin.teardown();

            } else {
                results = this.inherited( arguments );

            }

            return results;
        }

    });


});