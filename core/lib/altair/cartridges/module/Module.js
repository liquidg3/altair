/**
 * The module cartridge does a few things. Firstly, it uses ./Foundry to instantiate all the modules you passed as
 * options.
 *
 * Events:
 *  will-startup-module
 *  did-startup-module
 *  will-forge-module
 *  did-forge-module
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
        'altair/facades/glob'],

    function (declare,
              hitch,
              _Base,
              Deferred,
              all,
              ModulesResolver,
              Lifecycle,
              pathUtil,
              Foundry,
              glob) {

    return declare([_Base], {

        name:  'module',

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
         *      paths:      ['array', 'of', 'paths', 'to', 'look', 'for', 'modules']
         *
         * }
         */
        startup: function (options) {

            var _options = options || this.options,
                list;

            //pass through altair if it was passed or fallback to altair's paths
            this.paths = _options.paths;

            if(!this.paths && this.altair.paths.length > 0) {

                this.paths = [];
                this.deferred = new Deferred();

                this.altair.paths.forEach( hitch( this, function ( path, index ) {

                    //find all module dirs inside of this path
                    var base = require.toUrl(pathUtil.join(path, 'vendors', '*', 'modules'));

                    glob(base).then(this.hitch(function (matches) {

                        this.paths = this.paths.concat(matches);

                        //are we done?
                        if(index === this.altair.paths.length - 1) {
                            this.deferred.resolve(this);
                        }

                    }));

                }));

            }

            /**
             * Was a foundry passed? if not, lets create one
             */
            if (!_options || !_options.foundry) {
                this.foundry = new Foundry({ eventDelegate: this });

            } else {
                throw new Error("Not finished, should this set directly or assume something needs to be loaded?");
                return;
            }

            return this.inherited(arguments);

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

            this.deferred = this.buildModules(this.options.modules).then(hitch(this, function (modules) {

                this.modules = [];

                //make it easy to access modules by name
                this.modulesByName = {};

                //if the nexus cartridge is in, register our resolver and ourselves so people can find modules
                //using nexus()
                if(this.altair.hasCartridge('nexus')) {

                    var nexus       = this.altair.cartridge('nexus'),
                        resolver    = new ModulesResolver(this);

                    nexus.addResolver(resolver);
                }

               return modules;

            })).then(this.hitch(function (modules) {

                //startup all modules, then return ourselves to the deferred
                return this.injectModules(modules);

            })).then(this.hitch(function () {
                return this;
            }));

            return this.inherited(arguments);
        },

        /**
         * Inject modules into the Altair runtime
         *
         * @param modules
         * @returns {dojo.Deferred}
         */
        injectModules: function (modules) {

            //intentional shallow copy
            var _modules    = modules.slice(0),
                deferred    = new Deferred(),
                started     = [],
                startup,
                execute,
                options;

            this.modules = this.modules.concat(_modules);

            //add to local store of modules by name
            _modules.forEach(hitch(this, function (module) {
                this.modulesByName[module.name.toLowerCase()] = module;
            }));

            //lets startup all modules, ensuring one is not started until the one before it is
            startup = hitch(this, function () {

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

                            started.push(module);

                            startup();

                        })).otherwise(function (err) {
                            deferred.reject(err);
                        });

                    }
                    //...but it's not required
                    else {

                        this.emit('did-startup-module', {
                            module: module
                        });

                        startup();

                    }
                } else {

                    execute();

                }

            });


            execute = function () {

                var m = started.shift();

                if(m) {
                    m.execute().then(execute).otherwise(hitch(deferred, 'reject'));
                } else {
                    deferred.resolve();
                }

            };

            startup();


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
         * Build modules by name against our local path settings using the foundry
         *
         * @param modules array of module name, titan:Alfred
         * @returns {altair.Deferred}
         */
        buildModules: function (modules) {

            return this.foundry.build({
                eventDelegate: this,
                paths: this.paths,
                modules: modules
            });

        }

    });

});
