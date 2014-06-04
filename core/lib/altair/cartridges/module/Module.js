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
        'altair/facades/mixin',
        'altair/facades/hitch',
        './nexusresolvers/Modules',
        'altair/Lifecycle',
        'altair/plugins/node!path',
        './Foundry',
        'lodash',
        'altair/facades/glob'],

    function (declare,
              hitch,
              _Base,
              Deferred,
              all,
              mixin,
              hitch,
              ModulesResolver,
              Lifecycle,
              pathUtil,
              Foundry,
              _,
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

            //The paths we will look for modules (altair paths mixed in during buildOne())
            this.paths = _.map(_options.paths || [], hitch(require, 'toUrl'));

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

            var modules = this.altair.safeMode ? this.options.safeModeModules : this.options.modules;

            this.deferred = this.buildModules(modules).then(hitch(this, function (modules) {

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
                    deferred.resolve(modules);
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
                if(module.teardown) {
                    list.push(module.teardown());
                }
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
         * @param options for foundry (anything else you want to pass besides modules)
         * @returns {altair.Promise}
         */
        buildModules: function (modules, options) {

            //mixin altair paths with any custom ones set on the cartridges
            var paths = this.altair.paths.map(function ( path ) {

                //find all module dirs inside of this path
                return require.toUrl(pathUtil.join(path, 'vendors', '*', 'modules'));

            }).concat(this.paths);

            return glob(paths).then(this.hitch(function (paths) {

                return this.foundry.build(mixin({
                    eventDelegate: this,
                    paths: paths,
                    modules: modules,
                    alreadyInstalled: _.map(this.modules, 'name')
                }, options || {}));

            }));



        }

    });

});
