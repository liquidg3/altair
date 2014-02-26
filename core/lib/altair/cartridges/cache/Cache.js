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
define(['dojo/_base/declare',
        'dojo/_base/lang',
        '../_Base',
        'dojo/Deferred'],

    function (declare,
              lang,
              _Base,
              Deferred) {

    return declare('altair/cartridges/cache/Cache', [_Base], {

        plugin: null,

        /**
         * Load and startup any the plugin.
         *
         * @param options
         * @returns {*}
         */
        startup: function ( options ) {

            var _options = options || this.options;

            this.deferred = new Deferred();

            if(_options.plugin) {

                require([_options.plugin.path], lang.hitch(this, function ( Plugin ) {
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