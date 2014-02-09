/**
 * The module cartridge does a few things. Firstly, it uses ./Foundry to instantiate all the modules you passed as
 * options. Secondly
 *
 * @required Nexus cartridge
 *
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    '../_Base',
    'dojo/Deferred',
    'dojo/DeferredList',
    './Resolver',
    'altair/Lifecycle',
    'dojo/node!path',
    './Foundry'], function (declare, lang, _Base, Deferred, DeferredList, Resolver, Lifecycle, nodePath, Foundry) {

    return declare('altair/cartridges/module/Module', [_Base], {

        foundry:        null,
        modules:        null,
        plugins:        null,
        paths:          null,
        modulesByName:  null,

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

            //override our deferred
            this.deferred = new Deferred();

            //pass through altair if it was passed or fallback to altair's paths
            this.paths = options.paths;

            if(!this.paths && this.altair.paths) {
                this.paths = [];
                this.altair.paths.forEach(lang.hitch(this, function (path) {
                    this.paths.push(nodePath.join(path, 'vendors'));
                }));
            }

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

                this.deferred.reject("Not finished, need to figure out how to do this one");
                return;
            }

            /**
             * Load all plugins
             */
            if (options.plugins) {

                var list = [];
                this.plugins = {};

                options.plugins.forEach(lang.hitch(this, function (path) {

                    var def = new Deferred();

                    require([path], lang.hitch(this, function (Plugin) {

                        var plugin = new Plugin(this);

                        this.plugins[plugin.declaredClass] = plugin;

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
         *
         * @param declaredClass
         * @returns {boolean}
         */
        hasPlugin: function (declaredClass) {
            return !!this.plugins[declaredClass];
        },

        /**
         *
         * @param declaredClasses
         * @returns {boolean}
         */
        hasPlugins: function (declaredClasses) {

            for(var i = 0; i < declaredClasses.length; i ++) {
                if(!this.hasPlugin(declaredClasses[i])) {
                    return false;
                }
            }

            return true;
        },

        module: function (named) {
            return this.modulesByName[named];
        },

        hasModule: function (named) {
            return !!this.modulesByName[named];
        },

        /**
         * Build the modules and plug our resolver into nexus if the nexus cartridge is loaded
         *
         * @returns {*}
         */
        execute: function () {

            this.deferred = new Deferred();

            this.buildModules(this.options.modules).then(lang.hitch(this, function (modules) {

                this.modules = [];

                //make it easy to access modules by name
                this.modulesByName = {};

                //if the nexus cartridge is in, register our resolver

                if(this.altair.hasCartridge('altair/cartridges/nexus/Nexus')) {

                    var nexus       = this.altair.cartridge('altair/cartridges/nexus/Nexus'),
                        resolver    = new Resolver(this);

                    nexus.addResolver(resolver);

                }

                this.addModules(modules).then(lang.hitch(this, function () {
                    this.deferred.resolve(this);
                }));

            })).otherwise(lang.hitch(this.deferred, 'reject'));

            return this.inherited(arguments);
        },

        /**
         * Add modules to the cartridge
         *
         * @param modules
         * @returns {dojo.Deferred}
         */
        addModules: function (modules) {

            //shallow copy
            var _modules    = modules.slice(0),
                deferred    = new Deferred();

            this.modules = this.modules.concat(_modules);

            //add to local store of modules by name
            _modules.forEach(lang.hitch(this, function (module) {
                this.modulesByName[module.name] = module;
            }));

            //run through plugins and execute them on the plugins we have
            if (this.plugins) {

                _modules.forEach(lang.hitch(this, function (module) {

                    Object.keys(this.plugins).forEach(lang.hitch(this, function (key) {

                        var plugin = this.plugins[key];
                        plugin.execute(module);


                    }));

                }));


            }


            //lets startup all modules, ensuring one is not started until the one before it is
            var load = lang.hitch(this, function () {

                var module = _modules.pop();

                if(module) {

                    //lifecycle class gets started up....
                    if(module.isInstanceOf && module.isInstanceOf(Lifecycle)) {
                        module.startup().then(load);
                    }
                    //...but it's not required
                    else {
                        load();
                    }
                } else {
                    deferred.resolve(this);
                }
            });

            load();

            return deferred;

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
         * Build modules against our local path settings
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

                deferred.resolve(modules);

            })).otherwise(lang.hitch(deferred, 'reject'));

            return deferred;

        }



    });


});