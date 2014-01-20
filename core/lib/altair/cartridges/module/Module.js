/**
 * @required Nexus cartridge
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    '../Base',
    'dojo/Deferred',
    'dojo/DeferredList',
    './Foundry'], function (declare, lang, Base, Deferred, DeferredList, Foundry) {

    return declare([Base], {

        foundry: null,
        modules: null,
        plugins: null,
        paths: null,

        /**
         * Load up the modules.
         *
         * @param options {
         *
         *      modules:    ['array', 'of', 'module', 'names', 'that', 'will', 'be', 'created'],
         *      paths:      ['array', 'of', 'paths', 'to', 'look', 'for', 'modules'],
         *      dataStore:  configured instance of altair/cartridges/modules/DataStore
         *
         * }
         */
        startup: function (options) {

            options = options || this.options;

            var modules = options.modules;

            this.deferred = new Deferred();


            if (!modules) {
                throw "The Modules Cartridge needs some modules, yo.";
            }

            //pass through altair if it was passed
            this.paths = options.paths;

            /**
             * Was a foundry passed? if not, lets create one
             */
            if (!options || !options.foundry) {
                this.foundry = new Foundry();
            } else {
                throw "Not finished, should this set directly or assume something needs to be loaded?";
            }

            /**
             * If there is a datastore, we'll use it to get the enabled modules
             */
            if (options.dataStore) {

                throw "Not finished, need to figure out how to do this one";
            }

            /**
             * Load all plugins
             */
            if (options.plugins) {

                var list = [];
                this.plugins = [];

                options.plugins.forEach(lang.hitch(this, function (path) {

                    var def = new Deferred();

                    require([path], lang.hitch(this, function (Plugin) {

                        var plugin = new Plugin(this);

                        this.plugins.push(plugin);

                        def.resolve(this);

                    }));

                    list.push(def);
                }));

                var deferredList = new DeferredList(list);
                deferredList.then(lang.hitch(this, function () {
                    this.deferred.resolve(this);
                }));

            }
            //if there are no plugins, we are ready
            else {
                this.deferred.resolve(this);
            }

            return this.inherited(arguments);

        },

        /**
         * Build the modules
         *
         * @returns {*}
         */
        execute: function () {

            this.deferred = new Deferred();

            this.buildModules(this.options.modules).then(lang.hitch(this, function (modules) {

                this.modules = modules;
                this.deferred.resolve(this);

            }));

            return this.inherited(arguments);
        },

        teardown: function () {


            return this.inherited(arguments);
        },

        /**
         * Build modules, then loop through each plugin and call plugin.execute(module) on every module
         * to tack on super cool functionality
         *
         * @param modules
         * @returns {*|Promise}
         */
        buildModules: function (modules) {

            var deferred = new Deferred();

            this.foundry.build({
                paths: this.paths,
                modules: modules
            }).then(lang.hitch(this, function (modules) {

                if (this.plugins) {

                    modules.forEach(lang.hitch(this, function (module) {

                        this.plugins.forEach(lang.hitch(this, function (plugin) {

                            plugin.execute(module);


                        }));

                    }));


                }

                deferred.resolve(modules);

            }));

            return deferred;

        }



    });


});