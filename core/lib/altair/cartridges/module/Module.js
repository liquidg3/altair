/**
 * The module cartridge does a few things. Firstly, it uses ./Foundry to instantiate all the modules you passed as
 * options.
 *
 * Events:
 *  will-startup-module
 *  did-startup-module
 *
 *  Nexus:
 *   Cartridges/Module
 *
 * @required Nexus cartridge
 *
 */
define(['altair/facades/declare',
        'altair/facades/hitch',
        '../_Base',
        'altair/Deferred',
        'altair/facades/all',
        './nexusresolvers/Modules',
        'altair/Lifecycle',
        'altair/plugins/node!path',
        './Foundry',
        'dojo/_base/array',
        'altair/events/Emitter'],

    function (declare,
              hitch,
              _Base,
              Deferred,
              all,
              ModulesResolver,
              Lifecycle,
              nodePath,
              Foundry,
              array,
              Emitter) {

    return declare([_Base, Emitter], {

        declaredClass: 'altair/cartridges/module/Module',

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

            var _options = options || this.options,
                list;

            //override our deferred
            this.deferred = new Deferred();

            //pass through altair if it was passed or fallback to altair's paths
            this.paths = _options.paths;

            if(!this.paths && this.altair.paths) {
                this.paths = [];
                this.altair.paths.forEach( hitch( this, function ( path ) {
                    this.paths.push( nodePath.join(path, 'vendors') );
                }));
            }

            /**
             * Was a foundry passed? if not, lets create one
             */
            if (!_options || !_options.foundry) {
                this.foundry = new Foundry();

            } else {
                this.deferred.reject("Not finished, should this set directly or assume something needs to be loaded?");
                return;
            }

            /**
             * If there is a datastore, we'll use it to get the enabled modules
             */
            if (_options.dataStore) {
                this.deferred.reject("Not finished, need to figure out how to do this one");

                return;
            }

            /**
             * Load all plugins
             */
            if (_options.plugins) {

                list = [];
                this.plugins = [];

                _options.plugins.forEach(hitch(this, function (path) {

                    var def = new Deferred();

                    require([path], hitch(this, function (Plugin) {

                        var plugin = new Plugin(this);

                        this.plugins.push(plugin);
                        
                        plugin.startup().then(hitch(def, 'resolve')).otherwise(hitch(def, 'reject'));

                    }));

                    list.push(def);
                }));

                all(list).then(hitch(this.deferred, 'resolve', this)).otherwise(hitch(this.deferred, 'reject'));

            }
            //if there are no plugins, we are ready
            else {
                this.deferred.resolve(this);
            }

            return this.inherited(arguments);

        },

        /**
         * Gets you a module plugin by a particular declared class.
         *
         * @param declaredClass
         * @returns {*}
         */
        plugin: function (declaredClass) {
            var c;

            for( c = 0; c <= this.plugins.length; c++ ) {
                if( this.plugins[c].declaredClass === declaredClass ) {

                    return this.plugins[c];
                }
            }

            return null;
        },

        /**
         *
         * @param declaredClass
         * @returns {boolean}
         */
        hasPlugin: function (declaredClass) {

            return array.some(this.plugins, function (plugin) { return plugin.declaredClass === declaredClass; });
        },

        /**
         * Tells us whether or not we have all the plugins
         *
         * @param declaredClasses
         * @returns {boolean}
         */
        hasPlugins: function (declaredClasses) {
            var i;

            for( i = 0; i < declaredClasses.length; i++ ) {
                if(!this.hasPlugin(declaredClasses[i])) {

                    return false;
                }

            }

            return true;
        },

        module: function (named) {
            return this.modulesByName[named.toLowerCase()];
        },

        hasModule: function (named) {
            return !!this.modulesByName[named.toLowerCase()];
        },

        /**
         * Build the modules and plug our resolver into nexus if the nexus cartridge is loaded
         *
         * @returns {*}
         */
        execute: function () {
            this.deferred = new Deferred();

            this.buildModules(this.options.modules).then(hitch(this, function (modules) {

                this.modules = [];

                //make it easy to access modules by name
                this.modulesByName = {};

                //if the nexus cartridge is in, register our resolver and ourselves so people can find modules
                //using nexus()
                if(this.altair.hasCartridge('altair/cartridges/nexus/Nexus')) {

                    var nexus       = this.altair.cartridge('altair/cartridges/nexus/Nexus'),
                        resolver    = new ModulesResolver(this);

                    nexus.addResolver(resolver);
                }


                //startup all modules, then return ourselves to the deferred
                return this.addModules(modules).then(hitch(this, function (modules) {
                    this.deferred.resolve(this);
                }));

            })).otherwise(hitch(this.deferred, 'reject'));

            return this.inherited(arguments);
        },

        /**
         * Add modules to the cartridge
         *
         * @param modules
         * @returns {dojo.Deferred}
         */
        addModules: function (modules) {

            //intentional shallow copy
            var _modules    = modules.slice(0),
                deferred    = new Deferred(),
                list,
                load,
                options;

            this.modules = this.modules.concat(_modules);

            //add to local store of modules by name
            _modules.forEach(hitch(this, function (module) {
                this.modulesByName[module.name.toLowerCase()] = module;
            }));

            list = []; // all our deferreds

            //run through plugins and execute them on the plugins we have
            if (this.plugins) {

                _modules.forEach(hitch(this, function (module) {

                    this.plugins.forEach(hitch(this, function (plugin) {

                        list.push(plugin.execute(module));

                    }));

                }));


            }

            //lets startup all modules, ensuring one is not started until the one before it is
            load = hitch(this, function () {
                var module = _modules.shift();

                if(module) {

                    this.emit('will-startup-module', {
                        module: module
                    });

                    //lifecycle class gets started up....
                    if(module.isInstanceOf && module.isInstanceOf(Lifecycle)) {

                        options = (this.options.moduleOptions && this.options.moduleOptions[module.name]) ? this.options.moduleOptions[module.name] : undefined;

                        module.startup(options).then(hitch(this, function () {

                            this.emit('did-startup-module', {
                                module: module
                            });

                            module.execute().then(load).otherwise(hitch(deferred, 'reject'));

                        })).otherwise(hitch(deferred, 'reject'));

                    }
                    //...but it's not required
                    else {

                        this.emit('did-startup-module', {
                            module: module
                        });

                        load();

                    }
                } else {
                    deferred.resolve(this);

                }

            });

            all( list ).then( load ).otherwise( hitch( deferred, 'reject' ) );

            return deferred;

        },


        /**
         * Teardown every module, leave no prisoners!
         *
         * @returns {*}
         */
        teardown: function () {
            var list,
                deferred;

            //tear down all the modules
            list = [];

            this.modules.forEach(function (module) {
                list.push(module.teardown());

            });

            //make sure auto resolved deferred is not returned by Lifecycle parent
            this.modules  = [];
            this.deferred = all(list);

            return this.inherited(arguments);
        },

        /**
         * Build modules against our local path settings using the foundry
         *
         * @param modules
         * @returns {altair.Deferred}
         */
        buildModules: function (modules) {

            return this.foundry.build({
                paths: this.paths,
                modules: modules
            });

        }

    });

});
