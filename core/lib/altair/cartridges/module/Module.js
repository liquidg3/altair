/**
 * @required Nexus cartridge
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    '../_Base',
    'dojo/Deferred',
    'dojo/DeferredList',
    './Resolver',
    'altair/Lifecycle',
    './Foundry'], function (declare, lang, _Base, Deferred, DeferredList, Resolver, Lifecycle, Foundry) {

    return declare('altair/cartridges/module/Module', [_Base], {

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
         * Build the modules and install our
         *
         * @returns {*}
         */
        execute: function () {

            this.deferred = new Deferred();

            this.buildModules(this.options.modules).then(lang.hitch(this, function (modules) {

                //soft copy
                this.modules = modules.slice(0);

                //lets startup all modules, ensuring one is not started until the one before it is
                var load = lang.hitch(this, function () {

                    var module = modules.pop();

                    if(module) {

                        //lifecycle class gets startup
                        if(module.isInstanceOf && module.isInstanceOf(Lifecycle)) {
                            module.startup().then(load);
                        }
                        //but it's not required
                        else {
                            load();
                        }
                    } else {
                        this.deferred.resolve(this);
                    }
                });

                load();


            }));

            return this.inherited(arguments);
        },

        /**
         * Teardown every module, leave no prisoners!
         *
         * @returns {*}
         */
        teardown: function () {

            //tear down all the modules
            var list = [];

            this.modules.forEach(function (module) {
                list.push(module.teardown());
            });

            //make sure auto resolved deferred is not returned by Lifecycle parent
            this.deferred = new Deferred();
            this.modules  = [];

            var deferred = new DeferredList(list);
            deferred.on(lang.hitch(this, function() {
                this.deferred.resolve(this);
            }));


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